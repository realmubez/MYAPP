import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  MessageSquare,
  BookOpen,
  Edit3,
  Check,
  Send,
  User,
  Bot,
} from 'lucide-react';
import { useEdgeTTS } from '../../hooks/useEdgeTTS';
import { isAnswerAcceptable } from '../../utils/grammarValidation';

interface DialogueLine {
  id: string;
  speaker: 'Anna' | 'Sam' | 'Muhammed';
  english: string;
  somali: string;
}

const DIALOGUE_LINES: DialogueLine[] = [
  { id: 'd1', speaker: 'Anna', english: "Hi. What's your name?", somali: "Haye. Magacaa?" },
  { id: 'd2', speaker: 'Sam', english: "Hello. My name is Sam. Nice to meet you. How old are you?", somali: "Salaan. Magacaygu waa Sam. Waan ku faraxsanahay inaan kula kulmo. Immisa jir baad tahay?" },
  { id: 'd3', speaker: 'Anna', english: "I am 23 years old. And you?", somali: "Waxaan jiraa 23 sano. Adiguna?" },
  { id: 'd4', speaker: 'Sam', english: "I am 25 years old. Where are you from?", somali: "Waxaan jiraa 25 sano. Xaggee baad ka timid?" },
  { id: 'd5', speaker: 'Anna', english: "I am from Paris, France. And you?", somali: "Waxaan ka imid Paris, Faransiiska. Adiguna?" },
  { id: 'd6', speaker: 'Sam', english: "I am from Dortmund, Germany. Where do you live?", somali: "Waxaan ka imid Dortmund, Jarmalka. Xaggee baad ku nooshahay?" },
  { id: 'd7', speaker: 'Anna', english: "I live in Bochum. And you?", somali: "Waxaan ku noolahay Bochum. Adiguna?" },
  { id: 'd8', speaker: 'Sam', english: "I live in Dortmund. What is your job?", somali: "Waxaan ku noolahay Dortmund. Shaqadaadu waa maxay?" },
  { id: 'd9', speaker: 'Anna', english: "I am a teacher. And you?", somali: "Waxaan ahay macallimad. Adiguna?" },
  { id: 'd10', speaker: 'Sam', english: "I am a police officer. What is your favourite colour?", somali: "Waxaan ahay booliis. Midabka aad ugu jeceshahay waa kee?" },
  { id: 'd11', speaker: 'Anna', english: "My favourite colour is black. What's yours?", somali: "Midabka aan ugu jeclahay waa madow. Adiguna?" },
  { id: 'd12', speaker: 'Sam', english: "My favourite colour is green. What are your hobbies?", somali: "Midabka aan ugu jeclahay waa cagaar. Maxay yihiin hiwaayadahaagu?" },
  { id: 'd13', speaker: 'Anna', english: "My hobbies are cooking, listening to music and dancing. And what are your hobbies?", somali: "Hiwaayadahaygu waa cunto karinta, dhegeysiga muusigga iyo qoob-ka-ciyaarka. Adiguna maxay yihiin hiwaayadahaagu?" },
  { id: 'd14', speaker: 'Sam', english: "I like going to the cinema and watching TV. What's your telephone number?", somali: "Waxaan jeclahay inaan shaleemada aado oo aan TV-ga daawado. Waa maxay lambarkaaga telefoonka?" },
  { id: 'd15', speaker: 'Anna', english: "My number is 0152 8473615. And yours?", somali: "Lambarkaygu waa 0152 8473615. Adiguna?" },
  { id: 'd16', speaker: 'Sam', english: "My number is 0175 846275. Anna, this is Muhammed.", somali: "Lambarkaygu waa 0175 846275. Anna, kani waa Muhammed." },
  { id: 'd17', speaker: 'Anna', english: "Hello. Nice to meet you, Muhammed.", somali: "Salaan. Waan ku faraxsanahay inaan kula kulmo, Muhammed." },
  { id: 'd18', speaker: 'Muhammed', english: "Nice to meet you, too.", somali: "Aniguna waan ku faraxsanahay inaan kula kulmo." },
  { id: 'd19', speaker: 'Sam', english: "Goodbye.", somali: "Nabadgelyo." },
  { id: 'd20', speaker: 'Anna', english: "Bye.", somali: "Nabadgelyo." },
  { id: 'd21', speaker: 'Muhammed', english: "See you later.", somali: "Mar dambe ayaan is arki doonnaa." },
];

interface MissingWordQuiz {
  id: string;
  sentenceBefore: string;
  missingWord: string;
  sentenceAfter: string;
  expected: string;
  somaliHint: string;
}

const MISSING_WORD_ITEMS: MissingWordQuiz[] = [
  { id: 'mw1', sentenceBefore: 'My name', missingWord: 'is', sentenceAfter: 'Sam.', expected: 'is', somaliHint: 'Isticmaal TO BE (is) magaca qofka.' },
  { id: 'mw2', sentenceBefore: 'I', missingWord: 'am', sentenceAfter: '23 years old.', expected: 'am', somaliHint: 'Da\'da waxaa la socota "am" markay tahay I.' },
  { id: 'mw3', sentenceBefore: 'I', missingWord: 'am', sentenceAfter: 'from Paris.', expected: 'am', somaliHint: 'Wadankaaga markaad sheegayso: I am from...' },
  { id: 'mw4', sentenceBefore: 'I', missingWord: 'live', sentenceAfter: 'in Bochum.', expected: 'live', somaliHint: 'Magaalada aad degentahay: I live in...' },
  { id: 'mw5', sentenceBefore: 'I am', missingWord: 'a', sentenceAfter: 'teacher.', expected: 'a', somaliHint: 'Shaqada ka hor waxaa la geliyaa qodobka "a".' },
  { id: 'mw6', sentenceBefore: 'My favourite colour', missingWord: 'is', sentenceAfter: 'black.', expected: 'is', somaliHint: 'Midabka aad jeceshahay waa hal wax (is).' },
];

const AI_CONVERSATION_STEPS = [
  { step: 1, prompt: "Hi! How are you?", expected: "I am fine / Hello / Good", somaliHint: "Ku salaab oo sheeg sida aad tahay (tusaale: Hello! I am fine, thank you)." },
  { step: 2, prompt: "What's your name?", expected: "My name is", somaliHint: "Sheeg magacaaga (tusaale: My name is Amina)." },
  { step: 3, prompt: "How old are you?", expected: "I am", somaliHint: "Sheeg da'daada (tusaale: I am 20 years old)." },
  { step: 4, prompt: "Where are you from?", expected: "I am from", somaliHint: "Sheeg wadankii aad ka timid (tusaale: I am from Somalia)." },
  { step: 5, prompt: "Where do you live?", expected: "I live in", somaliHint: "Sheeg magaalada aad degentahay (tusaale: I live in Frankfurt)." },
  { step: 6, prompt: "What is your job, or what do you do?", expected: "I am a", somaliHint: "Sheeg shaqadaada ama ardaynimadaada (tusaale: I am a student)." },
  { step: 7, prompt: "What is your favourite colour?", expected: "My favourite colour is", somaliHint: "Sheeg midabkaaga aad jeceshahay (tusaale: My favourite colour is blue)." },
  { step: 8, prompt: "What are your hobbies?", expected: "My hobbies are / I like", somaliHint: "Sheeg hiwaayadahaaga (tusaale: My hobbies are reading and cooking)." },
  { step: 9, prompt: "What's your telephone number?", expected: "My number is", somaliHint: "Bixi lambar telefoon oo tijaabo ah (tusaale: My number is 0176 123456)." },
  { step: 10, prompt: "Anna, this is Muhammed. (Practise saying nice to meet you)", expected: "Nice to meet you", somaliHint: "Dheh: Nice to meet you, Muhammed." },
  { step: 11, prompt: "Goodbye! See you later.", expected: "Goodbye / Bye / See you", somaliHint: "Dheh nabadgelyo (tusaale: Goodbye! See you)." },
];

export const InteractiveDialogueLesson: React.FC = () => {
  const { play, stop, isSpeaking, activeSpeechId } = useEdgeTTS('en');
  const [activeStage, setActiveStage] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  // Stage A state
  const [playingFull, setPlayingFull] = useState<boolean>(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);
  const fullPlayTimerRef = useRef<number | null>(null);

  // Stage B state (Practice Dialogue line matching)
  const [bIndex, setBIndex] = useState<number>(0);
  const [bInput, setBInput] = useState<string>('');
  const [bFeedback, setBFeedback] = useState<{ correct?: boolean; message?: string } | null>(null);

  // Stage C state (Missing Words)
  const [cAnswers, setCAnswers] = useState<Record<string, string>>({});
  const [cSubmitted, setCSubmitted] = useState<Record<string, boolean>>({});

  // Stage D state (AI Conversation)
  const [aiStep, setAiStep] = useState<number>(0);
  const [aiInput, setAiInput] = useState<string>('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; feedback?: string }>>([
    { sender: 'ai', text: AI_CONVERSATION_STEPS[0].prompt }
  ]);
  const [aiCompleted, setAiCompleted] = useState<boolean>(false);

  // Stage E state (Independent Writing)
  const [userEssay, setUserEssay] = useState<string>('');
  const [essaySubmitted, setEssaySubmitted] = useState<boolean>(false);
  const [essayFeedback, setEssayFeedback] = useState<string>('');

  // Handle Play Full Dialogue sequential playback
  useEffect(() => {
    if (!playingFull) {
      if (fullPlayTimerRef.current) window.clearTimeout(fullPlayTimerRef.current);
      return;
    }

    if (currentLineIndex >= 0 && currentLineIndex < DIALOGUE_LINES.length) {
      const line = DIALOGUE_LINES[currentLineIndex];
      play(`dialogue-full-${line.id}`, line.english);
      
      const delay = Math.max(3000, line.english.length * 90);
      fullPlayTimerRef.current = window.setTimeout(() => {
        if (currentLineIndex < DIALOGUE_LINES.length - 1) {
          setCurrentLineIndex(prev => prev + 1);
        } else {
          setPlayingFull(false);
          setCurrentLineIndex(-1);
        }
      }, delay);
    }

    return () => {
      if (fullPlayTimerRef.current) window.clearTimeout(fullPlayTimerRef.current);
    };
  }, [playingFull, currentLineIndex]);

  const startFullDialogue = () => {
    setCurrentLineIndex(0);
    setPlayingFull(true);
  };

  const stopFullDialogue = () => {
    setPlayingFull(false);
    setCurrentLineIndex(-1);
    stop();
  };

  // Handle Stage B check
  const handleCheckB = () => {
    const target = DIALOGUE_LINES[bIndex + 1];
    if (!target) return;
    const userVal = bInput.trim();
    const ok = isAnswerAcceptable(userVal, target.english, [target.english.toLowerCase()]);
    if (ok) {
      setBFeedback({ correct: true, message: 'Sax! (Correct!)' });
      setTimeout(() => {
        setBFeedback(null);
        setBInput('');
        if (bIndex + 2 < DIALOGUE_LINES.length - 1) {
          setBIndex(prev => prev + 2);
        } else {
          setBIndex(0);
        }
      }, 1500);
    } else {
      setBFeedback({ correct: false, message: `Khalad. Jawaabta saxda ah waa: "${target.english}". Isku day mar kale!` });
    }
  };

  // Handle Stage C check
  const handleCheckC = (item: MissingWordQuiz) => {
    const val = (cAnswers[item.id] || '').trim().toLowerCase();
    setCSubmitted(prev => ({ ...prev, [item.id]: true }));
  };

  // Handle Stage D AI Conversation submit
  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiCompleted) return;

    const currentQ = AI_CONVERSATION_STEPS[aiStep];
    const userText = aiInput.trim();

    const newMsgs = [...aiMessages, { sender: 'user' as const, text: userText }];
    setAiMessages(newMsgs);
    setAiInput('');

    if (aiStep < AI_CONVERSATION_STEPS.length - 1) {
      const nextS = aiStep + 1;
      setAiStep(nextS);
      setTimeout(() => {
        setAiMessages(prev => [
          ...prev,
          { sender: 'ai', text: AI_CONVERSATION_STEPS[nextS].prompt, feedback: 'Wanaagsan! (Good job!)' }
        ]);
      }, 700);
    } else {
      setAiCompleted(true);
      setTimeout(() => {
        setAiMessages(prev => [
          ...prev,
          { sender: 'ai', text: "Hambalyo! You have successfully completed the conversation practice! Waxaad diyaar u tahay imtixaankaaga berri." }
        ]);
      }, 700);
    }
  };

  // Handle Stage E Essay Check
  const handleEssaySubmit = () => {
    if (!userEssay.trim()) return;
    setEssaySubmitted(true);
    const hasName = /name/i.test(userEssay);
    const hasAge = /years old|old/i.test(userEssay);
    const hasJob = /teacher|student|police|doctor|work/i.test(userEssay);
    const hasCity = /live in|from/i.test(userEssay);

    let feedback = 'Faallo (Feedback):\n';
    if (hasName && hasAge && hasJob && hasCity) {
      feedback += '✅ Aad u fiican! Waxaad ku dartay magac, da\', shaqo, iyo meel aad degentahay. Qoraalkaagu waa mid aad u fiican oo imtixaanka waafaqsan.';
    } else {
      feedback += '⚠️ Si fiican u eeg: Hubi inaad ku darto magaca, da\'da, shaqada, iyo magaalada aad degentahay (tusaale: My name is... I am ... years old. I live in...).';
    }
    setEssayFeedback(feedback);
  };

  return (
    <div className="space-y-6">
      {/* Stage Navigation Header */}
      <div className="bg-[#15120f] border border-amber-500/30 rounded-2xl p-3 sm:p-4 shadow-md flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-xs font-mono font-bold text-amber-400 mr-2">Dialogue Lessons:</span>
          <button
            type="button"
            onClick={() => setActiveStage('A')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStage === 'A'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Stage A: Listen & Understand
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('B')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStage === 'B'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Stage B: Practise Dialogue
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('C')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStage === 'C'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Stage C: Missing Words
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('D')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStage === 'D'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Stage D: AI Conversation
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('E')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStage === 'E'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Stage E: Independent Writing
          </button>
        </div>
      </div>

      {/* STAGE A: LISTEN & UNDERSTAND */}
      {activeStage === 'A' && (
        <div className="space-y-4">
          <div className="bg-[#15120f] border border-amber-500/25 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Stage A — Listen, Read & Understand (Anna, Sam & Muhammed)</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-1">
                  Dhageyso jumlad kasta oo Ingiriis ah oo akhri macnaha Soomaaliga ah ee hoos yaalla.
                </p>
              </div>

              <div>
                {!playingFull ? (
                  <button
                    type="button"
                    onClick={startFullDialogue}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>▶ Play Full Dialogue</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopFullDialogue}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-extrabold rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Playback</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dialogue Lines List */}
            <div className="space-y-3 pt-2">
              {DIALOGUE_LINES.map((item, idx) => {
                const isCurrentPlaying = playingFull && currentLineIndex === idx;
                const isAudioActive = activeSpeechId === `dialogue-full-${item.id}` || activeSpeechId === `dialogue-line-${item.id}`;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrentPlaying || isAudioActive
                        ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400'
                        : 'bg-[#181410] border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              item.speaker === 'Anna'
                                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                : item.speaker === 'Sam'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {item.speaker}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400">#{idx + 1}</span>
                        </div>

                        {/* English Sentence */}
                        <p className="text-sm sm:text-base font-bold text-white tracking-tight">
                          {item.english}
                        </p>

                        {/* Somali Translation underneath */}
                        <p className="text-xs sm:text-sm text-amber-300/90 font-medium bg-amber-500/5 p-2 rounded-xl border border-amber-500/15">
                          <span className="font-mono text-[10px] uppercase text-amber-400 font-bold block mb-0.5">Macnaha (Somali):</span>
                          {item.somali}
                        </p>
                      </div>

                      {/* Individual Audio Button */}
                      <button
                        type="button"
                        onClick={() => play(`dialogue-line-${item.id}`, item.english)}
                        className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer shrink-0 ${
                          isAudioActive && isSpeaking
                            ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                        }`}
                        title="Listen to sentence"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Audio</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STAGE B: PRACTISE THE DIALOGUE */}
      {activeStage === 'B' && (
        <div className="bg-[#15120f] border border-amber-500/25 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span>Stage B — Practise the Dialogue</span>
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              Akhri jumalada hore, kadibna qor ama dooro jawaabta saxda ah ee xigta ee wadahadalka.
            </p>
          </div>

          <div className="bg-[#1b1713] p-5 rounded-2xl border border-neutral-800 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Speaker {DIALOGUE_LINES[bIndex].speaker}:</span>
              <p className="text-base font-bold text-white">{DIALOGUE_LINES[bIndex].english}</p>
              <p className="text-xs text-amber-300 font-medium">({DIALOGUE_LINES[bIndex].somali})</p>
            </div>

            <div className="border-t border-neutral-800 pt-4 space-y-3">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                Next Line ({DIALOGUE_LINES[bIndex + 1]?.speaker || 'End'}):
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={bInput}
                  onChange={(e) => setBInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckB()}
                  placeholder="Type the expected English response..."
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleCheckB}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow"
                >
                  Check
                </button>
              </div>

              {bFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium ${
                    bFeedback.correct
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {bFeedback.message}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Progress: Line {bIndex + 1} of {DIALOGUE_LINES.length}</span>
            <button
              type="button"
              onClick={() => {
                setBIndex((prev) => (prev + 2 < DIALOGUE_LINES.length - 1 ? prev + 2 : 0));
                setBFeedback(null);
                setBInput('');
              }}
              className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Next prompt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE C: COMPLETE MISSING WORDS */}
      {activeStage === 'C' && (
        <div className="bg-[#15120f] border border-amber-500/25 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              <span>Stage C — Complete the Missing Words</span>
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              Buuxi meelaha bannaan adigoo isticmaalaya ereyada saxda ah ee wadahadalka ka dhex muuqda.
            </p>
          </div>

          <div className="space-y-4">
            {MISSING_WORD_ITEMS.map((item, idx) => {
              const userVal = (cAnswers[item.id] || '').trim().toLowerCase();
              const isSubmitted = cSubmitted[item.id];
              const isCorrect = isSubmitted && isAnswerAcceptable(userVal, item.expected, [item.expected.toLowerCase()]);

              return (
                <div key={item.id} className="bg-[#1b1713] p-4 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-400 font-bold">Exercise #{idx + 1}</span>
                    <span className="text-[11px] text-amber-300 italic">{item.somaliHint}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-sm sm:text-base font-bold text-white">
                    <span>{item.sentenceBefore}</span>
                    <input
                      type="text"
                      value={cAnswers[item.id] || ''}
                      onChange={(e) => setCAnswers({ ...cAnswers, [item.id]: e.target.value })}
                      disabled={isSubmitted && isCorrect}
                      placeholder="..."
                      className={`w-28 bg-neutral-900 border rounded-xl px-3 py-1.5 text-center text-sm font-bold text-white focus:outline-none ${
                        isSubmitted
                          ? isCorrect
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                            : 'border-rose-500 bg-rose-500/10 text-rose-300'
                          : 'border-neutral-700 focus:border-amber-400'
                      }`}
                    />
                    <span>{item.sentenceAfter}</span>

                    {!isSubmitted && (
                      <button
                        type="button"
                        onClick={() => handleCheckC(item)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl ml-auto cursor-pointer shadow"
                      >
                        Check
                      </button>
                    )}
                    {isSubmitted && !isCorrect && (
                      <button
                        type="button"
                        onClick={() => setCSubmitted({ ...cSubmitted, [item.id]: false })}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl ml-auto cursor-pointer"
                      >
                        Retry
                      </button>
                    )}
                  </div>

                  {isSubmitted && (
                    <div className={`text-xs font-semibold p-2 rounded-xl flex items-center gap-1.5 ${
                      isCorrect ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}>
                      {isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                      <span>{isCorrect ? 'Aad u fiican! Sax bay tahay.' : `Khalad. Jawaabta saxda ah waa: "${item.expected}".`}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STAGE D: AI CONVERSATION PRACTICE */}
      {activeStage === 'D' && (
        <div className="bg-[#15120f] border border-amber-500/25 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <span>Stage D — AI Conversation Practice</span>
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              La hadal saaxiibkaaga AI. Wuxuu ku weydiin doonaa su'aalo xiriir ah (1 ilaa 11). Si degan uga jawaab Ingiriisiga.
            </p>
          </div>

          {/* Chat box */}
          <div className="bg-[#181410] border border-neutral-800 rounded-2xl p-4 h-80 overflow-y-auto space-y-3">
            {aiMessages.map((m, mIdx) => (
              <div
                key={mIdx}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm space-y-1 ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-neutral-950 font-medium rounded-tr-none'
                      : 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-tl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.feedback && (
                    <p className="text-[11px] text-amber-300 font-semibold pt-1 border-t border-neutral-700/50">
                      💡 {m.feedback}
                    </p>
                  )}
                </div>
                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-neutral-700 text-white flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input form */}
          {!aiCompleted ? (
            <form onSubmit={handleAiSubmit} className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Type your answer in English (e.g. My name is...)..."
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-center space-y-2">
              <p className="text-sm font-bold text-emerald-300">🎉 Dhammaan su'aalashii waad ka jawaabtay!</p>
              <button
                type="button"
                onClick={() => {
                  setAiStep(0);
                  setAiMessages([{ sender: 'ai', text: AI_CONVERSATION_STEPS[0].prompt }]);
                  setAiCompleted(false);
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Conversation</span>
              </button>
            </div>
          )}

          {/* Hint box */}
          {!aiCompleted && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-bold">Caawinaad (Hint):</span> {AI_CONVERSATION_STEPS[aiStep]?.somaliHint}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAGE E: INDEPENDENT WRITING */}
      {activeStage === 'E' && (
        <div className="bg-[#15120f] border border-amber-500/25 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              <span>Stage E — Independent Writing Practice</span>
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              Qor wadahadal gaaban oo adiga kuu gaar ah oo u dhaxeeya laba qof oo is baranaya (magacyada, da'da, wadanka, shaqada, midabka, iyo hiwaayadaha).
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              value={userEssay}
              onChange={(e) => setUserEssay(e.target.value)}
              rows={6}
              placeholder="Write your dialogue here (e.g. Anna: Hi! What's your name? / Sam: Hello, my name is Sam...)..."
              className="w-full bg-[#181410] border border-neutral-700 rounded-2xl p-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 leading-relaxed"
            />

            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400">{userEssay.length} characters</span>
              <button
                type="button"
                onClick={handleEssaySubmit}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all"
              >
                Check My Dialogue
              </button>
            </div>

            {essaySubmitted && (
              <div className="bg-[#1b1713] border border-amber-500/40 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase block">Assessment & Feedback:</span>
                <p className="text-xs sm:text-sm text-neutral-200 whitespace-pre-line leading-relaxed">
                  {essayFeedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
