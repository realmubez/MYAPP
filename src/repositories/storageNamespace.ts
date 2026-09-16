/**
 * Multi-User LocalStorage Namespacing & Isolation Manager
 * Ensures that different users logging into the same device/browser NEVER share or leak local data.
 * Format: mylearning:{profileId}:{baseKey}
 */

const ACTIVE_USER_ID_KEY = 'mylearning_active_user_id';
const NAMESPACE_PREFIX = 'mylearning';

// Known base keys used throughout the application
export type StorageBaseKey =
  | 'progress'
  | 'mistakes'
  | 'settings'
  | 'vocabulary'
  | 'sync_queue'
  | 'profile'
  | 'sidebar_collapsed'
  | string;

export class StorageNamespace {
  private activeProfileId: string = 'mubez';

  constructor() {
    if (typeof window !== 'undefined') {
      const savedUid = localStorage.getItem(ACTIVE_USER_ID_KEY);
      if (savedUid) {
        this.activeProfileId = savedUid;
      }
    }
  }

  /**
   * Gets the currently active authenticated profile ID.
   */
  public getActiveProfileId(): string {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ACTIVE_USER_ID_KEY);
      if (saved) return saved;
    }
    return this.activeProfileId;
  }

  /**
   * Switches the active profile namespace upon login or profile switch.
   * Performs automatic migration of legacy unnamespaced keys if this is Mubez (Admin).
   */
  public setActiveProfileId(profileId: string): void {
    if (!profileId) return;
    this.activeProfileId = profileId;
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_USER_ID_KEY, profileId);
      this.migrateLegacyAdminKeysIfApplicable(profileId);
    }
  }

  /**
   * Generates a fully qualified namespaced storage key for the given base key.
   */
  public getKey(baseKey: StorageBaseKey, profileId?: string): string {
    const targetUid = profileId || this.getActiveProfileId();
    return `${NAMESPACE_PREFIX}:${targetUid}:${baseKey}`;
  }

  /**
   * Reads an item from the current user's namespace.
   */
  public getItem(baseKey: StorageBaseKey, profileId?: string): string | null {
    if (typeof window === 'undefined') return null;
    const namespacedKey = this.getKey(baseKey, profileId);
    const value = localStorage.getItem(namespacedKey);
    if (value !== null) return value;

    // Fallback check for Mubez legacy keys only
    const targetUid = profileId || this.getActiveProfileId();
    if (targetUid === 'mubez' || targetUid === '25993506-b5e2-4432-8e4d-c97ddd818e09') {
      const legacyKey = this.getLegacyKey(baseKey);
      if (legacyKey) {
        const legacyVal = localStorage.getItem(legacyKey);
        if (legacyVal !== null) {
          // Migrate into namespaced slot
          localStorage.setItem(namespacedKey, legacyVal);
          return legacyVal;
        }
      }
    }

    return null;
  }

  /**
   * Sets an item into the current user's namespace.
   */
  public setItem(baseKey: StorageBaseKey, value: string, profileId?: string): void {
    if (typeof window === 'undefined') return;
    const namespacedKey = this.getKey(baseKey, profileId);
    localStorage.setItem(namespacedKey, value);
  }

  /**
   * Removes an item from the current user's namespace.
   */
  public removeItem(baseKey: StorageBaseKey, profileId?: string): void {
    if (typeof window === 'undefined') return;
    const namespacedKey = this.getKey(baseKey, profileId);
    localStorage.removeItem(namespacedKey);
  }

  /**
   * Safely migrates Mubez's existing legacy keys into his namespace without touching backups.
   */
  private migrateLegacyAdminKeysIfApplicable(profileId: string): void {
    // Only migrate for Mubez or the admin profile
    if (profileId !== 'mubez' && profileId !== '25993506-b5e2-4432-8e4d-c97ddd818e09') {
      return;
    }

    const legacyMap: Record<string, string> = {
      progress: 'mylearning_progress_v1',
      mistakes: 'mylearning_review_items_v1',
      settings: 'mylearning_settings',
      profile: 'mylearning_user_profile_v1',
      vocabulary: 'mylearning_vocabulary_v1',
      sync_queue: 'mylearning_sync_queue_v1',
    };

    for (const [baseKey, legacyKey] of Object.entries(legacyMap)) {
      const namespacedKey = this.getKey(baseKey, profileId);
      if (!localStorage.getItem(namespacedKey)) {
        const legacyVal = localStorage.getItem(legacyKey);
        if (legacyVal) {
          localStorage.setItem(namespacedKey, legacyVal);
        }
      }
    }

    // Migrate typing days 1 to 30
    for (let d = 1; d <= 30; d++) {
      const namespacedKey = this.getKey(`typing_day_${d}`, profileId);
      if (!localStorage.getItem(namespacedKey)) {
        const legacyVal = localStorage.getItem(`my_learning_typing_day_${d}`);
        if (legacyVal) {
          localStorage.setItem(namespacedKey, legacyVal);
        }
      }
    }
  }

  private getLegacyKey(baseKey: string): string | null {
    const map: Record<string, string> = {
      progress: 'mylearning_progress_v1',
      mistakes: 'mylearning_review_items_v1',
      settings: 'mylearning_settings',
      profile: 'mylearning_user_profile_v1',
      vocabulary: 'mylearning_vocabulary_v1',
      sync_queue: 'mylearning_sync_queue_v1',
    };
    if (map[baseKey]) return map[baseKey];
    if (baseKey.startsWith('typing_day_')) {
      const num = baseKey.replace('typing_day_', '');
      return `my_learning_typing_day_${num}`;
    }
    return null;
  }
}

export const storageNamespace = new StorageNamespace();
