import { useState, useRef, useCallback, useEffect, type RefObject, type ChangeEvent } from 'react';
import { DifficultWord, Language } from '../types/lessons';
import { STORAGE_KEYS } from '../services/tts';
import { typingSoundService } from '../services/typingSoundService';
import { reviewService } from '../services/reviewService';

export interface UseTypingEngineOptions {
  targetText: string;
  language: Language | 'python' | string;
  isCode?: boolean;
  onComplete?: (stats: TypingSessionStats) => void;
  disabled?: boolean;
  sentenceContext?: {
    text?: string;
    translation?: string;
    unitId?: string;
    unitTitle?: string;
    lessonId?: string;
  };
}

export interface TypingSessionStats {
  wpm: number;
  accuracy: number;
  mistakes: number;
  totalChars: number;
  durationSeconds: number;
}

export interface CharacterState {
  char: string;
  expectedChar: string;
  status: 'correct' | 'incorrect' | 'current' | 'untyped';
  isCurrent: boolean;
}

export function saveDifficultWord(word: string, language: Language) {
  const clean = word.toLowerCase().replace(/[^a-zåäöA-ZÅÄÖ]/g, '');
  if (!clean || clean.length < 2) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIFFICULT_WORDS);
    const list: DifficultWord[] = raw ? JSON.parse(raw) : [];
    const existing = list.find((item) => item.word.toLowerCase() === clean && item.language === language);
    if (existing) {
      existing.mistakes += 1;
      existing.lastMistakeAt = Date.now();
    } else {
      list.push({
        word: clean,
        language,
        mistakes: 1,
        lastMistakeAt: Date.now(),
      });
    }
    localStorage.setItem(STORAGE_KEYS.DIFFICULT_WORDS, JSON.stringify(list.slice(-100)));
  } catch (e) {
    console.warn('Failed to save difficult word', e);
  }
}

export function getDifficultWords(language?: Language): DifficultWord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIFFICULT_WORDS);
    if (!raw) return [];
    const list: DifficultWord[] = JSON.parse(raw);
    if (language) {
      return list.filter((item) => item.language === language);
    }
    return list;
  } catch (e) {
    return [];
  }
}

// Mobile and cross-platform newline normalizer
export const normalizeCodeInput = (value: string): string => {
  if (!value) return '';
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
};

export function useTypingEngine(options: UseTypingEngineOptions) {
  const { targetText, language, isCode = false, onComplete, disabled = false, sentenceContext } = options;
  const [typedText, setTypedText] = useState<string>('');
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [stats, setStats] = useState<TypingSessionStats | null>(null);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const mistakeIndicesRef = useRef<Set<number>>(new Set());
  const typedTextRef = useRef<string>('');
  typedTextRef.current = typedText;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const targetTextRef = useRef(targetText);
  targetTextRef.current = targetText;

  const languageRef = useRef(language);
  languageRef.current = language;

  const isCodeRef = useRef(isCode);
  isCodeRef.current = isCode;

  const sentenceContextRef = useRef(sentenceContext);
  sentenceContextRef.current = sentenceContext;

  // Ensure typing sound service is initialized on user gesture
  useEffect(() => {
    typingSoundService.init();
  }, []);

  // Helper to find word at character index (for language vocabulary tracking)
  const findWordAtIndex = useCallback(
    (index: number): string => {
      const currentTarget = targetTextRef.current;
      const words = currentTarget.split(/(\s+)/);
      let charCounter = 0;
      for (const w of words) {
        if (index >= charCounter && index < charCounter + w.length) {
          return w.trim();
        }
        charCounter += w.length;
      }
      return '';
    },
    []
  );

  // Stable reset function
  const resetTyping = useCallback(() => {
    setTypedText('');
    typedTextRef.current = '';
    setMistakeCount(0);
    setStartTime(null);
    setIsCompleted(false);
    setStats(null);
    mistakeIndicesRef.current.clear();
    inputRef.current?.focus();
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Handle typing change - accepts raw string value (directly from input.value or onChange)
  const handleInputChange = useCallback((rawInput: string | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (disabled || isCompleted) return;

    const rawVal = typeof rawInput === 'string' ? rawInput : rawInput.target.value;
    const normalizedRaw = normalizeCodeInput(rawVal);
    const currentTarget = normalizeCodeInput(targetTextRef.current);
    const previousTyped = typedTextRef.current;

    // Slice to target length (exact character matching, no trimming)
    const val = normalizedRaw.slice(0, currentTarget.length);

    // Start timer on first keypress
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    // Check newly typed characters (forward typing)
    if (val.length > previousTyped.length) {
      for (let i = previousTyped.length; i < val.length; i++) {
        const expected = currentTarget[i];
        const actual = val[i];

        if (actual === expected) {
          // Correct character sound
          typingSoundService.playCorrectKey();
        } else {
          // Soft error sound
          typingSoundService.playIncorrectKey();

          if (!mistakeIndicesRef.current.has(i)) {
            mistakeIndicesRef.current.add(i);
            setMistakeCount((prev) => prev + 1);

            // Record difficult word & language mistake only for Swedish / English language lessons
            if (!isCodeRef.current && (languageRef.current === 'sv' || languageRef.current === 'en')) {
              const failedWord = findWordAtIndex(i);
              if (failedWord) {
                saveDifficultWord(failedWord, languageRef.current as Language);
                reviewService.recordLanguageMistake({
                  word: failedWord,
                  language: languageRef.current as Language,
                  sentenceText: sentenceContextRef.current?.text || currentTarget,
                  sentenceTranslation: sentenceContextRef.current?.translation,
                  unitId: sentenceContextRef.current?.unitId,
                  unitTitle: sentenceContextRef.current?.unitTitle,
                  lessonId: sentenceContextRef.current?.lessonId,
                });
              }
            }
          }
        }
      }
    } else if (val.length < previousTyped.length) {
      // Backspace: clear mistake records beyond current length without playing sounds
      mistakeIndicesRef.current.forEach((idx) => {
        if (idx >= val.length) {
          mistakeIndicesRef.current.delete(idx);
        }
      });
    }

    setTypedText(val);
    typedTextRef.current = val;

    // Check for exact completion (no trimmed equality; spaces and newlines must match exactly)
    if (val.length === currentTarget.length && val === currentTarget) {
      // Pleasant completion sound
      setTimeout(() => {
        typingSoundService.playCompletion();
      }, 40);

      const finishTime = Date.now();
      const durationSeconds = startTime ? Math.max(1, (finishTime - startTime) / 1000) : 1;
      const totalMistakes = mistakeIndicesRef.current.size;
      const totalChars = currentTarget.length;
      const accuracy = Math.max(
        0,
        Math.round(((totalChars - totalMistakes) / totalChars) * 100)
      );
      const wpm = Math.max(1, Math.round((totalChars / 5) / (durationSeconds / 60)));

      const sessionStats: TypingSessionStats = {
        wpm,
        accuracy,
        mistakes: totalMistakes,
        totalChars,
        durationSeconds,
      };

      setIsCompleted(true);
      setStats(sessionStats);
      onCompleteRef.current?.(sessionStats);
    }
  }, [disabled, isCompleted, startTime, findWordAtIndex]);

  // Build character array for display based on normalized target text
  const normalizedTarget = normalizeCodeInput(targetText);
  const characters: CharacterState[] = normalizedTarget.split('').map((char, index) => {
    let status: CharacterState['status'] = 'untyped';
    const isCurrent = index === typedText.length;

    if (index < typedText.length) {
      status = typedText[index] === char ? 'correct' : 'incorrect';
    }

    return {
      char: index < typedText.length ? typedText[index] : char,
      expectedChar: char,
      status,
      isCurrent,
    };
  });

  return {
    typedText,
    characters,
    mistakeCount,
    isCompleted,
    stats,
    inputRef,
    handleInputChange,
    resetTyping,
    focusInput,
  };
}
