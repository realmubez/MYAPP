import { LanguageLesson } from '../../../types/lessons';
import { MultiLangTranslation } from '../../../services/translationPreference';

export interface PhonePlanDrillItem {
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

export interface PhonePlanStep {
  stepNumber: number;
  badgeLabel: string;
  title?: string;
  contextNote?: string;
  contextTranslations?: MultiLangTranslation;
  audioText?: string;
  playAudioOnStart?: boolean;
  drills: PhonePlanDrillItem[];
}

export const PHONE_PLANS_STEPS: PhonePlanStep[] = [
  // ==========================================
  // STEP 1 — CONTEXT (LISTEN & TYPE)
  // ==========================================
  {
    stepNumber: 1,
    badgeLabel: 'LISTEN & TYPE',
    title: 'Context Introduction',
    contextNote: 'Listen to the natural spoken English and type the sentence you hear.',
    drills: [
      {
        id: 'pp-drill-1',
        targetText: 'I stream videos on my cellphone, so I need a plan with lots of data.',
        audioText: 'I stream videos on my cellphone, so I need a plan with lots of data.',
        playAudioOnStart: true,
        translations: {
          so: 'Waxaan fiidiyowyo ka daawadaa taleefankayga, sidaas darteed waxaan u baahanahay qorshe leh data badan.',
          sv: 'Jag streamar videor på min mobil, så jag behöver ett abonnemang med mycket data.',
          en: 'I stream videos on my phone, so I need high data.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 2 — PLAN
  // ==========================================
  {
    stepNumber: 2,
    badgeLabel: 'PLAN',
    title: 'Learn "Plan"',
    contextNote: 'A service package for your mobile phone.',
    contextTranslations: {
      so: 'Qorshe adeeg oo loogu talagalay taleefankaaga gacanta.',
      sv: 'Ett abonnemang för din mobiltelefon.',
    },
    drills: [
      {
        id: 'pp-drill-2a',
        targetText: 'a plan',
        prompt: 'A service package for your mobile phone.',
        translations: {
          so: 'Qorshe adeeg oo loogu talagalay taleefankaaga gacanta.',
          sv: 'Ett abonnemang för din mobiltelefon.',
          en: 'A service package for your mobile phone.',
        },
        audioText: 'a plan',
      },
      {
        id: 'pp-drill-2b',
        targetText: 'What kind of plan options do you offer?',
        prompt: 'TYPE & LEARN',
        translations: {
          so: 'Waa maxay noocyada qorshooyinka aad bixisaan?',
          sv: 'Vilka typer av abonnemangsalternativ erbjuder ni?',
          en: 'What mobile package choices are available?',
        },
        audioText: 'What kind of plan options do you offer?',
      },
    ],
  },

  // ==========================================
  // STEP 3 — PAY-AS-YOU-GO
  // ==========================================
  {
    stepNumber: 3,
    badgeLabel: 'PAY-AS-YOU-GO',
    title: 'Pay For What You Use',
    contextNote: 'You pay for what you use without a long-term commitment.',
    contextTranslations: {
      so: 'Waxaad bixisaa inta aad isticmaasho.',
      sv: 'Du betalar för det du använder.',
    },
    drills: [
      {
        id: 'pp-drill-3a',
        targetText: 'a pay-as-you-go plan',
        prompt: 'You pay for what you use.',
        translations: {
          so: 'Waxaad bixisaa inta aad isticmaasho.',
          sv: 'Du betalar för det du använder.',
          en: 'Prepaid mobile package.',
        },
        audioText: 'a pay-as-you-go plan',
      },
      {
        id: 'pp-drill-3b',
        targetText: "I don't want a contract. Do you have any pay-as-you-go plans?",
        prompt: 'TYPE IN CONTEXT',
        translations: {
          so: 'Ma rabo qandaraas. Ma haysaan wax qorshayaal pay-as-you-go ah?',
          sv: 'Jag vill inte ha något abonnemang med bindningstid. Har ni några pay-as-you-go-abonnemang?',
          en: 'Asking for prepaid options instead of a contract.',
        },
        audioText: "I don't want a contract. Do you have any pay-as-you-go plans?",
        postExplanation: 'Pay-as-you-go: There is no fixed monthly contract payment; you pay based on the service/credit you use.',
      },
    ],
  },

  // ==========================================
  // STEP 4 — CONTRACT
  // ==========================================
  {
    stepNumber: 4,
    badgeLabel: 'CONTRACT',
    title: 'Fixed Monthly Agreement',
    contextNote: 'You pay a regular amount as part of an agreement.',
    contextTranslations: {
      so: 'Waxaad si joogto ah u bixisaa lacag sida ku cad heshiiska.',
      sv: 'Du betalar ett regelbundet belopp enligt ett avtal.',
    },
    drills: [
      {
        id: 'pp-drill-4a',
        targetText: 'a contract',
        prompt: 'You pay a regular amount as part of an agreement.',
        translations: {
          so: 'Waxaad si joogto ah u bixisaa lacag sida ku cad heshiiska.',
          sv: 'Du betalar ett regelbundet belopp enligt ett avtal.',
          en: 'A fixed regular monthly agreement.',
        },
        audioText: 'a contract',
      },
      {
        id: 'pp-drill-4b',
        targetText: "I'm looking to get a new contract.",
        prompt: 'TYPE IN CONTEXT',
        translations: {
          so: 'Waxaan raadinayaa inaan helo qandaraas cusub.',
          sv: 'Jag vill teckna ett nytt mobilabonnemang.',
          en: 'I want to sign a new monthly service agreement.',
        },
        audioText: "I'm looking to get a new contract.",
      },
    ],
  },

  // ==========================================
  // STEP 5 — CONTRAST THROUGH TYPING
  // ==========================================
  {
    stepNumber: 5,
    badgeLabel: 'CONTRAST THROUGH TYPING',
    title: 'Distinguish By Typing',
    contextNote: 'Type the correct term based on the definition.',
    drills: [
      {
        id: 'pp-drill-5a',
        targetText: 'a pay-as-you-go plan',
        prompt: 'You pay for what you use.',
        translations: {
          so: 'Waxaad bixisaa inta aad isticmaasho.',
          sv: 'Du betalar för det du använder.',
          en: 'You pay for what you use.',
        },
        audioText: 'a pay-as-you-go plan',
      },
      {
        id: 'pp-drill-5b',
        targetText: 'a contract',
        prompt: 'You pay a regular amount under an agreement.',
        translations: {
          so: 'Waxaad si joogto ah u bixisaa lacag sida ku cad heshiiska.',
          sv: 'Du betalar ett regelbundet belopp enligt ett avtal.',
          en: 'You pay a regular amount under an agreement.',
        },
        audioText: 'a contract',
      },
    ],
  },

  // ==========================================
  // STEP 6 — RECALL FROM TRANSLATION
  // ==========================================
  {
    stepNumber: 6,
    badgeLabel: 'RECALL FROM TRANSLATION',
    title: 'Produce from Meaning',
    contextNote: 'Type the exact English phrase from the translation or concept prompt.',
    drills: [
      {
        id: 'pp-drill-6a',
        targetText: 'a pay-as-you-go plan',
        isRecallMode: true,
        prompt: 'TYPE IN ENGLISH',
        translations: {
          so: 'Waxaad bixisaa inta aad isticmaasho.',
          sv: 'Du betalar för det du använder.',
          en: 'You pay for what you use with no fixed commitment.',
        },
        hint: 'a pay-as-you-go...',
      },
      {
        id: 'pp-drill-6b',
        targetText: 'a contract',
        isRecallMode: true,
        prompt: 'TYPE IN ENGLISH',
        translations: {
          so: 'heshiis / qandaraas',
          sv: 'ett avtal / kontrakt',
          en: 'A regular monthly agreement.',
        },
        hint: 'a con...',
      },
    ],
  },

  // ==========================================
  // STEP 7 — MOBILE PHONE / CELL PHONE
  // ==========================================
  {
    stepNumber: 7,
    badgeLabel: 'MOBILE PHONE / CELL PHONE',
    title: 'British vs American English',
    contextNote: 'Both refer to the same device. "mobile phone" is common in British English, while "cell phone" is common in American English.',
    contextTranslations: {
      so: 'Labaduba waxay u taagan yihiin isla taleefanka gacanta.',
      sv: 'Båda syftar på samma enhet (mobil / mobiltelefon).',
    },
    drills: [
      {
        id: 'pp-drill-7a',
        targetText: 'I stream videos on my cellphone.',
        prompt: 'LISTEN & TYPE',
        audioText: 'I stream videos on my cellphone.',
        playAudioOnStart: true,
        translations: {
          so: 'Waxaan fiidiyowyo ka daawadaa taleefankayga gacanta.',
          sv: 'Jag streamar videor på min mobil.',
          en: 'I stream videos on my phone.',
        },
      },
    ],
  },

  // ==========================================
  // STEP 8 — DATA
  // ==========================================
  {
    stepNumber: 8,
    badgeLabel: 'DATA',
    title: 'Understanding Mobile Data',
    contextNote: 'LIGHT PLAN: 5 GB/month · PREMIUM PLAN: 25 GB/month\nThe two plans offer different amounts of data.',
    contextTranslations: {
      so: 'Labada qorshe waxay bixiyaan xaddi data oo kala duwan.',
      sv: 'De två abonnemangen erbjuder olika mängder data.',
    },
    drills: [
      {
        id: 'pp-drill-8a',
        targetText: 'data',
        prompt: 'Internet allowance on your mobile:',
        translations: {
          so: 'data / internet',
          sv: 'mobildata / surfmängd',
          en: 'Mobile internet allowance.',
        },
        audioText: 'data',
      },
      {
        id: 'pp-drill-8b',
        targetText: 'I need a plan with lots of data.',
        prompt: 'TYPE & LEARN',
        translations: {
          so: 'Waxaan u baahanahay qorshe leh data badan.',
          sv: 'Jag behöver ett abonnemang med mycket data.',
          en: 'I need a plan with plenty of internet.',
        },
        audioText: 'I need a plan with lots of data.',
      },
    ],
  },

  // ==========================================
  // STEP 9 — UNLIMITED DATA
  // ==========================================
  {
    stepNumber: 9,
    badgeLabel: 'UNLIMITED DATA',
    title: 'No Data Limits',
    contextNote: "You can use as much data as you like with this plan — it's unlimited!",
    contextTranslations: {
      so: 'Waxaad isticmaali kartaa data badan inta aad rabto — waa mid aan xad lahayn.',
      sv: 'Du kan använda så mycket data du vill med det här abonnemanget — det är obegränsat.',
    },
    drills: [
      {
        id: 'pp-drill-9a',
        targetText: 'unlimited data',
        prompt: 'No data caps or extra charges:',
        translations: {
          so: 'data aan xad lahayn',
          sv: 'obegränsad data / fri surf',
          en: 'Uncapped internet allowance.',
        },
        audioText: 'unlimited data',
      },
      {
        id: 'pp-drill-9b',
        targetText: "I'm looking for a plan with unlimited data.",
        prompt: 'TYPE & LEARN',
        translations: {
          so: 'Waxaan raadinayaa qorshe leh data aan xad lahayn.',
          sv: 'Jag letar efter ett abonnemang med obegränsad data.',
          en: 'Seeking an uncapped data plan.',
        },
        audioText: "I'm looking for a plan with unlimited data.",
      },
    ],
  },

  // ==========================================
  // STEP 10 — CHANGE THE SENTENCE
  // ==========================================
  {
    stepNumber: 10,
    badgeLabel: 'CHANGE THE SENTENCE',
    title: 'Modify Language Actively',
    contextNote: 'Base: "I need a plan with lots of data." Modify the sentence as requested.',
    drills: [
      {
        id: 'pp-drill-10a',
        targetText: 'I need a plan with unlimited data.',
        prompt: 'Change "lots of data" to "UNLIMITED DATA":',
        translations: {
          so: 'Waxaan u baahanahay qorshe leh data aan xad lahayn.',
          sv: 'Jag behöver ett abonnemang med obegränsad data.',
          en: 'I need a plan with unlimited data.',
        },
        audioText: 'I need a plan with unlimited data.',
      },
      {
        id: 'pp-drill-10b',
        targetText: "I'm looking for a plan with unlimited data.",
        prompt: 'Now use "I\'m looking for...":',
        translations: {
          so: 'Waxaan raadinayaa qorshe leh data aan xad lahayn.',
          sv: 'Jag letar efter ett abonnemang med obegränsad data.',
          en: "I'm looking for a plan with unlimited data.",
        },
        audioText: "I'm looking for a plan with unlimited data.",
      },
    ],
  },

  // ==========================================
  // STEP 11 — SIGNAL
  // ==========================================
  {
    stepNumber: 11,
    badgeLabel: 'SIGNAL',
    title: 'Reception & Coverage',
    contextNote: 'good signal · strong signal · weak signal · no signal',
    contextTranslations: {
      so: 'signal / shabakad',
      sv: 'täckning / signal',
    },
    drills: [
      {
        id: 'pp-drill-11a',
        targetText: "I live in a rural area where it's sometimes hard to get a good signal.",
        prompt: 'LISTEN & TYPE',
        audioText: "I live in a rural area where it's sometimes hard to get a good signal.",
        playAudioOnStart: true,
        translations: {
          so: 'Waxaan ku noolahay meel miyi ah oo mararka qaar ay adag tahay in la helo signal fiican.',
          sv: 'Jag bor på landsbygden där det ibland är svårt att få bra täckning.',
          en: "It's hard to get reception in the countryside.",
        },
      },
      {
        id: 'pp-drill-11b',
        targetText: 'I need a strong signal.',
        prompt: 'TYPE & LEARN',
        translations: {
          so: 'Waxaan u baahanahay signal xooggan.',
          sv: 'Jag behöver bra täckning / en stark signal.',
          en: 'I require reliable reception.',
        },
        audioText: 'I need a strong signal.',
      },
    ],
  },

  // ==========================================
  // STEP 12 — UNLIMITED CALLS
  // ==========================================
  {
    stepNumber: 12,
    badgeLabel: 'UNLIMITED CALLS',
    title: 'Call Allowances',
    contextNote: "I prefer to send messages, so I don't really need unlimited calls.",
    contextTranslations: {
      so: 'Waxaan doorbidaa inaan fariimo diro, sidaas darteed uma baahni wicitaanno aan xad lahayn.',
      sv: 'Jag föredrar att skicka meddelanden, så jag behöver egentligen inte obegränsade samtal.',
    },
    drills: [
      {
        id: 'pp-drill-12a',
        targetText: 'unlimited calls',
        prompt: 'Free calling minutes without limits:',
        translations: {
          so: 'wicitaanno aan xad lahayn',
          sv: 'obegränsade samtal / fria samtal',
          en: 'Unlimited voice calling.',
        },
        audioText: 'unlimited calls',
      },
      {
        id: 'pp-drill-12b',
        targetText: "I prefer to send messages, so I don't really need unlimited calls.",
        prompt: 'TYPE IN CONTEXT',
        translations: {
          so: 'Waxaan doorbidaa inaan fariimo diro, sidaas darteed uma baahni wicitaanno aan xad lahayn.',
          sv: 'Jag föredrar att skicka meddelanden, så jag behöver egentligen inte obegränsade samtal.',
          en: "I don't need endless minutes because I text.",
        },
        audioText: "I prefer to send messages, so I don't really need unlimited calls.",
      },
    ],
  },

  // ==========================================
  // STEP 13 — A GOOD DEAL
  // ==========================================
  {
    stepNumber: 13,
    badgeLabel: 'A GOOD DEAL',
    title: 'Special Offers & Prices',
    contextNote: 'A good or great deal means you received a particularly good price or offer.',
    contextTranslations: {
      so: 'qiimo ama heshiis wanaagsan',
      sv: 'ett bra erbjudande / bra pris',
    },
    drills: [
      {
        id: 'pp-drill-13a',
        targetText: 'a good deal',
        prompt: 'An attractive price or offer:',
        translations: {
          so: 'heshiis / qiimo wanaagsan',
          sv: 'ett bra erbjudande',
          en: 'A good value offer.',
        },
        audioText: 'a good deal',
      },
      {
        id: 'pp-drill-13b',
        targetText: "I'm looking for a good deal on a phone plan.",
        prompt: 'TYPE & LEARN',
        translations: {
          so: 'Waxaan raadinayaa heshiis wanaagsan oo ku saabsan qorshaha taleefanka.',
          sv: 'Jag letar efter ett bra erbjudande på ett mobilabonnemang.',
          en: 'Searching for a discounted phone plan.',
        },
        audioText: "I'm looking for a good deal on a phone plan.",
      },
    ],
  },

  // ==========================================
  // STEP 14 — "I'M LOOKING FOR..."
  // ==========================================
  {
    stepNumber: 14,
    badgeLabel: "I'M LOOKING FOR...",
    title: 'Reusable English Pattern',
    contextNote: 'Used when telling someone what you want to find or buy.',
    contextTranslations: {
      so: 'Waxaan raadinayaa...',
      sv: 'Jag letar efter...',
    },
    drills: [
      {
        id: 'pp-drill-14a',
        targetText: "I'm looking for a contract.",
        prompt: 'Pattern progression 1 of 3:',
        translations: {
          so: 'Waxaan raadinayaa qandaraas.',
          sv: 'Jag letar efter ett abonnemang med avtal.',
          en: "I'm looking for a contract.",
        },
        audioText: "I'm looking for a contract.",
      },
      {
        id: 'pp-drill-14b',
        targetText: "I'm looking for a good deal.",
        prompt: 'Pattern progression 2 of 3:',
        translations: {
          so: 'Waxaan raadinayaa heshiis wanaagsan.',
          sv: 'Jag letar efter ett bra erbjudande.',
          en: "I'm looking for a good deal.",
        },
        audioText: "I'm looking for a good deal.",
      },
      {
        id: 'pp-drill-14c',
        targetText: "I'm looking for a plan with unlimited data.",
        prompt: 'Pattern progression 3 of 3:',
        translations: {
          so: 'Waxaan raadinayaa qorshe leh data aan xad lahayn.',
          sv: 'Jag letar efter ett abonnemang med obegränsad data.',
          en: "I'm looking for a plan with unlimited data.",
        },
        audioText: "I'm looking for a plan with unlimited data.",
      },
    ],
  },

  // ==========================================
  // STEP 15 — COMPLETE THROUGH TYPING
  // ==========================================
  {
    stepNumber: 15,
    badgeLabel: 'COMPLETE THROUGH TYPING',
    title: 'Fill & Produce',
    contextNote: 'Type only the missing key word to complete the sentence.',
    drills: [
      {
        id: 'pp-drill-15a',
        targetText: 'unlimited',
        prompt: "I'm looking for a plan with ______ data.",
        fillIn: {
          prefix: "I'm looking for a plan with ",
          suffix: ' data.',
          fullSentence: "I'm looking for a plan with unlimited data.",
        },
        translations: {
          so: 'Waxaan raadinayaa qorshe leh data ______ (aan xad lahayn).',
          sv: 'Jag letar efter ett abonnemang med ______ (obegränsad) data.',
          en: 'Missing word: unlimited',
        },
        audioText: 'unlimited',
      },
      {
        id: 'pp-drill-15b',
        targetText: 'deal',
        prompt: "I'm looking for a good ____ on a phone plan.",
        fillIn: {
          prefix: "I'm looking for a good ",
          suffix: ' on a phone plan.',
          fullSentence: "I'm looking for a good deal on a phone plan.",
        },
        translations: {
          so: 'Waxaan raadinayaa ____ (heshiis) wanaagsan oo ku saabsan qorshaha taleefanka.',
          sv: 'Jag letar efter ett bra ____ (erbjudande) på ett mobilabonnemang.',
          en: 'Missing word: deal',
        },
        audioText: 'deal',
      },
      {
        id: 'pp-drill-15c',
        targetText: "I'm looking for a plan with unlimited data.",
        isRecallMode: true,
        prompt: 'TYPE FROM TRANSLATION:',
        translations: {
          so: 'Waxaan raadinayaa qorshe leh data aan xad lahayn.',
          sv: 'Jag letar efter ett abonnemang med obegränsad data.',
          en: 'I want a plan with unlimited data.',
        },
        hint: "I'm looking for a plan with un...",
      },
    ],
  },

  // ==========================================
  // STEP 16 — FEATURES
  // ==========================================
  {
    stepNumber: 16,
    badgeLabel: 'FEATURES',
    title: 'Plan Inclusions & Features',
    contextNote: 'Features = unlimited data · unlimited calls · strong signal',
    drills: [
      {
        id: 'pp-drill-16',
        targetText: "I'm looking for a plan with unlimited data.",
        speaker: {
          name: 'Shop Assistant',
          role: 'assistant',
          audioText: 'What kind of features are you looking for in your new plan?',
          text: 'What kind of features are you looking for in your new plan?',
          translation: {
            so: 'Maxay yihiin waxyaabaha aad ka rabto qorshahaaga cusub?',
            sv: 'Vilka funktioner eller egenskaper letar du efter i ditt nya abonnemang?',
            en: 'What plan features do you need?',
          },
        },
        prompt: 'Respond that you want unlimited data:',
        translations: {
          so: 'U sheeg inaad rabto qorshe leh data aan xad lahayn.',
          sv: 'Säg att du letar efter ett abonnemang med obegränsad data.',
          en: 'State your requirement for unlimited data.',
        },
        audioText: "I'm looking for a plan with unlimited data.",
      },
    ],
  },

  // ==========================================
  // STEP 17 — CONVERSATION MODE
  // ==========================================
  {
    stepNumber: 17,
    badgeLabel: 'CONVERSATION MODE',
    title: 'Store Greeting Turn',
    contextNote: 'Listen to the shop assistant and type your reply.',
    drills: [
      {
        id: 'pp-drill-17',
        targetText: "I'm looking for a new phone plan.",
        speaker: {
          name: 'Shop Assistant',
          role: 'assistant',
          audioText: 'Hi there! How can I help you?',
          text: 'Hi there! How can I help you?',
          translation: {
            so: 'Hayye! Sideen kuu caawin karaa?',
            sv: 'Hej! Hur kan jag hjälpa dig?',
            en: 'Friendly store greeting.',
          },
        },
        prompt: "Tell the assistant you're looking for a new phone plan:",
        translations: {
          so: 'Waxaan raadinayaa qorshe taleefan oo cusub.',
          sv: 'Jag letar efter ett nytt mobilabonnemang.',
          en: "I'm looking for a new phone plan.",
        },
        audioText: "I'm looking for a new phone plan.",
      },
    ],
  },

  // ==========================================
  // STEP 18 — CONVERSATION (Multi-Turn)
  // ==========================================
  {
    stepNumber: 18,
    badgeLabel: 'CONVERSATION',
    title: 'Dialogue Progression',
    contextNote: 'Respond to each question from the shop assistant in turn.',
    drills: [
      {
        id: 'pp-drill-18a',
        targetText: "I'm looking for a plan with unlimited data.",
        speaker: {
          name: 'Shop Assistant',
          role: 'assistant',
          audioText: 'What kind of features are you looking for in your new plan?',
          text: 'What kind of features are you looking for in your new plan?',
          translation: {
            so: 'Maxay yihiin waxyaabaha aad ka rabto qorshahaaga cusub?',
            sv: 'Vilka funktioner letar du efter i ditt nya abonnemang?',
            en: 'What features are you looking for?',
          },
        },
        prompt: 'Say that you want unlimited data:',
        translations: {
          so: 'Waxaan raadinayaa qorshe leh data aan xad lahayn.',
          sv: 'Jag letar efter ett abonnemang med obegränsad data.',
          en: 'Say you want unlimited data.',
        },
        audioText: "I'm looking for a plan with unlimited data.",
      },
      {
        id: 'pp-drill-18b',
        targetText: 'I prefer to send messages.',
        speaker: {
          name: 'Shop Assistant',
          role: 'assistant',
          audioText: 'Do you make a lot of phone calls?',
          text: 'Do you make a lot of phone calls?',
          translation: {
            so: 'Wicitaanno badan ma samaysaa?',
            sv: 'Ringer du många telefonsamtal?',
            en: 'Do you call often?',
          },
        },
        prompt: 'Say you prefer sending messages:',
        translations: {
          so: 'Waxaan doorbidaa inaan diro fariimo.',
          sv: 'Jag föredrar att skicka meddelanden.',
          en: 'I prefer to send messages.',
        },
        audioText: 'I prefer to send messages.',
      },
      {
        id: 'pp-drill-18c',
        targetText: 'I need a strong signal.',
        speaker: {
          name: 'Shop Assistant',
          role: 'assistant',
          audioText: 'Do you need good network coverage where you live?',
          text: 'Do you need good network coverage where you live?',
          translation: {
            so: 'Ma u baahan tahay shabakad fiican meesha aad ku nooshahay?',
            sv: 'Behöver du bra täckning där du bor?',
            en: 'Do you need good coverage?',
          },
        },
        prompt: 'Say that you need a strong signal:',
        translations: {
          so: 'Waxaan u baahanahay signal xooggan.',
          sv: 'Jag behöver en stark signal / bra täckning.',
          en: 'I need a strong signal.',
        },
        audioText: 'I need a strong signal.',
      },
    ],
  },

  // ==========================================
  // STEP 19 — HARDER CONVERSATION
  // ==========================================
  {
    stepNumber: 19,
    badgeLabel: 'HARDER CONVERSATION',
    title: 'Respond Without English Answer',
    contextNote: 'Produce the complete English reply based only on the prompt and meaning.',
    drills: [
      {
        id: 'pp-drill-19',
        targetText: "I'm looking for a plan with unlimited data and a strong signal.",
        isRecallMode: true,
        speaker: {
          name: 'Shop Assistant',
          role: 'assistant',
          audioText: 'What are you looking for?',
          text: 'What are you looking for?',
          translation: {
            so: 'Maxaad raadinaysaa?',
            sv: 'Vad letar du efter?',
            en: 'What are you looking for?',
          },
        },
        prompt: 'PRODUCE IN ENGLISH:',
        translations: {
          so: 'U sheeg inaad rabto qorshe leh data aan xad lahayn iyo signal fiican.',
          sv: 'Säg att du vill ha ett abonnemang med obegränsad data och bra täckning.',
          en: 'Tell the assistant you want a plan with unlimited data and a strong signal.',
        },
        hint: "I'm looking for a plan with un...",
      },
    ],
  },

  // ==========================================
  // STEP 20 — RECALL (5 Core Terms)
  // ==========================================
  {
    stepNumber: 20,
    badgeLabel: 'RECALL',
    title: 'Recall Vocabulary from Memory',
    contextNote: 'Type each term in English from memory without revealing audio.',
    drills: [
      {
        id: 'pp-drill-20a',
        targetText: 'pay-as-you-go plan',
        isRecallMode: true,
        prompt: 'RECALL 1 OF 5',
        translations: {
          so: 'Qorshe aad ku bixiso inta aad isticmaasho.',
          sv: 'Ett abonnemang där du betalar för det du använder.',
          en: 'A mobile plan where you pay for what you use.',
        },
        hint: 'pay-as-you-...',
      },
      {
        id: 'pp-drill-20b',
        targetText: 'contract',
        isRecallMode: true,
        prompt: 'RECALL 2 OF 5',
        translations: {
          so: 'Qandaraas / heshiis joogto ah.',
          sv: 'Ett avtal.',
          en: 'A formal regular agreement.',
        },
        hint: 'con...',
      },
      {
        id: 'pp-drill-20c',
        targetText: 'unlimited data',
        isRecallMode: true,
        prompt: 'RECALL 3 OF 5',
        translations: {
          so: 'Data aan xad lahayn.',
          sv: 'Obegränsad data.',
          en: 'Internet with no limits.',
        },
        hint: 'unlimited d...',
      },
      {
        id: 'pp-drill-20d',
        targetText: 'strong signal',
        isRecallMode: true,
        prompt: 'RECALL 4 OF 5',
        translations: {
          so: 'Signal xooggan.',
          sv: 'Stark signal / bra täckning.',
          en: 'Excellent wireless reception.',
        },
        hint: 'strong s...',
      },
      {
        id: 'pp-drill-20e',
        targetText: 'a good deal',
        isRecallMode: true,
        prompt: 'RECALL 5 OF 5',
        translations: {
          so: 'Qiimo ama heshiis wanaagsan.',
          sv: 'Ett bra erbjudande.',
          en: 'An attractive price or special offer.',
        },
        hint: 'a good d...',
      },
    ],
  },

  // ==========================================
  // STEP 21 — REVIEW PERSONAL MISTAKES
  // ==========================================
  {
    stepNumber: 21,
    badgeLabel: 'REVIEW MISTAKES',
    title: 'Reinforce Key Vocabulary',
    contextNote: 'One more time: practice key items to achieve full mastery.',
    drills: [
      {
        id: 'pp-drill-21',
        targetText: 'unlimited data',
        isRecallMode: true,
        prompt: 'ONE MORE TIME',
        translations: {
          so: 'Data aan xad lahayn.',
          sv: 'Obegränsad data.',
          en: 'Uncapped mobile internet.',
        },
        hint: 'unlimited...',
      },
    ],
  },

  // ==========================================
  // STEP 22 — FINAL REAL-LIFE CHALLENGE
  // ==========================================
  {
    stepNumber: 22,
    badgeLabel: 'REAL-LIFE CHALLENGE',
    title: 'The Store Request Challenge',
    contextNote: "You're buying a new phone plan. You watch lots of videos, need reliable signal, and want a good deal.",
    contextTranslations: {
      so: 'Qalbiga ku hay: waxaad daawataa fiidiyowyo badan, waxaad u baahan tahay signal la isku halleyn karo, waxaadna rabtaa heshiis fiican.',
      sv: 'Tänk på: du tittar på mycket video, behöver pålitlig täckning och vill ha ett bra erbjudande.',
    },
    drills: [
      {
        id: 'pp-drill-22',
        targetText: "I'm looking for a good deal on a plan with unlimited data and a strong signal.",
        isRecallMode: true,
        prompt: 'Tell the shop assistant what you are looking for:',
        translations: {
          so: 'Waxaan raadinayaa heshiis fiican oo ku saabsan qorshe leh data aan xad lahayn iyo signal xooggan.',
          sv: 'Jag letar efter ett bra erbjudande på ett abonnemang med obegränsad data och stark signal.',
          en: "Tell the shop assistant you want a good deal on a plan with unlimited data and strong signal.",
        },
        hint: "I'm looking for a good deal on a plan with un...",
      },
    ],
  },
];

export const PHONE_PLANS_LESSON: LanguageLesson = {
  id: 'en-phone-plans',
  language: 'en',
  title: 'Phone Plans',
  description: 'Learn how to understand and talk about mobile phone plans through structured typing.',
  category: 'Daily Life',
  level: 'Beginner',
  sentences: [
    {
      id: 'en-pp-s01',
      text: 'I stream videos on my cellphone, so I need a plan with lots of data.',
      translation: 'Waxaan fiidiyowyo ka daawadaa taleefankayga, sidaas darteed waxaan u baahanahay qorshe leh data badan.',
      hint: 'I stream videos on my cellphone...',
    },
    {
      id: 'en-pp-s02',
      text: "I don't want a contract. Do you have any pay-as-you-go plans?",
      translation: 'Ma rabo qandaraas. Ma haysaan wax qorshayaal pay-as-you-go ah?',
      hint: "I don't want a contract...",
    },
    {
      id: 'en-pp-s03',
      text: "I'm looking for a plan with unlimited data and a strong signal.",
      translation: 'Waxaan raadinayaa qorshe leh data aan xad lahayn iyo signal fiican.',
      hint: "I'm looking for a plan with unlimited data...",
    },
    {
      id: 'en-pp-s04',
      text: "I'm looking for a good deal on a phone plan.",
      translation: 'Waxaan raadinayaa heshiis wanaagsan oo ku saabsan qorshaha taleefanka.',
      hint: "I'm looking for a good deal...",
    },
  ],
};
