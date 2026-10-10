/**
 * Straightforward Elementary (Units 1–2D) Comprehensive Curriculum
 * 16 structured lessons covering all required examination categories.
 * Contains explanations, examples, vocabulary, audio targets, and self-checking practice.
 */

export interface LessonExample {
  id: string;
  english: string;
  german: string;
  note?: string;
}

export interface LessonPracticeQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'word-order' | 'translation';
  prompt: string;
  context?: string;
  options?: string[]; // for multiple choice
  words?: string[]; // for word ordering
  expectedAnswer: string;
  alternateAnswers?: string[];
  explanation: string;
  hint?: string;
}

export interface ExamLesson {
  id: string;
  number: number;
  title: string;
  unit: string;
  category: string;
  estimatedMinutes: number;
  description: string;
  explanation: string;
  rules: { rule: string; example: string }[];
  examples: LessonExample[];
  readingPassage?: {
    title: string;
    text: string;
  };
  keyVocabularyIds: string[];
  practiceQuestions: LessonPracticeQuestion[];
}

export const EXAM_LESSONS: ExamLesson[] = [
  // 1. Reading Comprehension
  {
    id: 'lesson-01',
    number: 1,
    title: 'Reading Comprehension: Emily in Canada',
    unit: 'Unit 1A & 2A',
    category: 'Reading Comprehension',
    estimatedMinutes: 15,
    description: 'Read and understand authentic personal profiles, daily habits, and life details of people living abroad.',
    explanation: 'When reading an English text for an exam, scan first for key facts: names, ages, hometowns, jobs, and daily routines. Pay close attention to question words like Where (place), How old (age), What (object/job), and Why (reason). Do not worry about unfamiliar words — look at the surrounding sentences for context clues.',
    rules: [
      {
        rule: 'Scan for names, numbers and places first',
        example: '"Emily is 29 years old and comes from Bristol, England."',
      },
      {
        rule: 'Match question words with text details',
        example: 'Where = place (Vancouver), Why = reason (because office is far).',
      },
    ],
    readingPassage: {
      title: 'Emily — revision practice based on my course notes',
      text: 'Emily is 29 years old and comes from Bristol, England. She is a graphic designer. Three years ago, she moved to Canada. Now, she lives in Vancouver in an apartment on the tenth floor. Her apartment has a beautiful view of the mountains and the city, and it is near a park. After work, she often walks in the park. She has a Canadian boyfriend. She takes the bus to work because her office is far away. In Vancouver, the weather is colder than in England, and it snows in winter. In winter, Emily goes skiing with her boyfriend, and in summer she goes hiking. She loves Canada, but she misses her family, her friends, and English tea.',
    },
    examples: [
      {
        id: 'ex-01-1',
        english: 'Where does Emily come from? She comes from Bristol, England.',
        german: 'Woher kommt Emily? Sie kommt aus Bristol, England.',
      },
      {
        id: 'ex-01-2',
        english: 'Why does she take the bus? Because her office is far away.',
        german: 'Warum nimmt sie den Bus? Weil ihr Büro weit weg ist.',
      },
    ],
    keyVocabularyIds: ['v-uk-british', 'v-live', 'v-work', 'v-tea', 'v-coffee', 'v-weekend'],
    practiceQuestions: [
      {
        id: 'q-01-1',
        type: 'multiple-choice',
        prompt: 'Where does Emily come from?',
        options: ['Bristol, England', 'Vancouver, Canada', 'Manchester, UK', 'London, England'],
        expectedAnswer: 'Bristol, England',
        explanation: 'The text states: "Emily is 29 years old and comes from Bristol, England."',
      },
      {
        id: 'q-01-2',
        type: 'multiple-choice',
        prompt: 'What is Emily\'s job?',
        options: ['Graphic designer', 'English teacher', 'Doctor', 'Nurse'],
        expectedAnswer: 'Graphic designer',
        explanation: 'The text says: "She is a graphic designer."',
      },
      {
        id: 'q-01-3',
        type: 'multiple-choice',
        prompt: 'Why does Emily take the bus to work?',
        options: [
          'Because her office is far away',
          'Because she does not have a bicycle',
          'Because it is too hot outside',
          'Because her boyfriend drives the bus',
        ],
        expectedAnswer: 'Because her office is far away',
        explanation: 'The text states: "She takes the bus to work because her office is far away."',
      },
      {
        id: 'q-01-4',
        type: 'fill-blank',
        prompt: 'What does Emily do in winter with her boyfriend? She goes _______.',
        expectedAnswer: 'skiing',
        alternateAnswers: ['ski'],
        explanation: 'The text says: "In winter, Emily goes skiing with her boyfriend, and in summer she goes hiking."',
      },
      {
        id: 'q-01-5',
        type: 'multiple-choice',
        prompt: 'What does Emily miss about England?',
        options: [
          'Her family, friends, and English tea',
          'The weather and the mountains',
          'Her apartment on the tenth floor',
          'Taking the bus to work',
        ],
        expectedAnswer: 'Her family, friends, and English tea',
        explanation: 'The final sentence states: "She loves Canada, but she misses her family, her friends, and English tea."',
      },
    ],
  },

  // 2. The verb to be: am, is, are
  {
    id: 'lesson-02',
    number: 2,
    title: 'The Verb "to be": am, is, are',
    unit: 'Unit 1A & 1D',
    category: 'Grammar',
    estimatedMinutes: 12,
    description: 'Master the forms of "to be" in positive statements, negative sentences, and questions.',
    explanation: 'The verb "to be" is the most important verb in English. We use it to describe identity, age, origin, and professions. In spoken and informal English, we usually use contractions (short forms): I am -> I\'m, he is -> he\'s, they are -> they\'re.',
    rules: [
      { rule: 'I am (I\'m) / I am not (I\'m not)', example: 'I am a student.' },
      { rule: 'He / She / It is (isn\'t)', example: 'She is from Germany. He isn\'t tired.' },
      { rule: 'You / We / They are (aren\'t)', example: 'We are in the classroom. They aren\'t late.' },
      { rule: 'Questions: Invert the verb and subject', example: 'Are you ready? Yes, I am. / Is he your brother?' },
    ],
    examples: [
      {
        id: 'ex-02-1',
        english: 'I am 25 years old and she is 28.',
        german: 'Ich bin 25 Jahre alt und sie ist 28.',
      },
      {
        id: 'ex-02-2',
        english: 'Are they from Italy? No, they are from Spain.',
        german: 'Sind sie aus Italien? Nein, sie sind aus Spanien.',
      },
      {
        id: 'ex-02-3',
        english: 'This book isn\'t expensive.',
        german: 'Dieses Buch ist nicht teuer.',
      },
    ],
    keyVocabularyIds: ['v-germany-german', 'v-italy-italian', 'v-spain-spanish'],
    practiceQuestions: [
      {
        id: 'q-02-1',
        type: 'fill-blank',
        prompt: 'Sarah _______ from London. (be)',
        expectedAnswer: 'is',
        explanation: 'Use "is" with third-person singular (she / Sarah).',
      },
      {
        id: 'q-02-2',
        type: 'multiple-choice',
        prompt: 'Choose the correct question:',
        options: ['Are you a student?', 'Is you a student?', 'Am you a student?', 'You are a student?'],
        expectedAnswer: 'Are you a student?',
        explanation: 'Questions with "you" use "Are you...?" with inversion.',
      },
      {
        id: 'q-02-3',
        type: 'fill-blank',
        prompt: 'They _______ (not be) German. They are Austrian.',
        expectedAnswer: 'are not',
        alternateAnswers: ["aren't", 'arent'],
        explanation: 'Use "are not" or "aren\'t" with they in negative statements.',
      },
    ],
  },

  // 3. Present simple: positive, negative, and questions
  {
    id: 'lesson-03',
    number: 3,
    title: 'Present Simple: Habits, Facts & Routines',
    unit: 'Unit 2B',
    category: 'Grammar',
    estimatedMinutes: 15,
    description: 'Learn when and how to use the present simple with I, you, we, they and he, she, it.',
    explanation: 'We use the Present Simple to talk about habits, regular routines, and general facts. The most important rule to remember is the third-person "s" (he/she/it walks, lives, studies). For negatives and questions, we use the helper verb do / does.',
    rules: [
      { rule: 'Add -s or -es with he / she / it', example: 'I live in Berlin, but he lives in Munich.' },
      { rule: 'Negative: don\'t / doesn\'t + base verb', example: 'I don\'t drink coffee. She doesn\'t work on Sundays.' },
      { rule: 'Questions: Do / Does + subject + base verb', example: 'Do you play tennis? Does he speak French?' },
    ],
    examples: [
      {
        id: 'ex-03-1',
        english: 'He works in a bank and drinks tea every day.',
        german: 'Er arbeitet in einer Bank und trinkt jeden Tag Tee.',
      },
      {
        id: 'ex-03-2',
        english: 'Do you live in an apartment or a house?',
        german: 'Wohnst du in einer Wohnung oder in einem Haus?',
      },
      {
        id: 'ex-03-3',
        english: 'She doesn\'t watch television during the week.',
        german: 'Sie schaut unter der Woche kein Fernsehen.',
      },
    ],
    keyVocabularyIds: ['v-live', 'v-work', 'v-study', 'v-speak', 'v-watch-tv'],
    practiceQuestions: [
      {
        id: 'q-03-1',
        type: 'fill-blank',
        prompt: 'Marcus _______ (live) in a small town near Hamburg.',
        expectedAnswer: 'lives',
        explanation: 'Third-person singular (he / Marcus) requires the ending -s.',
      },
      {
        id: 'q-03-2',
        type: 'multiple-choice',
        prompt: 'Which sentence is grammatically correct?',
        options: [
          'She doesn\'t likes coffee.',
          'She doesn\'t like coffee.',
          'She don\'t like coffee.',
          'She not like coffee.',
        ],
        expectedAnswer: 'She doesn\'t like coffee.',
        explanation: 'After "doesn\'t", always use the base form of the main verb ("like", not "likes").',
      },
      {
        id: 'q-03-3',
        type: 'fill-blank',
        prompt: '_______ you speak English at home? (Do / Does)',
        expectedAnswer: 'Do',
        alternateAnswers: ['do'],
        explanation: 'Use "Do" with the subject "you".',
      },
    ],
  },

  // 4. Articles: a, an, and no article
  {
    id: 'lesson-04',
    number: 4,
    title: 'Articles: a, an, and No Article',
    unit: 'Unit 1B & 2A',
    category: 'Grammar',
    estimatedMinutes: 10,
    description: 'Understand the sound rule for "a" vs "an", and when no article is used.',
    explanation: 'We use the indefinite article "a" or "an" with singular, countable nouns. The rule depends on the SOUND that follows: use "a" before a consonant sound (a pen, a book, a university) and "an" before a vowel sound (an apple, an umbrella, an hour). We do NOT use an article with plural nouns or uncountable things in general.',
    rules: [
      { rule: 'a + consonant sound', example: 'a bag, a teacher, a coffee, a dictionary.' },
      { rule: 'an + vowel sound (a, e, i, o, u)', example: 'an apple, an orange, an umbrella, an elephant.' },
      { rule: 'No article with plurals & uncountables in general', example: 'I like books. Water is good for health.' },
    ],
    examples: [
      {
        id: 'ex-04-1',
        english: 'I have a notebook and an orange in my bag.',
        german: 'Ich habe ein Notizheft und eine Orange in meiner Tasche.',
      },
      {
        id: 'ex-04-2',
        english: 'She is an English teacher at a language school.',
        german: 'Sie ist eine Englischlehrerin an einer Sprachschule.',
      },
    ],
    keyVocabularyIds: ['v-umbrella', 'v-apple', 'v-notebook', 'v-pen'],
    practiceQuestions: [
      {
        id: 'q-04-1',
        type: 'multiple-choice',
        prompt: 'Choose the correct article: "Please take _______ umbrella with you."',
        options: ['a', 'an', 'the no article', 'two'],
        expectedAnswer: 'an',
        explanation: '"Umbrella" begins with a vowel sound (/ʌ/), so we use "an".',
      },
      {
        id: 'q-04-2',
        type: 'fill-blank',
        prompt: 'He has _______ new laptop on his desk. (a / an)',
        expectedAnswer: 'a',
        explanation: '"New" begins with a consonant sound (/n/), so we use "a".',
      },
      {
        id: 'q-04-3',
        type: 'multiple-choice',
        prompt: 'Which phrase is correct?',
        options: ['an apple', 'a apple', 'a orange', 'an notebook'],
        expectedAnswer: 'an apple',
        explanation: '"Apple" starts with a vowel sound, requiring "an".',
      },
    ],
  },

  // 5. Demonstratives: this, that, these, those
  {
    id: 'lesson-05',
    number: 5,
    title: 'Demonstratives: this, that, these, those',
    unit: 'Unit 1C',
    category: 'Grammar',
    estimatedMinutes: 12,
    description: 'Point to things near and far, singular and plural.',
    explanation: 'Demonstratives show how close or far something is in space or time. "This" (here, 1 thing) and "these" (here, 2+ things) are near. "That" (there, 1 thing) and "those" (there, 2+ things) are far away.',
    rules: [
      { rule: 'this (singular, near)', example: 'This is my pen in my hand.' },
      { rule: 'these (plural, near)', example: 'These are my keys on my desk.' },
      { rule: 'that (singular, far)', example: 'That is my coat over there on the chair.' },
      { rule: 'those (plural, far)', example: 'Those are students in the garden.' },
    ],
    examples: [
      {
        id: 'ex-05-1',
        english: 'Are these your glasses? Yes, they are.',
        german: 'Ist das deine Brille (hier)? Ja, das ist sie.',
      },
      {
        id: 'ex-05-2',
        english: 'What is that on the whiteboard? It is a map.',
        german: 'Was ist das dort an der Tafel? Es ist eine Landkarte.',
      },
    ],
    keyVocabularyIds: ['v-keys', 'v-glasses', 'v-bag'],
    practiceQuestions: [
      {
        id: 'q-05-1',
        type: 'fill-blank',
        prompt: '_______ (plural, here) are my new books.',
        expectedAnswer: 'These',
        alternateAnswers: ['these'],
        explanation: '"These" is used for plural objects near the speaker.',
      },
      {
        id: 'q-05-2',
        type: 'multiple-choice',
        prompt: 'Look at the picture over there! Who is _______ man?',
        options: ['that', 'this', 'these', 'those'],
        expectedAnswer: 'that',
        explanation: 'Singular and far away = "that".',
      },
    ],
  },

  // 6. Possessive adjectives and possessive 's
  {
    id: 'lesson-06',
    number: 6,
    title: 'Possessive Adjectives & Possessive \'s',
    unit: 'Unit 1C & 2C',
    category: 'Grammar',
    estimatedMinutes: 14,
    description: 'Express ownership using my, your, his, her, our, their and noun\'s.',
    explanation: 'To show who owns an item, use possessive adjectives: my, your, his (for a man), her (for a woman), its (for things/animals), our, their. When mentioning a person\'s name, add \'s (apostrophe s): John\'s car, my sister\'s house.',
    rules: [
      { rule: 'his = a man\'s possession / her = a woman\'s possession', example: 'His name is Marco. Her name is Maria.' },
      { rule: 'their = possession of 2+ people', example: 'Their parents live in Spain.' },
      { rule: 'Name + \'s', example: 'David\'s bag is under the desk.' },
    ],
    examples: [
      {
        id: 'ex-06-1',
        english: 'This is my brother\'s laptop.',
        german: 'Das ist der Laptop meines Bruders.',
      },
      {
        id: 'ex-06-2',
        english: 'What is her telephone number?',
        german: 'Wie lautet ihre Telefonnummer?',
      },
    ],
    keyVocabularyIds: ['v-brother', 'v-sister', 'v-parents', 'v-wallet'],
    practiceQuestions: [
      {
        id: 'q-06-1',
        type: 'fill-blank',
        prompt: 'Elena is a doctor. _______ (She) hospital is in Madrid.',
        expectedAnswer: 'Her',
        alternateAnswers: ['her'],
        explanation: 'The possessive adjective for she is "Her".',
      },
      {
        id: 'q-06-2',
        type: 'multiple-choice',
        prompt: 'Which sentence correctly shows ownership?',
        options: [
          'This is Sarah\'s notebook.',
          'This is Sarahs\' notebook.',
          'This is Sarah notebook.',
          'This is the Sarah\'s notebook.',
        ],
        expectedAnswer: 'This is Sarah\'s notebook.',
        explanation: 'Add \'s to the singular person\'s name: Sarah\'s notebook.',
      },
    ],
  },

  // 7. Question words
  {
    id: 'lesson-07',
    number: 7,
    title: 'Question Words: What, Where, Who, When, Why, How',
    unit: 'Unit 1A & 2B',
    category: 'Grammar',
    estimatedMinutes: 14,
    description: 'Ask for specific information about things, places, people, time, reason, age, and height.',
    explanation: 'Question words (Wh- words) stand at the beginning of questions to ask for specific information instead of a simple Yes/No answer.',
    rules: [
      { rule: 'What = things / actions', example: 'What is your email address?' },
      { rule: 'Where = places', example: 'Where do you live?' },
      { rule: 'Who = people', example: 'Who is your English teacher?' },
      { rule: 'When = time / days', example: 'When is the exam?' },
      { rule: 'How old = age / How tall = height', example: 'How old are you? I am 20. How tall is he?' },
    ],
    examples: [
      {
        id: 'ex-07-1',
        english: 'Where are you from? I am from Germany.',
        german: 'Woher kommst du? Ich komme aus Deutschland.',
      },
      {
        id: 'ex-07-2',
        english: 'How old is your sister? She is 18 years old.',
        german: 'Wie alt ist deine Schwester? Sie ist 18 Jahre alt.',
      },
    ],
    keyVocabularyIds: ['v-germany-german', 'v-tall', 'v-how-are-you'],
    practiceQuestions: [
      {
        id: 'q-07-1',
        type: 'fill-blank',
        prompt: '_______ is your favourite actor? (Asking about a person)',
        expectedAnswer: 'Who',
        alternateAnswers: ['who'],
        explanation: '"Who" asks about people.',
      },
      {
        id: 'q-07-2',
        type: 'multiple-choice',
        prompt: '"_______ do you spell your surname?" "S-M-I-T-H."',
        options: ['How', 'What', 'Where', 'Why'],
        expectedAnswer: 'How',
        explanation: '"How do you spell...?" asks for the manner/spelling.',
      },
    ],
  },

  // 8. Classroom objects and personal possessions
  {
    id: 'lesson-08',
    number: 8,
    title: 'Classroom Objects & Personal Possessions',
    unit: 'Unit 1B & 1C',
    category: 'Vocabulary',
    estimatedMinutes: 12,
    description: 'Identify and talk about objects in the classroom, in your bag, and on your desk.',
    explanation: 'In the classroom and daily life, you need to ask for objects, identify lost items, and describe what you carry with you. Pay attention to plural forms (key -> keys, watch -> watches, dictionary -> dictionaries).',
    rules: [
      { rule: 'Regular plurals add -s', example: 'one pen -> two pens, one bag -> three bags.' },
      { rule: 'Nouns ending in -y after a consonant change to -ies', example: 'dictionary -> dictionaries.' },
    ],
    examples: [
      {
        id: 'ex-08-1',
        english: 'Can I borrow your dictionary and a pen?',
        german: 'Kann ich mir dein Wörterbuch und einen Stift ausleihen?',
      },
      {
        id: 'ex-08-2',
        english: 'I have my keys and my wallet in my jacket pocket.',
        german: 'Ich habe meine Schlüssel und mein Portemonnaie in meiner Jackentasche.',
      },
    ],
    keyVocabularyIds: ['v-bag', 'v-pen', 'v-pencil', 'v-dictionary', 'v-notebook', 'v-keys', 'v-wallet', 'v-umbrella'],
    practiceQuestions: [
      {
        id: 'q-08-1',
        type: 'multiple-choice',
        prompt: 'What do you use to look up the meaning of an English word?',
        options: ['a dictionary', 'an umbrella', 'a wallet', 'a pen'],
        expectedAnswer: 'a dictionary',
        explanation: 'A dictionary is used for looking up definitions and translations.',
      },
      {
        id: 'q-08-2',
        type: 'fill-blank',
        prompt: 'Translate to English: "der Kugelschreiber" = the _______',
        expectedAnswer: 'pen',
        explanation: '"Kugelschreiber" in English is "pen".',
      },
    ],
  },

  // 9. Countries and nationalities
  {
    id: 'lesson-09',
    number: 9,
    title: 'Countries & Nationalities',
    unit: 'Unit 1A & 1D',
    category: 'Vocabulary',
    estimatedMinutes: 12,
    description: 'Talk about where you come from, your nationality, and the languages you speak.',
    explanation: 'Always capitalise country names, nationalities, and languages in English (e.g. Germany, German, British, English). Note the pattern: "from + Country" (from Spain) vs "to be + Nationality" (is Spanish).',
    rules: [
      { rule: 'Country vs Nationality', example: 'I am from Italy (country). I am Italian (nationality).' },
      { rule: 'Always capitalise nationalities and languages', example: 'She speaks English, not english.' },
    ],
    examples: [
      {
        id: 'ex-09-1',
        english: 'He is from the UK. He is British.',
        german: 'Er kommt aus Großbritannien. Er ist Brite.',
      },
      {
        id: 'ex-09-2',
        english: 'Are they from Spain? Yes, they speak Spanish.',
        german: 'Kommen sie aus Spanien? Ja, sie sprechen Spanisch.',
      },
    ],
    keyVocabularyIds: ['v-germany-german', 'v-uk-british', 'v-spain-spanish', 'v-italy-italian', 'v-france-french', 'v-usa-american'],
    practiceQuestions: [
      {
        id: 'q-09-1',
        type: 'fill-blank',
        prompt: 'Elena is from Spain. She is _______. (Nationality)',
        expectedAnswer: 'Spanish',
        alternateAnswers: ['spanish'],
        explanation: 'The nationality for Spain is Spanish.',
      },
      {
        id: 'q-09-2',
        type: 'multiple-choice',
        prompt: 'Which sentence has correct capitalisation?',
        options: [
          'They speak german and live in berlin.',
          'They speak German and live in Berlin.',
          'They speak German and live in berlin.',
          'They speak german and live in Berlin.',
        ],
        expectedAnswer: 'They speak German and live in Berlin.',
        explanation: 'Both languages (German) and city names (Berlin) must be capitalised.',
      },
    ],
  },

  // 10. Drinks, snacks, and common verbs
  {
    id: 'lesson-10',
    number: 10,
    title: 'Drinks, Snacks & Ordering in a Café',
    unit: 'Unit 2A',
    category: 'Daily Life',
    estimatedMinutes: 14,
    description: 'Order food and drink politely and use common action verbs like drink, eat, want, and have.',
    explanation: 'When ordering in a café or restaurant, polite English uses "Could I have... please?" or "I\'d like... please" rather than demanding "I want".',
    rules: [
      { rule: 'Polite ordering formula', example: 'Could I have a coffee, please? / I\'d like a sandwich.' },
      { rule: 'Asking questions with like / want', example: 'Would you like some tea? Do you want milk?' },
    ],
    examples: [
      {
        id: 'ex-10-1',
        english: 'Could I have a bottle of mineral water, please?',
        german: 'Könnte ich bitte eine Flasche Mineralwasser haben?',
      },
      {
        id: 'ex-10-2',
        english: 'He eats a cheese sandwich and drinks an orange juice.',
        german: 'Er isst ein Käsesandwich und trinkt einen Orangensaft.',
      },
    ],
    keyVocabularyIds: ['v-coffee', 'v-tea', 'v-water', 'v-sandwich', 'v-apple', 'v-want'],
    practiceQuestions: [
      {
        id: 'q-10-1',
        type: 'multiple-choice',
        prompt: 'How do you ask politely for a drink in an English café?',
        options: [
          'Could I have a coffee, please?',
          'Give me coffee now!',
          'I want drink coffee.',
          'Is there coffee for me?',
        ],
        expectedAnswer: 'Could I have a coffee, please?',
        explanation: '"Could I have a coffee, please?" is natural, polite English.',
      },
      {
        id: 'q-10-2',
        type: 'fill-blank',
        prompt: 'In the morning, I _______ (drink) a cup of tea with milk.',
        expectedAnswer: 'drink',
        explanation: 'Subject "I" takes the base form "drink".',
      },
    ],
  },

  // 11. Free-time activities
  {
    id: 'lesson-11',
    number: 11,
    title: 'Free-Time Activities & Hobbies',
    unit: 'Unit 2B',
    category: 'Daily Life',
    estimatedMinutes: 12,
    description: 'Talk about what you do in your spare time: music, sports, books, and friends.',
    explanation: 'Notice the specific prepositions and verbs that pair with each activity: listen TO music, play football (no preposition), watch TV, read books, meet friends.',
    rules: [
      { rule: 'listen + to', example: 'I listen to music every evening.' },
      { rule: 'play + sports / games', example: 'He plays football on Saturdays.' },
      { rule: 'go + to the cinema / park', example: 'We go to the cinema on Fridays.' },
    ],
    examples: [
      {
        id: 'ex-11-1',
        english: 'What do you do at the weekend? I meet friends and play football.',
        german: 'Was machst du am Wochenende? Ich treffe Freunde und spiele Fußball.',
      },
      {
        id: 'ex-11-2',
        english: 'She reads English novels to improve her vocabulary.',
        german: 'Sie liest englische Romane, um ihren Wortschatz zu verbessern.',
      },
    ],
    keyVocabularyIds: ['v-listen-to-music', 'v-read-books', 'v-watch-tv', 'v-play-football', 'v-meet-friends'],
    practiceQuestions: [
      {
        id: 'q-11-1',
        type: 'fill-blank',
        prompt: 'I love to listen _______ classical music. (preposition)',
        expectedAnswer: 'to',
        explanation: 'Always use the preposition "to" after the verb "listen".',
      },
      {
        id: 'q-11-2',
        type: 'multiple-choice',
        prompt: 'Which collocation is correct?',
        options: ['play football', 'play to football', 'make football', 'do football'],
        expectedAnswer: 'play football',
        explanation: 'We say "play football" for the team sport.',
      },
    ],
  },

  // 12. Family vocabulary
  {
    id: 'lesson-12',
    number: 12,
    title: 'Family Members & Relationships',
    unit: 'Unit 2C',
    category: 'Vocabulary',
    estimatedMinutes: 12,
    description: 'Describe your family tree and relationships accurately.',
    explanation: 'Learn the core family members: parents (mother + father), children (son + daughter), siblings (brother + sister), grandparents, and partners (husband + wife). Remember that "parents" means mother and father, NOT relatives in general.',
    rules: [
      { rule: 'Parents = mother & father', example: 'My parents live in Munich.' },
      { rule: 'Children = plural of child', example: 'One child, two children.' },
    ],
    examples: [
      {
        id: 'ex-12-1',
        english: 'I have two brothers and one sister.',
        german: 'Ich habe zwei Brüder und eine Schwester.',
      },
      {
        id: 'ex-12-2',
        english: 'Her husband works in a language school.',
        german: 'Ihr Ehemann arbeitet in einer Sprachschule.',
      },
    ],
    keyVocabularyIds: ['v-parents', 'v-brother', 'v-sister', 'v-children', 'v-husband', 'v-wife'],
    practiceQuestions: [
      {
        id: 'q-12-1',
        type: 'fill-blank',
        prompt: 'My mother and father are my _______.',
        expectedAnswer: 'parents',
        explanation: '"Parents" is the English word for mother and father.',
      },
      {
        id: 'q-12-2',
        type: 'multiple-choice',
        prompt: 'What is the plural of "child"?',
        options: ['children', 'childs', 'childrens', 'childes'],
        expectedAnswer: 'children',
        explanation: '"Child" is an irregular noun with the plural form "children".',
      },
    ],
  },

  // 13. Describing people's appearance
  {
    id: 'lesson-13',
    number: 13,
    title: 'Describing People\'s Appearance & Clothes',
    unit: 'Unit 2D',
    category: 'Appearance',
    estimatedMinutes: 15,
    description: 'Describe height, build, hair, facial features, and what someone is wearing.',
    explanation: 'Use the verb "to be" for height and build (He is tall, she is slim, they are short). Use "have / has" for features (He has a beard, she has blue eyes). Use "is / are wearing" for current clothes (He is wearing black shoes).',
    rules: [
      { rule: 'be + adjective for body build', example: 'He is tall and slim. She is short.' },
      { rule: 'have / has + feature', example: 'He has short dark hair and a neat beard.' },
      { rule: 'wear for clothes & glasses', example: 'He wears glasses. She is wearing a coat.' },
    ],
    examples: [
      {
        id: 'ex-13-1',
        english: 'The man is tall and slim, and he wears glasses.',
        german: 'Der Mann ist groß und schlank und er trägt eine Brille.',
      },
      {
        id: 'ex-13-2',
        english: 'She has a warm smile and is wearing flat shoes.',
        german: 'Sie hat ein herzliches Lächeln und trägt flache Schuhe.',
      },
    ],
    keyVocabularyIds: ['v-tall', 'v-slim', 'v-short', 'v-heavy', 'v-wearing', 'v-beard', 'v-glasses', 'v-pants', 'v-shoes', 'v-smile'],
    practiceQuestions: [
      {
        id: 'q-13-1',
        type: 'fill-blank',
        prompt: 'He _______ (have) short dark hair and blue eyes.',
        expectedAnswer: 'has',
        explanation: 'Use "has" with third-person singular (he).',
      },
      {
        id: 'q-13-2',
        type: 'multiple-choice',
        prompt: 'Which sentence correctly describes someone\'s clothes today?',
        options: [
          'She is wearing a blue dress.',
          'She is putting a blue dress.',
          'She has a blue dress on body.',
          'She wears a blue dress now.',
        ],
        expectedAnswer: 'She is wearing a blue dress.',
        explanation: 'We use the present continuous "is wearing" for clothes on the body right now.',
      },
    ],
  },

  // 14. Days of the week and colours
  {
    id: 'lesson-14',
    number: 14,
    title: 'Days of the Week & Colours',
    unit: 'Unit 1B & 1D',
    category: 'Vocabulary',
    estimatedMinutes: 10,
    description: 'Use the days of the week with the preposition "on" and describe colours accurately.',
    explanation: 'Days of the week are always capitalised in English: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Use the preposition "on" before days (on Monday, on the weekend). Colours in English go BEFORE the noun: a black coat, a red pen.',
    rules: [
      { rule: 'Capitalise every day of the week', example: 'Monday, Tuesday, Wednesday, Thursday, Friday.' },
      { rule: 'Preposition "on" + day', example: 'The test is on Wednesday morning.' },
      { rule: 'Colour + Noun order', example: 'a blue pen, not "a pen blue".' },
    ],
    examples: [
      {
        id: 'ex-14-1',
        english: 'We have English lessons on Tuesday and Thursday.',
        german: 'Wir haben dienstags und donnerstags Englischunterricht.',
      },
      {
        id: 'ex-14-2',
        english: 'He has a black backpack and a blue jacket.',
        german: 'Er hat einen schwarzen Rucksack und eine blaue Jacke.',
      },
    ],
    keyVocabularyIds: ['v-monday', 'v-weekend', 'v-black', 'v-white', 'v-blue', 'v-red'],
    practiceQuestions: [
      {
        id: 'q-14-1',
        type: 'fill-blank',
        prompt: 'We meet our friends _______ Saturday evening. (preposition)',
        expectedAnswer: 'on',
        explanation: 'Use "on" with specific days of the week.',
      },
      {
        id: 'q-14-2',
        type: 'multiple-choice',
        prompt: 'Which word order is correct?',
        options: ['a red notebook', 'a notebook red', 'an notebook red', 'red a notebook'],
        expectedAnswer: 'a red notebook',
        explanation: 'In English, the adjective (colour) comes before the noun: a red notebook.',
      },
    ],
  },

  // 15. Introducing yourself and other people
  {
    id: 'lesson-15',
    number: 15,
    title: 'Introducing Yourself & Other People',
    unit: 'Unit 1A',
    category: 'Conversation',
    estimatedMinutes: 14,
    description: 'Introduce yourself politely, ask someone\'s name, and introduce a friend or colleague.',
    explanation: 'To introduce yourself: "Hello, I\'m David" or "My name is Elena." To introduce another person: "This is my friend Marco." The polite response to a formal or semi-formal introduction is "Pleased to meet you" or "Nice to meet you."',
    rules: [
      { rule: 'Introducing yourself', example: 'Hello, my name is Alex. I am from Sweden.' },
      { rule: 'Introducing someone else', example: 'This is my classmate Anna. She is from Poland.' },
      { rule: 'Polite response', example: 'Pleased to meet you, Anna.' },
    ],
    examples: [
      {
        id: 'ex-15-1',
        english: 'Hello, I\'m Sarah. Pleased to meet you!',
        german: 'Hallo, ich bin Sarah. Freut mich, dich kennenzulernen!',
      },
      {
        id: 'ex-15-2',
        english: 'David, this is my colleague Maria. Maria is from Rome.',
        german: 'David, das ist meine Kollegin Maria. Maria kommt aus Rom.',
      },
    ],
    keyVocabularyIds: ['v-pleased-to-meet-you', 'v-how-are-you', 'v-germany-german'],
    practiceQuestions: [
      {
        id: 'q-15-1',
        type: 'multiple-choice',
        prompt: 'What is the natural polite response when someone says: "This is my friend John"?',
        options: ['Pleased to meet you, John.', 'Goodbye, John.', 'How much is it, John?', 'Yes, it is John.'],
        expectedAnswer: 'Pleased to meet you, John.',
        explanation: '"Pleased to meet you" is the standard courteous response upon an introduction.',
      },
      {
        id: 'q-15-2',
        type: 'word-order',
        prompt: 'Put the words in order to introduce a friend:',
        words: ['This', 'is', 'my', 'brother', 'Marco.'],
        expectedAnswer: 'This is my brother Marco.',
        explanation: 'Subject (This) + verb (is) + object (my brother Marco).',
      },
    ],
  },

  // 16. Writing descriptions of people
  {
    id: 'lesson-16',
    number: 16,
    title: 'Writing Descriptions of People',
    unit: 'Unit 2D',
    category: 'Writing',
    estimatedMinutes: 16,
    description: 'Structure and write a clear 3–5 sentence personal description for an exam.',
    explanation: 'An elementary writing task often asks you to describe a person (a friend, teacher, or family member). Structure your paragraph logically: 1. Name, age, and where they are from. 2. Height and physical build. 3. Hair and facial features. 4. Clothes they are wearing. 5. Personality or profession.',
    rules: [
      { rule: 'Sentence 1: Identity', example: 'My friend Alex is 28 years old and he is from Germany.' },
      { rule: 'Sentence 2: Appearance', example: 'He is tall and slim with short brown hair.' },
      { rule: 'Sentence 3: Features & clothes', example: 'He has a beard and he wears glasses. Today he is wearing a dark jacket.' },
    ],
    examples: [
      {
        id: 'ex-16-1',
        english: 'The man looks around 30 years old. He is tall and slim. He has short dark hair and a neat beard, and he wears glasses.',
        german: 'Der Mann sieht etwa 30 Jahre alt aus. Er ist groß und schlank. Er hat kurze dunkle Haare und einen gepflegten Bart und er trägt eine Brille.',
      },
      {
        id: 'ex-16-2',
        english: 'Maria is around 25 years old. She is short with long curly hair and a warm smile. She is wearing flat shoes and casual pants.',
        german: 'Maria ist ungefähr 25 Jahre alt. Sie ist klein mit langen lockigen Haaren und einem warmen Lächeln. Sie trägt flache Schuhe und eine bequeme Hose.',
      },
    ],
    keyVocabularyIds: ['v-tall', 'v-slim', 'v-wearing', 'v-beard', 'v-glasses', 'v-pants', 'v-shoes', 'v-smile'],
    practiceQuestions: [
      {
        id: 'q-16-1',
        type: 'multiple-choice',
        prompt: 'Which sentence correctly combines age and appearance?',
        options: [
          'He is around 30 years old and he is tall and slim.',
          'He has 30 years old and is tall build.',
          'He is 30 years and wears tall.',
          'He have around 30 years.',
        ],
        expectedAnswer: 'He is around 30 years old and he is tall and slim.',
        explanation: 'In English, use "is ... years old", not "has ... years".',
      },
      {
        id: 'q-16-2',
        type: 'fill-blank',
        prompt: 'Complete the sentence: "She is _______ 40 years old." (meaning approximately / circa)',
        expectedAnswer: 'around',
        alternateAnswers: ['about'],
        explanation: '"around" or "about" means approximately when describing age.',
      },
    ],
  },
];
