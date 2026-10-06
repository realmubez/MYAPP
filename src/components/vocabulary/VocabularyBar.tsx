import React, { useState } from 'react';
import { BookOpen, Volume2, Sparkles, ChevronRight, Languages } from 'lucide-react';
import { PUBLIC_VOCABULARY_LIST, VocabularyEntry } from '../../data/publicVocabulary';
import { PublicVocabularyModal } from './PublicVocabularyModal';

interface VocabularyBarProps {
  onPracticeText?: (text: string) => void;
  compact?: boolean;
}

export function VocabularyBar({ onPracticeText, compact = false }: VocabularyBarProps) {
  const [selectedEntry, setSelectedEntry] = useState<VocabularyEntry | null>(null);

  return (
    <div className="w-full rounded-2xl bg-[#14110e] border border-neutral-800/80 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📖</span>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>Interactive Vocabulary & Audio</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                EN • DE • SO
              </span>
            </h3>
            {!compact && (
              <p className="text-[11px] text-neutral-400">
                Click any word to see German & Somali translations with Ryan (UK), German & Somali Edge TTS audio
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Languages className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline font-mono text-[11px]">3 Languages</span>
        </div>
      </div>

      {/* Vocabulary Chips Grid */}
      <div className="flex flex-wrap items-center gap-2">
        {PUBLIC_VOCABULARY_LIST.map((entry) => (
          <button
            key={entry.id}
            onClick={() => setSelectedEntry(entry)}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 text-xs text-neutral-200 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
            title={`Explore "${entry.word}" (German: ${entry.germanWord} • Somali: ${entry.somaliWord})`}
          >
            <span className="font-bold text-amber-400 group-hover:text-amber-300 font-mono">
              {entry.word}
            </span>
            <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300">
              ({entry.germanWord.split('/')[0].trim()})
            </span>
            <Volume2 className="w-3 h-3 text-neutral-500 group-hover:text-amber-400 transition-colors" />
          </button>
        ))}
      </div>

      {/* Modal */}
      <PublicVocabularyModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onPracticeText={onPracticeText}
      />
    </div>
  );
}
