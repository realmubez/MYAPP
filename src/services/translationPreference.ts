export type TranslationLang = 'so' | 'sv' | 'en' | 'off';
export type PythonSupportLang = 'en' | 'so' | 'sv' | 'off';

export interface MultiLangTranslation {
  so?: string;
  sv?: string;
  en?: string;
}

const STORAGE_KEY_EN = 'mylearning_english_translation_lang';
const STORAGE_KEY_SV = 'mylearning_swedish_translation_lang';
const STORAGE_KEY_PYTHON = 'mylearning_python_translation_lang';

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

  getPythonLanguage(): PythonSupportLang {
    if (typeof window === 'undefined') return 'en';
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PYTHON) as PythonSupportLang | null;
      if (stored === 'en' || stored === 'so' || stored === 'sv' || stored === 'off') {
        return stored;
      }
    } catch {
      // fallback
    }
    return 'en';
  },

  setPythonLanguage(lang: PythonSupportLang): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_PYTHON, lang);
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

  /**
   * Helper for Python lessons: returns English as primary, plus optional translated text
   * when Somali or Swedish is selected. If off or en is selected, translated is undefined.
   */
  getPythonText(
    translations?: MultiLangTranslation | string,
    currentLang?: PythonSupportLang
  ): { en: string; translated?: string } | null {
    if (!translations) return null;
    if (typeof translations === 'string') {
      return { en: translations };
    }

    const enText = translations.en || translations.so || translations.sv || '';
    const lang = currentLang || 'en';

    if (lang === 'off' || lang === 'en') {
      return { en: enText };
    }

    const translated = lang === 'so' ? translations.so : lang === 'sv' ? translations.sv : undefined;
    return {
      en: enText,
      translated: translated && translated !== enText ? translated : undefined,
    };
  },

  /**
   * Returns text to be read by TTS for Python explanations/instructions
   */
  getPythonTTSText(
    translations?: MultiLangTranslation | string,
    currentLang?: PythonSupportLang
  ): { text: string; voice: string } | null {
    if (!translations) return null;
    if (typeof translations === 'string') {
      return { text: translations, voice: 'en-US-GuyNeural' };
    }

    const lang = currentLang || 'en';
    if (lang === 'so' && translations.so) {
      return { text: translations.so, voice: 'so-SO-MuqdishoNeural' };
    }
    if (lang === 'sv' && translations.sv) {
      return { text: translations.sv, voice: 'sv-SE-MattiasNeural' };
    }
    return { text: translations.en || translations.so || translations.sv || '', voice: 'en-US-GuyNeural' };
  },
};

