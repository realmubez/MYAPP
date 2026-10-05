import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, BookOpen, FileText, Sparkles, BarChart2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

export function SpacePlaceholderPage() {
  const { spaceSlug } = useParams<{ spaceSlug: string }>();
  const navigate = useNavigate();
  const { profile, isAdmin } = useProfile();

  const spaceTitle = spaceSlug === 'sisproject' ? 'SisProject' : (spaceSlug ? spaceSlug.toUpperCase() : 'Managed Learning Space');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <span>/</span>
        <span className="text-amber-400 font-mono">{spaceTitle}</span>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-[#14110e] p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-lg font-bold mx-auto">
          &gt;_
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          {spaceTitle}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg mx-auto">
          This managed learning space architecture is configured. In Phase 4 & Phase 5, active curriculum publishing and dedicated student learning spaces will be populated here.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/learn"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Go to Learn Hub</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold transition-all"
          >
            <span>Personal Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
