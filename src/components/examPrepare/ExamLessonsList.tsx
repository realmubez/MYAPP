import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { EXAM_LESSONS, ExamLesson } from '../../data/examPrepare/straightforwardUnits';

interface ExamLessonsListProps {
  completedLessonIds: string[];
  bookmarkedLessonIds: string[];
  onSelectLesson: (lesson: ExamLesson) => void;
}

export const ExamLessonsList: React.FC<ExamLessonsListProps> = ({
  completedLessonIds,
  bookmarkedLessonIds,
  onSelectLesson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const [sprintFilter, setSprintFilter] = useState<'all' | 'day1' | 'day2'>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    EXAM_LESSONS.forEach((l) => set.add(l.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredLessons = useMemo(() => {
    return EXAM_LESSONS.filter((l) => {
      // 2-Day Sprint filtering
      // Day 1: Lessons 1-8 (Basics & Unit 1)
      // Day 2: Lessons 9-16 (Unit 2 & Repetition Worksheet)
      if (sprintFilter === 'day1' && l.number > 8) return false;
      if (sprintFilter === 'day2' && l.number <= 8) return false;

      const matchesCategory =
        activeCategory === 'all' || l.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.unit.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, sprintFilter]);

  return (
    <div className="w-full space-y-4">
      {/* 2-Day Sprint Plan Banner & Toggle */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-[#181410] to-[#14100c] border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>2-Day Exam Sprint Study Plan</span>
          </div>
          <p className="text-[11px] text-neutral-300">
            Targeted preparation for Straightforward Elementary Units 1–2D in 48 hours.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setSprintFilter('all')}
            className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sprintFilter === 'all'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            All 16 Lessons
          </button>
          <button
            type="button"
            onClick={() => setSprintFilter('day1')}
            className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sprintFilter === 'day1'
                ? 'bg-sky-500 text-neutral-950 shadow'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            Day 1: Basics & Unit 1 (1–8)
          </button>
          <button
            type="button"
            onClick={() => setSprintFilter('day2')}
            className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sprintFilter === 'day2'
                ? 'bg-emerald-500 text-neutral-950 shadow'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            Day 2: Unit 2 & Repetition (9–16)
          </button>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons (e.g. Present simple, Verb to be, Countries, Appearance)..."
            className="w-full min-h-[44px] pl-10 pr-4 rounded-2xl bg-[#16120e] border border-neutral-800 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-amber-400 outline-none transition-colors"
          />
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`min-h-[32px] px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'bg-[#181410] text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat === 'all' ? 'All Topics' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredLessons.map((lesson) => {
          const isDone = completedLessonIds.includes(lesson.id);
          const isBookmarked = bookmarkedLessonIds.includes(lesson.id);

          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onSelectLesson(lesson)}
              className={`group w-full p-4 sm:p-5 rounded-3xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                isDone
                  ? 'bg-[#14120f] border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-[#15120f] border-neutral-800 hover:border-amber-500/40 hover:bg-[#1a1612] shadow-sm'
              }`}
            >
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : lesson.number}
                    </span>
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {lesson.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                    {isBookmarked && (
                      <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    )}
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" /> ~{lesson.estimatedMinutes}m
                    </span>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {lesson.title}
                </h3>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 w-full text-xs">
                <span className="text-[11px] text-neutral-400">
                  {lesson.category} · {lesson.practiceQuestions.length} practice questions
                </span>
                <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
