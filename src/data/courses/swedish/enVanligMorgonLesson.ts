import { StoryChapter, StoryVocabularyItem } from '../../../types/story';
import { LanguageLesson } from '../../../types/lessons';

export const EN_VANLIG_MORGON_VOCABULARY: StoryVocabularyItem[] = [
  {
    id: 'sv-morgon-1',
    word: 'en kall morgon',
    meaning: 'a cold morning',
    somaliTranslation: 'subax qabow',
    englishTranslation: 'a cold morning',
    exampleSentence: 'Det var en kall morgon i november.',
    audioText: 'en kall morgon',
  },
  {
    id: 'sv-morgon-2',
    word: 'komma ihåg',
    meaning: 'to remember',
    somaliTranslation: 'inaad xusuusato',
    englishTranslation: 'to remember',
    exampleSentence: 'Han försökte komma ihåg varför han hade ställt alarmet.',
    audioText: 'komma ihåg',
  },
  {
    id: 'sv-morgon-3',
    word: 'nya jobbet',
    meaning: 'the new job',
    somaliTranslation: 'shaqada cusub',
    englishTranslation: 'the new job',
    exampleSentence: 'Idag skulle han börja på sitt nya jobb.',
    audioText: 'nya jobbet',
  },
  {
    id: 'sv-morgon-4',
    word: 'flyttat',
    meaning: 'moved',
    somaliTranslation: 'u guuray',
    englishTranslation: 'moved',
    exampleSentence: 'Elias hade flyttat till Stockholm några månader tidigare.',
    audioText: 'flyttat',
  },
  {
    id: 'sv-morgon-5',
    word: 'dricka kaffe på morgonen',
    meaning: 'drink coffee in the morning',
    somaliTranslation: 'inaad qaxwo cabto subaxdii',
    englishTranslation: 'drink coffee in the morning',
    exampleSentence: 'Där brukade han dricka kaffe på morgonen.',
    audioText: 'dricka kaffe på morgonen',
  },
  {
    id: 'sv-morgon-6',
    word: 'halv åtta',
    meaning: 'half past seven (07:30)',
    somaliTranslation: 'todobadii iyo bar (07:30)',
    englishTranslation: 'half past seven (07:30)',
    exampleSentence: 'Klockan redan var halv åtta.',
    audioText: 'halv åtta',
    note: 'In Swedish, "halv åtta" literally means half to eight (07:30).',
  },
  {
    id: 'sv-morgon-7',
    word: 'bli sen',
    meaning: 'be late',
    somaliTranslation: 'soo daaho',
    englishTranslation: 'be late',
    exampleSentence: 'Jag kommer att bli sen.',
    audioText: 'bli sen',
  },
  {
    id: 'sv-morgon-8',
    word: 'på väg till jobbet',
    meaning: 'on the way to work',
    somaliTranslation: 'jidka shaqada ku socda',
    englishTranslation: 'on the way to work',
    exampleSentence: 'Människor som var på väg till jobbet.',
    audioText: 'på väg till jobbet',
  },
  {
    id: 'sv-morgon-9',
    word: 'andra sidan stan',
    meaning: 'the other side of town',
    somaliTranslation: 'dhinaca kale ee magaalada',
    englishTranslation: 'the other side of town',
    exampleSentence: 'Det nya jobbet låg på andra sidan stan.',
    audioText: 'andra sidan stan',
  },
];

export const FULL_STORY_TEXT = `Det var en kall morgon i november. Elias vaknade av att regnet slog mot fönstret. Han låg kvar i sängen några minuter och försökte komma ihåg varför han hade ställt alarmet så tidigt.

Sedan kom han ihåg.

Idag skulle han börja på sitt nya jobb.

Elias hade flyttat till Stockholm några månader tidigare. Han kände fortfarande inte staden särskilt bra, men han hade börjat hitta sina favoritplatser. Det fanns ett litet café nära hans lägenhet där han brukade dricka kaffe på morgonen.

Han gick upp, tog en snabb dusch och klädde på sig. När han kom ut i köket såg han att klockan redan var halv åtta.

"Jag kommer att bli sen", sa han för sig själv.

Han tog sin jacka och sprang nerför trapporna. Utanför huset var gatan full av människor som var på väg till jobbet. Bilar körde förbi och bussarna stannade vid hållplatserna.

Elias tittade på sin telefon.

08:12.

Han hade arton minuter på sig.

Det nya jobbet låg på andra sidan stan.`;

export const KAPITEL_1_CHAPTER: StoryChapter = {
  id: 'sv-b1-u02-c1',
  unitId: 'sv-b1-u-en-vanlig-morgon',
  chapterNumber: 1,
  title: 'Kapitel 1 – En vanlig morgon',
  subtitle: 'En vanlig morgon',
  description: 'Följ Elias under hans första morgon på ett nytt jobb. Lär dig vardagliga ord och uttryck genom att läsa, lyssna och skriva.',
  fullStoryText: FULL_STORY_TEXT,
  vocabulary: EN_VANLIG_MORGON_VOCABULARY,
  scenes: [
    // SCENE 1 — READ & LISTEN
    {
      id: 'scene-1',
      sceneNumber: 1,
      type: 'read_listen',
      badgeLabel: 'READ & LISTEN',
      icon: '🌧️',
      storyText: 'Det var en kall morgon i november.',
      audioText: 'Det var en kall morgon i november.',
      storyTranslations: {
        so: 'Waxay ahayd subax qabow bishii Nofembar.',
        en: 'It was a cold morning in November.',
      },
      actionLabel: 'Fortsätt / Continue',
    },

    // SCENE 2 — VOCABULARY & PHRASE
    {
      id: 'scene-2',
      sceneNumber: 2,
      type: 'type_phrase',
      badgeLabel: 'VOCABULARY',
      icon: '❄️',
      storyText: 'Det var en kall morgon i november.',
      audioText: 'en kall morgon',
      highlightWord: 'kall',
      highlightMeaning: {
        so: 'qabow',
        en: 'cold',
        note: 'morgon = subax / morning, november = Nofembar',
      },
      typingPrompt: 'Skriv frasen (Type the phrase):',
      typingTarget: 'en kall morgon',
      typingTranslations: {
        so: 'subax qabow',
        en: 'a cold morning',
      },
    },

    // SCENE 3 — TYPE THE SENTENCE
    {
      id: 'scene-3',
      sceneNumber: 3,
      type: 'type_sentence',
      badgeLabel: 'TYPE THE SENTENCE',
      icon: '🌧️',
      storyText: 'Det var en kall morgon i november.',
      audioText: 'Det var en kall morgon i november.',
      typingPrompt: 'Skriv hela meningen (Type the sentence):',
      typingTarget: 'Det var en kall morgon i november.',
      typingTranslations: {
        so: 'Waxay ahayd subax qabow bishii Nofembar.',
        en: 'It was a cold morning in November.',
      },
    },

    // SCENE 4 — READ STORY
    {
      id: 'scene-4',
      sceneNumber: 4,
      type: 'read_story',
      badgeLabel: 'READ STORY',
      icon: '🪟',
      storyText: 'Elias vaknade av att regnet slog mot fönstret.',
      audioText: 'Elias vaknade av att regnet slog mot fönstret.',
      highlightWord: 'vaknade',
      highlightMeaning: {
        so: 'soo toosay (regnet = roobka, fönstret = daaqadda)',
        en: 'woke up (regnet = the rain, fönstret = the window)',
      },
      storyTranslations: {
        so: 'Elias wuxuu ku toosay roobkii ku dhacayay daaqadda.',
        en: 'Elias woke up to the rain beating against the window.',
      },
      actionLabel: 'Fortsätt / Continue',
    },

    // SCENE 5 — TYPE THE PHRASE (komma ihåg)
    {
      id: 'scene-5',
      sceneNumber: 5,
      type: 'type_phrase',
      badgeLabel: 'TYPE THE PHRASE',
      icon: '🧠',
      storyText: 'Han låg kvar i sängen några minuter och försökte komma ihåg varför han hade ställt alarmet så tidigt.',
      audioText: 'komma ihåg',
      highlightWord: 'komma ihåg',
      highlightMeaning: {
        so: 'inaad xusuusato',
        en: 'to remember',
        note: 'sängen = sariirta, några minuter = dhowr daqiiqo, alarmet = alaarmiga',
      },
      typingPrompt: 'Skriv det viktiga uttrycket (Type the phrase):',
      typingTarget: 'komma ihåg',
      typingTranslations: {
        so: 'inaad xusuusato',
        en: 'to remember',
      },
    },

    // SCENE 6 — READ & UNDERSTAND
    {
      id: 'scene-6',
      sceneNumber: 6,
      type: 'read_understand',
      badgeLabel: 'READ & UNDERSTAND',
      icon: '⏰',
      storyText: 'Han låg kvar i sängen några minuter och försökte komma ihåg varför han hade ställt alarmet så tidigt.',
      audioText: 'Han försökte komma ihåg varför han hade ställt alarmet så tidigt.',
      storyTranslations: {
        so: 'Wuxuu sariirta ku jiray dhowr daqiiqo isagoo isku dayaya inuu xusuusto sababta uu alaarmiga ugu xiray waqti hore.',
        en: 'He stayed in bed for a few minutes trying to remember why he had set the alarm so early.',
      },
      actionLabel: 'Fortsätt / Continue',
    },

    // SCENE 7 — RECALL (Recall meaning: remember)
    {
      id: 'scene-7',
      sceneNumber: 7,
      type: 'recall',
      badgeLabel: 'RECALL',
      icon: '💡',
      storyText: 'Han försökte komma ihåg varför han hade ställt alarmet så tidigt.',
      isRecallMode: true,
      hint: 'k... i...',
      typingPrompt: 'Vad heter "to remember" på svenska? (Recall and type):',
      typingTarget: 'komma ihåg',
      typingTranslations: {
        so: 'xusuuso / inaad xusuusato',
        en: 'to remember',
      },
    },

    // SCENE 8 — STORY
    {
      id: 'scene-8',
      sceneNumber: 8,
      type: 'read_story',
      badgeLabel: 'STORY',
      icon: '💼',
      storyText: 'Sedan kom han ihåg. Idag skulle han börja på sitt nya jobb.',
      audioText: 'Sedan kom han ihåg. Idag skulle han börja på sitt nya jobb.',
      highlightWord: 'nya jobbet',
      highlightMeaning: {
        so: 'shaqada cusub (börja = bilaabo)',
        en: 'the new job (börja = to start)',
      },
      storyTranslations: {
        so: 'Kadib wuu xusuustay. Maanta wuxuu bilaabi lahaa shaqadiisa cusub.',
        en: 'Then he remembered. Today he was going to start his new job.',
      },
      actionLabel: 'Fortsätt / Continue',
    },

    // SCENE 9 — TYPE THE SENTENCE
    {
      id: 'scene-9',
      sceneNumber: 9,
      type: 'type_sentence',
      badgeLabel: 'TYPE THE SENTENCE',
      icon: '💼',
      storyText: 'Idag skulle han börja på sitt nya jobb.',
      audioText: 'Idag skulle han börja på sitt nya jobb.',
      typingPrompt: 'Skriv meningen (Type the sentence):',
      typingTarget: 'Idag skulle han börja på sitt nya jobb.',
      typingTranslations: {
        so: 'Maanta wuxuu bilaabi lahaa shaqadiisa cusub.',
        en: 'Today he was going to start his new job.',
      },
    },

    // SCENE 10 — STORY
    {
      id: 'scene-10',
      sceneNumber: 10,
      type: 'read_story',
      badgeLabel: 'STORY',
      icon: '🏙️',
      storyText: 'Elias hade flyttat till Stockholm några månader tidigare. Han kände fortfarande inte staden särskilt bra, men han hade börjat hitta sina favoritplatser.',
      audioText: 'Elias hade flyttat till Stockholm några månader tidigare.',
      highlightWord: 'flyttat',
      highlightMeaning: {
        so: 'u guuray (staden = magaalada, favoritplatser = meelaha uu jecel yahay)',
        en: 'moved (staden = the city, favoritplatser = favorite places)',
      },
      storyTranslations: {
        so: 'Elias wuxuu u soo guuray Stockholm dhowr bilood ka hor. Wali magaalada si fiican uma aqoonin, laakiin wuxuu bilaabay inuu helo meelaha uu ugu jecel yahay.',
        en: 'Elias had moved to Stockholm a few months earlier. He still did not know the city very well, but he had started finding his favorite places.',
      },
      actionLabel: 'Fortsätt / Continue',
    },

    // SCENE 11 — VOCABULARY IN CONTEXT
    {
      id: 'scene-11',
      sceneNumber: 11,
      type: 'vocabulary_context',
      badgeLabel: 'VOCABULARY IN CONTEXT',
      icon: '📍',
      storyText: 'Elias hade flyttat till Stockholm några månader tidigare.',
      audioText: 'Elias hade flyttat till Stockholm.',
      highlightWord: 'flyttat',
      highlightMeaning: {
        so: 'u guuray',
        en: 'moved / had moved',
      },
      typingPrompt: 'Skriv meningen i sammanhang (Type the sentence):',
      typingTarget: 'Elias hade flyttat till Stockholm.',
      typingTranslations: {
        so: 'Elias wuxuu u guuray Stockholm.',
        en: 'Elias had moved to Stockholm.',
      },
    },

    // SCENE 12 — STORY
    {
      id: 'scene-12',
      sceneNumber: 12,
      type: 'read_story',
      badgeLabel: 'STORY',
      icon: '☕',
      storyText: 'Det fanns ett litet café nära hans lägenhet där han brukade dricka kaffe på morgonen.',
      audioText: 'Det fanns ett litet café nära hans lägenhet där han brukade dricka kaffe på morgonen.',
      highlightWord: 'café',
      highlightMeaning: {
        so: 'kafateeri (lägenhet = guri/dabaq, brukade = wuxuu caado u lahaa)',
        en: 'café (lägenhet = apartment, brukade = used to)',
      },
      storyTranslations: {
        so: 'Waxaa jiray kafateeri yar oo u dhow gurigiisa halkaas oo uu caado u lahaa inuu qaxwo ku cabo subaxdii.',
        en: 'There was a small café near his apartment where he used to drink coffee in the morning.',
      },
      actionLabel: 'Fortsätt / Continue',
    },

    // SCENE 13 — PHRASE
    {
      id: 'scene-13',
      sceneNumber: 13,
      type: 'type_phrase',
      badgeLabel: 'PHRASE',
      icon: '☕',
      storyText: 'Det fanns ett litet café nära hans lägenhet där han brukade dricka kaffe på morgonen.',
      audioText: 'dricka kaffe på morgonen',
      highlightWord: 'dricka kaffe på morgonen',
      highlightMeaning: {
        so: 'inaad qaxwo cabto subaxdii',
        en: 'drink coffee in the morning',
      },
      typingPrompt: 'Skriv den naturliga frasen (Type the phrase):',
      typingTarget: 'dricka kaffe på morgonen',
      typingTranslations: {
        so: 'inaad qaxwo cabto subaxdii',
        en: 'drink coffee in the morning',
      },
    },

    // SCENE 14 — STORY & GRAMMAR (halv åtta)
    {
      id: 'scene-14',
      sceneNumber: 14,
      type: 'read_understand',
      badgeLabel: 'STORY',
      icon: '⏰',
      storyText: 'Han gick upp, tog en snabb dusch och klädde på sig. När han kom ut i köket såg han att klockan redan var halv åtta.',
      audioText: 'När han kom ut i köket såg han att klockan redan var halv åtta.',
      highlightWord: 'halv åtta',
      highlightMeaning: {
        so: '07:30 (todobadii iyo bar)',
        en: 'half past seven (07:30)',
      },
      grammarNote: 'Tid på svenska: "Halv åtta" betyder bokstavligen halvvägs till åtta, det vill säga 07:30! (In Swedish, "halv åtta" means 07:30, not 08:30).',
      storyTranslations: {
        so: 'Wuu kacay, si degdeg ah ayuu u mayrtay oo dhar gashaday. Markii uu jikada soo galay wuxuu arkay in saacaddu tahay todobadii iyo bar (07:30).',
        en: 'He got up, took a quick shower, and got dressed. When he came out into the kitchen, he saw that the clock was already half past seven (07:30).',
      },
      actionLabel: 'Fortsätt / Continue',
    },

    // SCENE 15 — TYPE THE PHRASE (halv åtta)
    {
      id: 'scene-15',
      sceneNumber: 15,
      type: 'type_phrase',
      badgeLabel: 'TYPE THE PHRASE',
      icon: '⏰',
      storyText: 'När han kom ut i köket såg han att klockan redan var halv åtta.',
      audioText: 'halv åtta',
      highlightWord: 'halv åtta',
      highlightMeaning: {
        so: 'todobadii iyo bar (07:30)',
        en: 'half past seven (07:30)',
      },
      typingPrompt: 'Skriv klockslaget (Type the time phrase):',
      typingTarget: 'halv åtta',
      typingTranslations: {
        so: 'todobadii iyo bar (07:30)',
        en: 'half past seven (07:30)',
      },
    },

    // SCENE 16 — DIALOGUE / THOUGHT
    {
      id: 'scene-16',
      sceneNumber: 16,
      type: 'dialogue_thought',
      badgeLabel: 'DIALOGUE / THOUGHT',
      icon: '💬',
      storyText: '"Jag kommer att bli sen", sa han för sig själv.',
      audioText: 'Jag kommer att bli sen, sa han för sig själv.',
      highlightWord: 'bli sen',
      highlightMeaning: {
        so: 'soo daaho (för sig själv = nafsaddiisa)',
        en: 'be late (för sig själv = to himself)',
      },
      typingPrompt: 'Skriv Elias tanke (Type what Elias said):',
      typingTarget: 'Jag kommer att bli sen.',
      typingTranslations: {
        so: 'Waan soo daahi doonaa.',
        en: 'I am going to be late.',
      },
    },

    // SCENE 17 — VOCABULARY IN ACTION (på väg till jobbet)
    {
      id: 'scene-17',
      sceneNumber: 17,
      type: 'type_phrase',
      badgeLabel: 'VOCABULARY',
      icon: '🏃',
      storyText: 'Han tog sin jacka och sprang nerför trapporna. Utanför huset var gatan full av människor som var på väg till jobbet.',
      audioText: 'Utanför huset var gatan full av människor som var på väg till jobbet.',
      highlightWord: 'på väg till jobbet',
      highlightMeaning: {
        so: 'jidka shaqada ku socda (jacka = jaakad, sprang = orday, trapporna = jaranjarooyinka)',
        en: 'on the way to work (jacka = jacket, sprang = ran, trapporna = stairs)',
      },
      typingPrompt: 'Skriv det användbara uttrycket (Type the phrase):',
      typingTarget: 'på väg till jobbet',
      typingTranslations: {
        so: 'jidka shaqada ku socda',
        en: 'on the way to work',
      },
    },

    // SCENE 18 — STORY
    {
      id: 'scene-18',
      sceneNumber: 18,
      type: 'read_story',
      badgeLabel: 'STORY',
      icon: '📱',
      storyText: 'Bilar körde förbi och bussarna stannade vid hållplatserna. Elias tittade på sin telefon.\n\n08:12.\n\nHan hade arton minuter på sig.\nDet nya jobbet låg på andra sidan stan.',
      audioText: 'Elias tittade på sin telefon. Noll åtta tolv. Han hade arton minuter på sig. Det nya jobbet låg på andra sidan stan.',
      highlightWord: 'andra sidan stan',
      highlightMeaning: {
        so: 'dhinaca kale ee magaalada (hållplatserna = boosteejooyinka, arton minuter = 18 daqiiqo)',
        en: 'the other side of town (hållplatserna = bus stops, arton minuter = 18 minutes)',
      },
      storyTranslations: {
        so: 'Baabuurtu way soo dhaafayeen basaskuna waxay istaagayeen boosteejooyinka. Elias wuxuu eegay taleefankiisa. 08:12. Wuxuu haystay siddeed iyo toban daqiiqo. Shaqada cusub waxay ku taallay dhinaca kale ee magaalada.',
        en: 'Cars drove past and buses stopped at the stops. Elias looked at his phone. 08:12. He had eighteen minutes. The new job was on the other side of town.',
      },
      actionLabel: 'Fortsätt / Continue',
    },

    // SCENE 19 — FINAL RECALL
    {
      id: 'scene-19',
      sceneNumber: 19,
      type: 'recall',
      badgeLabel: 'FINAL RECALL',
      icon: '🚇',
      storyText: 'Det nya jobbet låg på andra sidan stan.',
      isRecallMode: true,
      hint: 'D... n... j... l... p... a... s... s...',
      typingPrompt: 'Skriv den sista meningen ur minnet (Type from memory):',
      typingTarget: 'Det nya jobbet låg på andra sidan stan.',
      typingTranslations: {
        so: 'Shaqada cusub waxay ku taallay dhinaca kale ee magaalada.',
        en: 'The new job was on the other side of town.',
      },
    },

    // SCENE 20 — CHAPTER END
    {
      id: 'scene-20',
      sceneNumber: 20,
      type: 'chapter_summary',
      badgeLabel: 'KAPITEL 1 KLART',
      icon: '🎉',
      storyText: 'Bra jobbat! Du har läst, lyssnat och skrivit dig igenom Kapitel 1 av "En vanlig morgon".',
      storyTranslations: {
        so: 'Shaqo wacan! Waxaad akhrisatay, dhegeysatay, oo aad qortay cutubka 1-aad.',
        en: 'Great job! You have read, listened, and typed your way through Chapter 1.',
      },
      actionLabel: 'Avsluta lektionen / Complete',
    },
  ],
};

// Compatible LanguageLesson representation for existing routing and registry
export const EN_VANLIG_MORGON_LESSON: LanguageLesson = {
  id: 'sv-en-vanlig-morgon',
  language: 'sv',
  title: 'En vanlig morgon',
  description: 'Följ Elias under hans första morgon på ett nytt jobb. Lär dig vardagliga ord och uttryck genom att läsa, lyssna och skriva.',
  category: 'Daily Life',
  level: 'Beginner',
  sentences: [
    {
      id: 'morgon-s1',
      text: 'Det var en kall morgon i november.',
      translation: 'Waxay ahayd subax qabow bishii Nofembar.',
    },
    {
      id: 'morgon-s2',
      text: 'Elias vaknade av att regnet slog mot fönstret.',
      translation: 'Elias wuxuu ku toosay roobkii ku dhacayay daaqadda.',
    },
    {
      id: 'morgon-s3',
      text: 'Han försökte komma ihåg varför han hade ställt alarmet.',
      translation: 'Wuxuu isku dayay inuu xusuusto sababta uu alaarmiga u xiray.',
    },
    {
      id: 'morgon-s4',
      text: 'Idag skulle han börja på sitt nya jobb.',
      translation: 'Maanta wuxuu bilaabi lahaa shaqadiisa cusub.',
    },
    {
      id: 'morgon-s5',
      text: 'Elias hade flyttat till Stockholm några månader tidigare.',
      translation: 'Elias wuxuu u soo guuray Stockholm dhowr bilood ka hor.',
    },
    {
      id: 'morgon-s6',
      text: 'Där brukade han dricka kaffe på morgonen.',
      translation: 'Halkaas wuxuu caado u lahaa inuu qaxwo ku cabo subaxdii.',
    },
    {
      id: 'morgon-s7',
      text: 'När han kom ut i köket såg han att klockan redan var halv åtta.',
      translation: 'Markii uu jikada soo galay wuxuu arkay in saacaddu tahay 07:30.',
    },
    {
      id: 'morgon-s8',
      text: 'Jag kommer att bli sen.',
      translation: 'Waan soo daahi doonaa.',
    },
    {
      id: 'morgon-s9',
      text: 'Människor som var på väg till jobbet.',
      translation: 'Dad ku socday jidka shaqada.',
    },
    {
      id: 'morgon-s10',
      text: 'Det nya jobbet låg på andra sidan stan.',
      translation: 'Shaqada cusub waxay ku taallay dhinaca kale ee magaalada.',
    },
  ],
};

// Telegram-ready vocabulary items for future companion reviews
export const EN_VANLIG_MORGON_TELEGRAM_ITEMS = [
  {
    word: 'komma ihåg',
    meaning: 'to remember',
    somali: 'inaad xusuusato',
    exampleSentence: 'Han försökte komma ihåg varför han hade ställt alarmet.',
    audioText: 'Han försökte komma ihåg varför han hade ställt alarmet.',
    lessonId: 'sv-en-vanlig-morgon',
    chapterId: 'sv-b1-u02-c1',
  },
  {
    word: 'halv åtta',
    meaning: 'half past seven (07:30)',
    somali: 'todobadii iyo bar (07:30)',
    exampleSentence: 'Klockan redan var halv åtta.',
    audioText: 'Klockan redan var halv åtta.',
    lessonId: 'sv-en-vanlig-morgon',
    chapterId: 'sv-b1-u02-c1',
  },
  {
    word: 'på väg till jobbet',
    meaning: 'on the way to work',
    somali: 'jidka shaqada ku socda',
    exampleSentence: 'Utanför huset var gatan full av människor som var på väg till jobbet.',
    audioText: 'Utanför huset var gatan full av människor som var på väg till jobbet.',
    lessonId: 'sv-en-vanlig-morgon',
    chapterId: 'sv-b1-u02-c1',
  },
  {
    word: 'bli sen',
    meaning: 'be late',
    somali: 'soo daaho',
    exampleSentence: 'Jag kommer att bli sen, sa han för sig själv.',
    audioText: 'Jag kommer att bli sen, sa han för sig själv.',
    lessonId: 'sv-en-vanlig-morgon',
    chapterId: 'sv-b1-u02-c1',
  },
];
