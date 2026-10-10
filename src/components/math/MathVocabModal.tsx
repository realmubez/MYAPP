import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  BookOpen,
  Search,
  Sparkles,
  Check,
} from 'lucide-react';

export interface MathVocabTerm {
  id: string;
  wordDe: string;
  article?: string; // 'der', 'die', 'das'
  phoneticDe?: string;
  wordSo: string;
  wordEn: string;
  definitionDe: string;
  definitionSo: string;
  exampleLatex?: string;
  exampleDe?: string;
  category: 'Grundlagen' | 'Vorzeichen' | 'Algebra' | 'Operationen';
}

export const MATH_VOCAB_TERMS: MathVocabTerm[] = [
  {
    id: 'ganze-zahlen',
    article: 'die',
    wordDe: 'Ganze Zahlen',
    phoneticDe: '[ˈɡant͡sə ˈt͡saːlən]',
    wordSo: 'Tirooyinka togan iyo taban',
    wordEn: 'Integers',
    definitionDe: 'Alle positiven und negativen Zahlen ohne Komma, sowie die Null: ..., -3, -2, -1, 0, 1, 2, 3, ...',
    definitionSo: 'Dhammaan tirooyinka togan, taban iyo eberka oo aan lahayn jajab tobanle.',
    exampleLatex: '\\mathbb{Z} = \\{..., -3, -2, -1, 0, 1, 2, 3, ...\\}',
    exampleDe: '-5 °C oder +10 € auf dem Konto',
    category: 'Grundlagen',
  },
  {
    id: 'vorzeichen',
    article: 'das',
    wordDe: 'Vorzeichen',
    phoneticDe: '[ˈfoːɐ̯ˌt͡saɪ̯çn̩]',
    wordSo: 'Calaamadda hore (+ ama -)',
    wordEn: 'Sign (plus / minus)',
    definitionDe: 'Das Plus (+) oder Minus (-) vor einer Zahl. Es zeigt, ob die Zahl positiv oder negativ ist.',
    definitionSo: 'Calaamadda (+) ama (-) ee ka horreysa tirada, oo tilmaamaysa inay togan tahay ama taban tahay.',
    exampleLatex: '(-5) \\text{ hat das Minus-Vorzeichen}',
    exampleDe: 'Bei -7 ist Minus das Vorzeichen.',
    category: 'Vorzeichen',
  },
  {
    id: 'variable',
    article: 'die',
    wordDe: 'Variable',
    phoneticDe: '[vaˈʁi̯aːblə]',
    wordSo: 'Doorsoome (xaraf sida x ama y)',
    wordEn: 'Variable',
    definitionDe: 'Ein Buchstabe (wie x, y oder a), der als Platzhalter für eine noch unbekannte Zahl steht.',
    definitionSo: 'Xaraf (sida x ama y) oo u taagan tiro aan weli la garanayn.',
    exampleLatex: '3x + 5 \\quad (x \\text{ ist die Variable})',
    exampleDe: 'Wenn x = 4 ist, dann ist 3x = 12.',
    category: 'Algebra',
  },
  {
    id: 'koeffizient',
    article: 'der',
    wordDe: 'Koeffizient',
    phoneticDe: '[koʔɛfiˈt͡si̯ɛnt]',
    wordSo: 'Tirada doorsoomaha hor socota',
    wordEn: 'Coefficient',
    definitionDe: 'Die Zahl direkt vor einer Variablen. Sie gibt an, wie oft die Variable genommen wird.',
    definitionSo: 'Tirada ku dheggan xarafka (doorsoomaha) oo tilmaamaysa inta jeer ee la dhufanayo.',
    exampleLatex: '8x \\quad (8 \\text{ ist der Koeffizient})',
    exampleDe: 'Bei -3y ist -3 der Koeffizient.',
    category: 'Algebra',
  },
  {
    id: 'term',
    article: 'der',
    wordDe: 'Term',
    phoneticDe: '[tɛʁm]',
    wordSo: 'Eray xisaabeed',
    wordEn: 'Mathematical Term / Expression',
    definitionDe: 'Ein sinnvoller mathematischer Ausdruck aus Zahlen, Variablen und Rechenzeichen (ohne Gleichheitszeichen).',
    definitionSo: 'Muujin xisaabeed ka kooban tirooyin, xarfo iyo calaamado xisaabeed (oo aan lahayn calaamadda =).',
    exampleLatex: '4x - 7 + 2y',
    exampleDe: '4x + 5 ist ein Term. (4x + 5 = 13 wäre eine Gleichung).',
    category: 'Algebra',
  },
  {
    id: 'gleichartige-terme',
    article: 'die',
    wordDe: 'Gleichartige Terme',
    phoneticDe: '[ˈɡlaɪ̯çˌʔaːɐ̯tɪɡə ˈtɛʁmə]',
    wordSo: 'Erayo isku mid ah (isku xaraf leh)',
    wordEn: 'Like Terms',
    definitionDe: 'Terme mit genau den gleichen Variablen und Potenzen. Nur sie dürfen zusammengezählt oder abgezogen werden.',
    definitionSo: 'Erayo wadaaga isla xarafka iyo awoodda. Iyaga kaliya ayaa la isku dari karaa ama la kala jari karaa.',
    exampleLatex: '8x - 3x = 5x \\quad (x \\text{ bleibt } x)',
    exampleDe: '8x und 3x sind gleichartig. Aber 8x und 2y darf man nicht mischen!',
    category: 'Algebra',
  },
  {
    id: 'punkt-vor-strich',
    article: 'die',
    wordDe: 'Punkt vor Strich',
    phoneticDe: '[pʊŋkt foːɐ̯ ʃtʁɪç]',
    wordSo: 'Isku dhufashada/qaybinta ka horreysa isku darka/goynta',
    wordEn: 'Order of Operations (BODMAS / PEMDAS)',
    definitionDe: 'Die Grundregel der Mathematik: Multiplikation (·) und Division (:) werden IMMER vor Addition (+) und Subtraktion (-) gerechnet.',
    definitionSo: 'Xeerka aasaasiga ah: Isku dhufashada (·) iyo qaybinta (:) mar walba waa la hormariyaa ka hor intaan la isku darin (+) ama la kala jarin (-).',
    exampleLatex: '4 + 3 \\cdot 5 = 4 + 15 = 19',
    exampleDe: 'Zuerst 3 · 5 rechnen, danach + 4 addieren.',
    category: 'Operationen',
  },
  {
    id: 'klammer',
    article: 'die',
    wordDe: 'Klammer',
    phoneticDe: '[ˈklanɐ]',
    wordSo: 'Qawl (calaamadda xidhan)',
    wordEn: 'Parenthesis / Bracket',
    definitionDe: 'Klammern haben die allerhöchste Priorität. Was in den Klammern steht, muss immer als Erstes berechnet werden.',
    definitionSo: 'Qawska wuxuu leeyahay mudnaanta ugu sarreysa. Waxa ku dhex jira qawska mar kasta marka hore ayaa la xalliyaa.',
    exampleLatex: '(4 + 3) \\cdot 5 = 7 \\cdot 5 = 35',
    exampleDe: 'Hier zwingt die Klammer: Zuerst 4 + 3 = 7 rechnen.',
    category: 'Operationen',
  },
  {
    id: 'betrag',
    article: 'der',
    wordDe: 'Betrag (Absoluter Wert)',
    phoneticDe: '[bəˈtʁaːk]',
    wordSo: 'Qiimaha dhabta ah (fogaanta laga bilaabo eber)',
    wordEn: 'Absolute Value',
    definitionDe: 'Der Abstand einer Zahl von der Null auf dem Zahlenstrahl. Der Betrag ist immer positiv oder null.',
    definitionSo: 'Masaafada ay tiradu u jirto eberka. Qiimaha dhabta ahi mar kasta waa togan ama eber.',
    exampleLatex: '|-5| = 5 \\quad \\text{und} \\quad |+5| = 5',
    exampleDe: 'Der Betrag von -7 ist 7.',
    category: 'Vorzeichen',
  },
  {
    id: 'potenz',
    article: 'die',
    wordDe: 'Potenz',
    phoneticDe: '[poˈtɛnt͡s]',
    wordSo: 'Awoodda sare (sida x labajibbaaran)',
    wordEn: 'Power / Exponent',
    definitionDe: 'Eine Zahl oder Variable, die mit sich selbst multipliziert wird. Die Hochzahl (Exponent) sagt, wie oft.',
    definitionSo: 'Tiro ama xaraf lagu dhuftay naftiisa. Tirada yar ee sare waxay tilmaamaysaa inta jeer.',
    exampleLatex: 'x \\cdot x = x^2 \\quad \\text{und} \\quad 3^3 = 3 \\cdot 3 \\cdot 3 = 27',
    exampleDe: 'x² spricht man "x hoch zwei" oder "x Quadrat".',
    category: 'Algebra',
  },
  {
    id: 'einsetzen',
    article: 'das',
    wordDe: 'Werte Einsetzen',
    phoneticDe: '[ˈaɪ̯nˌzɛt͡sn̩]',
    wordSo: 'Ku beddelidda doorsoomaha tiro la yaqaan',
    wordEn: 'Substitution / Evaluating Expressions',
    definitionDe: 'Man ersetzt die Buchstaben in einem Term durch eine konkrete Zahl und berechnet das Ergebnis.',
    definitionSo: 'Waxaad xarafka (sida x) ku beddelaysaa tiro la yaqaan kaddibna xisaabinaysaa natiijada.',
    exampleLatex: '\\text{Wenn } x = -4: \\quad 3x - 7 = 3 \\cdot (-4) - 7 = -19',
    exampleDe: 'Wichtig: Bei negativen Zahlen immer eine Klammer setzen!',
    category: 'Algebra',
  },
];

interface MathVocabModalProps {
  selectedTerm: MathVocabTerm | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTerm?: (term: MathVocabTerm) => void;
}

export const MathVocabModal: React.FC<MathVocabModalProps> = ({
  selectedTerm,
  isOpen,
  onClose,
  onSelectTerm,
}) => {
  const [activeTerm, setActiveTerm] = useState<MathVocabTerm>(
    selectedTerm || MATH_VOCAB_TERMS[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLang, setAudioLang] = useState<'de' | 'en'>('de');

  useEffect(() => {
    if (selectedTerm) {
      setActiveTerm(selectedTerm);
    }
  }, [selectedTerm]);

  // Audio speech synthesis helper
  const speakText = useCallback((text: string, lang: 'de-DE' | 'en-US') => {
    if (typeof window === 'undefined') return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85; // slightly slower for language learners

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleStopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  useEffect(() => {
    return () => {
      handleStopAudio();
    };
  }, []);

  if (!isOpen) return null;

  const filteredTerms = MATH_VOCAB_TERMS.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.wordDe.toLowerCase().includes(q) ||
      t.wordSo.toLowerCase().includes(q) ||
      t.wordEn.toLowerCase().includes(q) ||
      t.definitionDe.toLowerCase().includes(q)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vocab-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleStopAudio();
          onClose();
        }
      }}
    >
      <div className="w-full sm:max-w-xl bg-[#141210] border-t sm:border border-amber-500/30 rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100 animate-slideUp sm:animate-scaleIn">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-[#191715]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 id="vocab-modal-title" className="text-sm sm:text-base font-bold text-white">
                Mathe-Wörterbuch (Qaamuus)
              </h2>
              <p className="text-[11px] text-neutral-400">
                Deutsch · Somali · English mit Aussprache
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleStopAudio();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors active:scale-95"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 sm:p-4 border-b border-neutral-800/80 bg-[#12100f]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Begriff suchen (z.B. Koeffizient, Term, Vorzeichen)..."
              className="w-full min-h-[40px] pl-9 pr-3 text-xs sm:text-sm rounded-xl bg-[#1c1916] border border-neutral-700/80 focus:border-amber-400 text-white placeholder-neutral-500 outline-none"
            />
          </div>

          {/* Quick chip selector for fast tapping */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-none">
            {filteredTerms.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTerm(t);
                  if (onSelectTerm) onSelectTerm(t);
                }}
                className={`min-h-[30px] px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-all ${
                  activeTerm.id === t.id
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-neutral-800/60 text-neutral-300 hover:text-white border border-neutral-700/60'
                }`}
              >
                {t.wordDe}
              </button>
            ))}
          </div>
        </div>

        {/* Active Term Detail Card */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Main Word Header */}
          <div className="bg-[#1b1815] border border-amber-500/20 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  {activeTerm.category}
                </span>
                <div className="flex items-baseline gap-2">
                  {activeTerm.article && (
                    <span className="text-xs font-mono text-neutral-400 font-semibold">
                      {activeTerm.article}
                    </span>
                  )}
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {activeTerm.wordDe}
                  </h3>
                </div>
                {activeTerm.phoneticDe && (
                  <p className="text-xs font-mono text-neutral-400">
                    Aussprache: {activeTerm.phoneticDe}
                  </p>
                )}
              </div>

              {/* Audio Listen Buttons (German & English) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (isPlayingAudio && audioLang === 'de') {
                      handleStopAudio();
                    } else {
                      setAudioLang('de');
                      speakText(`${activeTerm.article || ''} ${activeTerm.wordDe}`, 'de-DE');
                    }
                  }}
                  className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
                    isPlayingAudio && audioLang === 'de'
                      ? 'bg-amber-400 text-neutral-950 ring-2 ring-amber-300'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  }`}
                  title="Deutsche Aussprache anhören"
                >
                  {isPlayingAudio && audioLang === 'de' ? (
                    <>
                      <VolumeX className="w-4 h-4 animate-pulse" />
                      <span>Stopp</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Audio (DE)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Somali & English Translation Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
              <div className="bg-[#13110f] rounded-xl p-2.5 border border-amber-500/20">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                  Somali (Af-Soomaali):
                </span>
                <span className="text-sm font-semibold text-neutral-100">
                  {activeTerm.wordSo}
                </span>
              </div>
              <div className="bg-[#13110f] rounded-xl p-2.5 border border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">
                  English:
                </span>
                <span className="text-sm font-semibold text-neutral-100">
                  {activeTerm.wordEn}
                </span>
              </div>
            </div>

            {/* Simple German Explanation (A2 level) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Einfache Erklärung (Deutsch A2):</span>
              </span>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed bg-[#141210] p-3 rounded-xl border border-neutral-800">
                {activeTerm.definitionDe}
              </p>
            </div>

            {/* Somali Explanation */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90 block">
                Sharaxaad Kooban (Af-Soomaali):
              </span>
              <p className="text-xs sm:text-sm text-amber-200/90 italic leading-relaxed bg-[#141210] p-3 rounded-xl border border-amber-500/20">
                {activeTerm.definitionSo}
              </p>
            </div>

            {/* Example Box */}
            {(activeTerm.exampleDe || activeTerm.exampleLatex) && (
              <div className="bg-[#100e0d] border border-neutral-800 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
                  Beispiel (Tusaale):
                </span>
                {activeTerm.exampleDe && (
                  <p className="text-xs sm:text-sm text-neutral-200 font-mono">
                    {activeTerm.exampleDe}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Close Button (48px phone height) */}
        <div className="p-3 sm:p-4 border-t border-neutral-800 bg-[#161412]">
          <button
            type="button"
            onClick={() => {
              handleStopAudio();
              onClose();
            }}
            className="w-full min-h-[48px] rounded-xl font-bold text-sm bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Verstanden / Xidh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
