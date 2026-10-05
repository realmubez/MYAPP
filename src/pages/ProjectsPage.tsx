import { useState } from 'react';
import {
  FolderKanban,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Shield,
  Layers,
  Code2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';

interface DemoProject {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  tasksDone: number;
  totalTasks: number;
  status: 'active' | 'planning' | 'completed';
}

const INITIAL_PROJECTS: DemoProject[] = [
  {
    id: 'prj-1',
    title: 'Python CLI Automation & Data Parser',
    description: 'Building custom scripts to parse data logs, format structured reports, and manage file pipelines.',
    category: 'Python',
    progress: 65,
    tasksDone: 6,
    totalTasks: 9,
    status: 'active',
  },
  {
    id: 'prj-2',
    title: 'Swedish B1 Fluency & Writing Portfolio',
    description: 'Collection of written essays, conversational dialogues, and advanced listening transcriptions.',
    category: 'Swedish',
    progress: 40,
    tasksDone: 4,
    totalTasks: 10,
    status: 'active',
  },
  {
    id: 'prj-3',
    title: 'Taxi Theory Examination Preparation',
    description: 'Comprehensive study schedule covering navigation, regulations, vehicle safety, and passenger care.',
    category: 'Taxi Theory',
    progress: 85,
    tasksDone: 17,
    totalTasks: 20,
    status: 'active',
  },
];

export function ProjectsPage() {
  const navigate = useNavigate();
  const { profile, isAdmin } = useProfile();
  const [projects] = useState<DemoProject[]>(INITIAL_PROJECTS);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">
              <FolderKanban className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              Execution & Goals
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Projects
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Practical learning projects, coding assignments, portfolios, and managed study spaces.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-amber-500/10 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Managed Learning Spaces (For Admin / Owner) */}
      {isAdmin && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#18130e] to-[#14110e] p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                  <Shield className="w-3 h-3" />
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  Managed Learning Space
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                SisProject — Guided School & Language Space
              </h2>
              <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                Dedicated learning environment for German B1, Mathematics (German school curriculum), and English with Somali translation assistance.
              </p>
            </div>

            <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-semibold">
              Owner / Manager
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <span className="text-[10px] text-neutral-400 font-mono">Curriculum</span>
              <p className="text-xs font-semibold text-white mt-0.5">German B1 · Math · English</p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <span className="text-[10px] text-neutral-400 font-mono">Support Languages</span>
              <p className="text-xs font-semibold text-white mt-0.5">German (Primary) + Somali Help</p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <span className="text-[10px] text-neutral-400 font-mono">Architecture Status</span>
              <p className="text-xs font-semibold text-amber-400 mt-0.5">Phase 1 Navigation Active</p>
            </div>
          </div>
        </div>
      )}

      {/* Personal Learning Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-amber-400" />
            <span>Personal Learning Projects</span>
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            {projects.length} active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl border border-neutral-800/80 bg-[#14110e] p-5 hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                    {proj.category}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {proj.tasksDone}/{proj.totalTasks} tasks
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 leading-tight">
                  {proj.title}
                </h3>

                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 mb-4">
                  {proj.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-neutral-800/60">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-neutral-400">Progress</span>
                    <span className="text-amber-400 font-semibold">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
                >
                  <span>Open Project</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
