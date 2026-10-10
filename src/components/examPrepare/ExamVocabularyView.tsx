import React, { useState, useMemo } from 'react';
import {
  Volume2,
  Search,
  Headphones,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { EXAM_VOCABULARY_LIST, ExamVocabWord } from '../../data/examPrepare/vocabularyBank';
import { useEdgeTTS } from '../../hooks/useEdgeTTS';

export const ExamVocabularyView: React.FC = () => {
  const { play, isSpeaking, activeSpeechId, loadingKey } = useEdgeTTS('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Pronunciation / Listening Quiz Mode State
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    EXAM_VOCABULARY_LIST.forEach((v) => set.add(v.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredWords = useMemo(() => {
    return EXAM_VOCABULARY_LIST.filter((v) => {
      const matchCat =
        selectedCategory === 'all' || v.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        v.word.toLowerCase().includes(q) ||
        v.germanTranslation.toLowerCase().includes(q) ||
        v.englishDefinition.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Quiz list (shuffled subset of 10 items)
  const quizWords = useMemo(() => {
    return [...EXAM_VOCABULARY_LIST].sort(() => 0.5 - Math.random()).slice(0, 10);
  }, [isQuizMode]);

  const currentQuizWord = quizWords[quizIndex] || quizWords[0];

  // Options for current quiz word (current + 3 random distractors)
  const currentOptions = useMemo(() => {
    if (!currentQuizWord) return [];
    const distractors = EXAM_VOCABULARY_LIST.filter(
      (v) => v.id !== currentQuizWord.id
    )
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((v) => v.word);
    return [currentQuizWord.word, ...distractors].sort(() => 0.5 - Math.random());
  }, [currentQuizWord]);

  const handleStartQuiz = () => {
    setIsQuizMode(true);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizSubmitted(false);
    setSelectedOption(null);
  };

  const handlePlayQuizAudio = () => {
    if (currentQuizWord) {
      play(`quiz-audio-${currentQuizWord.id}`, currentQuizWord.word);
    }
  };

  const handleSelectQuizOption = (word: string) => {
    if (quizSubmitted) return;
    setSelectedOption(word);
    setQuizSubmitted(true);
    if (word === currentQuizWord.word) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex < quizWords.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setQuizSubmitted(false);
      setSelectedOption(null);
    } else {
      // Completed quiz
      setIsQuizMode(false);
    }
  };

  return (
    <div className="w-full space-y-5 animate-fadeIn">
      {/* Listening Mode Toggle Banner */}
      <div className="bg-gradient-to-r from-[#1b1713] to-[#15120f] border border-amber-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Pronunciation & Listening Mode
            </h3>
            <p className="text-xs text-neutral-400">
              Listen to native Microsoft Edge speech and test your English listening recognition.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartQuiz}
          className="min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start Listening Challenge</span>
        </button>
      </div>

      {/* Interactive Listening Challenge Modal / Section */}
      {isQuizMode && currentQuizWord && (
        <section className="bg-[#181410] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400">
                Listening Test: {quizIndex + 1} of {quizWords.length}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Score: {quizScore}/{quizIndex + (quizSubmitted ? 1 : 0)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsQuizMode(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Exit Challenge
            </button>
          </div>

          <div className="text-center py-4 space-y-3">
            <p className="text-xs sm:text-sm text-neutral-300">
              Tap the button below to listen to the English word, then choose what you heard:
            </p>

            <button
              type="button"
              onClick={handlePlayQuizAudio}
              className="min-h-[52px] px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm shadow-xl flex items-center justify-center gap-2.5 mx-auto cursor-pointer active:scale-95 transition-all"
            >
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span>Listen to Word 🔊</span>
            </button>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-2.5 max-w-lg mx-auto">
            {currentOptions.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQuizWord.word;

              let btnStyle =
                'bg-[#1e1914] border-neutral-700 text-white hover:border-amber-400';
              if (quizSubmitted) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                } else {
                  btnStyle = 'bg-[#14110e] border-neutral-800 text-neutral-500';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={quizSubmitted}
                  onClick={() => handleSelectQuizOption(opt)}
                  className={`min-h-[48px] px-4 py-2.5 rounded-2xl text-sm font-bold border transition-all cursor-pointer ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Result Feedback and Next Button */}
          {quizSubmitted && (
            <div className="p-4 rounded-2xl bg-[#14110e] border border-neutral-800 text-center space-y-2 max-w-lg mx-auto animate-fadeIn">
              <div className="flex items-center justify-center gap-1.5 text-sm font-bold">
                {selectedOption === currentQuizWord.word ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Perfect! Correct word.
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> The correct word was: "{currentQuizWord.word}"
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-300">
                German: <strong>{currentQuizWord.germanTranslation}</strong> · {currentQuizWord.englishDefinition}
              </p>

              <button
                type="button"
                onClick={handleNextQuiz}
                className="min-h-[40px] px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs mt-2 cursor-pointer shadow"
              >
                {quizIndex < quizWords.length - 1 ? 'Next Word ->' : 'Finish Challenge'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Search and Category Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search English or German words (e.g. beard, coffee, tall, dictionary)..."
            className="w-full min-h-[44px] pl-10 pr-4 rounded-2xl bg-[#16120e] border border-neutral-800 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-amber-400 outline-none transition-colors"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[32px] px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'bg-[#181410] text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat === 'all' ? `All (${EXAM_VOCABULARY_LIST.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredWords.map((v) => {
          const isPlayingWord = activeSpeechId === v.id && isSpeaking;
          const isPlayingExample =
            activeSpeechId === `ex-${v.id}` && isSpeaking;

          return (
            <div
              key={v.id}
              className="bg-[#15120f] border border-neutral-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-sm hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {v.word}
                    </h4>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {v.partOfSpeech}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {v.unit}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-amber-300 font-semibold mt-0.5">
                    {v.germanTranslation}
                  </p>
                </div>

                {/* Speak Word Button */}
                <button
                  type="button"
                  onClick={() => play(v.id, v.word)}
                  className={`min-h-[38px] min-w-[38px] p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    isPlayingWord
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md ring-2 ring-amber-300'
                      : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700'
                  }`}
                  title="Listen to English word"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Definition */}
              <p className="text-xs text-neutral-300 leading-relaxed bg-[#1b1713] p-2.5 rounded-xl border border-neutral-800/80">
                {v.englishDefinition}
              </p>

              {/* Example sentence with its own Listen button */}
              <div className="flex items-start justify-between gap-2 pt-1 border-t border-neutral-800/60 text-xs">
                <p className="text-neutral-300 italic min-w-0 pr-2">
                  "{v.exampleSentence}"
                </p>

                <button
                  type="button"
                  onClick={() => play(`ex-${v.id}`, v.exampleSentence)}
                  className={`min-h-[28px] px-2 py-0.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                    isPlayingExample
                      ? 'bg-amber-500 text-neutral-950 border-amber-400'
                      : 'bg-neutral-800/80 text-neutral-400 hover:text-white border-neutral-700'
                  }`}
                  title="Listen to example sentence"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Sentence</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
