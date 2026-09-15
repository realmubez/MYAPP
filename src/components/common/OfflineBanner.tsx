import { WifiOff, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface OfflineBannerProps {
  className?: string;
}

export function OfflineBanner({ className = '' }: OfflineBannerProps) {
  const { isOnline, wasOffline } = useNetworkStatus();

  // If online and was never offline in this session, show nothing
  if (isOnline) {
    if (!wasOffline) return null;
    // Briefly show reconnected notification or null
    return null;
  }

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div
      id="pwa-offline-banner"
      role="status"
      aria-live="polite"
      className={`rounded-2xl border border-amber-500/40 bg-[#151310] p-4 text-neutral-200 shadow-md ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 shrink-0 border border-amber-500/30">
          <WifiOff className="w-4 h-4" />
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              You're offline
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Offline Mode
            </span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            Your locally available learning progress is still safe.
          </p>

          <div className="text-[11px] text-neutral-400 pt-1 space-y-1">
            <p className="font-medium text-neutral-300">Some features require an internet connection:</p>
            <ul className="list-disc list-inside space-y-0.5 text-neutral-400 pl-1">
              <li>Lesson audio (TTS)</li>
              <li>Telegram synchronization</li>
              <li>Cloud features in the future</li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              type="button"
              id="pwa-offline-retry-btn"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-white transition-colors cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
