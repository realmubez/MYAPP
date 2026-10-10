import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  Highlighter,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export type DrawingTool = 'none' | 'pen' | 'highlighter' | 'eraser';
export type PenColor = '#1d4ed8' | '#dc2626' | '#16a34a' | '#18181b'; // blue, red, green, black
export type PenThickness = 'thin' | 'medium' | 'thick';

export interface StrokePoint {
  x: number; // normalized 0..1
  y: number; // normalized 0..1
}

export interface DrawingStroke {
  id: string;
  tool: 'pen' | 'highlighter' | 'eraser';
  color: string;
  size: number; // nominal pixel thickness
  opacity: number;
  points: StrokePoint[];
}

interface ScratchpadCanvasOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  storageKey?: string;
  lessonTitle?: string;
}

const THICKNESS_MAP: Record<PenThickness, number> = {
  thin: 2.5,
  medium: 5,
  thick: 9,
};

const COLOR_OPTIONS: { id: PenColor; label: string; bgClass: string; hex: string }[] = [
  { id: '#1d4ed8', label: 'Blue Pen', bgClass: 'bg-blue-600', hex: '#1d4ed8' },
  { id: '#dc2626', label: 'Red Pen', bgClass: 'bg-red-600', hex: '#dc2626' },
  { id: '#16a34a', label: 'Green Pen', bgClass: 'bg-emerald-600', hex: '#16a34a' },
  { id: '#18181b', label: 'Black Pen', bgClass: 'bg-zinc-900', hex: '#18181b' },
];

export const ScratchpadCanvasOverlay: React.FC<ScratchpadCanvasOverlayProps> = ({
  containerRef,
  storageKey = 'exam_scratchpad_notes_default',
  lessonTitle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active tool state ('none' means browsing/reading mode where normal touches scroll)
  const [activeTool, setActiveTool] = useState<DrawingTool>('pen');
  const [selectedColor, setSelectedColor] = useState<PenColor>('#1d4ed8');
  const [thickness, setThickness] = useState<PenThickness>('medium');

  // Strokes state
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [redoStack, setRedoStack] = useState<DrawingStroke[][]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Active stroke in progress
  const currentStrokeRef = useRef<DrawingStroke | null>(null);
  const isPointerDownRef = useRef<boolean>(false);

  // Load strokes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`scratchpad_strokes_${storageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setStrokes(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Save strokes to localStorage
  const saveStrokes = useCallback(
    (newStrokes: DrawingStroke[]) => {
      try {
        localStorage.setItem(
          `scratchpad_strokes_${storageKey}`,
          JSON.stringify(newStrokes)
        );
      } catch {
        // storage quota or disabled
      }
    },
    [storageKey]
  );

  // Render all strokes onto the canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Physical pixel size vs CSS size
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Helper to draw a single stroke
    const drawStroke = (stroke: DrawingStroke) => {
      if (stroke.points.length < 1) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.size * 2.8;
      } else if (stroke.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.38;
        ctx.lineWidth = stroke.size * 3.2;
      } else {
        // Regular pen
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = stroke.opacity;
        ctx.lineWidth = stroke.size;
      }

      ctx.beginPath();
      const first = stroke.points[0];
      ctx.moveTo(first.x * width, first.y * height);

      if (stroke.points.length === 1) {
        ctx.lineTo(first.x * width + 0.1, first.y * height + 0.1);
      } else {
        for (let i = 1; i < stroke.points.length; i++) {
          const pt = stroke.points[i];
          ctx.lineTo(pt.x * width, pt.y * height);
        }
      }

      ctx.stroke();
      ctx.restore();
    };

    // Draw completed strokes
    strokes.forEach(drawStroke);

    // Draw currently active stroke
    if (currentStrokeRef.current) {
      drawStroke(currentStrokeRef.current);
    }
  }, [strokes]);

  // Sync canvas size with container dimensions
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const cssWidth = Math.max(rect.width, 300);
    const cssHeight = Math.max(rect.height, 400);

    // Set pixel resolution
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;

    // Set CSS visual size
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    renderCanvas();
  }, [containerRef, renderCanvas]);

  // Observe container resizes (e.g. mobile rotation, responsive breakdown)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [containerRef, updateCanvasSize]);

  // Redraw when strokes change
  useEffect(() => {
    renderCanvas();
  }, [strokes, renderCanvas]);

  // Pointer event handlers for drawing (works with mouse, touch, and stylus)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture pointer to track smoothly outside borders
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    isPointerDownRef.current = true;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const strokeSize = THICKNESS_MAP[thickness];

    const newStroke: DrawingStroke = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tool: activeTool,
      color: activeTool === 'highlighter' ? selectedColor : selectedColor,
      size: strokeSize,
      opacity: activeTool === 'highlighter' ? 0.4 : 1.0,
      points: [{ x, y }],
    };

    currentStrokeRef.current = newStroke;
    renderCanvas();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current || !currentStrokeRef.current || activeTool === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    currentStrokeRef.current.points.push({ x, y });
    renderCanvas();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      const finished = currentStrokeRef.current;
      currentStrokeRef.current = null;
      setStrokes((prev) => {
        const next = [...prev, finished];
        saveStrokes(next);
        return next;
      });
      // Clear redo history when a new stroke is recorded
      setRedoStack([]);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    currentStrokeRef.current = null;
    renderCanvas();
  };

  // Undo last stroke
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    saveStrokes(newStrokes);
    setRedoStack((prev) => [...prev, [last]]);
  };

  // Redo stroke
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const restoredGroup = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    const newStrokes = [...strokes, ...restoredGroup];
    setStrokes(newStrokes);
    saveStrokes(newStrokes);
    setRedoStack(newRedo);
  };

  // Clear all annotations for this lesson
  const handleClear = () => {
    setStrokes([]);
    saveStrokes([]);
    setRedoStack([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="w-full">
      {/* =========================================================================
          DRAWING TOOLBAR (Clean, Compact, Sticky on Mobile)
          ========================================================================= */}
      <div className="bg-[#1c1713] border-2 border-[#d6c79f] rounded-2xl p-2.5 sm:p-3 mb-3 shadow-md flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Tool Selection (Pen, Highlighter, Eraser, Pointer/Read mode) */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Pen */}
          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              activeTool === 'pen'
                ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow'
                : 'bg-[#29221b] text-neutral-300 hover:text-white border-neutral-700'
            }`}
            title="Write and draw with pen"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Pen</span>
          </button>

          {/* Highlighter */}
          <button
            type="button"
            onClick={() => setActiveTool('highlighter')}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              activeTool === 'highlighter'
                ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow'
                : 'bg-[#29221b] text-neutral-300 hover:text-white border-neutral-700'
            }`}
            title="Highlight words and sentences"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Highlighter</span>
          </button>

          {/* Eraser */}
          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              activeTool === 'eraser'
                ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow'
                : 'bg-[#29221b] text-neutral-300 hover:text-white border-neutral-700'
            }`}
            title="Erase drawn strokes"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>

          {/* Reading Mode (Disables drawing overlay touch capturing so finger scrolls normally) */}
          <button
            type="button"
            onClick={() => setActiveTool('none')}
            className={`min-h-[36px] px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 border transition-all cursor-pointer ${
              activeTool === 'none'
                ? 'bg-neutral-200 text-neutral-900 border-white font-extrabold shadow'
                : 'bg-[#29221b] text-neutral-400 hover:text-neutral-200 border-neutral-700'
            }`}
            title="Read & Scroll (touches scroll the page)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Browse Mode</span>
            <span className="sm:hidden">Scroll</span>
          </button>
        </div>

        {/* Center: Color Palette & Thickness */}
        {activeTool !== 'none' && activeTool !== 'eraser' && (
          <div className="flex items-center gap-2">
            {/* Color buttons */}
            <div className="flex items-center gap-1 bg-[#120f0d] p-1 rounded-xl border border-neutral-800">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={`w-6 h-6 rounded-lg ${c.bgClass} border transition-transform cursor-pointer ${
                    selectedColor === c.id
                      ? 'scale-115 ring-2 ring-amber-400 border-white'
                      : 'opacity-70 hover:opacity-100 border-neutral-600'
                  }`}
                  title={c.label}
                />
              ))}
            </div>

            {/* Thickness selector */}
            <div className="flex items-center gap-1 bg-[#120f0d] p-1 rounded-xl border border-neutral-800">
              {(['thin', 'medium', 'thick'] as PenThickness[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setThickness(t)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                    thickness === t
                      ? 'bg-amber-400 text-neutral-950 shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right: Undo, Redo, Clear */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#29221b] border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Undo stroke"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#29221b] border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Redo stroke"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          {/* Clear button with confirmation modal */}
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={strokes.length === 0}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-rose-950/40 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Clear all drawings on this note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Drawing state banner helper */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 mb-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              activeTool !== 'none' ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
            }`}
          />
          <span>
            {activeTool !== 'none'
              ? `Canvas Active: Draw or write with your finger/stylus (${activeTool})`
              : 'Browse Mode: Normal scrolling active. Select Pen to write.'}
          </span>
        </div>
        {strokes.length > 0 && (
          <span className="font-mono text-amber-300/80">
            {strokes.length} stroke{strokes.length === 1 ? '' : 's'} saved locally
          </span>
        )}
      </div>

      {/* Confirmation Modal to Clear Current Drawings */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#1c1611] border-2 border-rose-500/50 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-left">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Clear Drawings?</span>
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              This will erase all your handwritten notes and circles on{' '}
              <strong className="text-amber-300">
                {lessonTitle || 'this grammar sheet'}
              </strong>
              . This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THE DRAWING CANVAS (Positioned absolute over the scratchpad container) */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`absolute inset-0 z-20 w-full h-full rounded-3xl ${
          activeTool !== 'none'
            ? 'cursor-crosshair pointer-events-auto touch-none'
            : 'pointer-events-none'
        }`}
        style={{
          touchAction: activeTool !== 'none' ? 'none' : 'auto',
        }}
      />
    </div>
  );
};
