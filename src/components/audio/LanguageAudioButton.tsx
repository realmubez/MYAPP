import { useState, useEffect, MouseEvent } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import {
  lessonSpeechManager,
  LessonSpeechState,
} from '../../services/tts';

export interface LanguageAudioButtonProps {
  text?: string | null;
  language: 'en' | 'so' | 'sv';
  audioKey?: string;
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  disabled?: boolean;
}

export function LanguageAudioButton({
  text,
  language,
  audioKey,
  label,
  size = 'sm',
  className = '',
  disabled = false,
}: LanguageAudioButtonProps) {
  const [speechState, setSpeechState] = useState<LessonSpeechState>(() =>
    lessonSpeechManager.getState()
  );

  useEffect(() => {
    return lessonSpeechManager.subscribe((nextState) => {
      setSpeechState({ ...nextState });
    });
  }, []);

  if (!text || !text.trim()) {
    return null;
  }

  const effectiveKey = audioKey || `${language}:${text.trim()}`;
  const isPlaying = speechState.playingKey === effectiveKey;
  const isLoading = speechState.loadingKey === effectiveKey;
  const isError = speechState.errorKey === effectiveKey;

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (disabled || !text.trim()) return;

    lessonSpeechManager.playSpeech({
      key: effectiveKey,
      text,
      language,
    });
  };

  const defaultLabel =
    label ||
    (language === 'so'
      ? 'Listen in Somali'
      : language === 'sv'
      ? 'Listen in Swedish'
      : 'Listen in English');

  // Size styling variants
  const sizeClasses =
    size === 'xs'
      ? 'p-1 rounded-md text-[11px]'
      : size === 'md'
      ? 'p-2 rounded-xl text-sm'
      : 'p-1.5 rounded-lg text-xs';

  const iconSize = size === 'xs' ? 13 : size === 'md' ? 17 : 14;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={defaultLabel}
      title={`${defaultLabel} (Edge TTS)`}
      className={`inline-flex items-center justify-center shrink-0 transition-all duration-150 cursor-pointer select-none touch-manipulation focus:outline-none ${
        isPlaying
          ? 'text-amber-400 bg-amber-500/20 ring-1 ring-amber-500/40 shadow-sm animate-pulse'
          : isError
          ? 'text-red-400/80 bg-red-950/30 hover:bg-red-950/50 hover:text-red-300'
          : 'text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/80 active:bg-neutral-800 active:scale-95'
      } ${sizeClasses} ${className}`}
    >
      {isLoading ? (
        <Loader2 size={iconSize} className="animate-spin text-amber-400" />
      ) : isError ? (
        <VolumeX size={iconSize} className="text-red-400" />
      ) : (
        <Volume2
          size={iconSize}
          className={isPlaying ? 'text-amber-400 animate-pulse' : 'text-current'}
        />
      )}
    </button>
  );
}
