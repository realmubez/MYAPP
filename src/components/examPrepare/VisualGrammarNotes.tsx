import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PenTool,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowDown,
  ArrowRight,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Check,
  MousePointer,
  HelpCircle,
  BookOpen,
  Languages,
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  promptBefore: string;
  promptAfter: string;
  options: [string, string];
  expected: string;
  explanationSomali: string;
  explanationEnglish: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    promptBefore: '',
    promptAfter: 'she happy?',
    options: ['Is', 'Does'],
    expected: 'Is',
    explanationSomali: 'Waxaan isticmaalnaa IS sababtoo ah "happy" waa sifo (adjective), ee ma aha falka caadiga ah.',
    explanationEnglish: 'We use IS with "she" to describe a feeling or state ("happy").',
  },
  {
    id: 2,
    promptBefore: '',
    promptAfter: 'she work?',
    options: ['Is', 'Does'],
    expected: 'Does',
    explanationSomali: 'Marka aan su\'aal ka weydiineyno falka caadiga ah ("work") ee he/she/it, waxaan isticmaalnaa DOES.',
    explanationEnglish: 'We use DOES to ask about an ordinary verb ("work") for he/she/it.',
  },
  {
    id: 3,
    promptBefore: 'They',
    promptAfter: 'students.',
    options: ['are', 'do'],
    expected: 'are',
    explanationSomali: 'Waa magac u yaal meelaynta (To Be), waxaana "they" raaca ARE markaad sheegayso cidda ay yihiin.',
    explanationEnglish: 'We use ARE to describe what people are ("students").',
  },
  {
    id: 4,
    promptBefore: 'He',
    promptAfter: 'not like coffee.',
    options: ['does', 'is'],
    expected: 'does',
    explanationSomali: 'Falka "like" waa ficil caadi ah, markaa diidmada waxaa lagu sameeyaa DOES (He does not like).',
    explanationEnglish: 'We say "He does not like..." for ordinary verbs ("like").',
  },
  {
    id: 5,
    promptBefore: '',
    promptAfter: 'you live here?',
    options: ['Do', 'Are'],
    expected: 'Do',
    explanationSomali: 'Falka "live" waa ficil caadi ah, su\'aashiisana waxaa lagu bilaabaa DO marka ay "you" tahay.',
    explanationEnglish: 'We use DO with "you" to ask about an ordinary verb ("live").',
  },
  {
    id: 6,
    promptBefore: "She doesn't",
    promptAfter: 'tennis.',
    options: ['plays', 'play'],
    expected: 'play',
    explanationSomali: 'Marka DOESN\'T la isticmaalo, falku wuxuu ku noqdaa asalkiisii ("play"), "s" kalama raacdo!',
    explanationEnglish: 'After doesn\'t, the verb ALWAYS returns to its basic form ("play").',
  },
];

type ToolType = 'select' | 'pen' | 'highlighter' | 'eraser';
type PenColor = '#1a5fb4' | '#dc2626' | '#16a34a' | '#1e293b';
type PenSize = 'thin' | 'medium' | 'thick';

interface VisualGrammarNotesProps {
  lessonId?: string;
}

export const VisualGrammarNotes: React.FC<VisualGrammarNotesProps> = ({
  lessonId = 'general-grammar',
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Drawing tools state
  const [tool, setTool] = useState<ToolType>('select');
  const [color, setColor] = useState<PenColor>('#1a5fb4');
  const [size, setSize] = useState<PenSize>('medium');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const storageKey = `visual_grammar_scratchpad_${lessonId}`;

  const saveToUndoStack = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setUndoStack((prev) => [...prev, dataUrl]);
    setRedoStack([]);
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || container.offsetWidth || 600;
    const height = container.scrollHeight || rect.height || 800;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        };
        img.src = saved;
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [initCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL();
      localStorage.setItem(storageKey, dataUrl);
    } catch {
      // ignore
    }
  }, [undoStack, storageKey]);

  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === 'select') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    canvas.setPointerCapture(e.pointerId);

    saveToUndoStack();

    const pos = getCanvasCoordinates(e);
    lastPosRef.current = pos;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || tool === 'select') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getCanvasCoordinates(e);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      const sizeMap = { thin: 12, medium: 24, thick: 40 };
      ctx.lineWidth = sizeMap[size];
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      const sizeMap = { thin: 10, medium: 20, thick: 32 };
      ctx.lineWidth = sizeMap[size];
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1.0;
      const sizeMap = { thin: 2, medium: 4, thick: 8 };
      ctx.lineWidth = sizeMap[size] || 4;
    }

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.restore();

    lastPosRef.current = pos;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentDataUrl = canvas.toDataURL();
    setRedoStack((prev) => [currentDataUrl, ...prev]);

    const previousDataUrl = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
    };
    img.src = previousDataUrl;
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentDataUrl = canvas.toDataURL();
    setUndoStack((prev) => [...prev, currentDataUrl]);

    const nextDataUrl = redoStack[0];
    setRedoStack((prev) => prev.slice(1));

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
    };
    img.src = nextDataUrl;
  };

  const handleClearCanvas = () => {
    saveToUndoStack();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setShowClearConfirm(false);
  };

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
          INTERACTIVE DRAWING TOOLBAR
          ========================================================================= */}
      <div className="bg-[#1c1814] border border-amber-500/30 rounded-2xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-amber-400 font-bold uppercase mr-1 flex items-center gap-1">
            <PenTool className="w-3.5 h-3.5" />
            <span>Qalin & Scratchpad:</span>
          </span>

          <div className="flex items-center bg-[#14100d] p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setTool('select')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                tool === 'select'
                  ? 'bg-neutral-700 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Scroll / Select</span>
            </button>

            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                tool === 'pen'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>✏️ Qalin (Pen)</span>
            </button>

            <button
              type="button"
              onClick={() => setTool('highlighter')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                tool === 'highlighter'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>🖍️ Calaamad (Highlighter)</span>
            </button>

            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                tool === 'eraser'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>🧽 Tirtire (Eraser)</span>
            </button>
          </div>

          {tool !== 'select' && tool !== 'eraser' && (
            <div className="flex items-center gap-1 ml-1 bg-[#14100d] px-2 py-1 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-mono mr-0.5">Midab:</span>
              {[
                { hex: '#1a5fb4', label: 'Blue' },
                { hex: '#dc2626', label: 'Red' },
                { hex: '#16a34a', label: 'Green' },
                { hex: '#1e293b', label: 'Black' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex as PenColor)}
                  title={c.label}
                  className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${
                    color === c.hex ? 'scale-110 border-white shadow' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          )}

          {tool !== 'select' && (
            <div className="flex items-center gap-1 ml-1 bg-[#14100d] px-2 py-1 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-neutral-400 font-mono mr-0.5">Dhumuc:</span>
              {(['thin', 'medium', 'thick'] as PenSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                    size === s
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {s === 'thin' ? 'Dhuuban' : s === 'medium' ? 'Dhexe' : 'Warran'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="px-2.5 py-1 rounded-xl bg-[#14100d] hover:bg-neutral-800 disabled:opacity-30 text-neutral-300 border border-neutral-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dib u celi (Undo)</span>
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="px-2.5 py-1 rounded-xl bg-[#14100d] hover:bg-neutral-800 disabled:opacity-30 text-neutral-300 border border-neutral-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hor u soco (Redo)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="px-2.5 py-1 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tirtir dhamaan</span>
          </button>
        </div>
      </div>

      {showClearConfirm && (
        <div className="bg-rose-950/80 border border-rose-500 text-rose-200 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs animate-fadeIn">
          <span>Ma rabtaa inaad tirtirto qoraalkaaga casharkan scratchpad-ka?</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearCanvas}
              className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
            >
              Haa, Tirtir
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
            >
              Jooji
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          THE MAIN NOTEBOOK SHEET (SOMALI-FIRST BILINGUAL TUTOR)
          ========================================================================= */}
      <div
        ref={containerRef}
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
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`absolute inset-0 z-20 ${
            tool === 'select' ? 'pointer-events-none' : 'touch-none cursor-crosshair'
          }`}
        />

        <div className="absolute top-3 left-6 right-6 flex justify-between pointer-events-none opacity-40 z-10">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="w-3.5 h-3.5 rounded-full bg-[#3c342a]/30 shadow-inner inline-block"
            />
          ))}
        </div>

        <div className="flex justify-center mb-6 pt-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f3ebd3] border border-[#d6c79f] text-[#2c3e50] text-xs font-semibold shadow-sm rotate-[-1deg]">
            <Languages className="w-3.5 h-3.5 text-[#1a5fb4]" />
            <span className="font-mono uppercase tracking-wider text-[11px]">
              Macallinkaaga Somali-English Exam Tutor 📝
            </span>
          </div>
        </div>

        {/* TITLE SECTION */}
        <div className="text-center space-y-2 mb-8 relative z-10">
          <h2
            className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1a365d] tracking-tight"
            style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
          >
            ENGLISH GRAMMAR — SI FUDUD OO SOMALI AH!
          </h2>
          <div className="inline-block relative">
            <p
              className="text-lg sm:text-2xl font-bold text-[#1f4e78]"
              style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
            >
              Sidee baan ku kala garan karaa AM, IS, ARE, DO iyo DOES?
            </p>
            <span className="absolute -bottom-1 left-2 right-2 h-2 bg-amber-300/60 -z-10 rounded-full transform -rotate-1" />
          </div>
        </div>

        {/* TWO SCRATCHPAD NOTES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 relative z-10">
          {/* NOTE 1: AM / IS / ARE */}
          <div className="bg-[#fffdf7]/95 rounded-2xl p-5 sm:p-6 border-2 border-dashed border-[#2b6cb0] relative shadow-sm">
            <div className="absolute -top-3.5 left-5 bg-[#2b6cb0] text-white px-3 py-0.5 rounded-lg text-xs font-bold font-mono shadow">
              QORAAL 1: AM / IS / ARE (Sifaynta & Xaaladda)
            </div>

            <div className="pt-2 space-y-4">
              {/* Somali Macnaha */}
              <div className="bg-[#eef2ff] p-3 rounded-xl border border-[#c7d2fe] text-xs sm:text-sm text-[#312e81]">
                <strong className="text-[#3730a3] block mb-0.5 font-mono">Macnaha (Somali):</strong>
                Waxaan isticmaalnaa <strong>AM / IS / ARE</strong> markaan rabno inaan sheegno qofka waxa uu yahay, ama sifadiisa (sida: <em>happy, tired, a student</em>). Waa in la xasuustaa xeerkan: <strong>AM</strong> waxay raacdaa <em>I</em>, <strong>IS</strong> waxay raacdaa <em>he/she/it</em>, halka <strong>ARE</strong> ay raacdo <em>you/we/they</em>. Sidoo kale <strong>IT</strong> waxaa loo isticmaalaa waxyaabaha, shayada, cimilada (weather), iyo xaaladaha.
              </div>

              {/* Table */}
              <div className="bg-[#f5f8fc] rounded-xl p-3.5 border border-[#bfd3e6]">
                <span className="text-[11px] font-mono uppercase font-bold text-[#2b6cb0] block mb-2">
                  Jadwalka Ficillada To Be:
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

              {/* Examples with Somali & Explanation */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-mono font-bold text-[#2b6cb0] uppercase tracking-wider block">
                  Tusaalooyin & Sharaxaad:
                </span>
                <div
                  className="space-y-3 text-base sm:text-xl font-bold"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <div className="p-2.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] space-y-1">
                    <div className="text-[#15803d]">✓ I am happy. (Positive)</div>
                    <div className="font-sans text-xs font-normal text-neutral-700">
                      <strong>Turjumaad:</strong> Anigu waan faraxsanahay. <br />
                      <strong>Sababta:</strong> "Happy" waa sifo (adjective), waxaana isticmaalnay AM sababtoo ah waxaa ka horreeya "I".
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] space-y-1">
                    <div className="text-[#15803d]">✓ She is a teacher. (Positive)</div>
                    <div className="font-sans text-xs font-normal text-neutral-700">
                      <strong>Turjumaad:</strong> Iyadu waa macallimad. <br />
                      <strong>Su'aal (?):</strong> Is she a teacher? (Miyay macallimad tahay?)
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-[#dce5ef]">
                <span className="text-xs font-mono font-bold text-[#c53030] uppercase tracking-wider block">
                  Diidmada (Negatives):
                </span>
                <div
                  className="space-y-2 text-base sm:text-xl font-bold text-[#b91c1c]"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <div>• I am not happy. <span className="font-sans text-xs font-normal text-neutral-600 block">(Negative: Anigu ma faraxsani)</span></div>
                  <div>• She isn't happy. <span className="font-sans text-xs font-normal text-neutral-600 block">(Negative: Iyadu ma faraxsana)</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* NOTE 2: DO / DOES */}
          <div className="bg-[#fffdf7]/95 rounded-2xl p-5 sm:p-6 border-2 border-dashed border-[#b7791f] relative shadow-sm">
            <div className="absolute -top-3.5 left-5 bg-[#b7791f] text-white px-3 py-0.5 rounded-lg text-xs font-bold font-mono shadow">
              QORAAL 2: DO / DOES (Ficillada Caadiga ah)
            </div>

            <div className="pt-2 space-y-4">
              <div className="bg-[#fffbeb] p-3 rounded-xl border border-[#fde68a] text-xs sm:text-sm text-[#78350f]">
                <strong className="text-[#92400e] block mb-0.5 font-mono">Macnaha (Somali):</strong>
                Ficillada caadiga ah ee Present Simple (sida <em>work, live, like, know</em>) uma baahna IS/ARE marka la waydiinayo su'aal ama la diidmayo. Halkaas waxaa loo isticmaalaa caawiyeyaasha <strong>DO</strong> iyo <strong>DOES</strong>.
              </div>

              <div className="bg-[#fffaf0] rounded-xl p-3.5 border border-[#fed7aa]">
                <span className="text-[11px] font-mono uppercase font-bold text-[#b7791f] block mb-2">
                  Jadwalka Su'aasha & Diidmada:
                </span>
                <div
                  className="space-y-2 text-lg sm:text-2xl font-bold text-[#7b341e]"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#7c2d12]">I / YOU / WE / THEY</span>
                    <ArrowRight className="w-4 h-4 text-[#ea580c]" />
                    <span className="px-2.5 py-0.5 rounded-md bg-[#ffedd5] border border-[#f97316] text-[#c2410c] font-black">
                      DO / DON'T
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#7c2d12]">HE / SHE / IT</span>
                    <ArrowRight className="w-4 h-4 text-[#ea580c]" />
                    <span className="px-2.5 py-0.5 rounded-md bg-[#ffedd5] border border-[#f97316] text-[#c2410c] font-black">
                      DOES / DOESN'T
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <span className="text-xs font-mono font-bold text-[#b7791f] uppercase tracking-wider block">
                  Tusaalooyinka Ficillada Caadiga ah:
                </span>
                <div
                  className="space-y-2 text-base sm:text-xl font-bold"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <div className="p-2.5 rounded-lg bg-[#fff7ed] border border-[#fed7aa] space-y-1">
                    <div className="text-[#c2410c]">? Does she work?</div>
                    <div className="font-sans text-xs font-normal text-neutral-700">
                      <strong>Turjumaad:</strong> Miyay shaqaysaa? (Question) <br />
                      <strong>Jawaab:</strong> Yes, she does. / No, she doesn't.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#fff7ed] border border-[#fed7aa] space-y-1">
                    <div className="text-[#c2410c]">− She doesn't work.</div>
                    <div className="font-sans text-xs font-normal text-neutral-700">
                      <strong>Turjumaad:</strong> Shaqa ma hayso / Ma shaqayso. (Negative)
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-[#fed7aa]">
                <span className="text-xs font-mono font-bold text-[#c53030] uppercase tracking-wider block">
                  Tusaalooyin kale (live, like, know):
                </span>
                <div
                  className="space-y-1 text-base sm:text-xl font-bold text-[#9a3412]"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <div>• Do you live in Canada? <span className="font-sans text-xs font-normal text-neutral-600 block">(Ma degan tahay Kanada?)</span></div>
                  <div>• She doesn't like tea. <span className="font-sans text-xs font-normal text-neutral-600 block">(Shaaha ma jecla)</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            HERO BLOCK: THE GOLDEN VERB RULE (WORKS -> DOESN'T WORK)
            ========================================================================= */}
        <div className="my-8 bg-[#fffefb] rounded-3xl p-6 sm:p-8 border-4 border-[#dc2626] shadow-xl relative overflow-hidden z-10">
          <div className="absolute top-2 right-4 bg-rose-200/90 text-rose-900 px-3 py-1 rounded-md text-[11px] font-mono font-black uppercase rotate-2 shadow-sm">
            ★ Xeerka Imtixaanka Ugu Muhiimsan ★
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-mono font-bold text-[#b91c1c] uppercase tracking-wider block mb-1">
                Ficillada caadiga ah ee Present Simple:
              </span>
              <div
                className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 my-3 text-2xl sm:text-4xl md:text-5xl font-black"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                {/* Positive */}
                <div className="flex items-center gap-2 p-2.5 px-6 rounded-2xl bg-[#e6fffa] border-2 border-[#0d9488] text-[#0f766e]">
                  <span>SHE WORKS.</span>
                  <span className="text-sm font-sans font-bold text-[#065f46] ml-2">
                    (Positive: Isticmaal falka oo wata -s)
                  </span>
                </div>

                <div className="text-[#b91c1c] flex items-center justify-center">
                  <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
                </div>

                {/* Negative */}
                <div className="flex flex-wrap items-center justify-center gap-2 p-2.5 px-6 rounded-2xl bg-[#fff1f2] border-2 border-[#e11d48] text-[#9f1239]">
                  <span>SHE</span>
                  <span className="relative inline-block px-3 py-1 rounded-full border-2 border-dashed border-[#e11d48] text-[#be123c] font-black bg-rose-100/80">
                    DOESN'T
                  </span>
                  <span>WORK</span>
                  <span className="relative text-[#b91c1c] line-through decoration-rose-600 decoration-[3px] opacity-60">
                    S
                  </span>
                  <span className="text-sm font-sans font-bold text-[#9f1239] ml-2">
                    (Negative: She doesn't work.)
                  </span>
                </div>

                <div className="text-[#b91c1c] flex items-center justify-center">
                  <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
                </div>

                {/* Question */}
                <div className="flex flex-wrap items-center justify-center gap-2 p-2.5 px-6 rounded-2xl bg-[#eff6ff] border-2 border-[#2563eb] text-[#1e40af]">
                  <span className="relative inline-block px-3 py-1 rounded-full border-2 border-dashed border-[#2563eb] text-[#1d4ed8] font-black bg-blue-100/80">
                    DOES
                  </span>
                  <span>SHE WORK</span>
                  <span className="relative text-[#b91c1c] line-through decoration-rose-600 decoration-[3px] opacity-60">
                    S
                  </span>
                  <span>?</span>
                  <span className="text-sm font-sans font-bold text-[#1e40af] ml-2">
                    (Question: Does she work?)
                  </span>
                </div>
              </div>
            </div>

            {/* Somali Explanation Box */}
            <div className="bg-[#e0f2fe] border-2 border-[#0284c7] rounded-2xl p-4 text-[#0369a1] space-y-1.5 font-sans">
              <strong className="block text-sm font-bold text-[#0369a1]">Waa maxay sababtu? (The Reason):</strong>
              <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
                Jumlada caadiga ah ee positive-ka ah, he/she/it falku wuxuu qaataa <strong>-s</strong> (sida: <em>She works</em>). Laakiin marka aad sameyneyso su'aal ama diidmo, waxaad keeneysaa <strong>DOES</strong> ama <strong>DOESN'T</strong>. Maadaama <em>does</em> ay horey u siddo "s"-tii, falku wuxuu ku noqdaa asalkiisii oo dambe (base verb), markaa waa in la yiraahdaa <strong>Does she work?</strong> oo <em>marnaba</em> ma noqon karto <em>Does she works?</em>.
              </p>
            </div>

            <div className="bg-[#fef2f2] border-2 border-[#ef4444] rounded-2xl p-4 sm:p-5 text-[#991b1b] space-y-2">
              <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold uppercase font-mono text-[#b91c1c]">
                <XCircle className="w-5 h-5 text-[#dc2626]" />
                <span>Isbarbardhigga Saxda ah (Short Answers):</span>
              </div>
              <div
                className="text-lg sm:text-2xl font-extrabold text-[#7f1d1d] flex flex-wrap gap-4 sm:gap-6 justify-center pt-1"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                <span>Does she work? — Yes, she does. / No, she doesn't.</span>
              </div>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-lg sm:text-2xl font-bold"
              style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
            >
              <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Does she work?</span>
                <span className="text-sm font-sans font-normal text-emerald-900">✓ Sax (Base verb)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Does she works?</span>
                <span className="text-sm font-sans font-normal text-rose-900">✗ Khalad (Laba "s")</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SIDE-BY-SIDE: REFINED RULES
            ========================================================================= */}
        <div className="space-y-4 mb-8 relative z-10">
          <div className="text-center">
            <span className="text-xs font-mono font-bold text-[#1f4e78] uppercase tracking-wider">
              Xeerarka Muhiimka ah (Key Grammar Rules):
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#f0f9ff]/90 border-2 border-[#0284c7] rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#bae6fd] pb-2">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-[#0369a1]">
                  Xeerka 1: Sifada (Adjectives & To Be)
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#e0f2fe] text-[#0284c7]">
                  AM / IS / ARE
                </span>
              </div>
              <div
                className="space-y-2 text-xl sm:text-2xl font-bold text-[#0c4a6e]"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                <div>• Happy is an adjective (sifo).</div>
                <div>• Use AM with I, IS with he/she/it, and ARE with you/we/they.</div>
              </div>
              <p className="text-xs text-[#0369a1] font-sans pt-1 leading-relaxed">
                <strong>Sharaxaad:</strong> Markay tahay sifad ama magac (sida <em>happy, cold, a teacher</em>), waxaan isticmaalnaa <strong>AM / IS / ARE</strong> oo loama baahna DO/DOES.
              </p>
            </div>

            <div className="bg-[#fffbeb]/90 border-2 border-[#d97706] rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#fde68a] pb-2">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-[#b45309]">
                  Xeerka 2: Ficillada Caadiga ah
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#fef3c7] text-[#d97706]">
                  DO / DOES / DON'T / DOESN'T
                </span>
              </div>
              <div
                className="space-y-2 text-xl sm:text-2xl font-bold text-[#78350f]"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                <div>• For ordinary verbs in Present Simple, positive sentences use the main verb directly: “She works.”</div>
                <div>• Questions use DO/DOES: “Does she work?”</div>
                <div>• Negatives use DON'T/DOESN'T: “She doesn't work.”</div>
              </div>
              <p className="text-xs text-[#b45309] font-sans pt-1 leading-relaxed">
                <strong>Sharaxaad:</strong> Ficillada caadiga ah (sida <em>work, live, like</em>) waxay u baahan yihiin <strong>DO / DOES</strong> marka la weydiinayo su'aal ama la diidmayo (negative).
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            7. INTERACTIVE PRACTICE QUIZ WITH SOMALI EXPLANATIONS
            ========================================================================= */}
        <div className="mt-10 pt-6 border-t-2 border-dashed border-[#d3c7a8] relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#1a5fb4] font-bold block">
                Tijaabada Naxwaha (Scratchpad Quiz)
              </span>
              <h3
                className="text-xl sm:text-3xl font-black text-[#1a365d]"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                Xulo erayga saxda ah ee xukun kasta:
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
                  Dhibcaha: {score} / {QUIZ_QUESTIONS.length}
                </span>
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-[#fffdf7] border border-[#d3c7a8] text-[#1c2e4a] hover:bg-[#f5eed6] flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mar kale tijaabi</span>
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
                      Su'aasha {q.id}:
                    </span>
                    {hasSubmitted && (
                      <span className="text-xs font-bold flex items-center gap-1">
                        {isCorrect ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sax (Correct)
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-rose-600" /> Khalad (Mistake)
                          </span>
                        )}
                      </span>
                    )}
                  </div>

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

                  {hasSubmitted && (
                    <div className="mt-3 pt-2 border-t border-neutral-200 text-xs leading-relaxed space-y-1">
                      <p className={isCorrect ? 'text-emerald-900 font-semibold' : 'text-rose-900 font-semibold'}>
                        🇪🇹 <strong>Sharaxaad (Somali):</strong> {q.explanationSomali}
                      </p>
                      <p className="text-neutral-600 italic">
                        🇬🇧 {q.explanationEnglish}
                      </p>
                      {!isCorrect && (
                        <p className="text-emerald-800 font-bold pt-1">
                          Jawaabta saxda ah: <span className="underline">{q.expected}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-3">
            <span className="text-xs text-[#64748b]">
              {!hasSubmitted
                ? `${answeredCount} ee ka mid ah ${QUIZ_QUESTIONS.length} la jawaabay`
                : 'Eeg natiijadaada kor ama riix "Mar kale tijaabi".'}
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
                Hubi Jawaabaha (Check Answers)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetQuiz}
                className="min-h-[44px] px-6 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-[#1a5fb4] hover:bg-[#154b8c] text-white shadow flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Mar kale tijaabi (Try Again)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
