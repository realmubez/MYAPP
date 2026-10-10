import React from 'react';
import {
  Volume2,
  Square,
  RotateCcw,
  Sparkles,
  Sliders,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useEdgeTTS } from '../../hooks/useEdgeTTS';
import { TTSRate } from '../../services/tts';

export const ExamVoiceSettingsBar: React.FC = () => {
  const {
    selectedVoice,
    selectedRate,
    availableVoices,
    availableRates,
    isSpeaking,
    loadingKey,
    errorKey,
    errorMessage,
    stop,
    repeatLast,
    changeVoice,
    changeRate,
    play,
  } = useEdgeTTS('en');

  const selectedVoiceObj = availableVoices.find((v) => v.id === selectedVoice);

  const handleTestVoice = () => {
    play('voice-test', 'She lives in a small town.', { voice: selectedVoice, rate: selectedRate });
  };

  return (
    <div className="w-full bg-[#16120e] border border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-sm space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Voice Selector Label & Edge Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white tracking-tight">
                Edge Neural Speech Voice
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Backend Connected</span>
              </span>
              {selectedVoiceObj && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {selectedVoiceObj.region}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 truncate">
              Natural neural pronunciation ({availableVoices.length} neural voices available: English, German, Swedish, Somali)
            </p>
          </div>
        </div>

        {/* Playback status & Stop / Repeat / Test Voice buttons */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          {loadingKey && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-semibold">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Loading Audio...</span>
            </div>
          )}

          {isSpeaking && !loadingKey && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Playing...</span>
            </div>
          )}

          {errorKey && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
              <AlertCircle className="w-3 h-3" />
              <span>{errorMessage || 'Audio unavailable'}</span>
            </div>
          )}

          {isSpeaking ? (
            <button
              type="button"
              onClick={stop}
              className="min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
              title="Stop audio playback"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTestVoice}
              className="min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-800/80 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 border border-neutral-700 transition-colors flex items-center gap-1 cursor-pointer"
              title="Test pronunciation sample"
            >
              <Volume2 className="w-3 h-3" />
              <span className="hidden xs:inline">Test Sample</span>
            </button>
          )}

          <button
            type="button"
            onClick={repeatLast}
            className="min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors flex items-center gap-1 cursor-pointer"
            title="Repeat last spoken phrase"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden xs:inline">Repeat</span>
          </button>
        </div>
      </div>

      {/* Voice Dropdown and Speed Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-neutral-800/80">
        {/* Voice Selector */}
        <div className="sm:col-span-2">
          <label htmlFor="exam-voice-select" className="sr-only">
            Select Edge TTS Voice
          </label>
          <select
            id="exam-voice-select"
            value={selectedVoice}
            onChange={(e) => changeVoice(e.target.value)}
            className="w-full min-h-[36px] px-3 py-1.5 rounded-xl bg-[#1f1a15] border border-neutral-700/80 text-xs text-white focus:border-amber-400 outline-none transition-colors"
          >
            <optgroup label="English Voices (Straightforward Exam Course)">
              {availableVoices
                .filter((v) => v.language === 'en')
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.region}) — {v.description}
                  </option>
                ))}
            </optgroup>
            <optgroup label="German Voices">
              {availableVoices
                .filter((v) => v.language === 'de')
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.region}) — {v.description}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Swedish Voices">
              {availableVoices
                .filter((v) => v.language === 'sv')
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.region}) — {v.description}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Somali Voices">
              {availableVoices
                .filter((v) => (v.language as string) === 'so')
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.region}) — {v.description}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* Speed Rate Pill Buttons (-20%, -10%, 0%, +10%) */}
        <div className="flex items-center gap-1 justify-between sm:justify-end">
          <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1 mr-1">
            <Sliders className="w-3 h-3" /> Speed:
          </span>
          {availableRates.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => changeRate(r as TTSRate)}
              className={`min-h-[32px] px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedRate === r
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'bg-neutral-800/80 text-neutral-300 hover:text-white border border-neutral-700/70'
              }`}
            >
              {r === '0%' ? '1.0x' : r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
