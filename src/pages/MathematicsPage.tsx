import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  Languages,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  BookOpen,
  HelpCircle,
  Award,
  PenTool,
  Volume2,
  RotateCcw,
  ListOrdered,
} from 'lucide-react';
import { MATH_SECTIONS } from '../data/courses/mathematics/curriculumData';
import { MathSectionItem } from '../components/math/MathSectionItem';
import { MathView } from '../components/math/MathView';
import {
  MathVocabModal,
  MATH_VOCAB_TERMS,
  MathVocabTerm,
} from '../components/math/MathVocabModal';
import { FingerScratchpad } from '../components/math/FingerScratchpad';

export function MathematicsPage() {
  // Mobile accordion state: first section open by default, users can toggle any
  const [openSectionIds, setOpenSectionIds] = useState<Record<string, boolean>>({
    'ganze-zahlen': true,
  });

  // Dual-language helper toggle for Somali learner (A2 German + Somali support)
  const [showSomali, setShowSomali] = useState<boolean>(true);

  // Quick navigation / filter
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Interactive Tools state
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isVocabModalOpen, setIsVocabModalOpen] = useState<boolean>(false);
  const [selectedVocabTerm, setSelectedVocabTerm] = useState<MathVocabTerm | null>(null);

  // Overall progress tracker across all sections
  const [completedCount, setCompletedCount] = useState<number>(0);

  const totalExercises = useMemo(() => {
    return MATH_SECTIONS.reduce((acc, curr) => acc + curr.exercises.length, 0);
  }, []);

  // Update total completed count from localStorage
  const updateProgress = () => {
    let count = 0;
    MATH_SECTIONS.forEach((sec) => {
      sec.exercises.forEach((ex) => {
        try {
          if (localStorage.getItem(`math_done_${ex.id}`) === 'true') {
            count += 1;
          }
        } catch {
          // ignore
        }
      });
    });
    setCompletedCount(count);
  };

  useEffect(() => {
    updateProgress();
    const interval = setInterval(updateProgress, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleResetAllProgress = () => {
    if (window.confirm('Möchtest du deinen Lernfortschritt wirklich zurücksetzen? (Dib u bilow?)')) {
      MATH_SECTIONS.forEach((sec) => {
        sec.exercises.forEach((ex) => {
          try {
            localStorage.removeItem(`math_done_${ex.id}`);
          } catch {
            // ignore
          }
        });
      });
      updateProgress();
      window.location.reload();
    }
  };

  const toggleSection = (id: string) => {
    setOpenSectionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    MATH_SECTIONS.forEach((s) => {
      all[s.id] = true;
    });
    setOpenSectionIds(all);
  };

  const collapseAll = () => {
    setOpenSectionIds({});
  };

  const handleOpenTerm = (termId?: string) => {
    if (termId) {
      const match = MATH_VOCAB_TERMS.find((t) => t.id === termId);
      if (match) setSelectedVocabTerm(match);
    } else {
      setSelectedVocabTerm(MATH_VOCAB_TERMS[0]);
    }
    setIsVocabModalOpen(true);
  };

  const filteredSections = useMemo(() => {
    if (activeFilter === 'all') return MATH_SECTIONS;
    return MATH_SECTIONS.filter((s) => s.id === activeFilter);
  }, [activeFilter]);

  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  return (
    <div className="w-full min-h-screen bg-[#0a0908] text-neutral-100 flex flex-col items-center overflow-x-hidden selection:bg-amber-500 selection:text-neutral-950">
      {/* Top Mobile-Sticky Compact Header (No desktop sidebar, pure single-page focus) */}
      <header className="sticky top-0 z-30 w-full bg-[#0e0c0b]/95 backdrop-blur-md border-b border-neutral-800/80 px-2.5 sm:px-6 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-neutral-950 shadow-md shrink-0 font-bold">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-bold text-white tracking-tight truncate">
                Mathematik Lernen
              </h1>
              <p className="text-[10px] sm:text-xs text-neutral-400 truncate">
                Klasse 7–9 · Ganze Zahlen & Algebren
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Somali / German language helper toggle */}
            <button
              type="button"
              onClick={() => setShowSomali(!showSomali)}
              className={`min-h-[36px] px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
                showSomali
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
              title="Somali-Hilfstexte ein- oder ausschalten"
            >
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="text-[11px] sm:text-xs font-bold">
                {showSomali ? 'SO: AN' : 'SO: AUS'}
              </span>
            </button>
          </div>
        </div>

        {/* Subtle Progress Bar below header */}
        <div className="w-full max-w-3xl mx-auto mt-2">
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Single Page Content */}
      <main className="w-full max-w-3xl px-2.5 sm:px-6 py-4 sm:py-6 space-y-5 flex-1 pb-32">
        {/* Welcome Hero Card with quick pedagogical guidance for German A2 / Somali learner */}
        <section className="w-full bg-gradient-to-b from-[#171412] to-[#12100f] border border-amber-500/25 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-block">
                Einfach & Schritt für Schritt (A2 Niveau)
              </span>
              <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                Mathe verstehen, nicht nur auswendig lernen
              </h2>
            </div>
            <Award className="w-6 h-6 text-amber-400 shrink-0 hidden sm:block" />
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Willkommen! Hier lernst du alle Grundlagen von den <strong>ganzen Zahlen</strong> bis zu den <strong>Termen</strong> und <strong>Textaufgaben</strong>.
          </p>

          {showSomali && (
            <p className="text-xs text-amber-300/90 italic pt-1 border-t border-neutral-800/80 leading-relaxed">
              Ku soo dhowaw! Halkan waxaad ku baranaysaa xisaabta aasaasiga ah laga bilaabo tirooyinka togan iyo taban ilaa aljebraha iyo xallinta dhibaatooyinka qoraalka ah.
            </p>
          )}

          {/* Quick Stats & Controls Bar */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800/80 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{completedCount}/{totalExercises} gelöst ({progressPercent}%)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={expandAll}
                className="text-[11px] font-medium text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800/70 hover:bg-neutral-800 transition-colors"
              >
                Alle öffnen
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="text-[11px] font-medium text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800/70 hover:bg-neutral-800 transition-colors"
              >
                Schließen
              </button>
              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetAllProgress}
                  className="text-[11px] font-medium text-rose-400/90 hover:text-rose-300 px-2 py-1 rounded bg-rose-950/30 border border-rose-500/20 transition-colors flex items-center gap-1"
                  title="Fortschritt zurücksetzen"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Quick Access Mobile Tools Banner (Finger Scratchpad & Audio Dictionary) */}
        <section className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsScratchpadOpen(true)}
            className="min-h-[50px] p-2.5 rounded-2xl bg-[#161412] hover:bg-[#1d1a17] border border-amber-500/30 text-left flex items-center gap-2.5 transition-all active:scale-98 shadow-md"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <PenTool className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                Finger-Notizblock ✍️
              </span>
              <span className="text-[10px] text-neutral-400 block truncate">
                Auf dem Bildschirm rechnen
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOpenTerm()}
            className="min-h-[50px] p-2.5 rounded-2xl bg-[#161412] hover:bg-[#1d1a17] border border-sky-500/30 text-left flex items-center gap-2.5 transition-all active:scale-98 shadow-md"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                Wörterbuch (Audio) 🔊
              </span>
              <span className="text-[10px] text-neutral-400 block truncate">
                Deutsch · Somali · English
              </span>
            </div>
          </button>
        </section>

        {/* Mobile Horizontal Topic Pill Selector for Fast Scrolling / Jump */}
        <nav aria-label="Themenübersicht" className="w-full overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'bg-[#151311] text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              Alle 9 Themen
            </button>
            {MATH_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setActiveFilter(sec.id);
                  setOpenSectionIds((prev) => ({ ...prev, [sec.id]: true }));
                }}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs transition-all ${
                  activeFilter === sec.id
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                    : 'bg-[#151311] text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {sec.number}. {sec.titleDe.split('(')[0].replace(/^\d+\.\s*/, '').trim()}
              </button>
            ))}
          </div>
        </nav>

        {/* 9 Comprehensive Learning Sections (All on this single page) */}
        <div className="space-y-4">
          {filteredSections.map((section) => (
            <MathSectionItem
              key={section.id}
              section={section}
              isOpen={!!openSectionIds[section.id]}
              onToggle={() => toggleSection(section.id)}
              showSomali={showSomali}
              onOpenVocab={handleOpenTerm}
            />
          ))}
        </div>

        {/* Useful Quick Formula Reference Sheet Box at bottom */}
        <section className="w-full bg-[#13110f] border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <BookOpen className="w-4 h-4" />
              <span>Spickzettel: Die wichtigsten Vorzeichenregeln</span>
            </div>
            <button
              type="button"
              onClick={() => handleOpenTerm()}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
            >
              <span>Glossar öffnen</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-[#181614] rounded-xl p-3 border border-neutral-800 space-y-1">
              <span className="font-bold text-neutral-200 block">Multiplikation & Division</span>
              <div className="text-amber-300 font-mono space-y-0.5 pt-1">
                <div><MathView math="(+) \cdot (+) = +" /></div>
                <div><MathView math="(-) \cdot (-) = +" /></div>
                <div><MathView math="(+) \cdot (-) = -" /></div>
                <div><MathView math="(-) \cdot (+) = -" /></div>
              </div>
            </div>

            <div className="bg-[#181614] rounded-xl p-3 border border-neutral-800 space-y-1">
              <span className="font-bold text-neutral-200 block">Vorrangregeln & Terme</span>
              <div className="text-sky-300 font-mono space-y-0.5 pt-1">
                <div><MathView math="\text{1. Klammern } ()" /></div>
                <div><MathView math="\text{2. Punkt } (\cdot, :)" /></div>
                <div><MathView math="\text{3. Strich } (+, -)" /></div>
                <div><MathView math="8x - 3x + 2y = 5x + 2y" /></div>
              </div>
            </div>
          </div>

          {/* Quick Math Vocabulary Terms Grid with Audio Preview Buttons */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <span className="text-[11px] font-mono uppercase text-neutral-400 tracking-wider block">
              Wichtige Fachbegriffe (Tippe für Audio & Erklärung):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MATH_VOCAB_TERMS.slice(0, 8).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleOpenTerm(t.id)}
                  className="min-h-[32px] px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#1a1715] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/70 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Volume2 className="w-3 h-3 text-amber-400" />
                  <span>{t.wordDe}</span>
                  <span className="text-[10px] text-neutral-500">· {t.wordSo}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Floating Sticky Mobile Bottom Action Toolbar (Thumb Zone) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0e0c0b]/95 backdrop-blur-md border-t border-neutral-800/90 px-3 py-2 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          {/* Progress Pill */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono text-xs font-bold shrink-0">
              {progressPercent}%
            </div>
            <div className="min-w-0 hidden xs:block">
              <span className="text-xs font-bold text-white block truncate">
                {completedCount}/{totalExercises} Gelöst
              </span>
              <span className="text-[10px] text-neutral-400 block truncate">
                {completedCount === totalExercises ? 'Alles abgeschlossen! 🏆' : 'Weiter so!'}
              </span>
            </div>
          </div>

          {/* Floating Actions for Finger Scratchpad & Audio Dictionary */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsScratchpadOpen(true)}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold bg-[#1d1a17] hover:bg-neutral-800 text-amber-300 border border-amber-500/40 active:scale-95 transition-all flex items-center gap-1.5 shadow"
              title="Notizblock öffnen"
            >
              <PenTool className="w-4 h-4 text-amber-400" />
              <span>Notizblock</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenTerm()}
              className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-neutral-950 active:scale-95 transition-all flex items-center gap-1.5 shadow-lg"
              title="Wörterbuch mit Aussprache öffnen"
            >
              <Volume2 className="w-4 h-4" />
              <span>Wörterbuch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Bilingual Math Vocab Modal */}
      <MathVocabModal
        isOpen={isVocabModalOpen}
        selectedTerm={selectedVocabTerm}
        onClose={() => setIsVocabModalOpen(false)}
        onSelectTerm={(t) => setSelectedVocabTerm(t)}
      />

      {/* Touch-Friendly Finger Scratchpad */}
      <FingerScratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        showSomali={showSomali}
      />
    </div>
  );
}
