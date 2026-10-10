import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Volume2,
  Square,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Languages,
  Sparkles,
  BookOpen,
  Info,
  Check,
  Type,
  Headphones,
} from 'lucide-react';
import { useEdgeTTS } from '../../hooks/useEdgeTTS';
import {
  lookupWordTranslation,
  normalizeReadingToken,
  WordContextTranslation,
  ReadingTranslationLang,
} from '../../data/examPrepare/readingDictionary';

export type ReadingFontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface ReadingPassageData {
  title: string;
  text: string;
}

interface InteractiveReadingPassageProps {
  lessonId: string;
  passage: ReadingPassageData;
}

interface TokenItem {
  id: string; // unique identifier
  type: 'word' | 'punct' | 'space';
  text: string;
  cleanWord?: string;
}

interface TokenCluster {
  type: 'cluster';
  id: string;
  word: TokenItem;
  trailingPunct: TokenItem[];
}

interface StandaloneToken {
  type: 'standalone';
  id: string;
  token: TokenItem;
}

type ParagraphRenderItem = TokenCluster | StandaloneToken;

const FONT_SIZES: ReadingFontSize[] = ['small', 'medium', 'large', 'xlarge'];

const FONT_SIZE_CONFIG: Record<
  ReadingFontSize,
  {
    label: string;
    textClass: string;
    leadingClass: string;
    wordPadding: string;
  }
> = {
  small: {
    label: 'Small',
    textClass: 'text-sm sm:text-base',
    leadingClass: 'leading-relaxed sm:leading-loose',
    wordPadding: 'py-0.5 px-1',
  },
  medium: {
    label: 'Medium (Default)',
    textClass: 'text-base sm:text-lg',
    leadingClass: 'leading-loose',
    wordPadding: 'py-0.5 px-1.5',
  },
  large: {
    label: 'Large',
    textClass: 'text-lg sm:text-xl',
    leadingClass: 'leading-loose sm:leading-[2.2]',
    wordPadding: 'py-1 px-2',
  },
  xlarge: {
    label: 'Extra Large',
    textClass: 'text-xl sm:text-2xl',
    leadingClass: 'leading-[2.2] sm:leading-[2.4]',
    wordPadding: 'py-1 px-2.5',
  },
};

const STORAGE_KEY_FONT_SIZE = 'straightforward_reading_font_size';
const STORAGE_KEY_LANG = 'straightforward_reading_preferred_lang';

export const InteractiveReadingPassage: React.FC<InteractiveReadingPassageProps> = ({
  lessonId,
  passage,
}) => {
  const { play, stop, isSpeaking, activeSpeechId } = useEdgeTTS('en');

  // Text size state with persistence
  const [fontSize, setFontSize] = useState<ReadingFontSize>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
      if (saved && (FONT_SIZES as string[]).includes(saved)) {
        return saved as ReadingFontSize;
      }
    } catch {
      // fallback
    }
    return 'medium';
  });

  // Preferred translation language tab ('de' | 'sv' | 'so')
  const [preferredLang, setPreferredLang] = useState<ReadingTranslationLang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved === 'de' || saved === 'sv' || saved === 'so') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'de';
  });

  // Selected word for translation inspection
  const [selectedWordToken, setSelectedWordToken] = useState<TokenItem | null>(null);

  // Reference to word details inspector for smooth scroll on mobile
  const inspectorRef = useRef<HTMLDivElement>(null);

  const handleSetFontSize = (size: ReadingFontSize) => {
    setFontSize(size);
    try {
      localStorage.setItem(STORAGE_KEY_FONT_SIZE, size);
    } catch {
      // ignore
    }
  };

  const handleSetPreferredLang = (lang: ReadingTranslationLang) => {
    setPreferredLang(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch {
      // ignore
    }
  };

  const zoomIn = () => {
    const idx = FONT_SIZES.indexOf(fontSize);
    if (idx < FONT_SIZES.length - 1) {
      handleSetFontSize(FONT_SIZES[idx + 1]);
    }
  };

  const zoomOut = () => {
    const idx = FONT_SIZES.indexOf(fontSize);
    if (idx > 0) {
      handleSetFontSize(FONT_SIZES[idx - 1]);
    }
  };

  const resetZoom = () => {
    handleSetFontSize('medium');
  };

  // Parse text into paragraphs and individual tokens (words, punctuation, spaces)
  const paragraphs = useMemo(() => {
    const rawParagraphs = passage.text.split(/\r?\n+/);
    return rawParagraphs.map((paraText, pIdx) => {
      const TOKEN_REGEX = /([a-zA-Z0-9]+(?:['\-][a-zA-Z0-9]+)*)|([^a-zA-Z0-9\s]+)|(\s+)/g;
      let match: RegExpExecArray | null;
      const tokens: TokenItem[] = [];
      let tokenIdx = 0;

      while ((match = TOKEN_REGEX.exec(paraText)) !== null) {
        if (match[1]) {
          // Word
          const raw = match[1];
          const clean = normalizeReadingToken(raw);
          tokens.push({
            id: `p${pIdx}-t${tokenIdx++}`,
            type: 'word',
            text: raw,
            cleanWord: clean,
          });
        } else if (match[2]) {
          // Punctuation
          tokens.push({
            id: `p${pIdx}-t${tokenIdx++}`,
            type: 'punct',
            text: match[2],
          });
        } else if (match[3]) {
          // Whitespace
          tokens.push({
            id: `p${pIdx}-t${tokenIdx++}`,
            type: 'space',
            text: match[3],
          });
        }
      }

      // Group words and immediately trailing punctuation into atomic line-wrap units
      const items: ParagraphRenderItem[] = [];
      let i = 0;
      while (i < tokens.length) {
        const tok = tokens[i];
        if (tok.type === 'word') {
          const trailingPunct: TokenItem[] = [];
          let j = i + 1;
          while (j < tokens.length && tokens[j].type === 'punct') {
            trailingPunct.push(tokens[j]);
            j++;
          }
          items.push({
            type: 'cluster',
            id: `cluster-${tok.id}`,
            word: tok,
            trailingPunct,
          });
          i = j;
        } else {
          items.push({
            type: 'standalone',
            id: tok.id,
            token: tok,
          });
          i++;
        }
      }
      return items;
    });
  }, [passage.text]);

  // Lookup translation data for the selected word
  const translationData: WordContextTranslation | null = useMemo(() => {
    if (!selectedWordToken || !selectedWordToken.cleanWord) return null;
    return (
      lookupWordTranslation(selectedWordToken.cleanWord) ||
      // Try singular / base without apostrophe s
      lookupWordTranslation(selectedWordToken.cleanWord.replace(/'s$/i, ''))
    );
  }, [selectedWordToken]);

  const isFullPassagePlaying =
    activeSpeechId === `reading-${lessonId}` && isSpeaking;

  const isWordAudioPlaying = (tokenWord: string) => {
    return (
      activeSpeechId === `reading-word-${normalizeReadingToken(tokenWord)}` &&
      isSpeaking
    );
  };

  const handleTogglePlayPassage = () => {
    if (isFullPassagePlaying) {
      stop();
    } else {
      play(`reading-${lessonId}`, passage.text);
    }
  };

  const handleSelectWord = useCallback((token: TokenItem) => {
    if (selectedWordToken?.id === token.id) {
      // Toggle off if already selected
      setSelectedWordToken(null);
    } else {
      setSelectedWordToken(token);
      // Small timeout to allow render, then smooth scroll into view on small screens if needed
      setTimeout(() => {
        if (window.innerWidth < 640 && inspectorRef.current) {
          inspectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, [selectedWordToken]);

  const handlePlayWordAudio = (wordText: string) => {
    const clean = normalizeReadingToken(wordText);
    play(`reading-word-${clean}`, wordText);
  };

  const handleDeselectWord = () => {
    setSelectedWordToken(null);
  };

  // Keyboard shortcut to close inspector on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedWordToken) {
        setSelectedWordToken(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWordToken]);

  const currentConfig = FONT_SIZE_CONFIG[fontSize];
  const canZoomIn = FONT_SIZES.indexOf(fontSize) < FONT_SIZES.length - 1;
  const canZoomOut = FONT_SIZES.indexOf(fontSize) > 0;
  const isDefaultSize = fontSize === 'medium';

  return (
    <section className="bg-[#171310] border border-sky-500/30 rounded-3xl p-4 sm:p-6 space-y-4 shadow-md transition-all">
      {/* 1. Header Toolbar: Title, Passage Audio & Text Display Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
            <BookOpen className="w-4 h-4" />
          </span>
          <div>
            <span className="text-[10px] font-mono uppercase text-sky-400 font-bold tracking-wider block">
              Interactive Reading Text
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {passage.title}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Listen / Stop Button */}
          <button
            type="button"
            onClick={handleTogglePlayPassage}
            aria-label={isFullPassagePlaying ? 'Stop full text audio' : 'Listen to full text'}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isFullPassagePlaying
                ? 'bg-sky-500 text-neutral-950 font-bold border-sky-400 shadow-sm animate-pulse'
                : 'bg-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-700/80 border-neutral-700'
            }`}
          >
            {isFullPassagePlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen to Full Text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Reading Display Toolbar: Font Size Presets, Zoom Controls & Helpful Tip */}
      <div className="bg-[#120f0d] rounded-2xl p-2.5 sm:p-3 border border-neutral-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        {/* Left: Text size preset pills & zoom buttons */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 text-neutral-400 font-medium mr-1">
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono">Text Size:</span>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center bg-[#1c1814] rounded-xl p-0.5 border border-neutral-800">
            {FONT_SIZES.map((size) => {
              const active = fontSize === size;
              const shortLabels: Record<ReadingFontSize, string> = {
                small: 'S',
                medium: 'M',
                large: 'L',
                xlarge: 'XL',
              };
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSetFontSize(size)}
                  title={`Set text size: ${FONT_SIZE_CONFIG[size].label}`}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  {shortLabels[size]}
                </button>
              );
            })}
          </div>

          {/* Zoom Out (-) */}
          <button
            type="button"
            onClick={zoomOut}
            disabled={!canZoomOut}
            aria-label="Decrease text size"
            title="Decrease text size (-)"
            className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all ${
              canZoomOut
                ? 'bg-[#1c1814] border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-800 cursor-pointer'
                : 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Zoom In (+) */}
          <button
            type="button"
            onClick={zoomIn}
            disabled={!canZoomIn}
            aria-label="Increase text size"
            title="Increase text size (+)"
            className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all ${
              canZoomIn
                ? 'bg-[#1c1814] border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-800 cursor-pointer'
                : 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Reset Zoom */}
          {!isDefaultSize && (
            <button
              type="button"
              onClick={resetZoom}
              title="Reset to default Medium size"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-semibold text-neutral-400 hover:text-neutral-200 bg-[#1c1814] hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Helpful learner tip */}
        <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80 bg-amber-400/5 px-2.5 py-1 rounded-xl border border-amber-400/10">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Tap any word to see translation, grammar role & listen.</span>
        </div>
      </div>

      {/* 3. Interactive Reading Area: Words as Clickable Tokens */}
      <div
        className={`bg-[#110e0c] p-5 sm:p-7 rounded-2xl border border-neutral-800/90 text-neutral-200 font-serif select-text transition-all ${currentConfig.textClass} ${currentConfig.leadingClass}`}
      >
        {paragraphs.map((paraItems, pIdx) => (
          <p key={`p-${pIdx}`} className="mb-4 last:mb-0">
            {paraItems.map((item) => {
              if (item.type === 'cluster') {
                const wordToken = item.word;
                const isSelected = selectedWordToken?.id === wordToken.id;
                const isSpeakingThis = isWordAudioPlaying(wordToken.text);

                return (
                  <span
                    key={item.id}
                    className="inline-block whitespace-nowrap align-baseline"
                  >
                    <button
                      key={wordToken.id}
                      type="button"
                      onClick={() => handleSelectWord(wordToken)}
                      role="button"
                      aria-label={`Translate word: ${wordToken.text}`}
                      aria-pressed={isSelected}
                      className={`inline font-serif transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/80 cursor-pointer select-none ${
                        currentConfig.wordPadding
                      } ${
                        isSelected
                          ? 'bg-amber-400/25 text-amber-200 font-bold ring-2 ring-amber-400/90 shadow-sm'
                          : isSpeakingThis
                          ? 'bg-sky-500/25 text-sky-200 font-bold ring-2 ring-sky-400/90'
                          : 'text-neutral-200 hover:bg-neutral-800/90 hover:text-white'
                      }`}
                    >
                      {wordToken.text}
                    </button>
                    {item.trailingPunct.map((p) => (
                      <span
                        key={p.id}
                        className="text-neutral-400 font-serif inline select-none pointer-events-none"
                      >
                        {p.text}
                      </span>
                    ))}
                  </span>
                );
              }

              if (item.token.type === 'punct') {
                return (
                  <span
                    key={item.id}
                    className="text-neutral-400 font-serif inline select-none pointer-events-none"
                  >
                    {item.token.text}
                  </span>
                );
              }

              // Space
              return (
                <span
                  key={item.id}
                  className="font-serif inline select-none pointer-events-none"
                >
                  {item.token.text}
                </span>
              );
            })}
          </p>
        ))}
      </div>

      {/* 4. Word Translation & Audio Inspector Card (Opens when word is tapped) */}
      {selectedWordToken && (
        <div
          ref={inspectorRef}
          className="bg-[#1b1612] border-2 border-amber-400/50 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl transition-all animate-fadeIn"
        >
          {/* Card Top: Word, Badges, Single-word Listen & Close button */}
          <div className="flex items-start justify-between gap-3 border-b border-neutral-800/90 pb-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide">
                {translationData ? translationData.word : selectedWordToken.text}
              </span>

              {/* Part of Speech Badge */}
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30">
                {translationData ? translationData.partOfSpeech : 'vocabulary word'}
              </span>

              {/* Word Pronunciation / Listen Button */}
              <button
                type="button"
                onClick={() =>
                  handlePlayWordAudio(
                    translationData ? translationData.word : selectedWordToken.text
                  )
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isWordAudioPlaying(
                    translationData ? translationData.word : selectedWordToken.text
                  )
                    ? 'bg-amber-400 text-neutral-950 border-amber-300 font-black animate-pulse'
                    : 'bg-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-700 border-neutral-700'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>
                  {isWordAudioPlaying(
                    translationData ? translationData.word : selectedWordToken.text
                  )
                    ? 'Playing...'
                    : 'Listen'}
                </span>
              </button>
            </div>

            {/* Close / Dismiss Inspector Button */}
            <button
              type="button"
              onClick={handleDeselectWord}
              aria-label="Close word details"
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context Meaning in English */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-400 font-semibold tracking-wider block">
              Meaning in this text:
            </span>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed bg-[#14100d] p-2.5 rounded-xl border border-neutral-800/80">
              {translationData
                ? translationData.contextMeaning
                : `Straightforward Elementary vocabulary item: "${selectedWordToken.text}".`}
            </p>
          </div>

          {/* Multilingual Translation Tabs & Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider flex items-center gap-1">
                <Languages className="w-3 h-3" />
                Translations:
              </span>

              {/* Language Selector Pills */}
              <div className="flex items-center gap-1 bg-[#14100d] p-1 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => handleSetPreferredLang('de')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    preferredLang === 'de'
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  🇩🇪 German
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPreferredLang('sv')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    preferredLang === 'sv'
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  🇸🇪 Swedish
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPreferredLang('so')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    preferredLang === 'so'
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  🇸🇴 Somali
                </button>
              </div>
            </div>

            {/* Translation Display */}
            {translationData ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* German */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    preferredLang === 'de'
                      ? 'bg-amber-400/10 border-amber-400/40 ring-1 ring-amber-400/30'
                      : 'bg-[#14100d] border-neutral-800/80 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-neutral-400 mb-1">
                    <span>🇩🇪 Deutsch</span>
                    {preferredLang === 'de' && (
                      <span className="text-[10px] text-amber-300 font-bold">Selected</span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white">
                    {translationData.translations.de.translation}
                  </div>
                  {translationData.translations.de.note && (
                    <div className="text-[11px] text-amber-200/80 italic mt-0.5">
                      {translationData.translations.de.note}
                    </div>
                  )}
                </div>

                {/* Swedish */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    preferredLang === 'sv'
                      ? 'bg-amber-400/10 border-amber-400/40 ring-1 ring-amber-400/30'
                      : 'bg-[#14100d] border-neutral-800/80 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-neutral-400 mb-1">
                    <span>🇸🇪 Svenska</span>
                    {preferredLang === 'sv' && (
                      <span className="text-[10px] text-amber-300 font-bold">Selected</span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white">
                    {translationData.translations.sv.translation}
                  </div>
                  {translationData.translations.sv.note && (
                    <div className="text-[11px] text-amber-200/80 italic mt-0.5">
                      {translationData.translations.sv.note}
                    </div>
                  )}
                </div>

                {/* Somali */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    preferredLang === 'so'
                      ? 'bg-amber-400/10 border-amber-400/40 ring-1 ring-amber-400/30'
                      : 'bg-[#14100d] border-neutral-800/80 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-neutral-400 mb-1">
                    <span>🇸🇴 Soomaali</span>
                    {preferredLang === 'so' && (
                      <span className="text-[10px] text-amber-300 font-bold">Selected</span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white">
                    {translationData.translations.so.translation}
                  </div>
                  {translationData.translations.so.note && (
                    <div className="text-[11px] text-amber-200/80 italic mt-0.5">
                      {translationData.translations.so.note}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#14100d] border border-neutral-800 text-xs text-neutral-300">
                <span>Elementary context: </span>
                <span className="font-semibold text-white">"{selectedWordToken.text}"</span>
                <span className="text-neutral-400">
                  {' '}
                  is used in Lesson {lessonId.replace('lesson-', '')} practice. Use the audio
                  button above to hear British English pronunciation.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
