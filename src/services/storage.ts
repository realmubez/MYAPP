import { UserStats, AppSettings } from '../types';
import { progressService } from './progress';

const SETTINGS_KEY = 'mylearning_settings';
const SIDEBAR_COLLAPSED_KEY = 'mylearning_sidebar_collapsed';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  typingSoundVolume: 0.4,
  caretStyle: 'line',
  fontSize: 'large',
  ttsVoice: 'default',
  ttsRate: 1.0,
};

/**
 * Storage Service
 * Modular client-side storage with localStorage.
 * Integrates with progressService for user metrics, while managing application-wide settings.
 */
export const storageService = {
  getUserStats(): UserStats {
    return progressService.getUserStats();
  },

  getSidebarCollapsed(): boolean {
    try {
      const val = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return val === 'true';
    } catch (e) {
      console.warn('Could not read sidebar state from localStorage:', e);
      return false;
    }
  },

  setSidebarCollapsed(collapsed: boolean): void {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch (e) {
      console.warn('Could not save sidebar state to localStorage:', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings to localStorage:', e);
    }
  },
};

