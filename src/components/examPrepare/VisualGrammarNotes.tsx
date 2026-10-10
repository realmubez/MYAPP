import React, { useState } from 'react';
import {
  PenTool,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowDown,
  ArrowRight,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  promptBefore: string;
  promptAfter: string;
  options: [string, string];
  expected: string;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    promptBefore: '',
    promptAfter: 'she happy?',
    options: ['Is', 'Does'],
    expected: 'Is',
    explanation: 'We use IS with "she" to describe a feeling or state ("happy").',
  },
  {
    id: 2,
    promptBefore: '',
    promptAfter: 'she work?',
    options: ['Is', 'Does'],
    expected: 'Does',
    explanation: 'We use DOES to ask about an action verb ("work") for he/she/it.',
  },
  {
    id: 3,
    promptBefore: 'They',
    promptAfter: 'students.',
    options: ['are', 'do'],
    expected: 'are',
    explanation: 'We use ARE to describe what people are ("students"). "Do" is for action questions or negatives.',
  },
  {
    id: 4,
    promptBefore: 'He',
    promptAfter: 'not like coffee.',
    options: ['does', 'is'],
    expected: 'does',
    explanation: 'We say "He does not like..." for actions/preferences ("like"). "Is not like" is incorrect.',
  },
  {
    id: 5,
    promptBefore: '',
    promptAfter: 'you live here?',
    options: ['Do', 'Are'],
    expected: 'Do',
    explanation: 'We use DO with "you" to ask about an action ("live").',
  },
  {
    id: 6,
    promptBefore: "She doesn't",
    promptAfter: 'tennis.',
    options: ['plays', 'play'],
    expected: 'play',
    explanation: 'After doesn\'t, the verb ALWAYS returns to its basic form: "play", never "plays"!',
  },
];

export const VisualGrammarNotes: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const handleSelect = (questionId: number, option: string) => {
    if (hasSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setHasSubmitted(false);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === QUIZ_QUESTIONS.length;

  const score = QUIZ_QUESTIONS.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.expected ? 1 : 0);
  }, 0);

  return (
    <section className="w-full space-y-4 my-2">
      {/* =========================================================================
          THE MAIN NOTEBOOK / SCRATCHPAD SHEET
          Warm cream paper background (#fdfbf7), subtle notebook lines, handwriting style
          ========================================================================= */}
      <div
        className="relative rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl border-2 border-[#e7dec8] text-[#1c2e4a] overflow-hidden"
        style={{
          backgroundColor: '#fbf8ee',
          backgroundImage: `
            radial-gradient(#d3c7a8 0.75px, transparent 0.75px),
            linear-gradient(to bottom, transparent 27px, #e8dfc7 28px)
          `,
          backgroundSize: '20px 20px, 100% 28px',
        }}
      >
        {/* Notebook top binding holes effect */}
        <div className="absolute top-3 left-6 right-6 flex justify-between pointer-events-none opacity-40">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="w-3.5 h-3.5 rounded-full bg-[#3c342a]/30 shadow-inner inline-block"
            />
          ))}
        </div>

        {/* Header tape / note pin */}
        <div className="flex justify-center mb-6 pt-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f3ebd3] border border-[#d6c79f] text-[#2c3e50] text-xs font-semibold shadow-sm rotate-[-1deg]">
            <PenTool className="w-3.5 h-3.5 text-[#1a5fb4]" />
            <span className="font-mono uppercase tracking-wider text-[11px]">
              Teacher's Handwritten Study Notes
            </span>
          </div>
        </div>

        {/* 2. TITLE SECTION */}
        <div className="text-center space-y-2 mb-8">
          <h2
            className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1a365d] tracking-tight"
            style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
          >
            ENGLISH GRAMMAR — LET'S MAKE IT EASY!
          </h2>
          <div className="inline-block relative">
            <p
              className="text-lg sm:text-2xl font-bold text-[#1f4e78]"
              style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
            >
              How do I know when to use AM, IS, ARE, DO and DOES?
            </p>
            {/* Hand-drawn yellow underline highlight */}
            <span className="absolute -bottom-1 left-2 right-2 h-2 bg-amber-300/60 -z-10 rounded-full transform -rotate-1" />
          </div>
        </div>

        {/* Grid for Scratchpad 1 and Scratchpad 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* =========================================================================
              3. FIRST SCRATCHPAD — AM / IS / ARE
              ========================================================================= */}
          <div className="bg-[#fffdf7]/95 rounded-2xl p-5 sm:p-6 border-2 border-dashed border-[#2b6cb0] relative shadow-sm">
            {/* Paper Corner Pin Tag */}
            <div className="absolute -top-3.5 left-5 bg-[#2b6cb0] text-white px-3 py-0.5 rounded-lg text-xs font-bold font-mono shadow">
              NOTE 1: AM / IS / ARE
            </div>

            <div className="pt-2 space-y-4">
              {/* Handwritten Pronoun Table */}
              <div className="bg-[#f5f8fc] rounded-xl p-3.5 border border-[#bfd3e6]">
                <span className="text-[11px] font-mono uppercase font-bold text-[#2b6cb0] block mb-2">
                  Handwritten Reference Table:
                </span>
                <div
                  className="grid grid-cols-2 gap-y-1.5 text-base sm:text-xl font-bold text-[#1a365d]"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-[#2b6cb0]">I</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2b6cb0]" />
                    <span className="text-[#0d6efd] underline decoration-wavy">AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[#2b6cb0]">YOU</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2b6cb0]" />
                    <span className="text-[#0d6efd] underline decoration-wavy">ARE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-[#2b6cb0]">HE</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2b6cb0]" />
                    <span className="text-[#0d6efd] underline decoration-wavy">IS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[#2b6cb0]">WE</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2b6cb0]" />
                    <span className="text-[#0d6efd] underline decoration-wavy">ARE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-[#2b6cb0]">SHE</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2b6cb0]" />
                    <span className="text-[#0d6efd] underline decoration-wavy">IS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[#2b6cb0]">THEY</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2b6cb0]" />
                    <span className="text-[#0d6efd] underline decoration-wavy">ARE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-[#2b6cb0]">IT</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2b6cb0]" />
                    <span className="text-[#0d6efd] underline decoration-wavy">IS</span>
                  </div>
                </div>
              </div>

              {/* Core Rule in Blue Pen */}
              <div
                className="text-lg sm:text-2xl font-bold text-[#0d47a1] bg-[#e3f2fd]/80 p-3 rounded-xl border-l-4 border-[#1976d2]"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                “We use AM / IS / ARE to describe someone or something.”
              </div>

              {/* Statements with Arrows to Questions */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-mono font-bold text-[#2b6cb0] uppercase tracking-wider block">
                  Positive Examples ➔ Questions (Invert Subject & Verb):
                </span>

                <div
                  className="space-y-2 text-base sm:text-xl font-bold"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0]">
                    <span className="text-[#15803d]">✓ I am happy.</span>
                    <span className="text-[#0369a1] flex items-center gap-1">
                      ➔ <span className="underline decoration-sky-400">Are you happy?</span>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0]">
                    <span className="text-[#15803d]">✓ She is a teacher.</span>
                    <span className="text-[#0369a1] flex items-center gap-1">
                      ➔ <span className="underline decoration-sky-400">Is she a teacher?</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d]">
                    ✓ They are students.
                  </div>
                </div>
              </div>

              {/* Show the Negatives */}
              <div className="space-y-2 pt-1 border-t border-[#dce5ef]">
                <span className="text-xs font-mono font-bold text-[#c53030] uppercase tracking-wider block">
                  Negatives (Add NOT after AM / IS / ARE):
                </span>
                <div
                  className="space-y-1 text-base sm:text-xl font-bold text-[#b91c1c]"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <div>• I am not happy.</div>
                  <div>• She isn't happy.</div>
                  <div>• They aren't students.</div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              4. SECOND SCRATCHPAD — DO / DOES
              ========================================================================= */}
          <div className="bg-[#fffdf7]/95 rounded-2xl p-5 sm:p-6 border-2 border-dashed border-[#b7791f] relative shadow-sm">
            {/* Paper Corner Pin Tag */}
            <div className="absolute -top-3.5 left-5 bg-[#b7791f] text-white px-3 py-0.5 rounded-lg text-xs font-bold font-mono shadow">
              NOTE 2: DO / DOES
            </div>

            <div className="pt-2 space-y-4">
              {/* Pronoun group table */}
              <div className="bg-[#fffaf0] rounded-xl p-3.5 border border-[#fed7aa]">
                <span className="text-[11px] font-mono uppercase font-bold text-[#b7791f] block mb-2">
                  Action & Question Auxiliary:
                </span>
                <div
                  className="space-y-2 text-lg sm:text-2xl font-bold text-[#7b341e]"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#7c2d12]">I / YOU / WE / THEY</span>
                    <ArrowRight className="w-4 h-4 text-[#ea580c]" />
                    <span className="px-2.5 py-0.5 rounded-md bg-[#ffedd5] border border-[#f97316] text-[#c2410c] font-black">
                      DO
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#7c2d12]">HE / SHE / IT</span>
                    <ArrowRight className="w-4 h-4 text-[#ea580c]" />
                    <span className="px-2.5 py-0.5 rounded-md bg-[#ffedd5] border border-[#f97316] text-[#c2410c] font-black">
                      DOES
                    </span>
                  </div>
                </div>
              </div>

              {/* Core Rule */}
              <div
                className="text-lg sm:text-2xl font-bold text-[#7b341e] bg-[#fff7ed]/90 p-3 rounded-xl border-l-4 border-[#ea580c]"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                “Use DO and DOES to ask about actions and routines.”
              </div>

              {/* Examples: Do / Does */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-mono font-bold text-[#b7791f] uppercase tracking-wider block">
                  Question Examples (Action Verbs):
                </span>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-base sm:text-xl font-bold"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <div className="p-2 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8]">
                    • Do you work?
                  </div>
                  <div className="p-2 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8]">
                    • Do they play football?
                  </div>
                  <div className="p-2 rounded-lg bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c]">
                    • Does she work?
                  </div>
                  <div className="p-2 rounded-lg bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c]">
                    • Does he play football?
                  </div>
                </div>
              </div>

              {/* Show the Negatives: don't & doesn't */}
              <div className="space-y-2 pt-1 border-t border-[#fed7aa]">
                <span className="text-xs font-mono font-bold text-[#c53030] uppercase tracking-wider block">
                  Negatives with Action Verbs (don't & doesn't):
                </span>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-base sm:text-xl font-bold text-[#b91c1c]"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <div>• I don't work.</div>
                  <div>• They don't play.</div>
                  <div>• She doesn't work.</div>
                  <div>• He doesn't play.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. THE MOST IMPORTANT VISUAL — THE VERB TRANSFORMATION (HERO BLOCK)
            ========================================================================= */}
        <div className="my-8 bg-[#fffefb] rounded-3xl p-6 sm:p-8 border-4 border-[#dc2626] shadow-xl relative overflow-hidden">
          {/* Hand-drawn corner tape */}
          <div className="absolute top-2 right-4 bg-rose-200/90 text-rose-900 px-3 py-1 rounded-md text-[11px] font-mono font-black uppercase rotate-2 shadow-sm">
            ★ Most Important Exam Rule ★
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-mono font-bold text-[#b91c1c] uppercase tracking-wider block mb-1">
                Notice What Happens to the Verb:
              </span>
              <div
                className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 my-3 text-2xl sm:text-4xl md:text-5xl font-black"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                {/* 1. Positive: SHE WORKS */}
                <div className="flex items-center gap-2 p-2.5 px-6 rounded-2xl bg-[#e6fffa] border-2 border-[#0d9488] text-[#0f766e]">
                  <span>SHE WORK</span>
                  <span className="underline decoration-wavy decoration-[#0d9488] font-black text-[#047857]">
                    S.
                  </span>
                  <span className="text-sm font-sans font-bold text-[#065f46] ml-2">
                    (Positive with -s)
                  </span>
                </div>

                <div className="text-[#b91c1c] flex items-center justify-center">
                  <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
                </div>

                {/* 2. Negative: SHE DOESN'T WORK */}
                <div className="flex flex-wrap items-center justify-center gap-2 p-2.5 px-6 rounded-2xl bg-[#fff1f2] border-2 border-[#e11d48] text-[#9f1239]">
                  <span>SHE</span>
                  {/* Hand-drawn circle effect around DOESN'T */}
                  <span className="relative inline-block px-3 py-1 rounded-full border-2 border-dashed border-[#e11d48] text-[#be123c] font-black bg-rose-100/80">
                    DOESN'T
                  </span>
                  <span>WORK</span>
                  {/* Red line through extra S */}
                  <span className="relative text-[#b91c1c] line-through decoration-rose-600 decoration-[3px] opacity-60">
                    S
                  </span>
                  <span className="text-sm font-sans font-bold text-[#9f1239] ml-2">
                    (NO -S!)
                  </span>
                </div>

                <div className="text-[#b91c1c] flex items-center justify-center">
                  <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
                </div>

                {/* 3. Question: DOES SHE WORK? */}
                <div className="flex flex-wrap items-center justify-center gap-2 p-2.5 px-6 rounded-2xl bg-[#eff6ff] border-2 border-[#2563eb] text-[#1e40af]">
                  {/* Hand-drawn circle effect around DOES */}
                  <span className="relative inline-block px-3 py-1 rounded-full border-2 border-dashed border-[#2563eb] text-[#1d4ed8] font-black bg-blue-100/80">
                    DOES
                  </span>
                  <span>SHE WORK</span>
                  <span className="relative text-[#b91c1c] line-through decoration-rose-600 decoration-[3px] opacity-60">
                    S
                  </span>
                  <span>?</span>
                  <span className="text-sm font-sans font-bold text-[#1e40af] ml-2">
                    (BASE VERB!)
                  </span>
                </div>
              </div>
            </div>

            {/* Red-outlined rule box */}
            <div className="bg-[#fef2f2] border-2 border-[#ef4444] rounded-2xl p-4 sm:p-5 text-[#991b1b] space-y-2">
              <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold uppercase font-mono text-[#b91c1c]">
                <XCircle className="w-5 h-5 text-[#dc2626]" />
                <span>IMPORTANT! After DOES or DOESN'T, use the basic verb:</span>
              </div>
              <div
                className="text-xl sm:text-3xl font-extrabold text-[#7f1d1d] flex flex-wrap gap-4 sm:gap-8 justify-center pt-1"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                <span>
                  WORK — <span className="text-[#dc2626] line-through">NOT WORKS</span>
                </span>
                <span>
                  GO — <span className="text-[#dc2626] line-through">NOT GOES</span>
                </span>
                <span>
                  LIKE — <span className="text-[#dc2626] line-through">NOT LIKES</span>
                </span>
              </div>
            </div>

            {/* Examples: Check vs Cross */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-lg sm:text-2xl font-bold"
              style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
            >
              <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] flex items-center justify-between">
                <span>Does she work?</span>
                <span className="text-xl font-sans font-extrabold">✓</span>
              </div>
              <div className="p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] flex items-center justify-between">
                <span>Does she works?</span>
                <span className="text-xl font-sans font-extrabold">✗</span>
              </div>
              <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] flex items-center justify-between">
                <span>She doesn't like coffee.</span>
                <span className="text-xl font-sans font-extrabold">✓</span>
              </div>
              <div className="p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] flex items-center justify-between">
                <span>She doesn't likes coffee.</span>
                <span className="text-xl font-sans font-extrabold">✗</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            6. SHOW THE DIFFERENCE SIDE BY SIDE
            Box A (State / Description) vs Box B (Action) + Memory Trick
            ========================================================================= */}
        <div className="space-y-4 mb-8">
          <div className="text-center">
            <span className="text-xs font-mono font-bold text-[#1f4e78] uppercase tracking-wider">
              Side-by-Side Comparison:
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BOX A — DESCRIBING SOMEONE */}
            <div className="bg-[#f0f9ff]/90 border-2 border-[#0284c7] rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#bae6fd] pb-2">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-[#0369a1]">
                  BOX A — DESCRIBING SOMEONE
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#e0f2fe] text-[#0284c7]">
                  State / Feeling / Identity
                </span>
              </div>
              <div
                className="space-y-2 text-xl sm:text-2xl font-bold text-[#0c4a6e]"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                <div>“She is happy.”</div>
                <div>“Is she happy?”</div>
                <div>“She isn't happy.”</div>
              </div>
              <p className="text-xs text-[#0369a1] font-sans pt-1">
                Here, <strong>“happy”</strong> is an adjective describing her feelings or state. We use <strong>IS</strong>.
              </p>
            </div>

            {/* BOX B — TALKING ABOUT AN ACTION */}
            <div className="bg-[#fffbeb]/90 border-2 border-[#d97706] rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#fde68a] pb-2">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-[#b45309]">
                  BOX B — TALKING ABOUT AN ACTION
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#fef3c7] text-[#d97706]">
                  Action / Routine
                </span>
              </div>
              <div
                className="space-y-2 text-xl sm:text-2xl font-bold text-[#78350f]"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                <div>“She works every day.”</div>
                <div>“Does she work every day?”</div>
                <div>“She doesn't work every day.”</div>
              </div>
              <p className="text-xs text-[#b45309] font-sans pt-1">
                Here, <strong>“work”</strong> is an action verb. We use <strong>DOES / DOESN'T</strong> for questions and negatives.
              </p>
            </div>
          </div>

          {/* Teacher's Memory Trick Sticky Note */}
          <div className="flex justify-center pt-2">
            <div className="max-w-md w-full bg-[#fef08a] border-2 border-[#ca8a04] rounded-2xl p-4 sm:p-5 shadow-md transform rotate-[-0.5deg]">
              <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-[#854d0e] mb-1">
                <Sparkles className="w-4 h-4 text-[#ca8a04]" />
                <span>Memory Trick:</span>
              </div>
              <div
                className="text-2xl sm:text-3xl font-extrabold text-[#713f12] text-center my-1"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                “Happy = IS · Work = DOES”
              </div>
              <p className="text-xs text-[#854d0e] text-center leading-relaxed font-sans">
                “Happy” describes a state, while “work” is an action.
                <span className="block text-[11px] text-[#a16207] italic mt-0.5">
                  (Beginner rule to remember when starting questions and negatives!)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            7. INTERACTIVE SCRATCHPAD PRACTICE SECTION
            6 questions with immediate feedback, explanations, and retry
            ========================================================================= */}
        <div className="mt-10 pt-6 border-t-2 border-dashed border-[#d3c7a8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#1a5fb4] font-bold block">
                Quick Interactive Scratchpad Check
              </span>
              <h3
                className="text-xl sm:text-3xl font-black text-[#1a365d]"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                Choose the correct word for each sentence:
              </h3>
            </div>

            {hasSubmitted && (
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm sm:text-base font-bold px-3 py-1 rounded-xl border ${
                    score >= 5
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  Score: {score} / {QUIZ_QUESTIONS.length}
                </span>
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-[#fffdf7] border border-[#d3c7a8] text-[#1c2e4a] hover:bg-[#f5eed6] flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {QUIZ_QUESTIONS.map((q) => {
              const userPick = selectedAnswers[q.id];
              const isCorrect = userPick === q.expected;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    hasSubmitted
                      ? isCorrect
                        ? 'bg-[#ecfdf5] border-[#10b981]/60'
                        : 'bg-[#fff1f2] border-[#ef4444]/60'
                      : 'bg-[#ffffff]/90 border-[#e5dac1]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-[#64748b]">
                      Question {q.id}:
                    </span>
                    {hasSubmitted && (
                      <span className="text-xs font-bold flex items-center gap-1">
                        {isCorrect ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-rose-600" /> Mistake
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Question Sentence */}
                  <div className="text-base sm:text-lg font-bold text-[#1e293b] mb-3 flex flex-wrap items-center gap-1.5">
                    {q.promptBefore && <span>{q.promptBefore}</span>}
                    <span
                      className={`min-w-[60px] px-2.5 py-0.5 rounded-lg border-2 border-dashed text-center inline-block ${
                        userPick
                          ? hasSubmitted
                            ? isCorrect
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                              : 'bg-rose-100 border-rose-500 text-rose-900'
                            : 'bg-amber-100 border-amber-500 text-amber-900'
                          : 'bg-[#f8fafc] border-[#94a3b8] text-neutral-400'
                      }`}
                    >
                      {userPick || '___'}
                    </span>
                    <span>{q.promptAfter}</span>
                  </div>

                  {/* Choice Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt) => {
                      const isChosen = userPick === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={hasSubmitted}
                          onClick={() => handleSelect(q.id, opt)}
                          className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                            isChosen
                              ? hasSubmitted
                                ? opt === q.expected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                                  : 'bg-rose-600 text-white border-rose-600 shadow'
                                : 'bg-[#1a5fb4] text-white border-[#1a5fb4] shadow'
                              : 'bg-white border-[#cbd5e1] text-[#334155] hover:bg-neutral-50 hover:border-neutral-400'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanatory feedback after submission */}
                  {hasSubmitted && (
                    <div className="mt-3 pt-2 border-t border-neutral-200 text-xs leading-relaxed space-y-1">
                      <p className={isCorrect ? 'text-emerald-800' : 'text-rose-900 font-semibold'}>
                        {q.explanation}
                      </p>
                      {!isCorrect && (
                        <p className="text-emerald-800 font-bold">
                          Correct word: <span className="underline">{q.expected}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit / Retry Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-3">
            <span className="text-xs text-[#64748b]">
              {!hasSubmitted
                ? `${answeredCount} of ${QUIZ_QUESTIONS.length} answered`
                : 'Review your results above or click Try Again to practice again.'}
            </span>

            {!hasSubmitted ? (
              <button
                type="button"
                disabled={!isAllAnswered}
                onClick={() => setHasSubmitted(true)}
                className={`min-h-[44px] px-6 py-2 rounded-2xl text-xs sm:text-sm font-bold shadow transition-all cursor-pointer ${
                  isAllAnswered
                    ? 'bg-[#1a5fb4] hover:bg-[#154b8c] text-white'
                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                }`}
              >
                Check Answers
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetQuiz}
                className="min-h-[44px] px-6 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-[#1a5fb4] hover:bg-[#154b8c] text-white shadow flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
