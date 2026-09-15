import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { AppSettings } from '../types';
import { DbUserSettings } from './types';
import { syncQueue } from './syncQueue';
import { syncManager } from './syncManager';
import { profileRepository } from './profileRepository';

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

class SettingsRepository {
  public getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_SETTINGS, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  }

  public saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings to localStorage:', e);
    }

    const profile = profileRepository.getLocalProfile();
    if (!profile?.id) return;

    const payload: DbUserSettings = {
      profile_id: profile.id,
      sound_enabled: settings.soundEnabled,
      typing_sound_volume: settings.typingSoundVolume,
      caret_style: settings.caretStyle,
      font_size: settings.fontSize,
      tts_voice: settings.ttsVoice,
      tts_rate: settings.ttsRate,
      swedish_translation_lang: 'so',
      english_translation_lang: 'so',
      python_support_lang: 'en',
    };

    syncQueue.enqueue('user_settings', 'upsert', payload, 'profile_id');
    syncManager.scheduleSync(1000);
  }

  public getSidebarCollapsed(): boolean {
    try {
      const val = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return val === 'true';
    } catch (e) {
      return false;
    }
  }

  public setSidebarCollapsed(collapsed: boolean): void {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch (e) {
      console.warn('Could not save sidebar state:', e);
    }
  }

  public async pullRemoteSettings(userId: string): Promise<void> {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('profile_id', userId)
        .single();

      if (data) {
        const current = this.getSettings();
        const merged: AppSettings = {
          ...current,
          soundEnabled: data.sound_enabled ?? current.soundEnabled,
          typingSoundVolume: Number(data.typing_sound_volume) || current.typingSoundVolume,
          caretStyle: (data.caret_style as any) || current.caretStyle,
          fontSize: (data.font_size as any) || current.fontSize,
          ttsVoice: data.tts_voice || current.ttsVoice,
          ttsRate: Number(data.tts_rate) || current.ttsRate,
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      }
    } catch (e) {
      console.warn('Failed to pull remote settings:', e);
    }
  }
}

export const settingsRepository = new SettingsRepository();
