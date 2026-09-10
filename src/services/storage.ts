import { UserStats, AppSettings } from '../types';
import { progressService } from './progress';

const SETTINGS_KEY = 'mylearning_settings';

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

