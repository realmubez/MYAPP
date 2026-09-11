import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HomeKeysIntroProps {
  onStart: () => void;
}

export const HomeKeysIntro: React.FC<HomeKeysIntroProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center px-4 py-8 sm:py-12 animate-in fade-in duration-300">
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider mb-6">
        <Sparkles size={13} />
        <span>Touch Typing · Foundation</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
        The Home Position
      </h1>
      <p className="text-sm sm:text-base text-neutral-400 max-w-md mb-8 leading-relaxed">
        Place your index fingers on the two anchor keys. Feel the small raised bumps with your fingertips.
      </p>

      {/* Visual representation of F and J with tactile bump markers */}
      <div className="flex items-center justify-center gap-6 sm:gap-10 my-4">
        {/* F Key */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1a1714] border-2 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.15)] text-white">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-300">F</span>
            {/* Tactile marker bump */}
            <span
              aria-hidden="true"
              className="w-5 h-1 bg-amber-400 rounded-full mt-1 shadow-sm"
              title="Tactile marker"
            />
          </div>
          <span className="text-xs font-mono text-neutral-400">Left Index</span>
        </div>

        {/* Separator / Hands gap */}
        <div className="flex flex-col items-center justify-center gap-1 text-neutral-600">
          <span className="text-xs font-mono tracking-widest uppercase">Home</span>
          <span className="text-xs font-mono text-neutral-700">• • •</span>
          <span className="text-xs font-mono tracking-widest uppercase">Keys</span>
        </div>

        {/* J Key */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1a1714] border-2 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.15)] text-white">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-300">J</span>
            {/* Tactile marker bump */}
            <span
              aria-hidden="true"
              className="w-5 h-1 bg-amber-400 rounded-full mt-1 shadow-sm"
              title="Tactile marker"
            />
          </div>
          <span className="text-xs font-mono text-neutral-400">Right Index</span>
        </div>
      </div>

      {/* Subtle compact finger rest overview */}
      <div className="w-full max-w-md bg-[#141210] border border-neutral-800/80 rounded-2xl p-4 my-6 text-left">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-amber-400/90 font-mono font-semibold uppercase tracking-wider block mb-1.5 text-[11px]">
              Left Hand
            </span>
            <ul className="space-y-1 text-neutral-300 font-mono text-[12px]">
              <li><span className="text-amber-300 font-bold">A</span> = pinky</li>
              <li><span className="text-amber-300 font-bold">S</span> = ring</li>
              <li><span className="text-amber-300 font-bold">D</span> = middle</li>
              <li><span className="text-amber-300 font-bold">F</span> = index</li>
            </ul>
          </div>
          <div>
            <span className="text-amber-400/90 font-mono font-semibold uppercase tracking-wider block mb-1.5 text-[11px]">
              Right Hand
            </span>
            <ul className="space-y-1 text-neutral-300 font-mono text-[12px]">
              <li><span className="text-amber-300 font-bold">J</span> = index</li>
              <li><span className="text-amber-300 font-bold">K</span> = middle</li>
              <li><span className="text-amber-300 font-bold">L</span> = ring</li>
              <li><span className="text-amber-300 font-bold">;</span> = pinky</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        type="button"
        id="start-touch-typing-btn"
        onClick={onStart}
        className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
      >
        <span>Start Practice</span>
        <ArrowRight size={16} />
      </button>

      <span className="text-[11px] text-neutral-500 mt-3 font-mono">
        Press Enter or click to begin Exercise 1
      </span>
    </div>
  );
};
