import { LanguageLesson } from '../../../types/lessons';
import { MultiLangTranslation } from '../../../services/translationPreference';

export interface InteractiveDrillItem {
  id: string;
  targetText: string;
  prompt?: string;
  translations?: MultiLangTranslation;
  audioText?: string;
  playAudioOnStart?: boolean;
  isRecallMode?: boolean;
  hint?: string;
  fillIn?: {
    prefix: string;
    suffix: string;
    fullSentence: string;
  };
  speaker?: {
    name: string;
    role: 'assistant' | 'user';
    audioText?: string;
    text?: string;
    translation?: MultiLangTranslation;
  };
  postExplanation?: string;
}

export interface InteractiveLessonStep {
  stepNumber: number;
  badgeLabel: string;
  title?: string;
  contextNote?: string;
  contextTranslations?: MultiLangTranslation;
  audioText?: string;
  playAudioOnStart?: boolean;
  drills: InteractiveDrillItem[];
}

export const PA_CAFE_STEPS: InteractiveLessonStep[] = [
  // ==========================================
  // STEP 1 — REAL-WORLD INTRO (LISTEN & TYPE)
  // ==========================================
  {
    stepNumber: 1,
    badgeLabel: 'LISTEN & TYPE',
    title: 'På café · Introduktion',
    contextNote: 'Du är på ett café och vill beställa något.',
    contextTranslations: {
      so: 'Waxaad joogtaa kafateeri oo waxaad rabtaa inaad wax dalbato.',
      en: "You're at a café and want to order something.",
    },
    drills: [
      {
        id: 'cafe-drill-01',
        targetText: 'Jag skulle vilja ha en kaffe.',
        audioText: 'Jag skulle vilja ha en kaffe.',
        playAudioOnStart: true,
        translations: {
          so: 'Waxaan jeclaan lahaa qaxwo.',
          en: 'I would like a coffee.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 2 — KAFFE
  // ==========================================
  {
    stepNumber: 2,
    badgeLabel: 'KAFFE',
    title: 'Lär dig "kaffe"',
    contextNote: '☕ kaffe',
    contextTranslations: {
      so: 'qaxwo',
      en: 'coffee',
    },
    drills: [
      {
        id: 'cafe-drill-02a',
        targetText: 'kaffe',
        prompt: '☕ Type the basic word:',
        translations: {
          so: 'qaxwo',
          en: 'coffee',
        },
        audioText: 'kaffe',
      },
      {
        id: 'cafe-drill-02b',
        targetText: 'en kaffe',
        prompt: 'Put it in context ("a coffee"):',
        translations: {
          so: 'koob qaxwo ah',
          en: 'a coffee',
        },
        audioText: 'en kaffe',
      },
    ],
  },

  // ==========================================
  // STEP 3 — USEFUL PATTERN: JAG SKULLE VILJA HA...
  // ==========================================
  {
    stepNumber: 3,
    badgeLabel: 'JAG SKULLE VILJA HA...',
    title: 'Artigt sätt att beställa',
    contextNote: 'A polite, natural way to state what you would like to order in Swedish.',
    contextTranslations: {
      so: 'Hab edeb leh oo wax lagu dalbado (Waxaan jeclaan lahaa...).',
      en: 'Polite expression to order: "I would like to have...".',
    },
    drills: [
      {
        id: 'cafe-drill-03a',
        targetText: 'Jag skulle vilja ha',
        prompt: 'TYPE & LEARN:',
        translations: {
          so: 'Waxaan jeclaan lahaa...',
          en: 'I would like to have...',
        },
        audioText: 'Jag skulle vilja ha',
      },
      {
        id: 'cafe-drill-03b',
        targetText: 'Jag skulle vilja ha en kaffe.',
        prompt: 'TYPE IN CONTEXT:',
        translations: {
          so: 'Waxaan jeclaan lahaa qaxwo.',
          en: 'I would like a coffee.',
        },
        audioText: 'Jag skulle vilja ha en kaffe.',
      },
    ],
  },

  // ==========================================
  // STEP 4 — CHANGE THE SENTENCE
  // ==========================================
  {
    stepNumber: 4,
    badgeLabel: 'CHANGE THE SENTENCE',
    title: 'Skapa nya meningar',
    contextNote: 'Base sentence: "Jag skulle vilja ha en kaffe."',
    drills: [
      {
        id: 'cafe-drill-04a',
        targetText: 'Jag skulle vilja ha te.',
        prompt: 'CHANGE: kaffe → te',
        translations: {
          so: 'Hadda waxaad rabtaa shaah (Waxaan jeclaan lahaa shaah).',
          en: 'Now you want tea (I would like tea).',
        },
        audioText: 'Jag skulle vilja ha te.',
      },
      {
        id: 'cafe-drill-04b',
        targetText: 'Jag skulle vilja ha vatten.',
        prompt: 'CHANGE: te → vatten',
        translations: {
          so: 'Hadda waxaad rabtaa biyo (Waxaan jeclaan lahaa biyo).',
          en: 'Now you want water (I would like water).',
        },
        audioText: 'Jag skulle vilja ha vatten.',
      },
    ],
  },

  // ==========================================
  // STEP 5 — LISTEN & TYPE
  // ==========================================
  {
    stepNumber: 5,
    badgeLabel: 'LISTEN & TYPE',
    title: 'Hörförståelse',
    contextNote: 'Listen closely to the natural Swedish pronunciation and type what you hear.',
    drills: [
      {
        id: 'cafe-drill-05',
        targetText: 'Jag skulle vilja ha te.',
        audioText: 'Jag skulle vilja ha te.',
        playAudioOnStart: true,
        translations: {
          so: 'Waxaan jeclaan lahaa shaah.',
          en: 'I would like tea.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 6 — TACK
  // ==========================================
  {
    stepNumber: 6,
    badgeLabel: 'TACK',
    title: 'Artighet på svenska',
    contextNote: 'In Swedish, "tack" is essential for polite everyday interactions (please / thank you).',
    contextTranslations: {
      so: '"Tack" waxaa loo isticmaalaa mahadsanid iyo fadlan marka wax la dalbanayo.',
      en: '"Tack" functions both as "thank you" and as a polite "please".',
    },
    drills: [
      {
        id: 'cafe-drill-06a',
        targetText: 'tack',
        prompt: 'TYPE & LEARN:',
        translations: {
          so: 'mahadsanid / fadlan',
          en: 'thank you / please',
        },
        audioText: 'tack',
      },
      {
        id: 'cafe-drill-06b',
        targetText: 'Ja tack.',
        prompt: 'Polite yes:',
        translations: {
          so: 'Haa, mahadsanid / Haa, fadlan.',
          en: 'Yes, please / Yes, thanks.',
        },
        audioText: 'Ja tack.',
      },
      {
        id: 'cafe-drill-06c',
        targetText: 'Nej tack.',
        prompt: 'Polite no:',
        translations: {
          so: 'Maya, mahadsanid.',
          en: 'No, thank you.',
        },
        audioText: 'Nej tack.',
      },
    ],
  },

  // ==========================================
  // STEP 7 — SOMETHING ELSE
  // ==========================================
  {
    stepNumber: 7,
    badgeLabel: 'SOMETHING ELSE',
    title: 'Vill du ha något mer?',
    contextNote: 'The staff will often ask if you want anything else.',
    contextTranslations: {
      so: 'Shaqaalaha kafateerigu waxay ku weydiin doonaan haddii aad wax kale rabto.',
      en: 'Staff will often ask if you would like anything else.',
    },
    drills: [
      {
        id: 'cafe-drill-07a',
        targetText: 'Vill du ha något mer?',
        audioText: 'Vill du ha något mer?',
        playAudioOnStart: true,
        prompt: 'LISTEN & TYPE:',
        translations: {
          so: 'Wax kale ma rabtaa?',
          en: 'Would you like anything else?',
        },
      },
      {
        id: 'cafe-drill-07b',
        targetText: 'Nej tack.',
        prompt: 'Respond: Say "No, thank you."',
        translations: {
          so: 'Dheh: Maya, mahadsanid.',
          en: 'Say: No, thank you.',
        },
        audioText: 'Nej tack.',
      },
    ],
  },

  // ==========================================
  // STEP 8 — CHANGE THE RESPONSE
  // ==========================================
  {
    stepNumber: 8,
    badgeLabel: 'CHANGE THE RESPONSE',
    title: 'Svara jakande',
    contextNote: 'Staff asks: "Vill du ha något mer?"',
    drills: [
      {
        id: 'cafe-drill-08',
        targetText: 'Ja tack, lite vatten.',
        speaker: {
          name: 'Cafépersonal',
          role: 'assistant',
          audioText: 'Vill du ha något mer?',
          text: 'Vill du ha något mer?',
          translation: {
            so: 'Wax kale ma rabtaa?',
            en: 'Would you like anything else?',
          },
        },
        prompt: 'Respond: "Yes, some water please."',
        translations: {
          so: 'Haa, biyo fadlan.',
          en: 'Yes, some water please.',
        },
        audioText: 'Ja tack, lite vatten.',
      },
    ],
  },

  // ==========================================
  // STEP 9 — ASKING THE PRICE
  // ==========================================
  {
    stepNumber: 9,
    badgeLabel: 'ASKING THE PRICE',
    title: 'Fråga om priset',
    contextNote: 'Vad = what · kostar = costs · det = it',
    contextTranslations: {
      so: 'Vad = maxaa · kostar = ku kacaya · det = taasi',
      en: 'Vad = what · kostar = costs · det = it',
    },
    drills: [
      {
        id: 'cafe-drill-09a',
        targetText: 'Vad kostar det?',
        audioText: 'Vad kostar det?',
        playAudioOnStart: true,
        prompt: 'LISTEN & TYPE:',
        translations: {
          so: 'Immisa ayuu ku kacayaa?',
          en: 'How much does it cost?',
        },
      },
    ],
  },

  // ==========================================
  // STEP 10 — TRANSLATION → SWEDISH
  // ==========================================
  {
    stepNumber: 10,
    badgeLabel: 'TRANSLATION → SWEDISH',
    title: 'Producera på svenska',
    contextNote: 'Type the exact Swedish question from meaning.',
    drills: [
      {
        id: 'cafe-drill-10',
        targetText: 'Vad kostar det?',
        isRecallMode: true,
        prompt: 'TYPE IN SWEDISH:',
        translations: {
          so: 'Immisa ayuu ku kacayaa?',
          en: 'How much does it cost?',
        },
        hint: 'Vad k...',
      },
    ],
  },

  // ==========================================
  // STEP 11 — PRICE
  // ==========================================
  {
    stepNumber: 11,
    badgeLabel: 'PRICE',
    title: 'Förstå priset',
    contextNote: 'trettio = 30 · kronor = Swedish kronor (SEK)',
    contextTranslations: {
      so: 'trettio = 30 · kronor = lacagta Sweden',
      en: 'trettio = 30 · kronor = Swedish currency',
    },
    drills: [
      {
        id: 'cafe-drill-11',
        targetText: 'Det kostar trettio kronor.',
        audioText: 'Det kostar trettio kronor.',
        playAudioOnStart: true,
        prompt: 'LISTEN & TYPE:',
        translations: {
          so: 'Waxay ku kacaysaa soddon karoon.',
          en: 'It costs thirty kronor.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 12 — PATTERN CHANGE
  // ==========================================
  {
    stepNumber: 12,
    badgeLabel: 'PATTERN CHANGE',
    title: 'Prismönster',
    contextNote: 'Practice the pricing pattern with different amounts.',
    drills: [
      {
        id: 'cafe-drill-12a',
        targetText: 'Det kostar trettio kronor.',
        prompt: 'Amount: 30 kr',
        translations: {
          so: '30 kr — Waxay ku kacaysaa soddon karoon.',
          en: '30 kr — It costs thirty kronor.',
        },
        audioText: 'Det kostar trettio kronor.',
      },
      {
        id: 'cafe-drill-12b',
        targetText: 'Det kostar fyrtio kronor.',
        prompt: 'Amount: 40 kr',
        translations: {
          so: '40 kr — Waxay ku kacaysaa afartan karoon.',
          en: '40 kr — It costs forty kronor.',
        },
        audioText: 'Det kostar fyrtio kronor.',
      },
      {
        id: 'cafe-drill-12c',
        targetText: 'Det kostar femtio kronor.',
        prompt: 'Amount: 50 kr',
        translations: {
          so: '50 kr — Waxay ku kacaysaa konton karoon.',
          en: '50 kr — It costs fifty kronor.',
        },
        audioText: 'Det kostar femtio kronor.',
      },
    ],
  },

  // ==========================================
  // STEP 13 — NATURAL CAFÉ LANGUAGE
  // ==========================================
  {
    stepNumber: 13,
    badgeLabel: 'NATURAL CAFÉ LANGUAGE',
    title: '"Jag tar..."',
    contextNote: 'At a Swedish café, "Jag tar..." is a very natural and direct way to order.',
    contextTranslations: {
      so: 'Kafateeriga, "Jag tar..." waa hab aad u dabiici ah oo wax lagu dalbado.',
      en: 'At a café, "Jag tar..." is very natural ("I\'ll take... / I\'ll have...").',
    },
    drills: [
      {
        id: 'cafe-drill-13a',
        targetText: 'Jag tar en kaffe.',
        prompt: 'TYPE & LEARN:',
        translations: {
          so: 'Waxaan qaadanayaa qaxwo.',
          en: "I'll have a coffee.",
        },
        audioText: 'Jag tar en kaffe.',
      },
      {
        id: 'cafe-drill-13b',
        targetText: 'Jag tar te.',
        prompt: 'CHANGE: kaffe → te',
        translations: {
          so: 'Waxaan qaadanayaa shaah.',
          en: "I'll have tea.",
        },
        audioText: 'Jag tar te.',
      },
    ],
  },

  // ==========================================
  // STEP 14 — CAN I HAVE...?
  // ==========================================
  {
    stepNumber: 14,
    badgeLabel: 'CAN I HAVE...?',
    title: '"Kan jag få...?"',
    contextNote: '"Kan jag få...?" is another polite and flexible ordering phrase.',
    contextTranslations: {
      so: '"Kan jag få...?" = Ma heli karaa...?',
      en: '"Kan jag få...?" = Can I have...?',
    },
    drills: [
      {
        id: 'cafe-drill-14a',
        targetText: 'Kan jag få en kaffe?',
        prompt: 'TYPE & LEARN:',
        translations: {
          so: 'Ma heli karaa qaxwo?',
          en: 'Can I have a coffee?',
        },
        audioText: 'Kan jag få en kaffe?',
      },
      {
        id: 'cafe-drill-14b',
        targetText: 'Kan jag få ett glas vatten?',
        prompt: 'CHANGE TO: a glass of water',
        translations: {
          so: 'Ma heli karaa koob biyo ah?',
          en: 'Can I have a glass of water?',
        },
        audioText: 'Kan jag få ett glas vatten?',
      },
    ],
  },

  // ==========================================
  // STEP 15 — RECOGNIZE MEANING THROUGH TYPING
  // ==========================================
  {
    stepNumber: 15,
    badgeLabel: 'RECOGNIZE MEANING',
    title: 'Typing från betydelse',
    contextNote: 'Produce the correct Swedish phrase based on meaning without multiple choice.',
    drills: [
      {
        id: 'cafe-drill-15a',
        targetText: 'Jag skulle vilja ha',
        isRecallMode: true,
        prompt: '1 of 3 — TYPE IN SWEDISH:',
        translations: {
          so: 'Waxaan jeclaan lahaa...',
          en: 'I would like to have...',
        },
        hint: 'Jag sk...',
      },
      {
        id: 'cafe-drill-15b',
        targetText: 'Vad kostar det?',
        isRecallMode: true,
        prompt: '2 of 3 — TYPE IN SWEDISH:',
        translations: {
          so: 'Immisa ayuu ku kacayaa?',
          en: 'How much does it cost?',
        },
        hint: 'Vad k...',
      },
      {
        id: 'cafe-drill-15c',
        targetText: 'Nej tack.',
        isRecallMode: true,
        prompt: '3 of 3 — TYPE IN SWEDISH:',
        translations: {
          so: 'Maya, mahadsanid.',
          en: 'No, thank you.',
        },
        hint: 'Nej t...',
      },
    ],
  },

  // ==========================================
  // STEP 16 — START CONVERSATION
  // ==========================================
  {
    stepNumber: 16,
    badgeLabel: 'CONVERSATION (START)',
    title: 'Hälsning i kassan',
    contextNote: 'Listen to the café staff greeting and type your polite order.',
    drills: [
      {
        id: 'cafe-drill-16',
        targetText: 'Jag skulle vilja ha en kaffe.',
        speaker: {
          name: 'Cafépersonal',
          role: 'assistant',
          audioText: 'Hej! Vad får det lov att vara?',
          text: 'Hej! Vad får det lov att vara?',
          translation: {
            so: 'Salaan! Maxaad jeclaan lahayd?',
            en: 'Hi! What would you like?',
          },
        },
        prompt: 'Order a coffee politely:',
        translations: {
          so: 'Si edeb leh u dalbo qaxwo (Waxaan jeclaan lahaa qaxwo).',
          en: 'Order a coffee politely.',
        },
        audioText: 'Jag skulle vilja ha en kaffe.',
      },
    ],
  },

  // ==========================================
  // STEP 17 — CONTINUE CONVERSATION
  // ==========================================
  {
    stepNumber: 17,
    badgeLabel: 'CONVERSATION (CONTINUE)',
    title: 'Svara personalen',
    contextNote: 'The staff confirms and asks if you want anything more.',
    drills: [
      {
        id: 'cafe-drill-17',
        targetText: 'Nej tack.',
        speaker: {
          name: 'Cafépersonal',
          role: 'assistant',
          audioText: 'Absolut. Vill du ha något mer?',
          text: 'Absolut. Vill du ha något mer?',
          translation: {
            so: 'Haa. Wax kale ma rabtaa?',
            en: 'Of course. Would you like anything else?',
          },
        },
        prompt: 'Say: "No, thank you."',
        translations: {
          so: 'Dheh: Maya, mahadsanid.',
          en: 'Say: No, thank you.',
        },
        audioText: 'Nej tack.',
      },
    ],
  },

  // ==========================================
  // STEP 18 — PRICE CONVERSATION
  // ==========================================
  {
    stepNumber: 18,
    badgeLabel: 'PRICE CONVERSATION',
    title: 'Fråga pris och betala',
    contextNote: 'Ask for the price, then listen to the total.',
    drills: [
      {
        id: 'cafe-drill-18a',
        targetText: 'Vad kostar det?',
        prompt: 'Ask how much it costs:',
        translations: {
          so: 'Weydii immisa ayuu ku kacayaa:',
          en: 'Ask how much it costs:',
        },
        audioText: 'Vad kostar det?',
      },
      {
        id: 'cafe-drill-18b',
        targetText: 'Tack så mycket.',
        speaker: {
          name: 'Cafépersonal',
          role: 'assistant',
          audioText: 'Det blir trettio kronor.',
          text: 'Det blir trettio kronor.',
          translation: {
            so: 'Wadartu waa soddon karoon.',
            en: "That'll be thirty kronor.",
          },
        },
        prompt: 'Say "Thank you very much":',
        translations: {
          so: 'Dheh: Aad baad u mahadsan tahay.',
          en: 'Say: Thank you very much.',
        },
        audioText: 'Tack så mycket.',
      },
    ],
  },

  // ==========================================
  // STEP 19 — HARDER CONVERSATION
  // ==========================================
  {
    stepNumber: 19,
    badgeLabel: 'HARDER CONVERSATION',
    title: 'Konversation utan textfacit',
    contextNote: 'Respond without the exact Swedish answer revealed.',
    drills: [
      {
        id: 'cafe-drill-19a',
        targetText: 'Jag skulle vilja ha en kaffe och lite vatten.',
        isRecallMode: true,
        speaker: {
          name: 'Cafépersonal',
          role: 'assistant',
          audioText: 'Hej! Vad får det lov att vara?',
          text: 'Hej! Vad får det lov att vara?',
          translation: {
            so: 'Salaan! Maxaad jeclaan lahayd?',
            en: 'Hi! What would you like?',
          },
        },
        prompt: 'PRODUCE IN SWEDISH (You want a coffee and some water):',
        translations: {
          so: 'Waxaad rabtaa qaxwo iyo xoogaa biyo ah.',
          en: 'You want a coffee and some water.',
        },
        hint: 'Jag skulle vilja ha en kaffe och...',
      },
      {
        id: 'cafe-drill-19b',
        targetText: 'Nej tack.',
        speaker: {
          name: 'Cafépersonal',
          role: 'assistant',
          audioText: 'Vill du ha något mer?',
          text: 'Vill du ha något mer?',
          translation: {
            so: 'Wax kale ma rabtaa?',
            en: 'Would you like anything else?',
          },
        },
        prompt: 'Say: "No, thank you."',
        translations: {
          so: 'Dheh: Maya, mahadsanid.',
          en: 'Say: No, thank you.',
        },
        audioText: 'Nej tack.',
      },
    ],
  },

  // ==========================================
  // STEP 20 — LISTENING WITHOUT TRANSLATION FIRST
  // ==========================================
  {
    stepNumber: 20,
    badgeLabel: 'LISTEN & TYPE (ADVANCED)',
    title: 'Hör utan översättning först',
    contextNote: 'Hear the audio first, try typing what you hear, use help only if needed.',
    drills: [
      {
        id: 'cafe-drill-20',
        targetText: 'Vill du ha något mer?',
        audioText: 'Vill du ha något mer?',
        playAudioOnStart: true,
        translations: {
          so: 'Wax kale ma rabtaa?',
          en: 'Would you like anything else?',
        },
      },
    ],
  },

  // ==========================================
  // STEP 21 — RECALL (Core Phrases)
  // ==========================================
  {
    stepNumber: 21,
    badgeLabel: 'RECALL',
    title: 'Återkalla ur minnet',
    contextNote: 'Type each Swedish phrase from memory without answer audio.',
    drills: [
      {
        id: 'cafe-drill-21a',
        targetText: 'Jag skulle vilja ha en kaffe.',
        isRecallMode: true,
        prompt: 'RECALL 1 OF 4:',
        translations: {
          so: 'Waxaan jeclaan lahaa qaxwo.',
          en: 'I would like a coffee.',
        },
        hint: 'Jag skulle vilja...',
      },
      {
        id: 'cafe-drill-21b',
        targetText: 'Vad kostar det?',
        isRecallMode: true,
        prompt: 'RECALL 2 OF 4:',
        translations: {
          so: 'Immisa ayuu ku kacayaa?',
          en: 'How much does it cost?',
        },
        hint: 'Vad k...',
      },
      {
        id: 'cafe-drill-21c',
        targetText: 'Vill du ha något mer?',
        isRecallMode: true,
        prompt: 'RECALL 3 OF 4:',
        translations: {
          so: 'Wax kale ma rabtaa?',
          en: 'Would you like anything else?',
        },
        hint: 'Vill du h...',
      },
      {
        id: 'cafe-drill-21d',
        targetText: 'Nej tack.',
        isRecallMode: true,
        prompt: 'RECALL 4 OF 4:',
        translations: {
          so: 'Maya, mahadsanid.',
          en: 'No, thank you.',
        },
        hint: 'Nej...',
      },
    ],
  },

  // ==========================================
  // STEP 22 — PERSONAL MISTAKE PRACTICE
  // ==========================================
  {
    stepNumber: 22,
    badgeLabel: 'ONE MORE TIME',
    title: 'Förstärk nyckelmening',
    contextNote: 'One more time: secure full mastery of the core ordering sentence.',
    drills: [
      {
        id: 'cafe-drill-22',
        targetText: 'Jag skulle vilja ha en kaffe.',
        isRecallMode: true,
        prompt: 'ONE MORE TIME — TYPE IN SWEDISH:',
        translations: {
          so: 'Waxaan jeclaan lahaa qaxwo.',
          en: 'I would like a coffee.',
        },
        hint: 'Jag skulle vilja ha...',
      },
    ],
  },

  // ==========================================
  // STEP 23 — REAL-LIFE FINAL CHALLENGE
  // ==========================================
  {
    stepNumber: 23,
    badgeLabel: 'REAL-LIFE CHALLENGE 🇸🇪',
    title: 'Caféutmaningen',
    contextNote: 'Du är på ett café i Sverige.\nDu vill ha: ☕ en kaffe och 💧 lite vatten. Du vill också fråga om priset.',
    contextTranslations: {
      so: 'Waxaad joogtaa kafateeri ku taal Sweden. Waxaad rabtaa: qaxwo iyo biyo, waxaadna rabtaa inaad weydiiso qiimaha.',
      en: "You're at a café in Sweden. You want: a coffee and some water, and you also want to ask the price.",
    },
    drills: [
      {
        id: 'cafe-drill-23',
        targetText: 'Jag skulle vilja ha en kaffe och lite vatten. Vad kostar det?',
        isRecallMode: true,
        prompt: 'Order politely and ask the price in Swedish:',
        translations: {
          so: 'Si edeb leh u dalbo qaxwo iyo biyo, weydiina qiimaha.',
          en: 'Order politely and ask the price in Swedish.',
        },
        hint: 'Jag skulle vilja ha en kaffe och lite vatten. Vad k...',
      },
    ],
  },
];

export const PA_CAFE_LESSON: LanguageLesson = {
  id: 'sv-pa-cafe',
  language: 'sv',
  title: 'På café — At a Café',
  description: 'Master ordering, polite questions, and café conversation in Swedish through structured typing.',
  category: 'Daily Life',
  level: 'Beginner',
  sentences: [
    {
      id: 'sv-cafe-s01',
      text: 'Jag skulle vilja ha en kaffe.',
      translation: 'I would like a coffee.',
      hint: 'Jag skulle vilja ha...',
    },
    {
      id: 'sv-cafe-s02',
      text: 'Vill du ha något mer? — Nej tack.',
      translation: 'Would you like anything else? — No, thank you.',
      hint: 'Vill du ha något mer?...',
    },
    {
      id: 'sv-cafe-s03',
      text: 'Vad kostar det? — Det kostar trettio kronor.',
      translation: 'How much does it cost? — It costs thirty kronor.',
      hint: 'Vad kostar det?...',
    },
    {
      id: 'sv-cafe-s04',
      text: 'Jag skulle vilja ha en kaffe och lite vatten. Vad kostar det?',
      translation: 'I would like a coffee and some water. How much does it cost?',
      hint: 'Jag skulle vilja ha en kaffe...',
    },
  ],
};
