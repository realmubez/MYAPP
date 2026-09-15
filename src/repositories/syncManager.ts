import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { syncQueue, QueuedMutation } from './syncQueue';
import { SyncState } from './types';

const SYNC_STATE_EVENT = 'mylearning_sync_state_changed';

class SyncManager {
  private currentState: SyncState = 'idle';
  private isProcessing = false;
  private syncTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  public getState(): SyncState {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'offline';
    }
    return this.currentState;
  }

  private setState(state: SyncState) {
    this.currentState = state;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SYNC_STATE_EVENT, { detail: state }));
    }
  }

  /**
   * Triggers an asynchronous queue processing run if online and configured.
   */
  public async processQueue(): Promise<void> {
    if (!isSupabaseConfigured()) {
      this.setState('idle');
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setState('offline');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) return;

    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const queue = syncQueue.getQueue();
      if (queue.length === 0) {
        this.setState('synced');
        this.isProcessing = false;
        return;
      }

      this.setState('syncing');

      // Process queued mutations in order
      for (const item of queue) {
        try {
          if (item.action === 'upsert') {
            const query = (supabase.from(item.table as any) as any).upsert(
              item.payload,
              item.onConflictKey ? { onConflict: item.onConflictKey } : undefined
            );
            const { error } = await query;
            if (error) {
              console.warn(`[SyncManager] Upsert failed for table ${item.table}:`, error.message);
              item.retryCount++;
              if (item.retryCount >= 5) {
                // Drop permanently failed items to prevent blocking queue
                syncQueue.remove(item.id);
              }
            } else {
              syncQueue.remove(item.id);
            }
          } else if (item.action === 'delete') {
            const query = (supabase.from(item.table as any) as any).delete().match(item.payload);
            const { error } = await query;
            if (error) {
              console.warn(`[SyncManager] Delete failed for table ${item.table}:`, error.message);
              syncQueue.remove(item.id);
            } else {
              syncQueue.remove(item.id);
            }
          }
        } catch (itemErr) {
          console.warn('[SyncManager] Error executing item:', itemErr);
          break;
        }
      }

      const remaining = syncQueue.getQueue();
      this.setState(remaining.length === 0 ? 'synced' : 'error');
    } catch (err) {
      console.warn('[SyncManager] Batch processing failed:', err);
      this.setState('error');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Debounces queue execution so multiple rapid user events (e.g. typing exercises, lesson steps)
   * flush cleanly in a batch rather than hammering the database.
   */
  public scheduleSync(delayMs = 1500) {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }
    this.syncTimer = setTimeout(() => {
      this.processQueue();
    }, delayMs);
  }
}

export const syncManager = new SyncManager();
export { SYNC_STATE_EVENT };
