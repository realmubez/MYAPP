import { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Type, Eye } from 'lucide-react';
import { AppSettings } from '../../types';
import { storageService } from '../../services/storage';
import { typingSoundService } from '../../services/typingSoundService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(storageService.getSettings());
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

  if (!isOpen) return null;

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="settings-modal-card"
        className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">Learning Settings</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Preferences for typing and audio</p>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 py-4">
          {/* Audio Feedback Controls */}
          <div className="space-y-3 rounded-xl border border-neutral-800/80 bg-neutral-950/40 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800/80 text-amber-400">
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-200">Typing Sounds</p>
                  <p className="text-xs text-neutral-400">Tactile mechanical feedback & completion sound</p>
                </div>
              </div>
              <button
                id="toggle-sound-btn"
                type="button"
                onClick={handleToggleSound}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-amber-500' : 'bg-neutral-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-neutral-950 transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Volume Slider */}
            <div className={`space-y-1.5 pt-2 border-t border-neutral-800/60 transition-opacity ${settings.soundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Typing Sound Volume</span>
                <span className="font-mono text-amber-400 font-semibold">
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

          {/* Caret Style */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-neutral-200">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Caret Style</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['line', 'block', 'underline'] as const).map((style) => (
                <button
                  key={style}
                  id={`caret-style-${style}-btn`}
                  onClick={() => updateSetting('caretStyle', style)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border capitalize transition-colors ${
                    settings.caretStyle === style
                      ? 'border-amber-500/80 bg-amber-500/10 text-amber-300 font-semibold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-neutral-200">
              <Type className="w-4 h-4 text-amber-400" />
              <span>Focus Typing Font Size</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['medium', 'large', 'extra-large'] as const).map((size) => (
                <button
                  key={size}
                  id={`font-size-${size}-btn`}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border capitalize transition-colors ${
                    settings.fontSize === size
                      ? 'border-amber-500/80 bg-amber-500/10 text-amber-300 font-semibold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300'
                  }`}
                >
                  {size.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* TTS Architecture Notice */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-xs text-neutral-400">
            <p className="font-medium text-neutral-300 mb-1">Remote Neural TTS Service</p>
            <p className="leading-relaxed">
              Swedish and English lesson audio streams directly from the dedicated Hugging Face Piper neural endpoint.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-800 flex justify-end">
          <button
            id="done-settings-btn"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
