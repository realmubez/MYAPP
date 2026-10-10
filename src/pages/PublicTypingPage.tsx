import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Clock,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  Trophy,
  Gauge,
  Target,
  FileText,
  Volume1,
  Share2,
  Check,
  Flame,
  ListOrdered,
  BookOpen,
  FastForward,
  Mic,
  Loader2,
  Play,
  Square,
  Radio,
  Bot,
  Plus,
  Languages,
  UploadCloud,
  FileUp,
} from 'lucide-react';
import { typingSoundService } from '../services/typingSoundService';
import { getTTSUrl, fetchTTSAudioBlobUrl, cleanSpeechText, TTSRate } from '../services/tts';
import { AIChatDrawer } from '../components/ai/AIChatDrawer';
import { findVocabularyByWord, VocabularyEntry } from '../data/publicVocabulary';
import { PublicVocabularyModal } from '../components/vocabulary/PublicVocabularyModal';
import { PublicDocumentReader } from '../components/reader/PublicDocumentReader';

export interface TrainingStep {
  id: string;
  title: string;
  chunk: string;
  hint?: string;
}

export interface PassageItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  gender: 'man' | 'woman' | 'custom';
  fullText: string;
  progressiveSteps: TrainingStep[];
  sentenceSteps: TrainingStep[];
}

export const INITIAL_PUBLIC_PASSAGES: PassageItem[] = [
  {
    id: 'man-profile',
    title: 'Passage 1 — The Man',
    subtitle: 'Description: Tall, slim, dark hair, beard & glasses',
    tag: 'First Subject',
    gender: 'man',
    fullText:
      'The man is tall and slim, and he looks around 30 years old. He has short dark hair, a beard, and he wears glasses. He is wearing a dark T-shirt, pants, and black shoes.',
    progressiveSteps: [
      { id: 'm-1', title: 'Start: Subject', chunk: 'The man', hint: 'Start with the subject' },
      { id: 'm-2', title: 'Physical Build', chunk: 'The man is tall', hint: 'Describe height' },
      { id: 'm-3', title: 'Complete Clause 1', chunk: 'The man is tall and slim,', hint: 'Height and build with comma' },
      { id: 'm-4', title: 'Age Clause', chunk: 'and he looks around 30 years old.', hint: 'Estimated age' },
      {
        id: 'm-5',
        title: 'Master Sentence 1',
        chunk: 'The man is tall and slim, and he looks around 30 years old.',
        hint: 'Full first sentence',
      },
      { id: 'm-6', title: 'Hair Description', chunk: 'He has short dark hair,', hint: 'Short dark hair with comma' },
      { id: 'm-7', title: 'Beard & Glasses', chunk: 'a beard, and he wears glasses.', hint: 'Facial details' },
      {
        id: 'm-8',
        title: 'Master Sentence 2',
        chunk: 'He has short dark hair, a beard, and he wears glasses.',
        hint: 'Full second sentence',
      },
      { id: 'm-9', title: 'Clothing: Top', chunk: 'He is wearing a dark T-shirt,', hint: 'Shirt details (capital T)' },
      { id: 'm-10', title: 'Pants & Shoes', chunk: 'pants, and black shoes.', hint: 'Bottom and footwear' },
      {
        id: 'm-11',
        title: 'Master Sentence 3',
        chunk: 'He is wearing a dark T-shirt, pants, and black shoes.',
        hint: 'Full third sentence',
      },
      {
        id: 'm-12',
        title: 'Complete Passage Mastery',
        chunk:
          'The man is tall and slim, and he looks around 30 years old. He has short dark hair, a beard, and he wears glasses. He is wearing a dark T-shirt, pants, and black shoes.',
        hint: 'Type the entire paragraph fluidly',
      },
    ],
    sentenceSteps: [
      {
        id: 'm-s1',
        title: 'Sentence 1: Appearance & Age',
        chunk: 'The man is tall and slim, and he looks around 30 years old.',
      },
      {
        id: 'm-s2',
        title: 'Sentence 2: Facial Features',
        chunk: 'He has short dark hair, a beard, and he wears glasses.',
      },
      {
        id: 'm-s3',
        title: 'Sentence 3: Outfit & Shoes',
        chunk: 'He is wearing a dark T-shirt, pants, and black shoes.',
      },
    ],
  },
  {
    id: 'woman-profile',
    title: 'Passage 2 — The Woman',
    subtitle: 'Description: Short, heavy, brown hair & happy smile',
    tag: 'Second Subject',
    gender: 'woman',
    fullText:
      'The woman is short and a little heavy, and she is around 40 years old. She has brown hair and a happy smile. She is wearing a light tunic shirt, pants, and flat shoes.',
    progressiveSteps: [
      { id: 'w-1', title: 'Start: Subject', chunk: 'The woman', hint: 'Start with the subject' },
      { id: 'w-2', title: 'Physical Build', chunk: 'The woman is short', hint: 'Describe height' },
      {
        id: 'w-3',
        title: 'Complete Clause 1',
        chunk: 'The woman is short and a little heavy,',
        hint: 'Height and weight with comma',
      },
      { id: 'w-4', title: 'Age Clause', chunk: 'and she is around 40 years old.', hint: 'Estimated age' },
      {
        id: 'w-5',
        title: 'Master Sentence 1',
        chunk: 'The woman is short and a little heavy, and she is around 40 years old.',
        hint: 'Full first sentence',
      },
      { id: 'w-6', title: 'Hair Description', chunk: 'She has brown hair', hint: 'Hair color' },
      { id: 'w-7', title: 'Smile Expression', chunk: 'and a happy smile.', hint: 'Facial expression' },
      {
        id: 'w-8',
        title: 'Master Sentence 2',
        chunk: 'She has brown hair and a happy smile.',
        hint: 'Full second sentence',
      },
      { id: 'w-9', title: 'Clothing: Top', chunk: 'She is wearing a light tunic shirt,', hint: 'Tunic shirt with comma' },
      { id: 'w-10', title: 'Pants & Shoes', chunk: 'pants, and flat shoes.', hint: 'Bottom and flat shoes' },
      {
        id: 'w-11',
        title: 'Master Sentence 3',
        chunk: 'She is wearing a light tunic shirt, pants, and flat shoes.',
        hint: 'Full third sentence',
      },
      {
        id: 'w-12',
        title: 'Complete Passage Mastery',
        chunk:
          'The woman is short and a little heavy, and she is around 40 years old. She has brown hair and a happy smile. She is wearing a light tunic shirt, pants, and flat shoes.',
        hint: 'Type the entire paragraph fluidly',
      },
    ],
    sentenceSteps: [
      {
        id: 'w-s1',
        title: 'Sentence 1: Appearance & Age',
        chunk: 'The woman is short and a little heavy, and she is around 40 years old.',
      },
      {
        id: 'w-s2',
        title: 'Sentence 2: Hair & Smile',
        chunk: 'She has brown hair and a happy smile.',
      },
      {
        id: 'w-s3',
        title: 'Sentence 3: Outfit & Footwear',
        chunk: 'She is wearing a light tunic shirt, pants, and flat shoes.',
      },
    ],
  },
];

export function generateStepsFromText(text: string, title = 'Custom Document Passage'): PassageItem {
  const clean = text.trim();
  const sentenceMatches = clean.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [clean];
  const sentences = sentenceMatches.map((s) => s.trim()).filter(Boolean);

  const progressiveSteps: TrainingStep[] = [];
  let progressiveIndex = 1;

  sentences.forEach((sentence, sIdx) => {
    const clauses = sentence.split(/,\s*/).map((c, i, arr) => (i < arr.length - 1 ? `${c},` : c));
    if (clauses.length > 1) {
      clauses.forEach((clause, cIdx) => {
        progressiveSteps.push({
          id: `custom-p-${progressiveIndex++}`,
          title: `Clause ${sIdx + 1}.${cIdx + 1}`,
          chunk: clause.trim(),
        });
      });
    }
    progressiveSteps.push({
      id: `custom-s-${progressiveIndex++}`,
      title: `Sentence ${sIdx + 1} Mastery`,
      chunk: sentence,
    });
  });

  progressiveSteps.push({
    id: `custom-full-${progressiveIndex}`,
    title: 'Complete Passage Mastery',
    chunk: clean,
  });

  const sentenceSteps: TrainingStep[] = sentences.map((s, idx) => ({
    id: `custom-sent-${idx + 1}`,
    title: `Sentence ${idx + 1}`,
    chunk: s,
  }));

  return {
    id: `custom-${Date.now()}`,
    title,
    subtitle: 'Uploaded Document / File Practice',
    tag: 'Custom File',
    gender: 'custom',
    fullText: clean,
    progressiveSteps,
    sentenceSteps,
  };
}

type PracticeMode = 'progressive' | 'sentence' | 'full';
type TimerOption = 0 | 15 | 30 | 60 | 90;
type MainTab = 'reader' | 'trainer';

const RYAN_VOICE_ID = 'en-GB-RyanNeural';

export function PublicTypingPage() {
  const location = useLocation();
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('reader');
  const [passages, setPassages] = useState<PassageItem[]>(INITIAL_PUBLIC_PASSAGES);
  const [selectedPassageIndex, setSelectedPassageIndex] = useState<number>(0);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('progressive');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [timerMode, setTimerMode] = useState<TimerOption>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [autoplayVoice, setAutoplayVoice] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<TTSRate>('0%');
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [selectedVocabEntry, setSelectedVocabEntry] = useState<VocabularyEntry | null>(null);

  const [inputVal, setInputVal] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const mistakeSetRef = useRef<Set<number>>(new Set());
  const autoAdvanceTimeoutRef = useRef<number | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check router state or query param for tab / custom text
  useEffect(() => {
    const customText = (location.state as { customText?: string; tab?: MainTab })?.customText;
    const targetTab = (location.state as { tab?: MainTab })?.tab;

    if (targetTab) {
      setActiveMainTab(targetTab);
    }
    if (customText && customText.trim()) {
      const newPassage = generateStepsFromText(customText, 'Custom Practice');
      setPassages((prev) => [newPassage, ...prev]);
      setSelectedPassageIndex(0);
      setActiveMainTab('trainer');
    }
  }, [location.state]);

  const currentPassage = passages[selectedPassageIndex] || passages[0];

  const currentStepsList: TrainingStep[] =
    practiceMode === 'progressive'
      ? currentPassage.progressiveSteps
      : practiceMode === 'sentence'
      ? currentPassage.sentenceSteps
      : [
          {
            id: `${currentPassage.id}-full`,
            title: 'Full Passage',
            chunk: currentPassage.fullText,
          },
        ];

  const currentStep =
    currentStepsList[Math.min(currentStepIndex, currentStepsList.length - 1)] ||
    currentStepsList[0];
  const targetText = currentStep.chunk;

  const stopAudio = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
        activeAudioRef.current.removeAttribute('src');
      } catch {
        // ignore
      }
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAudioLoading(false);
    setIsAudioPlaying(false);
  }, []);

  const playRyanAudio = useCallback(
    async (textToPlay: string) => {
      const clean = cleanSpeechText(textToPlay);
      if (!clean) return;

      stopAudio();
      setIsAudioLoading(true);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const targetUrl = getTTSUrl({
        text: clean,
        voice: RYAN_VOICE_ID,
        rate: speechRate,
      });

      try {
        let resolvedSrc = targetUrl;
        try {
          resolvedSrc = await fetchTTSAudioBlobUrl(targetUrl, abortController.signal);
        } catch {
          // fallback to direct targetUrl
        }

        if (abortController.signal.aborted) return;

        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = resolvedSrc;
        activeAudioRef.current = audio;

        audio.onplaying = () => {
          setIsAudioLoading(false);
          setIsAudioPlaying(true);
        };

        audio.onended = () => {
          setIsAudioLoading(false);
          setIsAudioPlaying(false);
          activeAudioRef.current = null;
        };

        audio.onerror = () => {
          setIsAudioLoading(false);
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(clean);
            utterance.lang = 'en-GB';
            utterance.rate = speechRate === '-10%' ? 0.85 : 0.95;
            utterance.onstart = () => setIsAudioPlaying(true);
            utterance.onend = () => setIsAudioPlaying(false);
            utterance.onerror = () => setIsAudioPlaying(false);
            window.speechSynthesis.speak(utterance);
          } else {
            setIsAudioPlaying(false);
          }
        };

        await audio.play();
      } catch {
        if (abortController.signal.aborted) return;
        setIsAudioLoading(false);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(clean);
          utterance.lang = 'en-GB';
          utterance.rate = 0.95;
          utterance.onstart = () => setIsAudioPlaying(true);
          utterance.onend = () => setIsAudioPlaying(false);
          utterance.onerror = () => setIsAudioPlaying(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsAudioPlaying(false);
        }
      }
    },
    [speechRate, stopAudio]
  );

  const resetSession = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setInputVal('');
    setStartTime(null);
    setEndTime(null);
    setTimeLeft(timerMode > 0 ? timerMode : null);
    setMistakesCount(0);
    setIsCompleted(false);
    setIsTimeUp(false);
    mistakeSetRef.current.clear();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    stopAudio();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
  }, [timerMode, stopAudio]);

  useEffect(() => {
    setCurrentStepIndex(0);
    resetSession();
  }, [selectedPassageIndex, practiceMode, resetSession]);

  useEffect(() => {
    resetSession();
    if (autoplayVoice && targetText && activeMainTab === 'trainer') {
      const timer = setTimeout(() => {
        playRyanAudio(targetText);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, resetSession, autoplayVoice, targetText, playRyanAudio, activeMainTab]);

  useEffect(() => {
    if (startTime && !endTime && !isCompleted && !isTimeUp) {
      timerIntervalRef.current = window.setInterval(() => {
        if (timerMode > 0) {
          const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
          const remaining = Math.max(0, timerMode - elapsedSec);
          setTimeLeft(remaining);
          if (remaining <= 0) {
            setIsTimeUp(true);
            setEndTime(Date.now());
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          }
        }
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [startTime, endTime, isCompleted, isTimeUp, timerMode]);

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < currentStepsList.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, currentStepsList.length]);

  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCompleted || isTimeUp) return;

    const val = e.target.value;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    if (val.length > inputVal.length) {
      const charIndex = val.length - 1;
      const targetChar = targetText[charIndex];
      const lastChar = val[charIndex];

      if (lastChar === targetChar) {
        typingSoundService.playCorrectKey();
      } else {
        typingSoundService.playIncorrectKey();
        if (!mistakeSetRef.current.has(charIndex)) {
          mistakeSetRef.current.add(charIndex);
          setMistakesCount((prev) => prev + 1);
        }
      }
    }

    setInputVal(val);

    if (val === targetText) {
      setEndTime(Date.now());
      setIsCompleted(true);
      typingSoundService.playCompletion();

      setCompletedStepIds((prev) => {
        const next = new Set(prev);
        next.add(currentStep.id);
        return next;
      });

      if (autoAdvance && currentStepIndex < currentStepsList.length - 1) {
        autoAdvanceTimeoutRef.current = window.setTimeout(() => {
          goToNextStep();
        }, 800);
      }
    }
  };

  const calculateStats = () => {
    const currentTime = endTime || (startTime ? Date.now() : Date.now());
    const durationSec = startTime ? Math.max(1, (currentTime - startTime) / 1000) : 1;
    const minutes = durationSec / 60;

    let correctChars = 0;
    for (let i = 0; i < inputVal.length; i++) {
      if (i < targetText.length && inputVal[i] === targetText[i]) {
        correctChars++;
      }
    }

    const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
    const totalTyped = inputVal.length;
    const accuracy =
      totalTyped > 0 ? Math.max(0, Math.round(((totalTyped - mistakesCount) / totalTyped) * 100)) : 100;

    return {
      wpm,
      accuracy,
      durationSec: Math.round(durationSec * 10) / 10,
      correctChars,
      totalTyped,
      mistakes: mistakesCount,
    };
  };

  const stats = calculateStats();

  const handleShareResults = () => {
    const textToCopy = `⌨️ My Learning Audio Typing Practice:
${currentPassage.title} — ${currentStep.title}
Voice: Ryan (Neural) (UK)
Speed: ${stats.wpm} WPM | Accuracy: ${stats.accuracy}% | Time: ${stats.durationSec}s`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePracticeFileText = (text: string, title: string) => {
    const newPassage = generateStepsFromText(text, title);
    setPassages((prev) => [newPassage, ...prev.filter((p) => p.id !== newPassage.id)]);
    setSelectedPassageIndex(0);
    setCurrentStepIndex(0);
    setActiveMainTab('trainer');
    resetSession();
  };

  const handleOpenAIChatWithPrompt = (prompt: string) => {
    setAiCustomPrompt(prompt);
    setIsAIChatOpen(true);
  };

  const completedCount = currentStepsList.filter((s) => completedStepIds.has(s.id)).length;
  const progressPercent = Math.round((completedCount / currentStepsList.length) * 100);

  // Extract interactive vocabulary items present in the current target text
  const activeStepVocab = React.useMemo(() => {
    if (!targetText) return [];
    const words = targetText.split(/\s+/);
    const set = new Map<string, VocabularyEntry>();
    for (const w of words) {
      const match = findVocabularyByWord(w);
      if (match && !set.has(match.id)) {
        set.set(match.id, match);
      }
    }
    return Array.from(set.values());
  }, [targetText]);

  return (
    <div className="min-h-screen w-full bg-[#0a0908] text-neutral-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-neutral-800/80 bg-[#120f0c]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl select-none">📖</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  MY LEARNING
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Public Hub
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 hidden sm:block">
                Powered by <strong className="text-amber-400 font-semibold">Ryan (Neural) UK</strong> & <strong className="text-amber-400 font-semibold">Groq (14.4k/day)</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* AI Assistant Button */}
            <button
              onClick={() => {
                setAiCustomPrompt('');
                setIsAIChatOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Open AI Messages & Tutor (Groq 14.4k/day)"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>AI Tutor</span>
            </button>

            {/* Sound Effects Toggle */}
            <button
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                typingSoundService.setEnabled(nextState);
                if (nextState) typingSoundService.playCorrectKey();
              }}
              title={soundEnabled ? 'Mute typing sounds' : 'Enable typing sounds'}
              className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
            </button>

            {/* Login Link */}
            <Link
              to="/login"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Primary Tab Navigation Strip (Reader / Trainer) */}
      <div className="w-full bg-[#120f0c] border-b border-neutral-800/80 sticky top-14 sm:top-16 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveMainTab('reader')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMainTab === 'reader'
                  ? 'bg-amber-500 text-neutral-950 shadow-xs'
                  : 'bg-neutral-900/90 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📖 Reader & Audio</span>
              <span className="text-[10px] font-mono opacity-80">(Files & Words)</span>
            </button>

            <button
              onClick={() => setActiveMainTab('trainer')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMainTab === 'trainer'
                  ? 'bg-amber-500 text-neutral-950 shadow-xs'
                  : 'bg-neutral-900/90 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>🎯 Typing Trainer</span>
              <span className="hidden sm:inline">(Ryan UK)</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400">
              🇬🇧 Ryan UK • 🇩🇪 Killian DE • 🇸🇴 Muuse SO
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col justify-start gap-4 sm:gap-6">
        {/* VIEW 1: Document Reader & File Study Hub */}
        {activeMainTab === 'reader' && (
          <div className="space-y-4 sm:space-y-6">
            <PublicDocumentReader
              onPracticeFileText={handlePracticeFileText}
              onOpenAIChatWithPrompt={handleOpenAIChatWithPrompt}
            />
          </div>
        )}

        {/* VIEW 2: Step-by-Step Progressive Typing Trainer */}
        {activeMainTab === 'trainer' && (
          <div className="space-y-4 sm:space-y-5">
            {/* 1. Passage Selector Tabs (Man vs Woman vs AI Generated / Uploaded) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {passages.map((passage, idx) => {
                const isSelected = selectedPassageIndex === idx;
                return (
                  <button
                    key={passage.id}
                    onClick={() => setSelectedPassageIndex(idx)}
                    className={`relative flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30 shadow-xs'
                        : 'bg-[#14110e] border-neutral-800/80 hover:border-neutral-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-base shrink-0 font-bold ${
                        isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-900 text-neutral-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
                          {passage.tag}
                        </span>
                        {isSelected && (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-neutral-100 truncate mt-0.5">
                        {passage.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {passage.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 2. Practice Mode & Neural Audio Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#14110e] border border-neutral-800/80">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-neutral-400 hidden sm:flex items-center gap-1 mr-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode:</span>
                </span>
                <button
                  onClick={() => setPracticeMode('progressive')}
                  className={`px-2.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    practiceMode === 'progressive'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                      : 'bg-neutral-900/90 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>🎯 One-by-One</span>
                </button>

                <button
                  onClick={() => setPracticeMode('sentence')}
                  className={`px-2.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    practiceMode === 'sentence'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                      : 'bg-neutral-900/90 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Sentences</span>
                </button>

                <button
                  onClick={() => setPracticeMode('full')}
                  className={`px-2.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    practiceMode === 'full'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                      : 'bg-neutral-900/90 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Full</span>
                </button>
              </div>

              {/* Voice & Auto-play options */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[10px] sm:text-[11px] text-amber-400">
                  <Radio className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                  <span className="font-semibold">Ryan UK</span>
                </div>

                <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoplayVoice}
                    onChange={(e) => setAutoplayVoice(e.target.checked)}
                    className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500 bg-neutral-900"
                  />
                  <span className="text-[11px]">Auto-read</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500 bg-neutral-900"
                  />
                  <span className="text-[11px]">Auto-advance</span>
                </label>
              </div>
            </div>

            {/* 3. Step Progression Stepper Strip (One-by-One visual track) */}
            <div className="p-4 rounded-2xl bg-[#14110e] border border-neutral-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">
                    Step {currentStepIndex + 1} of {currentStepsList.length}:
                  </span>
                  <span className="text-amber-400 font-semibold">{currentStep.title}</span>
                  {currentStep.hint && (
                    <span className="text-neutral-400 hidden sm:inline">({currentStep.hint})</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-neutral-400">
                    Progress: {progressPercent}%
                  </span>
                  <div className="w-20 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Numbered Step Badges Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {currentStepsList.map((step, idx) => {
                  const isCurrent = currentStepIndex === idx;
                  const isDone = completedStepIds.has(step.id);
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`group shrink-0 h-8 px-2.5 rounded-xl font-mono text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500 border-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                          : isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium'
                          : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                      title={`${step.title}: "${step.chunk}"`}
                    >
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                      <span className="truncate max-w-[90px] sm:max-w-[120px] text-[11px]">
                        {step.chunk}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Real-time Live HUD Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#14110e] border border-neutral-800 flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Speed (WPM)
                  </div>
                  <div className="text-lg sm:text-xl font-black font-mono text-white">{stats.wpm}</div>
                </div>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#14110e] border border-neutral-800 flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Accuracy
                  </div>
                  <div className="text-lg sm:text-xl font-black font-mono text-emerald-400">
                    {stats.accuracy}%
                  </div>
                </div>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#14110e] border border-neutral-800 flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Time
                  </div>
                  <div className="text-lg sm:text-xl font-black font-mono text-blue-400">
                    {timeLeft !== null ? `${timeLeft}s` : `${stats.durationSec}s`}
                  </div>
                </div>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#14110e] border border-neutral-800 flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Mistakes
                  </div>
                  <div className="text-lg sm:text-xl font-black font-mono text-rose-400">
                    {stats.mistakes}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Main Active Typing Engine Box */}
            <div
              onClick={() => inputRef.current?.focus()}
              className="relative p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#14110e] border border-neutral-800 hover:border-amber-500/40 transition-all shadow-lg space-y-4 sm:space-y-6 cursor-text"
            >
              {/* Header inside typing box with Listen Audio button */}
              <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 font-mono shrink-0">
                    Target:
                  </span>
                  <span className="text-xs text-neutral-300 font-medium truncate">
                    {currentStep.title}
                  </span>
                </div>

                {/* Audio Listen Ryan UK Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAudioPlaying) {
                        stopAudio();
                      } else {
                        playRyanAudio(targetText);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                      isAudioPlaying
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300'
                    }`}
                  >
                    {isAudioLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isAudioPlaying ? (
                      <Square className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    <span>{isAudioPlaying ? 'Stop' : 'Listen (Ryan UK)'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetSession();
                    }}
                    className="p-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                    title="Reset chunk"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Character by character rendering */}
              <div className="text-base sm:text-2xl font-mono leading-relaxed select-none tracking-normal min-h-[50px] sm:min-h-[70px]">
                {targetText.split('').map((char, index) => {
                  let statusColor = 'text-neutral-500';
                  let bgHighlight = '';

                  if (index < inputVal.length) {
                    if (inputVal[index] === char) {
                      statusColor = 'text-emerald-400 font-bold';
                    } else {
                      statusColor = 'text-rose-400 font-black bg-rose-950/50 rounded-xs';
                    }
                  } else if (index === inputVal.length) {
                    bgHighlight = 'bg-amber-500/20 border-b-2 border-amber-400 animate-pulse text-amber-200';
                  }

                  return (
                    <span
                      key={index}
                      className={`relative inline-block transition-colors duration-75 ${statusColor} ${bgHighlight}`}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  );
                })}
              </div>

              {/* Hidden text input for hardware keyboard input capture */}
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={handleInputChange}
                className="opacity-0 absolute inset-0 w-full h-full cursor-default"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />

              {/* Active Step Interactive Yellow Vocabulary Chips */}
              {activeStepVocab.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-neutral-800/60">
                  <span className="text-[11px] font-mono text-neutral-400">
                    Interactive Words (Tap for 3-Language Audio Card):
                  </span>
                  {activeStepVocab.map((vocab) => (
                    <button
                      key={vocab.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVocabEntry(vocab);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/35 border border-amber-400/50 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                      title={`"${vocab.word}" • German: ${vocab.germanWord} • Somali: ${vocab.somaliWord}`}
                    >
                      <span>{vocab.word}</span>
                      <Volume2 className="w-3 h-3 text-amber-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Bottom Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevStep();
                  }}
                  disabled={currentStepIndex === 0}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none text-xs text-neutral-300 font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="text-[10px] sm:text-[11px] text-neutral-400 hidden sm:block">
                  Press <kbd className="px-1 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">Esc</kbd> to restart
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextStep();
                  }}
                  disabled={currentStepIndex === currentStepsList.length - 1}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none text-xs text-neutral-300 font-medium transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 7. Completion Scorecard Card */}
            {(isCompleted || isTimeUp) && (
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#16120e] border border-amber-500/50 shadow-xl shadow-amber-500/10 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2.5 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center text-xl font-black shrink-0">
                      <Trophy className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {isCompleted ? '🎉 Step Mastered!' : '⏱️ Time’s Up!'}
                      </h3>
                      <p className="text-xs text-neutral-400">
                        {currentStep.title} — {stats.wpm} WPM • {stats.accuracy}% Accuracy
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShareResults}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 transition-all cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-neutral-400" />}
                      <span>{copied ? 'Copied!' : 'Copy Stats'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 sm:my-6">
                  <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#0e0c0a] border border-neutral-800 text-center">
                    <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                      {stats.wpm}
                    </div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">
                      Speed (WPM)
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#0e0c0a] border border-neutral-800 text-center">
                    <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                      {stats.accuracy}%
                    </div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">
                      Accuracy
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#0e0c0a] border border-neutral-800 text-center">
                    <div className="text-xl sm:text-2xl font-black font-mono text-blue-400">
                      {stats.durationSec}s
                    </div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">
                      Duration
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#0e0c0a] border border-neutral-800 text-center">
                    <div className="text-xl sm:text-2xl font-black font-mono text-rose-400">
                      {stats.mistakes}
                    </div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">
                      Mistakes
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                  <button
                    onClick={resetSession}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Repeat Step</span>
                  </button>

                  {currentStepIndex < currentStepsList.length - 1 ? (
                    <button
                      onClick={goToNextStep}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <span>Next: {currentStepsList[currentStepIndex + 1]?.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPassageIndex((prev) => (prev + 1) % passages.length);
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <span>🎉 Mastered! Next Passage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* AI Chat Drawer */}
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onSelectTypingText={(txt) => handlePracticeFileText(txt, 'AI Generated Practice')}
        initialPrompt={aiCustomPrompt}
      />

      {/* Tri-Lingual Interactive Vocabulary Modal */}
      <PublicVocabularyModal
        entry={selectedVocabEntry}
        onClose={() => setSelectedVocabEntry(null)}
        onPracticeText={(txt) => handlePracticeFileText(txt, 'Vocabulary Practice')}
      />

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 bg-[#0c0a09] py-4 text-center text-xs text-neutral-500">
        <p className="font-mono">“I learn by reading and typing.”</p>
      </footer>
    </div>
  );
}
