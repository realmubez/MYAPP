import { useState } from 'react';
import { Play, Keyboard, ArrowLeft, Timer, Quote, Sparkles, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TypingPage() {
  const [selectedMode, setSelectedMode] = useState<'words' | 'time' | 'quotes' | 'swedish' | 'code'>('words');
  const [timeLimit, setTimeLimit] = useState<number>(30);

  const practiceModes = [
    {
      id: 'words',
      label: 'Top Words',
      desc: 'Top 200 high-frequency words in English or Swedish.',
    },
    {
      id: 'time',
      label: 'Timed Sprints',
      desc: 'Pure concentration sprints for 15s, 30s, or 60s.',
    },
    {
      id: 'quotes',
      label: 'Famous Quotes',
      desc: 'Punctuation, capitalization, and flowing prose.',
    },
    {
      id: 'swedish',
      label: 'Swedish Keys (å, ä, ö)',
      desc: 'Master reach for Scandinavian Nordic letters.',
    },
    {
      id: 'code',
      label: 'Code Symbols',
      desc: 'Brackets, braces, equals signs, colons & indentation.',
    },
  ];

  return (
    <div id="typing-practice-page" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <Link
            to="/"
            id="back-to-dashboard-typing"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">⌨️</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Typing <span className="text-neutral-400 text-lg font-normal">Practice</span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                Minimalist speed, rhythm, and accuracy engine
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/lesson/type-nordic-1"
          id="start-typing-session-btn"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/10 hover:bg-amber-400 transition-all self-start sm:self-auto"
        >
          <Play className="w-4 h-4 fill-neutral-950" />
          <span>Launch Typing Session</span>
        </Link>
      </div>

      {/* Mode Selector (Minimalist bar) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-neutral-400 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Practice Mode</span>
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            Focus Mode
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {practiceModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id as any)}
              className={`text-left p-3 rounded-xl border transition-all ${
                selectedMode === mode.id
                  ? 'border-amber-500/80 bg-amber-500/15 text-white'
                  : 'border-neutral-800/80 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <p className="text-xs font-semibold text-neutral-200">{mode.label}</p>
              <p className="text-[11px] text-neutral-400 mt-1 leading-snug line-clamp-2">
                {mode.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Timed duration options if time sprint */}
        {selectedMode === 'time' && (
          <div className="pt-2 flex items-center gap-2 text-xs text-neutral-400">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span>Duration:</span>
            {[15, 30, 60, 120].map((sec) => (
              <button
                key={sec}
                onClick={() => setTimeLimit(sec)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  timeLimit === sec
                    ? 'bg-amber-500 text-neutral-950 font-semibold'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Target Content Snippet Preview */}
      <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Current Exercise Preview
          </span>
          <span className="text-xs text-amber-400 font-mono">
            Nordic Letters Drill
          </span>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 font-mono text-base sm:text-lg text-neutral-400 leading-relaxed tracking-wide">
          <p>
            <span className="text-neutral-100">många fåglar flyger över</span>{' '}
            <span className="relative inline-block text-neutral-500">
              sjön
              <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-amber-400 animate-pulse" />
            </span>{' '}
            <span className="text-neutral-600">i den svala kvällen</span>
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-400 pt-2">
          <span>Targeting seamless reach for å, ä, and ö</span>
          <Link
            to="/lesson/type-nordic-1"
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            Launch in Full Screen Focus Mode →
          </Link>
        </div>
      </div>
    </div>
  );
}
