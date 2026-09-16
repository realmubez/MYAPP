import { storageNamespace } from './storageNamespace';

export interface QueuedMutation {
  id: string; // unique UUID or timestamp-random
  table: string; // e.g. 'lesson_progress', 'mistakes', 'daily_activity', etc.
  action: 'upsert' | 'delete';
  payload: Record<string, any>;
  onConflictKey?: string; // e.g. 'profile_id,subject_id,lesson_id'
  createdAt: number;
  retryCount: number;
}

const SYNC_QUEUE_KEY = 'sync_queue';

export const syncQueue = {
  getQueue(): QueuedMutation[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = storageNamespace.getItem(SYNC_QUEUE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  },

  enqueue(table: string, action: 'upsert' | 'delete', payload: Record<string, any>, onConflictKey?: string): void {
    if (typeof window === 'undefined') return;
    try {
      const queue = this.getQueue();
      // Deduplicate: If an upsert for the exact same conflict key / identity is already in queue, update its payload
      const identityKey = onConflictKey
        ? onConflictKey.split(',').map((k) => `${k}:${payload[k.trim()]}`).join('|')
        : `${table}:${payload.id || payload.profile_id}`;

      const existingIndex = queue.findIndex((item) => {
        if (item.table !== table || item.action !== action) return false;
        const itemIdentity = item.onConflictKey
          ? item.onConflictKey.split(',').map((k) => `${k}:${item.payload[k.trim()]}`).join('|')
          : `${item.table}:${item.payload.id || item.payload.profile_id}`;
        return itemIdentity === identityKey;
      });

      if (existingIndex >= 0) {
        queue[existingIndex].payload = { ...queue[existingIndex].payload, ...payload };
        queue[existingIndex].createdAt = Date.now();
      } else {
        queue.push({
          id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          table,
          action,
          payload,
          onConflictKey,
          createdAt: Date.now(),
          retryCount: 0,
        });
      }

      storageNamespace.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue.slice(-150))); // Cap queue at 150 items
    } catch (e) {
      console.warn('Failed to enqueue sync mutation:', e);
    }
  },

  remove(mutationId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const queue = this.getQueue().filter((item) => item.id !== mutationId);
      storageNamespace.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to remove mutation from queue:', e);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      storageNamespace.removeItem(SYNC_QUEUE_KEY);
    } catch {}
  },
};

