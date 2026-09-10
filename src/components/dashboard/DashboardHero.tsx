import { Link } from 'react-router-dom';
import { Play, BarChart2, ArrowRight } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';

export function DashboardHero() {
  const { progress } = useProgress();
  const lastPos = progress.lastPosition;
  const continueRoute = lastPos?.subjectId ? `/${lastPos.subjectId}` : '/swedish';

  return (
    <div
      id="dashboard-hero-banner"
      className="relative overflow-hidden rounded-3xl border border-neutral-800/80 bg-gradient-to-r from-[#1c1611] via-[#161310] to-[#1a1511] p-6 sm:p-8 shadow-xl"
    >
      {/* Subtle warm amber ambient glow effect */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 -bottom-10 h-48 w-48 rounded-full bg-amber-600/5 blur-2xl" />

      {/* Decorative subtle atmospheric hills / lines in background */}
      <svg
        className="pointer-events-none absolute right-0 top-0 bottom-0 h-full w-1/2 opacity-20 text-amber-500/20"
        viewBox="0 0 400 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0 200 C100 120 180 160 260 90 C320 40 370 70 400 50 L400 200 Z"
          fill="currentColor"
        />
        <path
          d="M60 200 C150 140 220 170 300 110 C350 70 380 90 400 80 L400 200 Z"
          fill="currentColor"
          opacity="0.5"
        />
      </svg>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left Welcome Copy & CTAs */}
        <div className="space-y-4 max-w-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Welcome <span className="text-amber-400">back!</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal mt-1.5 leading-relaxed">
              Small steps every day make a big difference.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              to={continueRoute}
              id="hero-continue-learning-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-400/20 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-neutral-950 translate-x-0.5" />
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/progress"
              id="hero-view-progress-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 text-xs sm:text-sm font-medium transition-all active:scale-95 cursor-pointer"
            >
              <BarChart2 className="w-4 h-4 text-neutral-400" />
              <span>View Progress</span>
            </Link>
          </div>
        </div>

        {/* Right Quote Card (Visible on tablet & desktop) */}
        <div className="hidden sm:flex flex-col items-end justify-center self-end md:self-center text-right max-w-xs pl-4 border-l md:border-l-0 border-neutral-800">
          <p className="text-xs lg:text-sm text-neutral-300 italic leading-relaxed">
            “Discipline today creates freedom tomorrow.”
          </p>
          <div className="mt-2 h-0.5 w-16 bg-amber-400/60 rounded-full" />
        </div>
      </div>
    </div>
  );
}
