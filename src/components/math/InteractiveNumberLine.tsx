import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CalculationPreset {
  start: number;
  operation: '+' | '-';
  change: number;
  label: string;
}

const PRESETS: CalculationPreset[] = [
  { start: -4, operation: '+', change: 6, label: '(-4) + 6 = +2' },
  { start: -2, operation: '-', change: 5, label: '(-2) - 5 = -7' },
  { start: 3, operation: '-', change: 8, label: '3 - 8 = -5' },
  { start: -6, operation: '+', change: 9, label: '(-6) + 9 = +3' },
  { start: 5, operation: '-', change: 5, label: '5 - 5 = 0' },
];

export const InteractiveNumberLine: React.FC<{ showSomali?: boolean }> = ({
  showSomali = true,
}) => {
  const [currentVal, setCurrentVal] = useState<number>(-3);
  const [activePreset, setActivePreset] = useState<CalculationPreset | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const min = -10;
  const max = 10;
  const range = max - min; // 20

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivePreset(null);
    setCurrentVal(parseInt(e.target.value, 10));
  };

  const applyPreset = (preset: CalculationPreset) => {
    setActivePreset(preset);
    const result =
      preset.operation === '+'
        ? preset.start + preset.change
        : preset.start - preset.change;
    setCurrentVal(result);
  };

  const getTemperatureBadge = (val: number) => {
    if (val < 0) {
      return {
        icon: '❄️',
        color: 'text-sky-400 bg-sky-950/40 border-sky-500/30',
        textDe: `${val} °C (Kälter / Unter Null)`,
        textSo: `${val} (Tiro taban / Qabow / Deyn)`,
        subtext: 'Minus = Nach links bewegen (Goyn)',
      };
    } else if (val === 0) {
      return {
        icon: '⚖️',
        color: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
        textDe: '0 (Nullpunkt / Neutral)',
        textSo: '0 (Eber / Barta dhexe)',
        subtext: 'Der neutrale Mittelpunkt',
      };
    } else {
      return {
        icon: '🔥',
        color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
        textDe: `+${val} °C (Wärmer / Über Null)`,
        textSo: `+${val} (Tiro togan / Kuleyl / Faa'iido)`,
        subtext: 'Plus = Nach rechts bewegen (Isku dar)',
      };
    }
  };

  const badge = getTemperatureBadge(currentVal);

  // SVG metrics for smooth responsive rendering
  const width = 360;
  const height = 90;
  const paddingX = 24;
  const innerWidth = width - 2 * paddingX;

  const getX = (val: number) => {
    const clamped = Math.max(min, Math.min(max, val));
    return paddingX + ((clamped - min) / range) * innerWidth;
  };

  const startX = activePreset ? getX(activePreset.start) : null;
  const endX = getX(currentVal);

  return (
    <div className="w-full bg-[#13110f] border border-sky-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header with accordion collapse option */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold text-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              Interaktiver Zahlenstrahl (Khadka Tirooyinka)
            </h3>
            <p className="text-[11px] text-neutral-400">
              Negativ & Positiv mit dem Finger anfassen
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 py-1 px-2 rounded-lg bg-neutral-800/60"
        >
          <span>{isOpen ? 'Ausblenden' : 'Anzeigen'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <>
          {/* Status Display Card */}
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${badge.color}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl">{badge.icon}</span>
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-extrabold tracking-tight block truncate">
                  {badge.textDe}
                </span>
                {showSomali && (
                  <span className="text-xs opacity-90 italic block truncate">
                    {badge.textSo}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold block opacity-80">
                Wert:
              </span>
              <span className="text-lg font-mono font-extrabold">
                {currentVal > 0 ? `+${currentVal}` : currentVal}
              </span>
            </div>
          </div>

          {/* SVG Visual Number Line */}
          <div className="w-full bg-[#0d0c0a] border border-neutral-800 rounded-xl p-2.5 overflow-x-hidden select-none">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto max-h-[110px]"
              aria-label="Interaktiver Zahlenstrahl"
            >
              <defs>
                <marker
                  id="arrow-right"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                </marker>
                <marker
                  id="arrow-left"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
                </marker>
              </defs>

              {/* Main Line */}
              <line
                x1={paddingX}
                y1={52}
                x2={width - paddingX}
                y2={52}
                stroke="#404040"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Zero Highlight Marker */}
              <circle cx={getX(0)} cy={52} r={4.5} fill="#f59e0b" />
              <text
                x={getX(0)}
                y={72}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#f59e0b"
                fontFamily="monospace"
              >
                0
              </text>

              {/* Major Ticks (-10, -5, 0, 5, 10) */}
              {[-10, -5, 5, 10].map((t) => (
                <g key={t}>
                  <line
                    x1={getX(t)}
                    y1={44}
                    x2={getX(t)}
                    y2={60}
                    stroke={t < 0 ? '#38bdf8' : '#10b981'}
                    strokeWidth="2"
                  />
                  <text
                    x={getX(t)}
                    y={72}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill={t < 0 ? '#7dd3fc' : '#6ee7b7'}
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {t > 0 ? `+${t}` : t}
                  </text>
                </g>
              ))}

              {/* Intermediate minor ticks */}
              {[-9, -8, -7, -6, -4, -3, -2, -1, 1, 2, 3, 4, 6, 7, 8, 9].map((t) => (
                <line
                  key={t}
                  x1={getX(t)}
                  y1={47}
                  x2={getX(t)}
                  y2={57}
                  stroke="#262626"
                  strokeWidth="1.2"
                />
              ))}

              {/* Animated calculation jump arc if preset is active */}
              {activePreset && startX !== null && (
                <g>
                  {/* Start point marker */}
                  <circle cx={startX} cy={52} r={4} fill="#a3a3a3" />
                  <text
                    x={startX}
                    y={32}
                    textAnchor="middle"
                    fontSize="8.5"
                    fill="#a3a3a3"
                    fontFamily="monospace"
                  >
                    Start: {activePreset.start}
                  </text>

                  {/* Arc curve */}
                  <path
                    d={`M ${startX} 48 Q ${(startX + endX) / 2} 16 ${endX} 48`}
                    fill="none"
                    stroke={activePreset.operation === '+' ? '#38bdf8' : '#f43f5e'}
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    markerEnd={
                      activePreset.operation === '+'
                        ? 'url(#arrow-right)'
                        : 'url(#arrow-left)'
                    }
                  />

                  {/* Operation badge on top of arc */}
                  <text
                    x={(startX + endX) / 2}
                    y={14}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="bold"
                    fill={activePreset.operation === '+' ? '#38bdf8' : '#f43f5e'}
                    fontFamily="monospace"
                  >
                    {activePreset.operation === '+'
                      ? `+${activePreset.change}`
                      : `-${activePreset.change}`}
                  </text>
                </g>
              )}

              {/* Current position marker on the line */}
              <circle
                cx={endX}
                cy={52}
                r={7}
                fill={currentVal < 0 ? '#0284c7' : currentVal === 0 ? '#d97706' : '#059669'}
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <text
                x={endX}
                y={28}
                textAnchor="middle"
                fontSize="11"
                fontWeight="extrabold"
                fill="#ffffff"
                fontFamily="monospace"
              >
                {currentVal > 0 ? `+${currentVal}` : currentVal}
              </text>
            </svg>
          </div>

          {/* Touch Slider with large handle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1 text-sky-400">
                <ArrowLeft className="w-3.5 h-3.5" /> Minus (Kälter)
              </span>
              <span className="text-amber-400 font-bold">0</span>
              <span className="flex items-center gap-1 text-emerald-400">
                Plus (Wärmer) <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <input
              type="range"
              min={min}
              max={max}
              step={1}
              value={currentVal}
              onChange={handleSliderChange}
              aria-label="Zahlenstrahl Schieberegler"
              className="w-full h-8 accent-sky-400 cursor-pointer bg-neutral-800 rounded-lg outline-none"
            />
          </div>

          {/* Quick Problem Simulation Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 block font-mono">
              Rechnungen am Zahlenstrahl simulieren:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`min-h-[42px] px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 border flex items-center justify-center gap-1 ${
                    activePreset?.label === p.label
                      ? 'bg-sky-500 text-neutral-950 border-sky-400 shadow'
                      : 'bg-[#181614] hover:bg-neutral-800 text-neutral-200 border-neutral-700/80'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setActivePreset(null);
                  setCurrentVal(0);
                }}
                className="min-h-[42px] px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-neutral-800/80 text-neutral-300 hover:text-white border border-neutral-700/80 flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Auf 0 zurück</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
