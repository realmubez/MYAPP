import { Sparkles, RefreshCw, X } from 'lucide-react';
import { usePwaUpdate } from '../../hooks/usePwaUpdate';

export function PwaUpdatePrompt() {
  const { needRefresh, isTypingActive, triggerUpdate, dismissRefresh } = usePwaUpdate();

  // If no update needed, do not render
  if (!needRefresh) return null;

  // If the user is actively typing, completing a lesson, or in Mistake Review,
  // do NOT render or interrupt. Wait until they navigate away or finish.
  if (isTypingActive) return null;

  return (
    <aside
      id="pwa-update-prompt-banner"
      aria-label="Application Update Notice"
      className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full p-4 rounded-2xl border border-amber-500/50 bg-[#161412] text-neutral-100 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 shrink-0 border border-amber-500/30">
          <Sparkles className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-bold text-white tracking-tight">
            New version available
          </p>
          <p className="text-[11px] text-neutral-400 leading-snug">
            An update to MY LEARNING is ready. Refresh to load the latest enhancements.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              id="pwa-update-action-btn"
              onClick={triggerUpdate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all cursor-pointer active:scale-98 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update</span>
            </button>
            <button
              type="button"
              id="pwa-dismiss-action-btn"
              onClick={dismissRefresh}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissRefresh}
          className="text-neutral-500 hover:text-neutral-300 p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
