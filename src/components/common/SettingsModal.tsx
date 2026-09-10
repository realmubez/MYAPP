import { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Type, Eye, Languages } from 'lucide-react';
import { AppSettings } from '../../types';
import { storageService } from '../../services/storage';
import { typingSoundService } from '../../services/typingSoundService';
import { translationService, TranslationLang } from '../../services/translationPreference';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [translationLang, setTranslationLang] = useState<'so' | 'sv' | 'off'>(() => {
    const lang = translationService.getLanguage('en');
    if (lang === 'sv' || lang === 'off') return lang;
    return 'so';
  });

  useEffect(() => {
    if (isOpen) {
      setSettings(storageService.getSettings());
      const lang = translationService.getLanguage('en');
      setTranslationLang(lang === 'sv' || lang === 'off' ? lang : 'so');
    }
  }, [isOpen]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    updateSetting('soundEnabled', next);
    typingSoundService.setEnabled(next);
    if (next) {
      typingSoundService.playCorrectKey();
    }
  };

  const handleVolumeChange = (val: number) => {
    updateSetting('typingSoundVolume', val);
    typingSoundService.setVolume(val);
  };

  const previewSound = () => {
    if (settings.soundEnabled) {
      typingSoundService.playCorrectKey();
    }
  };

  const handleTranslationSelect = (lang: 'so' | 'sv' | 'off') => {
    setTranslationLang(lang);
    translationService.setLanguage(lang, 'en');
    translationService.setPythonLanguage(lang);
    if (lang === 'so' || lang === 'off') {
      translationService.setLanguage(lang, 'sv');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="settings-modal-card"
        className="w-[calc(100%-24px)] max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-neutral-800 bg-[#141210] p-4 sm:p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Learning Settings
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Preferences for typing and audio
            </p>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer shrink-0"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Setting Groups */}
        <div className="space-y-4">
          {/* 1. Typing Sounds & Volume */}
          <div className="space-y-3 rounded-2xl border border-neutral-800/80 bg-[#181614] p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 shrink-0">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    Typing Sounds
                  </p>
                  <p className="text-[11px] sm:text-xs text-neutral-400">
                    Keyboard feedback
                  </p>
                </div>
              </div>
              <button
                id="toggle-sound-btn"
                type="button"
                onClick={handleToggleSound}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                  settings.soundEnabled ? 'bg-amber-500' : 'bg-neutral-800'
                }`}
                aria-label="Toggle typing sounds"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-neutral-950 transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Volume slider directly underneath */}
            <div
              className={`space-y-1.5 pt-2.5 border-t border-neutral-800/70 transition-opacity ${
                settings.soundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Volume</span>
                <span className="font-mono text-amber-400 font-bold text-[11px] sm:text-xs">
                  {Math.round((settings.typingSoundVolume ?? 0.4) * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <VolumeX className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <input
                  type="range"
                  id="typing-sound-volume-slider"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.typingSoundVolume ?? 0.4}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  onMouseUp={previewSound}
                  onTouchEnd={previewSound}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  aria-label="Typing sound volume"
                />
                <Volume2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </div>
            </div>
          </div>

          {/* 2. Translation Help */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-200">
              <Languages className="w-4 h-4 text-amber-400" />
              <span>Translation Help</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'so' as const, label: 'Somali' },
                { id: 'sv' as const, label: 'Swedish' },
                { id: 'off' as const, label: 'Off' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  id={`translation-help-${opt.id}-btn`}
                  type="button"
                  onClick={() => handleTranslationSelect(opt.id)}
                  className={`h-11 sm:h-12 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    translationLang === opt.id
                      ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 shadow-sm'
                      : 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Caret Style */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-200">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Caret Style</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['line', 'block', 'underline'] as const).map((style) => (
                <button
                  key={style}
                  id={`caret-style-${style}-btn`}
                  type="button"
                  onClick={() => updateSetting('caretStyle', style)}
                  className={`h-11 sm:h-12 px-3 text-xs font-semibold rounded-xl border capitalize flex items-center justify-center transition-all cursor-pointer ${
                    settings.caretStyle === style
                      ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 shadow-sm'
                      : 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Focus Typing Font Size */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-200">
              <Type className="w-4 h-4 text-amber-400" />
              <span>Typing Font Size</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['medium', 'large', 'extra-large'] as const).map((size) => (
                <button
                  key={size}
                  id={`font-size-${size}-btn`}
                  type="button"
                  onClick={() => updateSetting('fontSize', size)}
                  className={`h-11 sm:h-12 px-3 text-xs font-semibold rounded-xl border capitalize flex items-center justify-center transition-all cursor-pointer ${
                    settings.fontSize === size
                      ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 shadow-sm'
                      : 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {size.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Lesson Audio Notice (Non-technical) */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#181614] p-3.5 space-y-1">
            <p className="text-xs font-semibold text-white">Lesson Audio</p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Listen to lesson explanations and pronunciation.
            </p>
          </div>
        </div>

        {/* 6. Done Button */}
        <div className="pt-2 border-t border-neutral-800">
          <button
            id="done-settings-btn"
            type="button"
            onClick={onClose}
            className="w-full h-12 flex items-center justify-center text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
