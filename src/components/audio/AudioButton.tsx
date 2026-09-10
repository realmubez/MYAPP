import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface AudioButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  error?: string | null;
  onPlay: () => void;
  className?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function AudioButton({
  isPlaying,
  isLoading,
  error,
  onPlay,
  className = '',
  size = 'md',
  disabled = false,
}: AudioButtonProps) {
  const iconSize = size === 'sm' ? 16 : 18;
  const btnPadding = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        id="focus-audio-button"
        onClick={onPlay}
        disabled={disabled || isLoading}
        title={error ? error : isPlaying ? 'Replay audio' : 'Listen to audio'}
        className={`inline-flex items-center justify-center rounded-lg transition-all duration-150 border border-neutral-800 hover:border-neutral-700 active:scale-95 focus:outline-none focus:ring-1 focus:ring-amber-500/50 ${
          isPlaying
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            : 'bg-neutral-900/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
        } ${btnPadding} ${className}`}
        aria-label="Play audio"
      >
        {isLoading ? (
          <Loader2 size={iconSize} className="animate-spin text-amber-400" />
        ) : error ? (
          <VolumeX size={iconSize} className="text-red-400" />
        ) : (
          <Volume2
            size={iconSize}
            className={isPlaying ? 'animate-pulse text-amber-400' : 'text-neutral-300'}
          />
        )}
      </button>

      {/* Error badge if audio fails */}
      {error && (
        <span className="absolute -bottom-6 right-0 whitespace-nowrap text-[10px] text-red-400 bg-neutral-900/95 px-2 py-0.5 rounded border border-red-900/60 pointer-events-none z-50 shadow-md">
          {error}
        </span>
      )}
    </div>
  );
}
