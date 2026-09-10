export type TranslationLang = 'so' | 'sv' | 'en' | 'off';

export interface MultiLangTranslation {
  so?: string;
  sv?: string;
  en?: string;
}

const STORAGE_KEY_EN = 'mylearning_english_translation_lang';
const STORAGE_KEY_SV = 'mylearning_swedish_translation_lang';

export const translationService = {
  getLanguage(courseLang: 'en' | 'sv' = 'en'): TranslationLang {
    if (typeof window === 'undefined') return 'so';
    try {
      const key = courseLang === 'sv' ? STORAGE_KEY_SV : STORAGE_KEY_EN;
      const stored = localStorage.getItem(key) as TranslationLang | null;
      if (courseLang === 'sv') {
        if (stored === 'so' || stored === 'en' || stored === 'off') {
          return stored;
        }
      } else {
        if (stored === 'so' || stored === 'sv' || stored === 'off') {
          return stored;
        }
      }
    } catch {
      // fallback
    }
    return 'so'; // Default to Somali as helpful support
  },

  setLanguage(lang: TranslationLang, courseLang: 'en' | 'sv' = 'en'): void {
    if (typeof window === 'undefined') return;
    try {
      const key = courseLang === 'sv' ? STORAGE_KEY_SV : STORAGE_KEY_EN;
      localStorage.setItem(key, lang);
    } catch {
      // ignore
    }
  },

  getText(
    translations?: MultiLangTranslation | string,
    currentLang?: TranslationLang
  ): string | undefined {
    if (!translations) return undefined;
    if (currentLang === 'off') return undefined;

    if (typeof translations === 'string') {
      return translations;
    }

    const lang = currentLang || 'so';
    if (lang === 'so' && translations.so) return translations.so;
    if (lang === 'sv' && translations.sv) return translations.sv;
    if (lang === 'en' && translations.en) return translations.en;

    return translations.so || translations.en || translations.sv;
  },
};

