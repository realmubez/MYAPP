import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MathView } from './MathView';

interface TermItem {
  id: string;
  display: string;
  variableGroup: 'x' | 'y' | 'const';
  coefficient: number;
}

interface TermLevel {
  title: string;
  problemLatex: string;
  items: TermItem[];
  simplifiedLatex: string;
  explanationDe: string;
  explanationSo: string;
}

const LEVELS: TermLevel[] = [
  {
    title: 'Aufgabe 1: Zwei Variablen & Zahl',
    problemLatex: '5x + 3y + 2x - 7y + 4',
    simplifiedLatex: '7x - 4y + 4',
    explanationDe: 'Wir fassen zusammen: 5x + 2x = 7x. Dann 3y - 7y = -4y. Und die +4 bleibt stehen.',
    explanationSo: 'Waxaan isku dareynaa: 5x + 2x = 7x. Kaddib 3y - 7y = -4y. Tirada +4 kaligeed ayaa taagan.',
    items: [
      { id: '1', display: '5x', variableGroup: 'x', coefficient: 5 },
      { id: '2', display: '+3y', variableGroup: 'y', coefficient: 3 },
      { id: '3', display: '+2x', variableGroup: 'x', coefficient: 2 },
      { id: '4', display: '-7y', variableGroup: 'y', coefficient: -7 },
      { id: '5', display: '+4', variableGroup: 'const', coefficient: 4 },
    ],
  },
  {
    title: 'Aufgabe 2: Negative Koeffizienten',
    problemLatex: '8x - 3x + 2y - 5 - 6y + 9',
    simplifiedLatex: '5x - 4y + 4',
    explanationDe: 'x-Terme: 8x - 3x = 5x. y-Terme: 2y - 6y = -4y. Zahlen: -5 + 9 = +4.',
    explanationSo: 'x-ka: 8x - 3x = 5x. y-ka: 2y - 6y = -4y. Tirooyinka: -5 + 9 = +4.',
    items: [
      { id: '1', display: '8x', variableGroup: 'x', coefficient: 8 },
      { id: '2', display: '-3x', variableGroup: 'x', coefficient: -3 },
      { id: '3', display: '+2y', variableGroup: 'y', coefficient: 2 },
      { id: '4', display: '-5', variableGroup: 'const', coefficient: -5 },
      { id: '5', display: '-6y', variableGroup: 'y', coefficient: -6 },
      { id: '6', display: '+9', variableGroup: 'const', coefficient: 9 },
    ],
  },
];

export const TermSorterLab: React.FC<{ showSomali?: boolean }> = ({
  showSomali = true,
}) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [selectedGroup, setSelectedGroup] = useState<'x' | 'y' | 'const'>('x');
  const [placedItems, setPlacedItems] = useState<Record<string, 'x' | 'y' | 'const'>>({});
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const level = LEVELS[currentLevelIdx];

  const handlePlaceItem = (item: TermItem) => {
    setPlacedItems((prev) => ({
      ...prev,
      [item.id]: selectedGroup,
    }));
  };

  const handleReset = () => {
    setPlacedItems({});
  };

  const unplacedItems = level.items.filter((it) => !placedItems[it.id]);

  // Check if all placed correctly
  const allPlaced = level.items.every((it) => placedItems[it.id]);
  const allCorrect = allPlaced && level.items.every((it) => placedItems[it.id] === it.variableGroup);

  const xItems = level.items.filter((it) => placedItems[it.id] === 'x');
  const yItems = level.items.filter((it) => placedItems[it.id] === 'y');
  const constItems = level.items.filter((it) => placedItems[it.id] === 'const');

  const sumGroup = (items: TermItem[]) => {
    return items.reduce((acc, curr) => acc + curr.coefficient, 0);
  };

  return (
    <div className="w-full bg-[#13110f] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              Term-Labor: Gleichartige Terme sortieren
            </h3>
            <p className="text-[11px] text-neutral-400">
              Tippe auf die Bausteine und sortiere sie in Körbe
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 py-1 px-2 rounded-lg bg-neutral-800/60"
        >
          <span>{isOpen ? 'Ausblenden' : 'Anzeigen'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <>
          {/* Level Switcher */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-neutral-300 font-mono">
              {level.title}
            </span>
            <div className="flex items-center gap-1">
              {LEVELS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentLevelIdx(idx);
                    setPlacedItems({});
                  }}
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    currentLevelIdx === idx
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Übung {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Original Problem */}
          <div className="bg-[#181614] border border-neutral-800 rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-0.5">
              Term zusammenfassen:
            </span>
            <div className="text-lg sm:text-xl text-amber-300 font-mono">
              <MathView math={level.problemLatex} block={true} />
            </div>
          </div>

          {/* Instruction */}
          <div className="text-xs text-neutral-300 bg-[#161412] p-2.5 rounded-xl border border-neutral-800 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Anleitung: Wähle unten einen Korb, dann tippe auf den Term!</span>
            </div>
            {showSomali && (
              <p className="text-[11px] text-neutral-400 italic">
                Dooro dambiisha (x-Terme, y-Terme ama Zahlen) kaddib taabo erayada ku habboon.
              </p>
            )}
          </div>

          {/* Active Target Basket Selector Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedGroup('x')}
              className={`min-h-[44px] p-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center ${
                selectedGroup === 'x'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                  : 'bg-[#181614] border-neutral-800 text-neutral-400'
              }`}
            >
              <span>🧺 Korb für x</span>
              <span className="text-[10px] opacity-80">({xItems.length} abgelegt)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGroup('y')}
              className={`min-h-[44px] p-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center ${
                selectedGroup === 'y'
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-1 ring-sky-400'
                  : 'bg-[#181614] border-neutral-800 text-neutral-400'
              }`}
            >
              <span>🧺 Korb für y</span>
              <span className="text-[10px] opacity-80">({yItems.length} abgelegt)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGroup('const')}
              className={`min-h-[44px] p-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center ${
                selectedGroup === 'const'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                  : 'bg-[#181614] border-neutral-800 text-neutral-400'
              }`}
            >
              <span>🧺 Zahlen</span>
              <span className="text-[10px] opacity-80">({constItems.length} abgelegt)</span>
            </button>
          </div>

          {/* Floating Term Bubbles available to sort */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-neutral-400 block">
              Noch nicht einsortiert ({unplacedItems.length}):
            </span>
            <div className="flex items-center gap-2 flex-wrap min-h-[44px] p-2 bg-[#100e0d] border border-neutral-800 rounded-xl">
              {unplacedItems.length === 0 ? (
                <span className="text-xs text-emerald-400 font-semibold italic flex items-center gap-1.5 py-1">
                  <CheckCircle2 className="w-4 h-4" /> Alle Terme in Körbe abgelegt!
                </span>
              ) : (
                unplacedItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePlaceItem(item)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold bg-[#221f1c] hover:bg-neutral-800 text-white border border-neutral-700/80 active:scale-90 transition-all shadow"
                  >
                    {item.display}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* The 3 Sorted Baskets Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* X Basket */}
            <div className="bg-[#181614] p-3 rounded-xl border border-amber-500/20 space-y-1">
              <span className="font-bold text-amber-400 block">x-Terme</span>
              <div className="flex flex-wrap gap-1 min-h-[28px]">
                {xItems.map((it) => (
                  <span
                    key={it.id}
                    className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs"
                  >
                    {it.display}
                  </span>
                ))}
              </div>
              <div className="pt-1 text-[11px] font-mono text-neutral-300 border-t border-neutral-800">
                Summe: <strong className="text-amber-300">{sumGroup(xItems)}x</strong>
              </div>
            </div>

            {/* Y Basket */}
            <div className="bg-[#181614] p-3 rounded-xl border border-sky-500/20 space-y-1">
              <span className="font-bold text-sky-400 block">y-Terme</span>
              <div className="flex flex-wrap gap-1 min-h-[28px]">
                {yItems.map((it) => (
                  <span
                    key={it.id}
                    className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold text-xs"
                  >
                    {it.display}
                  </span>
                ))}
              </div>
              <div className="pt-1 text-[11px] font-mono text-neutral-300 border-t border-neutral-800">
                Summe:{' '}
                <strong className="text-sky-300">
                  {sumGroup(yItems) >= 0 ? `+${sumGroup(yItems)}` : sumGroup(yItems)}y
                </strong>
              </div>
            </div>

            {/* Const Basket */}
            <div className="bg-[#181614] p-3 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="font-bold text-emerald-400 block">Zahlen</span>
              <div className="flex flex-wrap gap-1 min-h-[28px]">
                {constItems.map((it) => (
                  <span
                    key={it.id}
                    className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs"
                  >
                    {it.display}
                  </span>
                ))}
              </div>
              <div className="pt-1 text-[11px] font-mono text-neutral-300 border-t border-neutral-800">
                Summe:{' '}
                <strong className="text-emerald-300">
                  {sumGroup(constItems) >= 0 ? `+${sumGroup(constItems)}` : sumGroup(constItems)}
                </strong>
              </div>
            </div>
          </div>

          {/* Final Combined Result Card */}
          {allPlaced && (
            <div
              className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                allCorrect
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {allCorrect ? 'Perfekt sortiert!' : 'Noch nicht ganz richtig'}
                </span>
                <span className="font-mono text-base font-extrabold text-white">
                  <MathView math={level.simplifiedLatex} />
                </span>
              </div>
              <p className="text-xs text-neutral-200">{level.explanationDe}</p>
              {showSomali && (
                <p className="text-xs text-amber-200/90 italic pt-1 border-t border-neutral-800">
                  {level.explanationSo}
                </p>
              )}
            </div>
          )}

          {/* Reset button */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Zurücksetzen</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
