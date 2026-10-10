import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  RotateCcw,
  Trash2,
  X,
  Minimize2,
  Maximize2,
  Eraser,
  Sparkles,
} from 'lucide-react';

interface FingerScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
  showSomali?: boolean;
  title?: string;
  subtitle?: string;
  storageKey?: string;
}

export const FingerScratchpad: React.FC<FingerScratchpadProps> = ({
  isOpen,
  onClose,
  showSomali = false,
  title = 'Handwriting Scratchpad ✍️',
  subtitle = 'Practise spelling, word order & answers with your finger',
  storageKey = 'my_learning_finger_scratchpad_v1',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState<string>('#f59e0b'); // amber default
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Initialize and size canvas
  const setupCanvas = useCallback((restoreFromStorage: boolean = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use parent container bounding client rect
    const parent = canvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth || 360;
    const height = isFullscreen
      ? Math.max(window.innerHeight - 150, 400)
      : Math.min(window.innerHeight * 0.45, 340);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill dark background
    ctx.fillStyle = '#0f0e0d';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines to guide handwriting
    ctx.strokeStyle = '#1e1c19';
    ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Try restoring saved drawing from localStorage if available
    if (restoreFromStorage && storageKey) {
      try {
        const savedDataUrl = localStorage.getItem(storageKey);
        if (savedDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            const loadedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setHistory([loadedState]);
          };
          img.src = savedDataUrl;
          return;
        }
      } catch (e) {
        console.warn('Failed to restore scratchpad image', e);
      }
    }

    // Save initial state for undo
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
  }, [isFullscreen, storageKey]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        setupCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized, setupCanvas]);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), currentState]); // keep last 10 states
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // remove current
    const previousState = newHistory[newHistory.length - 1];
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, canvas.toDataURL());
        } catch {
          // ignore quota error
        }
      }
    }
  };

  const clearCanvas = () => {
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    }
    setupCanvas(false);
  };

  // Pointer / Touch drawing handlers with touch-action: none
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const coords = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = isEraser ? '#0f0e0d' : color;
    ctx.lineWidth = isEraser ? 18 : lineWidth;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveHistoryState();
    if (storageKey && canvasRef.current) {
      try {
        localStorage.setItem(storageKey, canvasRef.current.toDataURL());
      } catch {
        // quota exceeded fallback
      }
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ${
        isMinimized
          ? 'bottom-20 right-4 w-auto'
          : isFullscreen
          ? 'inset-2 sm:inset-4 flex flex-col'
          : 'bottom-0 left-0 right-0 max-w-xl mx-auto p-2 sm:p-4'
      }`}
    >
      {isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-amber-500 text-neutral-950 font-bold shadow-2xl flex items-center gap-2 border border-amber-400 active:scale-95"
        >
          <PenTool className="w-5 h-5" />
          <span>Open Scratchpad ✍️</span>
        </button>
      ) : (
        <div className={`w-full bg-[#161412] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 ${
          isFullscreen ? 'h-full flex flex-col' : ''
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#1b1916] border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <PenTool className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">
                  {title}
                </span>
                {subtitle && (
                  <span className="text-[10px] text-amber-400/90 italic block">
                    {subtitle}
                  </span>
                )}
                {showSomali && (
                  <span className="text-[10px] text-amber-400/90 italic block">
                    Halkan ku xisaabi fartaada
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
                title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className={`w-full relative touch-none bg-[#0f0e0d] border-b border-neutral-800 ${
            isFullscreen ? 'flex-1 overflow-hidden' : ''
          }`}>
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full touch-none cursor-crosshair block"
              style={{ touchAction: 'none' }}
            />
          </div>

          {/* Scratchpad Controls Bar (Optimized for finger tapping) */}
          <div className="p-2.5 sm:p-3 bg-[#171513] flex items-center justify-between gap-2 flex-wrap">
            {/* Color Palette & Eraser */}
            <div className="flex items-center gap-1.5">
              {[
                { hex: '#f59e0b', label: 'Amber' },
                { hex: '#ffffff', label: 'White' },
                { hex: '#38bdf8', label: 'Sky' },
                { hex: '#10b981', label: 'Green' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    setIsEraser(false);
                    setColor(c.hex);
                  }}
                  aria-label={c.label}
                  className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${
                    !isEraser && color === c.hex
                      ? 'border-white scale-110 shadow-md'
                      : 'border-transparent opacity-80'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}

              <button
                type="button"
                onClick={() => setIsEraser(!isEraser)}
                className={`min-h-[34px] px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                  isEraser
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
                title="Eraser"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eraser</span>
              </button>
            </div>

            {/* Undo & Clear Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={undo}
                disabled={history.length <= 1}
                className="min-h-[36px] px-2.5 py-1 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 flex items-center gap-1 transition-all"
                title="Undo last stroke"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>

              <button
                type="button"
                onClick={clearCanvas}
                className="min-h-[36px] px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-all"
                title="Clear all handwriting"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
