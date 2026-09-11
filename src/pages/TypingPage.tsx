import { useState } from 'react';
import { Play, ArrowLeft, Timer, Sliders, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTouchTypingProgress } from '../data/typingCurriculum';

export function TypingPage() {
  const [selectedMode, setSelectedMode] = useState<'words' | 'time' | 'quotes' | 'swedish' | 'code'>('words');
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const touchProgress = getTouchTypingProgress(1);

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
    <div id="typing-practice-page" className="w-full max-w-5xl lg:max-w-6xl space-y-6 lg:space-y-8 pb-24 lg:pb-12 text-neutral-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Typing Practice
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                Minimalist speed, rhythm, and accuracy keyboard engine
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/lesson/type-nordic-1"
          id="start-typing-session-btn"
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-neutral-950 shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <Play className="w-4 h-4 fill-neutral-950 translate-x-0.5" />
          <span>Launch Typing Session</span>
        </Link>
      </div>

      {/* Touch Typing Practice Hub - Day 1 Home Row */}
      <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#1c1712] via-[#141210] to-[#0d0c0a] p-5 sm:p-7 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles size={12} />
              <span>Touch Typing · Muscle Memory</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Day 1 · Home Row Basics
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300">
              Build true physical keyboard muscle memory. Practice exclusively with:
            </p>
            <div className="inline-flex items-center gap-2 pt-1 font-mono text-xs sm:text-sm font-bold text-amber-300">
              <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800">a s d f</span>
              <span className="text-neutral-500">·</span>
              <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800">j k l ;</span>
            </div>
          </div>

          <Link
            to="/typing/day-1"
            id="start-touch-typing-day1-btn"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-xs sm:text-sm font-bold text-neutral-950 shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Play className="w-4 h-4 fill-neutral-950 translate-x-0.5" />
            <span>
              {touchProgress.completed
                ? 'Practice Day 1 Again'
                : touchProgress.currentExerciseIndex > 0
                ? `Resume Day 1 (${touchProgress.currentExerciseIndex + 1}/10)`
                : 'Start Day 1 Practice'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Mode Selector (Minimalist bar) */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#141210] p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-neutral-400 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Practice Mode</span>
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            Focus Mode
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {practiceModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id as any)}
              className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                selectedMode === mode.id
                  ? 'border-amber-500/80 bg-amber-500/15 text-white shadow-sm'
                  : 'border-neutral-800/80 bg-[#0d0c0a] text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
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
                className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                  timeLimit === sec
                    ? 'bg-amber-400 text-neutral-950 font-bold'
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
      <div className="rounded-3xl border border-neutral-800/80 bg-[#141210] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Current Exercise Preview
          </span>
          <span className="text-xs text-amber-400 font-mono">
            Nordic Letters Drill
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 font-mono text-base sm:text-lg text-neutral-400 leading-relaxed tracking-wide">
          <p>
            <span className="text-neutral-100">många fåglar flyger över</span>{' '}
            <span className="relative inline-block text-neutral-500">
              sjön
              <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-amber-400 animate-pulse" />
            </span>{' '}
            <span className="text-neutral-600">i den svala kvällen</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400 pt-2">
          <span>Targeting seamless reach for å, ä, and ö</span>
          <Link
            to="/lesson/type-nordic-1"
            className="text-amber-400 hover:text-amber-300 font-semibold"
          >
            Launch in Full Screen Focus Mode →
          </Link>
        </div>
      </div>
    </div>
  );
}
