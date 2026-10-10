import React, { useState } from 'react';
import { BookOpen, Volume2, Languages, ArrowRight } from 'lucide-react';
import { PUBLIC_VOCABULARY_LIST, VocabularyEntry } from '../../data/publicVocabulary';
import { PublicVocabularyModal } from './PublicVocabularyModal';

interface VocabularyBarProps {
  onPracticeText?: (text: string) => void;
  compact?: boolean;
}

export function VocabularyBar({ onPracticeText, compact = false }: VocabularyBarProps) {
  const [selectedEntry, setSelectedEntry] = useState<VocabularyEntry | null>(null);

  return (
    <div className="w-full rounded-2xl bg-[#14110e] border border-neutral-800/90 p-3.5 sm:p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base select-none">📚</span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Key Vocabulary
              </h3>
              <span className="text-[10px] font-mono text-amber-400 font-semibold">
                (EN • DE • SO)
              </span>
            </div>
            {!compact && (
              <p className="text-[11px] text-neutral-400 line-clamp-1">
                Tap any word for definitions & audio (Ryan UK, German, Somali)
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono shrink-0">
          <Languages className="w-3 h-3 text-amber-400" />
          <span className="text-[10px]">3 Langs</span>
        </div>
      </div>

      {/* Vocabulary Chips Grid - Clean Mobile Layout */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {PUBLIC_VOCABULARY_LIST.map((entry) => {
          const shortGerman = entry.germanWord.split('/')[0].trim().replace(/\s*\(.*\)/, '');
          return (
            <button
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
              title={`Word: ${entry.word} • German: ${entry.germanWord} • Somali: ${entry.somaliWord}`}
            >
              <span className="font-semibold text-amber-400 group-hover:text-amber-300 font-mono text-[11px] sm:text-xs">
                {entry.word}
              </span>
              <span className="text-[10px] text-neutral-400 group-hover:text-neutral-300">
                · {shortGerman}
              </span>
              <Volume2 className="w-3 h-3 text-neutral-400 group-hover:text-amber-400 transition-colors shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Modal Popup */}
      <PublicVocabularyModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onPracticeText={onPracticeText}
      />
    </div>
  );
}
