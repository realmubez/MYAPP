import { UserStats, AppSettings } from '../types';
import { progressService } from './progress';
import { settingsRepository } from '../repositories/settingsRepository';

/**
 * Storage Service
 * Facade integrating progressService with settingsRepository.
 */
export const storageService = {
  getUserStats(): UserStats {
    return progressService.getUserStats();
  },

  getSidebarCollapsed(): boolean {
    return settingsRepository.getSidebarCollapsed();
  },

  setSidebarCollapsed(collapsed: boolean): void {
    settingsRepository.setSidebarCollapsed(collapsed);
  },

  getSettings(): AppSettings {
    return settingsRepository.getSettings();
  },

  saveSettings(settings: AppSettings): void {
    settingsRepository.saveSettings(settings);
  },
};


