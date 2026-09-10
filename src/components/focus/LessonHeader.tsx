import { useState } from 'react';
import { Settings, X, Volume2, VolumeX } from 'lucide-react';
import { AudioButton } from '../audio/AudioButton';
import { Language, LessonStage } from '../../types/lessons';
import { storageService } from '../../services/storage';
import { typingSoundService } from '../../services/typingSoundService';
import {
  SWEDISH_VOICES,
  ENGLISH_VOICES,
  AVAILABLE_RATES,
  TTSRate,
} from '../../services/tts';

interface LessonHeaderProps {
  language: Language;
  lessonTitle: string;
  currentIndex: number;
  totalSentences: number;
  stage: LessonStage;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  audioError?: string | null;
  onPlayAudio: () => void;
  currentVoice: string;
  onVoiceChange: (voice: string) => void;
  currentRate: TTSRate;
  onRateChange: (rate: TTSRate) => void;
  autoPlay: boolean;
  onAutoPlayToggle: (val: boolean) => void;
  onExit: () => void;
}

export function LessonHeader({
  language,
  lessonTitle,
  currentIndex,
  totalSentences,
  stage,
  isPlaying,
  isLoadingAudio,
  audioError,
  onPlayAudio,
  currentVoice,
  onVoiceChange,
  currentRate,
  onRateChange,
  autoPlay,
  onAutoPlayToggle,
  onExit,
}: LessonHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [typingSoundEnabled, setTypingSoundEnabled] = useState<boolean>(() => {
    return storageService.getSettings().soundEnabled ?? true;
  });
  const [typingSoundVolume, setTypingSoundVolume] = useState<number>(() => {
    return storageService.getSettings().typingSoundVolume ?? 0.4;
  });

  const handleToggleTypingSound = (enabled: boolean) => {
    setTypingSoundEnabled(enabled);
    const settings = storageService.getSettings();
    const updated = { ...settings, soundEnabled: enabled };
    storageService.saveSettings(updated);
    typingSoundService.setEnabled(enabled);
    if (enabled) {
      typingSoundService.playCorrectKey();
    }
  };

  const handleTypingVolumeChange = (vol: number) => {
    setTypingSoundVolume(vol);
    const settings = storageService.getSettings();
    const updated = { ...settings, typingSoundVolume: vol };
    storageService.saveSettings(updated);
    typingSoundService.setVolume(vol);
  };

  const flag = language === 'sv' ? '🇸🇪' : '🇬🇧';
  const langName = language === 'sv' ? 'Swedish' : 'English';
  const voices = language === 'sv' ? SWEDISH_VOICES : ENGLISH_VOICES;

  const stageLabel =
    stage === 'listen_type'
      ? 'Listen & Type'
      : stage === 'understand'
      ? 'Understand'
      : stage === 'recall'
      ? 'Recall'
      : 'Complete';

  return (
    <header className="relative w-full border-b border-neutral-900 bg-neutral-950/90 backdrop-blur-sm z-30 select-none">
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-2">
        {/* Left: Language display & stage (Desktop includes Brand) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <button
            type="button"
            id="focus-exit-brand-btn"
            onClick={onExit}
            className="hidden sm:inline-block text-xs font-semibold tracking-wider text-neutral-400 hover:text-white uppercase transition-colors shrink-0"
          >
            My Learning
          </button>
          <span className="hidden sm:inline-block text-neutral-700 text-xs shrink-0">•</span>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-200 truncate">
            <span className="text-sm shrink-0">{flag}</span>
            <span className="font-semibold text-neutral-300">{langName}</span>
            <span className="hidden md:inline-block text-neutral-500 font-normal truncate">
              · {lessonTitle}
            </span>
          </div>
        </div>

        {/* Center: Progress counter */}
        <div className="flex items-center justify-center shrink-0 px-2 py-0.5 rounded-full bg-neutral-900/80 border border-neutral-800/80 text-[11px] sm:text-xs font-mono text-neutral-400">
          <span className="text-amber-400 font-semibold mr-0.5">{currentIndex + 1}</span>
          <span className="text-neutral-600">/</span>
          <span className="ml-0.5">{totalSentences}</span>
          <span className="hidden lg:inline-block text-neutral-600 ml-2">({stageLabel})</span>
        </div>

        {/* Right Controls: Audio, Settings, Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Audio Play Button */}
          <AudioButton
            isPlaying={isPlaying}
            isLoading={isLoadingAudio}
            error={audioError}
            onPlay={onPlayAudio}
            size="sm"
          />

          {/* Quick Voice Settings Toggle */}
          <div className="relative">
            <button
              type="button"
              id="focus-settings-toggle-btn"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg border text-neutral-400 hover:text-white transition-all ${
                showSettings
                  ? 'bg-neutral-800 border-neutral-700 text-white'
                  : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800'
              }`}
              title="Voice & speed settings"
              aria-label="Settings"
            >
              <Settings size={15} />
            </button>

            {/* Compact Settings Dropdown */}
            {showSettings && (
              <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] p-3 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                  <span className="font-semibold text-neutral-200">Voice Settings</span>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="text-neutral-500 hover:text-white p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Voice Selection */}
                <div className="mb-3">
                  <label className="block text-[11px] text-neutral-400 mb-1">Speaker Voice</label>
                  <select
                    id="focus-voice-select"
                    value={currentVoice}
                    onChange={(e) => onVoiceChange(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-neutral-200 focus:outline-none focus:border-amber-500 text-xs"
                  >
                    {voices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.region})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Speed / Rate Selection */}
                <div className="mb-3">
                  <label className="block text-[11px] text-neutral-400 mb-1">Speaking Rate</label>
                  <div className="grid grid-cols-4 gap-1">
                    {AVAILABLE_RATES.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => onRateChange(rate)}
                        className={`py-1 rounded text-center font-mono text-[11px] transition-colors ${
                          currentRate === rate
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                        }`}
                      >
                        {rate}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-play toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                  <span className="text-[11px] text-neutral-300">Auto-play audio</span>
                  <input
                    type="checkbox"
                    id="focus-autoplay-checkbox"
                    checked={autoPlay}
                    onChange={(e) => onAutoPlayToggle(e.target.checked)}
                    className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Typing Sounds Feedback */}
                <div className="pt-2.5 mt-2 border-t border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-200 font-medium">Typing Sounds</span>
                    <button
                      type="button"
                      id="focus-typing-sound-toggle-btn"
                      onClick={() => handleToggleTypingSound(!typingSoundEnabled)}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                        typingSoundEnabled ? 'bg-amber-500' : 'bg-neutral-800'
                      }`}
                      aria-label="Toggle typing sound"
                    >
                      <span
                        className={`inline-block h-2.5 w-2.5 transform rounded-full bg-neutral-950 transition-transform ${
                          typingSoundEnabled ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className={`space-y-1 transition-opacity ${typingSoundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>Volume</span>
                      <span className="font-mono text-amber-400 font-semibold">{Math.round(typingSoundVolume * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <VolumeX className="w-3 h-3 text-neutral-500 shrink-0" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={typingSoundVolume}
                        onChange={(e) => handleTypingVolumeChange(parseFloat(e.target.value))}
                        onMouseUp={() => typingSoundService.playCorrectKey()}
                        onTouchEnd={() => typingSoundService.playCorrectKey()}
                        className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        aria-label="Typing sound volume"
                      />
                      <Volume2 className="w-3 h-3 text-neutral-400 shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Exit Button */}
          <button
            type="button"
            id="focus-exit-esc-btn"
            onClick={onExit}
            className="flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-xs font-mono shrink-0"
            title="Exit Focus Mode (ESC)"
            aria-label="Exit lesson"
          >
            <span className="hidden sm:inline">ESC</span>
            <X size={15} className="sm:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
}
