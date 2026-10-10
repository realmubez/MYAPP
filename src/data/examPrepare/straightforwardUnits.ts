/**
 * Straightforward Elementary (Units 1–2D) Comprehensive Curriculum
 * 16 structured lessons covering all examination requirements.
 * Focuses on beginner-friendly explanations, crucial transformations,
 * comparison tables, and intensive practice for do/does and Simple Present.
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
  crucialRule?: {
    title: string;
    transformation: string;
    explanation: string;
  };
  comparisonTable?: {
    subject: string;
    positive: string;
    negative: string;
    question: string;
    shortAnswer: string;
  }[];
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
  // ==========================================
  // LESSON 1: The Verb TO BE
  // ==========================================
  {
    id: 'lesson-01',
    number: 1,
    title: 'The Verb TO BE: am, is, are',
    unit: 'Unit 1A & 1D',
    category: 'Grammar Foundations',
    estimatedMinutes: 15,
    description: 'Master the forms of TO BE in positive statements, negatives, questions, and natural short answers.',
    explanation:
      'The verb "to be" changes depending on the subject: I am, you are, he/she/it is, we/they are. In negatives, put "not" directly after the verb. In questions, put the verb BEFORE the subject. In short answers, never use contractions in positive answers (say "Yes, I am", not "Yes, I\'m").',
    crucialRule: {
      title: 'Question & Short Answer Pattern',
      transformation: 'Statement: "She is a student." ➔ Question: "Is she a student?" ➔ Short Answer: "Yes, she is." / "No, she isn\'t."',
      explanation: 'Invert the subject and verb to make a question. In short positive answers, do not contract: "Yes, she is" (never "Yes, she\'s").',
    },
    comparisonTable: [
      {
        subject: 'I',
        positive: 'I am (I\'m) from Germany.',
        negative: 'I am not (I\'m not) French.',
        question: 'Am I late?',
        shortAnswer: 'Yes, you are. / No, you aren\'t.',
      },
      {
        subject: 'He / She / It',
        positive: 'She is (She\'s) 29 years old.',
        negative: 'She is not (She isn\'t) tired.',
        question: 'Is she a designer?',
        shortAnswer: 'Yes, she is. / No, she isn\'t.',
      },
      {
        subject: 'You / We / They',
        positive: 'They are (They\'re) in the classroom.',
        negative: 'They are not (They aren\'t) at home.',
        question: 'Are they ready?',
        shortAnswer: 'Yes, they are. / No, they aren\'t.',
      },
    ],
    rules: [
      { rule: 'Use "am" with I, "is" with he/she/it, and "are" with you/we/they.', example: 'I am Marco. She is Sarah. We are students.' },
      { rule: 'Negative: add "not" after am / is / are.', example: 'He is not (isn\'t) from London.' },
      { rule: 'Question word order: put Am/Is/Are before the subject.', example: 'Are you from Spain? Is he your brother?' },
      { rule: 'Short answers use the full verb in positive responses.', example: 'Yes, I am. (NOT Yes, I\'m). Yes, he is. (NOT Yes, he\'s).' },
    ],
    examples: [
      { id: 'ex-01-1', english: 'Are you from England? Yes, I am.', german: 'Kommst du aus England? Ja, das tue ich / Ja, bin ich.' },
      { id: 'ex-01-2', english: 'Is Lisa a nurse? No, she isn\'t.', german: 'Ist Lisa Krankenschwester? Nein, ist sie nicht.' },
      { id: 'ex-01-3', english: 'They aren\'t in the hotel today.', german: 'Sie sind heute nicht im Hotel.' },
    ],
    keyVocabularyIds: ['v-uk-british', 'v-live', 'v-work'],
    practiceQuestions: [
      {
        id: 'q-01-1',
        type: 'multiple-choice',
        prompt: 'Choose the correct form: "My parents _______ from Italy."',
        options: ['are', 'is', 'am', 'be'],
        expectedAnswer: 'are',
        explanation: '"Parents" is plural (they), so we use "are": They are from Italy.',
      },
      {
        id: 'q-01-2',
        type: 'fill-blank',
        prompt: 'Sarah _______ (not be) German. She is Austrian.',
        expectedAnswer: 'is not',
        alternateAnswers: ["isn't", 'isnt'],
        explanation: 'For she, the negative is "is not" or "isn\'t".',
      },
      {
        id: 'q-01-3',
        type: 'multiple-choice',
        prompt: '"Is your brother at home?" "No, _______."',
        options: ["he isn't", "he aren't", "he don't", "he not"],
        expectedAnswer: "he isn't",
        explanation: 'Short answer for he is: "No, he isn\'t" or "No, he is not".',
      },
      {
        id: 'q-01-4',
        type: 'fill-blank',
        prompt: 'Complete the question: "_______ you a student at this school?"',
        expectedAnswer: 'Are',
        alternateAnswers: ['are'],
        explanation: 'With subject "you", the question begins with "Are you...?"',
      },
      {
        id: 'q-01-5',
        type: 'multiple-choice',
        prompt: '"Are they English?" Which positive short answer is correct?',
        options: ['Yes, they are.', "Yes, they're.", 'Yes, they do.', 'Yes, are they.'],
        expectedAnswer: 'Yes, they are.',
        explanation: 'In positive short answers, never contract: say "Yes, they are", never "Yes, they\'re".',
      },
      {
        id: 'q-01-6',
        type: 'fill-blank',
        prompt: 'I _______ (be) 25 years old.',
        expectedAnswer: 'am',
        alternateAnswers: ["'m", 'm'],
        explanation: 'With "I", use "am" (or I\'m).',
      },
      {
        id: 'q-01-7',
        type: 'multiple-choice',
        prompt: 'Which sentence is grammatically correct?',
        options: [
          'Emily and her brother are at the hotel.',
          'Emily and her brother is at the hotel.',
          'Emily and her brother am at the hotel.',
          'Emily and her brother be at the hotel.',
        ],
        expectedAnswer: 'Emily and her brother are at the hotel.',
        explanation: 'Two people (Emily and her brother) = they (plural), so use "are".',
      },
      {
        id: 'q-01-8',
        type: 'fill-blank',
        prompt: '"Is this your book?" "Yes, it _______."',
        expectedAnswer: 'is',
        explanation: 'Positive short answer for it: "Yes, it is."',
      },
      {
        id: 'q-01-9',
        type: 'word-order',
        prompt: 'Put the words in order to form a question: "from / Where / you / are / ?"',
        expectedAnswer: 'Where are you from?',
        alternateAnswers: ['Where are you from'],
        words: ['Where', 'are', 'you', 'from', '?'],
        explanation: 'Question word (Where) + verb (are) + subject (you) + preposition (from)?',
      },
      {
        id: 'q-01-10',
        type: 'multiple-choice',
        prompt: 'Choose the correct negative sentence:',
        options: [
          'We aren\'t late for class.',
          'We doesn\'t late for class.',
          'We not are late for class.',
          'We don\'t late for class.',
        ],
        expectedAnswer: 'We aren\'t late for class.',
        explanation: 'The negative of "We are" is "We aren\'t" (we are not).',
      },
    ],
  },

  // ==========================================
  // LESSON 2: Simple Present Positive & 3rd-Person -s
  // ==========================================
  {
    id: 'lesson-02',
    number: 2,
    title: 'Simple Present: Positive Sentences & Third-Person -s',
    unit: 'Unit 2B',
    category: 'Present Simple Mastery',
    estimatedMinutes: 20,
    description: 'Learn when and how to add -s, -es, -ies, and irregular "has" for he, she, and it.',
    explanation:
      'We use the Simple Present for habits, daily routines, and permanent facts. For I, you, we, and they, we use the BASE VERB (I work, they live). But for HE, SHE, and IT, the verb MUST take an -s ending! Watch the spelling rules: most verbs add -s (works, lives), verbs ending in -ch/-sh/-ss/-x/-o add -es (watches, goes), consonant + y becomes -ies (studies), and "have" becomes "has".',
    crucialRule: {
      title: 'The Third-Person -s Rule',
      transformation: 'I work ➔ He works | I live ➔ She lives | I watch ➔ He watches | I study ➔ She studies | I have ➔ He has',
      explanation: 'He, she, and it ALWAYS take an -s ending in positive statements. Never say "He live" or "She work"!',
    },
    comparisonTable: [
      {
        subject: 'I / You / We / They',
        positive: 'I work in an office.',
        negative: 'I do not work on Sundays.',
        question: 'Do you work here?',
        shortAnswer: 'Yes, I do. / No, I don\'t.',
      },
      {
        subject: 'He / She / It',
        positive: 'She works in a hotel.',
        negative: 'She does not work in an office.',
        question: 'Does she work here?',
        shortAnswer: 'Yes, she does. / No, she doesn\'t.',
      },
    ],
    rules: [
      { rule: 'General rule: add -s to the base verb for he / she / it.', example: 'work ➔ works, live ➔ lives, eat ➔ eats, drink ➔ drinks' },
      { rule: 'Verbs ending in -ch, -sh, -ss, -x, -o: add -es.', example: 'watch ➔ watches, go ➔ goes, do ➔ does, wash ➔ washes' },
      { rule: 'Consonant + y: change y to -ies.', example: 'study ➔ studies, fly ➔ flies (contrast play ➔ plays)' },
      { rule: 'Irregular form: "have" becomes "has".', example: 'I have a car. ➔ She has a Canadian boyfriend.' },
    ],
    examples: [
      { id: 'ex-02-1', english: 'Lisa works at a hotel in the mountains.', german: 'Lisa arbeitet in einem Hotel in den Bergen.' },
      { id: 'ex-02-2', english: 'He watches television after work.', german: 'Er schaut nach der Arbeit fern.' },
      { id: 'ex-02-3', english: 'My brother studies English every evening.', german: 'Mein Bruder lernt jeden Abend Englisch.' },
      { id: 'ex-02-4', english: 'Emily has an apartment on the tenth floor.', german: 'Emily hat eine Wohnung im zehnten Stock.' },
    ],
    keyVocabularyIds: ['v-work', 'v-live', 'v-study', 'v-watch'],
    practiceQuestions: [
      {
        id: 'q-02-1',
        type: 'fill-blank',
        prompt: 'Lisa _______ (live) in a small town near the mountains.',
        expectedAnswer: 'lives',
        explanation: 'Subject "Lisa" is third-person singular (she), so add -s: "lives".',
      },
      {
        id: 'q-02-2',
        type: 'multiple-choice',
        prompt: 'Choose the correct verb form: "He _______ (watch) football on Saturdays."',
        options: ['watches', 'watchs', 'watch', 'watching'],
        expectedAnswer: 'watches',
        explanation: 'Verbs ending in -ch add -es for he/she/it: "watches".',
      },
      {
        id: 'q-02-3',
        type: 'fill-blank',
        prompt: 'Emily _______ (have) a Canadian boyfriend.',
        expectedAnswer: 'has',
        explanation: 'The third-person form of "have" is irregular: "has" (she has).',
      },
      {
        id: 'q-02-4',
        type: 'fill-blank',
        prompt: 'Marco _______ (go) to the gym after work.',
        expectedAnswer: 'goes',
        explanation: 'The verb "go" ends in -o, so it adds -es: "goes".',
      },
      {
        id: 'q-02-5',
        type: 'fill-blank',
        prompt: 'My sister _______ (study) at a university in Berlin.',
        expectedAnswer: 'studies',
        explanation: '"study" ends in consonant + y, so change y to -ies: "studies".',
      },
      {
        id: 'q-02-6',
        type: 'multiple-choice',
        prompt: 'Which sentence has the correct verb ending?',
        options: [
          'She works in a busy office.',
          'She work in a busy office.',
          'She workes in a busy office.',
          'She is work in a busy office.',
        ],
        expectedAnswer: 'She works in a busy office.',
        explanation: '"work" simply takes -s: "She works".',
      },
      {
        id: 'q-02-7',
        type: 'fill-blank',
        prompt: 'They _______ (live) in Vancouver, Canada.',
        expectedAnswer: 'live',
        explanation: 'With subject "They", use the base form without -s: "They live".',
      },
      {
        id: 'q-02-8',
        type: 'multiple-choice',
        prompt: '"On Saturdays, Lisa _______ (read) books and her brother _______ (take) photos."',
        options: [
          'reads / takes',
          'read / take',
          'reades / takes',
          'reads / take',
        ],
        expectedAnswer: 'reads / takes',
        explanation: 'Both Lisa (she) and her brother (he) require -s: "reads" and "takes".',
      },
      {
        id: 'q-02-9',
        type: 'fill-blank',
        prompt: 'David _______ (drink) tea with milk in the morning.',
        expectedAnswer: 'drinks',
        explanation: 'David (he) takes -s: "drinks".',
      },
      {
        id: 'q-02-10',
        type: 'word-order',
        prompt: 'Arrange the sentence: "plays / on / tennis / He / Sundays"',
        expectedAnswer: 'He plays tennis on Sundays.',
        alternateAnswers: ['He plays tennis on Sundays'],
        words: ['He', 'plays', 'tennis', 'on', 'Sundays', '.'],
        explanation: 'Subject (He) + verb with -s (plays) + object (tennis) + time expression (on Sundays).',
      },
    ],
  },

  // ==========================================
  // LESSON 3: Simple Present Negatives (don't & doesn't)
  // ==========================================
  {
    id: 'lesson-03',
    number: 3,
    title: 'Simple Present Negatives: don\'t and doesn\'t',
    unit: 'Unit 2B',
    category: 'Present Simple Mastery',
    estimatedMinutes: 20,
    description: 'Learn the golden rule of negatives: after doesn\'t, the verb ALWAYS returns to its base form!',
    explanation:
      'To make a negative sentence in the Simple Present, we use auxiliary verbs:\n• For I / you / we / they: use DON\'T + base verb (I don\'t drink coffee).\n• For he / she / it: use DOESN\'T + base verb (She doesn\'t drink coffee).\n\nCRITICAL EXAM TRAP: When you use "doesn\'t", the "-s" has already moved into "does"! You must NEVER add -s to the main verb after doesn\'t. Say "She doesn\'t work", NEVER "She doesn\'t works".',
    crucialRule: {
      title: 'The Golden Negative Transformation',
      transformation: 'Positive: "She works." ➔ Negative: "She doesn\'t work." (The -s disappears from "works"!)',
      explanation: 'Always use does not / doesn\'t + BASE VERB. "She doesn\'t work" is correct; "She doesn\'t works" is 100% wrong on exams.',
    },
    comparisonTable: [
      {
        subject: 'I / You / We / They',
        positive: 'I like cold milk.',
        negative: 'I don\'t like cold milk.',
        question: 'Do you like milk?',
        shortAnswer: 'Yes, I do. / No, I don\'t.',
      },
      {
        subject: 'He / She / It',
        positive: 'Lisa works at a bank.',
        negative: 'Lisa doesn\'t work at a bank.',
        question: 'Does Lisa work at a bank?',
        shortAnswer: 'Yes, she does. / No, she doesn\'t.',
      },
    ],
    rules: [
      { rule: 'I / you / we / they + don\'t + base form.', example: 'We don\'t drink tea in the evening.' },
      { rule: 'He / she / it + doesn\'t + base form (NO -s!).', example: 'He doesn\'t live in London. (NOT doesn\'t lives).' },
      { rule: 'don\'t = do not | doesn\'t = does not.', example: 'She does not like hot coffee.' },
      { rule: 'Irregular "have": use "doesn\'t have" (NOT doesn\'t has).', example: 'She doesn\'t have a car.' },
    ],
    examples: [
      { id: 'ex-03-1', english: 'Lisa doesn\'t work on Sundays.', german: 'Lisa arbeitet sonntags nicht.' },
      { id: 'ex-03-2', english: 'My brother doesn\'t drink coffee.', german: 'Mein Bruder trinkt keinen Kaffee.' },
      { id: 'ex-03-3', english: 'They don\'t take the bus to work.', german: 'Sie nehmen nicht den Bus zur Arbeit.' },
      { id: 'ex-03-4', english: 'Emily doesn\'t have a car in Vancouver.', german: 'Emily hat kein Auto in Vancouver.' },
    ],
    keyVocabularyIds: ['v-work', 'v-like', 'v-tea', 'v-coffee'],
    practiceQuestions: [
      {
        id: 'q-03-1',
        type: 'fill-blank',
        prompt: 'Lisa _______ (not work) in a hospital. She works at a hotel.',
        expectedAnswer: "doesn't work",
        alternateAnswers: ['does not work', 'doesnt work'],
        explanation: 'Lisa is "she", so use "doesn\'t" + base verb "work": "doesn\'t work".',
      },
      {
        id: 'q-03-2',
        type: 'multiple-choice',
        prompt: 'Which negative sentence is grammatically correct?',
        options: [
          'David doesn\'t drink tea.',
          'David doesn\'t drinks tea.',
          'David don\'t drinks tea.',
          'David not drinks tea.',
        ],
        expectedAnswer: 'David doesn\'t drink tea.',
        explanation: 'After doesn\'t, the verb must be in base form: "doesn\'t drink".',
      },
      {
        id: 'q-03-3',
        type: 'fill-blank',
        prompt: 'I _______ (not like) black coffee.',
        expectedAnswer: "don't like",
        alternateAnswers: ['do not like', 'dont like'],
        explanation: 'With subject "I", use "don\'t" + base verb: "don\'t like".',
      },
      {
        id: 'q-03-4',
        type: 'multiple-choice',
        prompt: 'Choose the correct negative form: "Emily _______ (not have) a bicycle."',
        options: [
          'doesn\'t have',
          'doesn\'t has',
          'don\'t has',
          'has not',
        ],
        expectedAnswer: 'doesn\'t have',
        explanation: 'After doesn\'t, use the base verb "have": "doesn\'t have".',
      },
      {
        id: 'q-03-5',
        type: 'fill-blank',
        prompt: 'They _______ (not live) in Bristol now. They live in Canada.',
        expectedAnswer: "don't live",
        alternateAnswers: ['do not live', 'dont live'],
        explanation: 'With subject "They", use "don\'t live".',
      },
      {
        id: 'q-03-6',
        type: 'multiple-choice',
        prompt: 'Transform into negative: "Marco speaks Italian." ➔ "Marco _______ Italian."',
        options: [
          'doesn\'t speak',
          'doesn\'t speaks',
          'don\'t speak',
          'not speak',
        ],
        expectedAnswer: 'doesn\'t speak',
        explanation: '"doesn\'t" + base verb "speak": Marco doesn\'t speak.',
      },
      {
        id: 'q-03-7',
        type: 'fill-blank',
        prompt: 'She _______ (not watch) television in the morning.',
        expectedAnswer: "doesn't watch",
        alternateAnswers: ['does not watch', 'doesnt watch'],
        explanation: 'She + doesn\'t + base verb "watch".',
      },
      {
        id: 'q-03-8',
        type: 'multiple-choice',
        prompt: 'Which sentence is WRONG?',
        options: [
          'He doesn\'t plays football.',
          'He doesn\'t play football.',
          'They don\'t play football.',
          'I don\'t play football.',
        ],
        expectedAnswer: 'He doesn\'t plays football.',
        explanation: '"He doesn\'t plays" is wrong because "plays" must not have -s after doesn\'t.',
      },
      {
        id: 'q-03-9',
        type: 'fill-blank',
        prompt: 'My parents _______ (not drink) alcohol.',
        expectedAnswer: "don't drink",
        alternateAnswers: ['do not drink', 'dont drink'],
        explanation: 'Parents = they (plural) ➔ "don\'t drink".',
      },
      {
        id: 'q-03-10',
        type: 'word-order',
        prompt: 'Put words in order: "hotel / She / at / work / doesn\'t / a"',
        expectedAnswer: "She doesn't work at a hotel.",
        alternateAnswers: ["She doesn't work at a hotel"],
        words: ['She', "doesn't", 'work', 'at', 'a', 'hotel', '.'],
        explanation: 'Subject (She) + auxiliary (doesn\'t) + base verb (work) + prepositional phrase (at a hotel).',
      },
    ],
  },

  // ==========================================
  // LESSON 4: Simple Present Questions (do & does)
  // ==========================================
  {
    id: 'lesson-04',
    number: 4,
    title: 'Simple Present Questions: do and does',
    unit: 'Unit 2B',
    category: 'Present Simple Mastery',
    estimatedMinutes: 20,
    description: 'Learn question word order: Do/Does + subject + base verb. The -s NEVER appears on the main verb in questions!',
    explanation:
      'To ask a question in Simple Present, put DO or DOES at the beginning (before the subject):\n• DO + I / you / we / they + base verb? (Do you drink tea?)\n• DOES + he / she / it + base verb? (Does Lisa work at a hotel?)\n\nTHE CRUCIAL EXAM RULE: Just like with negatives, the "-s" is already in "does"! The main verb MUST be in its base form. Say "Does she work?", NEVER "Does she works?".',
    crucialRule: {
      title: 'The Question Transformation',
      transformation: 'Statement: "She works at a hotel." ➔ Question: "Does she work at a hotel?" (NO -s on work!)',
      explanation: 'Question formula: Do/Does + Subject + BASE VERB. "Does she work?" is correct; "Does she works?" is incorrect.',
    },
    comparisonTable: [
      {
        subject: 'You / We / They',
        positive: 'You live in Germany.',
        negative: 'You don\'t live here.',
        question: 'Do you live in Germany?',
        shortAnswer: 'Yes, I do. / No, I don\'t.',
      },
      {
        subject: 'He / She / It',
        positive: 'Lisa lives near mountains.',
        negative: 'Lisa doesn\'t live here.',
        question: 'Does Lisa live near mountains?',
        shortAnswer: 'Yes, she does. / No, she doesn\'t.',
      },
    ],
    rules: [
      { rule: 'Question structure: Do / Does + subject + base verb.', example: 'Do you work here? Does he study English?' },
      { rule: 'Use DO with I / you / we / they.', example: 'Do they have breakfast together?' },
      { rule: 'Use DOES with he / she / it.', example: 'Does Emily take the bus to work?' },
      { rule: 'After DOES, the main verb never takes -s.', example: 'Does she like tea? (NOT Does she likes).' },
    ],
    examples: [
      { id: 'ex-04-1', english: 'Does Lisa work at a hotel? Yes, she does.', german: 'Arbeitet Lisa in einem Hotel? Ja, das tut sie.' },
      { id: 'ex-04-2', english: 'Where does your brother live?', german: 'Wo wohnt dein Bruder?' },
      { id: 'ex-04-3', english: 'Do you drink tea in the morning? No, I don\'t.', german: 'Trinkst du morgens Tee? Nein.' },
    ],
    keyVocabularyIds: ['v-work', 'v-live', 'v-tea', 'v-bus'],
    practiceQuestions: [
      {
        id: 'q-04-1',
        type: 'fill-blank',
        prompt: '_______ (Do / Does) Lisa work at a hotel in the mountains?',
        expectedAnswer: 'Does',
        alternateAnswers: ['does'],
        explanation: 'Lisa is third person singular (she), so start the question with "Does".',
      },
      {
        id: 'q-04-2',
        type: 'multiple-choice',
        prompt: 'Choose the correct question:',
        options: [
          'Does she live in Vancouver?',
          'Does she lives in Vancouver?',
          'Do she live in Vancouver?',
          'Is she live in Vancouver?',
        ],
        expectedAnswer: 'Does she live in Vancouver?',
        explanation: 'Does + subject (she) + base verb (live). No -s on "live"!',
      },
      {
        id: 'q-04-3',
        type: 'fill-blank',
        prompt: '_______ (Do / Does) you speak English with your friends?',
        expectedAnswer: 'Do',
        alternateAnswers: ['do'],
        explanation: 'With subject "you", questions begin with "Do".',
      },
      {
        id: 'q-04-4',
        type: 'multiple-choice',
        prompt: '"Where _______ your parents live?"',
        options: ['do', 'does', 'is', 'are'],
        expectedAnswer: 'do',
        explanation: '"Parents" is plural (they), so use auxiliary "do": Where do your parents live?',
      },
      {
        id: 'q-04-5',
        type: 'fill-blank',
        prompt: 'Complete the question: "_______ he have a car?" (Do / Does)',
        expectedAnswer: 'Does',
        alternateAnswers: ['does'],
        explanation: 'With subject "he", use "Does".',
      },
      {
        id: 'q-04-6',
        type: 'multiple-choice',
        prompt: 'Which question is grammatically correct?',
        options: [
          'Does your brother play football?',
          'Does your brother plays football?',
          'Do your brother play football?',
          'Is your brother plays football?',
        ],
        expectedAnswer: 'Does your brother play football?',
        explanation: '"your brother" = he ➔ Does + your brother + base verb "play".',
      },
      {
        id: 'q-04-7',
        type: 'fill-blank',
        prompt: 'What time _______ you wake up on weekdays? (do / does)',
        expectedAnswer: 'do',
        explanation: 'With subject "you", use "do".',
      },
      {
        id: 'q-04-8',
        type: 'multiple-choice',
        prompt: 'Transform into question: "Marco drinks coffee." ➔ "_______ Marco _______ coffee?"',
        options: [
          'Does / drink',
          'Does / drinks',
          'Do / drink',
          'Is / drinks',
        ],
        expectedAnswer: 'Does / drink',
        explanation: 'Auxiliary "Does" + subject Marco + base verb "drink".',
      },
      {
        id: 'q-04-9',
        type: 'fill-blank',
        prompt: '_______ they take the train to work? (Do / Does)',
        expectedAnswer: 'Do',
        alternateAnswers: ['do'],
        explanation: 'With subject "they", use "Do".',
      },
      {
        id: 'q-04-10',
        type: 'word-order',
        prompt: 'Form the question: "you / live / in / Do / Canada / ?"',
        expectedAnswer: 'Do you live in Canada?',
        alternateAnswers: ['Do you live in Canada'],
        words: ['Do', 'you', 'live', 'in', 'Canada', '?'],
        explanation: 'Auxiliary (Do) + subject (you) + verb (live) + prepositional phrase (in Canada)?',
      },
    ],
  },

  // ==========================================
  // LESSON 5: Short Answers (do/does & am/is/are)
  // ==========================================
  {
    id: 'lesson-05',
    number: 5,
    title: 'Short Answers: Yes/No Responses',
    unit: 'Unit 1A & 2B',
    category: 'Present Simple Mastery',
    estimatedMinutes: 15,
    description: 'Learn to answer Yes/No questions naturally without repeating the entire sentence.',
    explanation:
      'In English exams, you are frequently asked to provide "short answers".\n\n1. For questions with DO / DOES:\n• "Do you live in Berlin?" ➔ Yes, I do. / No, I don\'t.\n• "Does Lisa work at a hotel?" ➔ Yes, she does. / No, she doesn\'t.\n\n2. For questions with AM / IS / ARE:\n• "Are you from Germany?" ➔ Yes, I am. / No, I\'m not.\n• "Is he your brother?" ➔ Yes, he is. / No, he isn\'t.\n\nNEVER repeat the main verb in a short answer! Say "Yes, she does", NOT "Yes, she works".',
    crucialRule: {
      title: 'Short Answer Consistency',
      transformation: 'Question: "Does Lisa work at a hotel?" ➔ Positive: "Yes, she does." | Negative: "No, she doesn\'t."',
      explanation: 'Match the auxiliary verb in the answer to the question: Does ➔ does / doesn\'t. Do ➔ do / don\'t. Is ➔ is / isn\'t.',
    },
    comparisonTable: [
      {
        subject: 'Do you...?',
        positive: 'Yes, I do.',
        negative: 'No, I don\'t.',
        question: 'Do you like tea?',
        shortAnswer: 'Yes, I do. / No, I don\'t.',
      },
      {
        subject: 'Does she...?',
        positive: 'Yes, she does.',
        negative: 'No, she doesn\'t.',
        question: 'Does she work here?',
        shortAnswer: 'Yes, she does. / No, she doesn\'t.',
      },
      {
        subject: 'Are you...?',
        positive: 'Yes, I am. (never Yes, I\'m)',
        negative: 'No, I\'m not.',
        question: 'Are you a student?',
        shortAnswer: 'Yes, I am. / No, I\'m not.',
      },
      {
        subject: 'Is he...?',
        positive: 'Yes, he is. (never Yes, he\'s)',
        negative: 'No, he isn\'t.',
        question: 'Is he tired?',
        shortAnswer: 'Yes, he is. / No, he isn\'t.',
      },
    ],
    rules: [
      { rule: 'Match the auxiliary in the question: "Do" questions take "do/don\'t".', example: 'Do they live here? Yes, they do.' },
      { rule: '"Does" questions take "does/doesn\'t".', example: 'Does he speak German? No, he doesn\'t.' },
      { rule: 'Be questions (is/are) take "is/isn\'t" or "are/aren\'t".', example: 'Is Emily from England? Yes, she is.' },
      { rule: 'Never repeat the main action verb in short answers.', example: 'Does she like tea? Yes, she does. (NOT Yes, she likes).' },
    ],
    examples: [
      { id: 'ex-05-1', english: 'Does Lisa work at a hotel? Yes, she does.', german: 'Arbeitet Lisa in einem Hotel? Ja, das tut sie.' },
      { id: 'ex-05-2', english: 'Do you drink coffee? No, I don\'t.', german: 'Trinkst du Kaffee? Nein.' },
      { id: 'ex-05-3', english: 'Is your brother a teacher? No, he isn\'t.', german: 'Ist dein Bruder Lehrer? Nein.' },
    ],
    keyVocabularyIds: ['v-work', 'v-live', 'v-tea', 'v-coffee'],
    practiceQuestions: [
      {
        id: 'q-05-1',
        type: 'multiple-choice',
        prompt: '"Does Lisa work at a hotel?" What is the correct positive short answer?',
        options: ['Yes, she does.', 'Yes, she works.', 'Yes, she is.', 'Yes, does she.'],
        expectedAnswer: 'Yes, she does.',
        explanation: 'Questions starting with "Does" use "does" in positive short answers: "Yes, she does."',
      },
      {
        id: 'q-05-2',
        type: 'fill-blank',
        prompt: '"Do you drink tea in the morning?" "No, I _______."',
        expectedAnswer: "don't",
        alternateAnswers: ['do not', 'dont'],
        explanation: 'Negative short answer with "Do you...?": "No, I don\'t."',
      },
      {
        id: 'q-05-3',
        type: 'multiple-choice',
        prompt: '"Does Emily live in London?" "No, she _______."',
        options: ["doesn't", "don't", "isn't", 'not'],
        expectedAnswer: "doesn't",
        explanation: 'Negative short answer for "Does she...?": "No, she doesn\'t."',
      },
      {
        id: 'q-05-4',
        type: 'fill-blank',
        prompt: '"Is Marco from Italy?" "Yes, he _______."',
        expectedAnswer: 'is',
        explanation: 'Positive short answer for "Is he...?": "Yes, he is." (Never contract to "Yes, he\'s").',
      },
      {
        id: 'q-05-5',
        type: 'multiple-choice',
        prompt: '"Are they English?" "No, they _______."',
        options: ["aren't", "don't", "doesn't", "isn't"],
        expectedAnswer: "aren't",
        explanation: 'Question with "Are they...?": negative short answer is "No, they aren\'t."',
      },
      {
        id: 'q-05-6',
        type: 'fill-blank',
        prompt: '"Do your parents speak German?" "Yes, they _______."',
        expectedAnswer: 'do',
        explanation: '"parents" = they ➔ "Yes, they do."',
      },
      {
        id: 'q-05-7',
        type: 'multiple-choice',
        prompt: '"Does he have a car?" "No, he _______."',
        options: ["doesn't", "hasn't", "don't", "isn't"],
        expectedAnswer: "doesn't",
        explanation: 'Question begins with "Does", so answer with "No, he doesn\'t."',
      },
      {
        id: 'q-05-8',
        type: 'fill-blank',
        prompt: '"Are you a student?" "Yes, I _______."',
        expectedAnswer: 'am',
        explanation: 'Question to you ➔ "Yes, I am." (Full form required).',
      },
      {
        id: 'q-05-9',
        type: 'multiple-choice',
        prompt: 'Which short answer is WRONG?',
        options: [
          'Yes, I\'m.',
          'Yes, I am.',
          'No, I\'m not.',
          'Yes, they do.',
        ],
        expectedAnswer: 'Yes, I\'m.',
        explanation: '"Yes, I\'m" is wrong because contractions are never used at the end of positive short answers.',
      },
      {
        id: 'q-05-10',
        type: 'fill-blank',
        prompt: '"Does she take the bus to work?" "Yes, she _______."',
        expectedAnswer: 'does',
        explanation: 'Positive short answer: "Yes, she does."',
      },
    ],
  },

  // ==========================================
  // LESSON 6: Question Words (What, Where, When, Who, Why, How)
  // ==========================================
  {
    id: 'lesson-06',
    number: 6,
    title: 'Question Words: What, Where, When, Who, Why, How',
    unit: 'Unit 1A & 2B',
    category: 'Grammar Foundations',
    estimatedMinutes: 20,
    description: 'Learn the specific meaning of question words and the sentence order for wh- questions.',
    explanation:
      'Question words always stand at the very beginning of a question:\n• WHAT: for things or jobs ("What is your job?")\n• WHERE: for places ("Where do you live?")\n• WHEN: for time or days ("When do they meet?")\n• WHO: for people ("Who is your brother?")\n• WHY: for reasons, answered with because ("Why does she take the bus?")\n• HOW: for manner, spelling, or combined with adjectives ("How old are you? How do you spell it?")\n\nWord order rule: Question Word + do/does/be + Subject + Verb?',
    crucialRule: {
      title: 'Wh- Question Formula',
      transformation: 'Question Word + Auxiliary (do/does/is/are) + Subject + Base Verb? ➔ "Where does she live?"',
      explanation: 'Never omit the auxiliary verb! Say "Where does she live?", not "Where she lives?".',
    },
    rules: [
      { rule: 'Where = place (asking for hometown, country, location).', example: 'Where does Emily come from? Bristol, England.' },
      { rule: 'Why = reason, answered with "Because".', example: 'Why does she take the bus? Because her office is far away.' },
      { rule: 'How old = asking for age.', example: 'How old is Emily? She is 29 years old.' },
      { rule: 'What = asking for things, occupations, or objects.', example: 'What is your favourite drink?' },
    ],
    examples: [
      { id: 'ex-06-1', english: 'Where does Lisa live? Near the mountains.', german: 'Wo wohnt Lisa? In der Nähe der Berge.' },
      { id: 'ex-06-2', english: 'Why does she take the bus? Because her office is far away.', german: 'Warum nimmt sie den Bus? Weil ihr Büro weit weg ist.' },
      { id: 'ex-06-3', english: 'How old are you? I am 24 years old.', german: 'Wie alt bist du? Ich bin 24 Jahre alt.' },
    ],
    keyVocabularyIds: ['v-live', 'v-work', 'v-bus'],
    practiceQuestions: [
      {
        id: 'q-06-1',
        type: 'multiple-choice',
        prompt: '"_______ does Emily come from?" "Bristol, England."',
        options: ['Where', 'What', 'Who', 'When'],
        expectedAnswer: 'Where',
        explanation: 'Bristol is a city (place), so we ask "Where...?"',
      },
      {
        id: 'q-06-2',
        type: 'fill-blank',
        prompt: '"_______ old is your sister?" "She is 29."',
        expectedAnswer: 'How',
        alternateAnswers: ['how'],
        explanation: 'We ask "How old...?" to enquire about age.',
      },
      {
        id: 'q-06-3',
        type: 'multiple-choice',
        prompt: '"_______ does she take the bus?" "Because her office is far away."',
        options: ['Why', 'When', 'Where', 'What'],
        expectedAnswer: 'Why',
        explanation: 'When the answer begins with "Because" (reason), the question word is "Why".',
      },
      {
        id: 'q-06-4',
        type: 'fill-blank',
        prompt: '"_______ is your favourite actor?" "Tom Hanks."',
        expectedAnswer: 'Who',
        alternateAnswers: ['who'],
        explanation: 'Tom Hanks is a person, so we ask "Who".',
      },
      {
        id: 'q-06-5',
        type: 'multiple-choice',
        prompt: '"_______ do you spell your surname?" "S-M-I-T-H."',
        options: ['How', 'What', 'Where', 'Why'],
        expectedAnswer: 'How',
        explanation: 'To ask about the spelling or manner: "How do you spell...?"',
      },
      {
        id: 'q-06-6',
        type: 'fill-blank',
        prompt: '"_______ do you wake up on Saturdays?" "At 8:30 in the morning."',
        expectedAnswer: 'When',
        alternateAnswers: ['when', 'What time', 'what time'],
        explanation: 'Asking for time or day uses "When" (or "What time").',
      },
      {
        id: 'q-06-7',
        type: 'multiple-choice',
        prompt: 'Choose the correct question order:',
        options: [
          'Where do you work?',
          'Where you work?',
          'Where you do work?',
          'Where work you?',
        ],
        expectedAnswer: 'Where do you work?',
        explanation: 'Question word (Where) + auxiliary (do) + subject (you) + base verb (work)?',
      },
      {
        id: 'q-06-8',
        type: 'fill-blank',
        prompt: '"_______ is Emily\'s job?" "She is a graphic designer."',
        expectedAnswer: 'What',
        alternateAnswers: ['what'],
        explanation: 'To ask about someone\'s profession: "What is Emily\'s job?"',
      },
      {
        id: 'q-06-9',
        type: 'multiple-choice',
        prompt: '"_______ do Lisa and her brother do on Saturdays?" "They go to the mountains."',
        options: ['What', 'Where', 'Who', 'How'],
        expectedAnswer: 'What',
        explanation: 'Asking about an activity: "What do they do...?"',
      },
      {
        id: 'q-06-10',
        type: 'word-order',
        prompt: 'Form the question: "does / Where / brother / your / work / ?"',
        expectedAnswer: 'Where does your brother work?',
        alternateAnswers: ['Where does your brother work'],
        words: ['Where', 'does', 'your', 'brother', 'work', '?'],
        explanation: 'Question word (Where) + Does + subject (your brother) + base verb (work)?',
      },
    ],
  },

  // ==========================================
  // LESSON 7: Frequency Adverbs (always, usually, often, sometimes, never)
  // ==========================================
  {
    id: 'lesson-07',
    number: 7,
    title: 'Frequency Adverbs: always, usually, often, sometimes, never',
    unit: 'Unit 2B',
    category: 'Present Simple Mastery',
    estimatedMinutes: 20,
    description: 'Learn the frequency scale (100% to 0%) and the exact positioning rules before main verbs and after TO BE.',
    explanation:
      'Adverbs of frequency tell us how often something happens:\n• always (100% - immer)\n• usually (80% - normalerweise)\n• often (60% - oft)\n• sometimes (30% - manchmal)\n• never (0% - nie)\n\nTHE TWO GOLDEN POSITION RULES:\n1. BEFORE most main verbs: "She often walks in the park." "I never drink coffee."\n2. AFTER the verb TO BE (am/is/are): "He is always tired." "They are usually late."',
    crucialRule: {
      title: 'The Frequency Position Rule',
      transformation: 'Main verb: She [often] walks in the park. | Verb TO BE: She is [always] happy.',
      explanation: 'Put the frequency adverb BEFORE action verbs (walks, drinks, works), but AFTER am, is, are.',
    },
    rules: [
      { rule: 'Position 1: BEFORE main verbs.', example: 'Lisa often goes to the mountains. (NOT Lisa goes often).' },
      { rule: 'Position 2: AFTER am, is, are.', example: 'The weather in Vancouver is often cold.' },
      { rule: '"Never" already has negative meaning: do not use not with never.', example: 'He never drinks tea. (NOT He doesn\'t never drink tea).' },
      { rule: 'Frequency scale: always (100%) > usually (80%) > often (60%) > sometimes (30%) > never (0%).', example: 'I always have breakfast.' },
    ],
    examples: [
      { id: 'ex-07-1', english: 'After work, Emily often walks in the park.', german: 'Nach der Arbeit geht Emily oft im Park spazieren.' },
      { id: 'ex-07-2', english: 'He is always on time for English class.', german: 'Er ist immer pünktlich zum Englischunterricht.' },
      { id: 'ex-07-3', english: 'I never drink coffee with milk.', german: 'Ich trinke nie Kaffee mit Milch.' },
      { id: 'ex-07-4', english: 'They usually take the train home.', german: 'Sie nehmen normalerweise den Zug nach Hause.' },
    ],
    keyVocabularyIds: ['v-work', 'v-tea', 'v-coffee', 'v-weekend'],
    practiceQuestions: [
      {
        id: 'q-07-1',
        type: 'multiple-choice',
        prompt: 'Choose the correct word order:',
        options: [
          'Emily often walks in the park.',
          'Emily walks often in the park.',
          'Often Emily walks in the park.',
          'Emily walks in the park often.',
        ],
        expectedAnswer: 'Emily often walks in the park.',
        explanation: 'Frequency adverbs go BEFORE the main verb: "often walks".',
      },
      {
        id: 'q-07-2',
        type: 'multiple-choice',
        prompt: 'Choose the sentence with the correct position after "to be":',
        options: [
          'He is always tired on Monday mornings.',
          'He always is tired on Monday mornings.',
          'Always he is tired on Monday mornings.',
          'He tired is always on Monday mornings.',
        ],
        expectedAnswer: 'He is always tired on Monday mornings.',
        explanation: 'Frequency adverbs go AFTER the verb to be (am/is/are): "is always tired".',
      },
      {
        id: 'q-07-3',
        type: 'fill-blank',
        prompt: 'Translate into English: "Er trinkt nie Kaffee." ➔ He _______ drinks coffee.',
        expectedAnswer: 'never',
        explanation: 'German "nie" = English "never".',
      },
      {
        id: 'q-07-4',
        type: 'multiple-choice',
        prompt: 'Which sentence has INCORRECT word order?',
        options: [
          'David drinks usually coffee in the morning.',
          'David usually drinks coffee in the morning.',
          'David is always happy.',
          'David never eats meat.',
        ],
        expectedAnswer: 'David drinks usually coffee in the morning.',
        explanation: '"drinks usually" is wrong because "usually" must go before the main verb: "usually drinks".',
      },
      {
        id: 'q-07-5',
        type: 'fill-blank',
        prompt: 'German "normalerweise" in English is: _______',
        expectedAnswer: 'usually',
        explanation: '"normalerweise" translates to "usually".',
      },
      {
        id: 'q-07-6',
        type: 'multiple-choice',
        prompt: 'Put "sometimes" in the correct place: "We (A) have (B) breakfast (C) in a café (D)."',
        options: ['Position A (We sometimes have)', 'Position B (have sometimes)', 'Position C', 'Position D'],
        expectedAnswer: 'Position A (We sometimes have)',
        explanation: 'Before the main verb "have": "We sometimes have breakfast".',
      },
      {
        id: 'q-07-7',
        type: 'fill-blank',
        prompt: 'They are _______ late for work. (German: immer)',
        expectedAnswer: 'always',
        explanation: '"immer" = "always". It stands after "are": "They are always late".',
      },
      {
        id: 'q-07-8',
        type: 'multiple-choice',
        prompt: 'Which sentence correctly uses "never"?',
        options: [
          'She never speaks German in English class.',
          'She doesn\'t never speak German in English class.',
          'She speaks never German in English class.',
          'She never doesn\'t speak German in English class.',
        ],
        expectedAnswer: 'She never speaks German in English class.',
        explanation: '"never" already carries negative meaning, so do not add "doesn\'t": "She never speaks...".',
      },
      {
        id: 'q-07-9',
        type: 'fill-blank',
        prompt: 'Complete with the opposite of never: "100% of the time" = _______',
        expectedAnswer: 'always',
        explanation: '100% frequency is "always".',
      },
      {
        id: 'q-07-10',
        type: 'word-order',
        prompt: 'Arrange the sentence: "train / take / usually / They / the"',
        expectedAnswer: 'They usually take the train.',
        alternateAnswers: ['They usually take the train'],
        words: ['They', 'usually', 'take', 'the', 'train', '.'],
        explanation: 'Subject (They) + adverb (usually) + main verb (take) + object (the train).',
      },
    ],
  },

  // ==========================================
  // LESSON 8: Possessive Adjectives & Possessive 's
  // ==========================================
  {
    id: 'lesson-08',
    number: 8,
    title: 'Possessive Adjectives & Possessive \'s',
    unit: 'Unit 1C & 2C',
    category: 'Grammar Foundations',
    estimatedMinutes: 15,
    description: 'Learn my, your, his, her, its, our, their and when to use \'s for people\'s belongings.',
    explanation:
      'We use possessive adjectives before nouns to show who owns something:\n• I ➔ my | you ➔ your | he ➔ his | she ➔ her | it ➔ its | we ➔ our | they ➔ their\n\nTo show possession for a person\'s name, add \'s:\n• Emily\'s apartment | Lisa\'s brother | Sarah\'s notebook\n\nBe careful not to confuse:\n• He\'s = he is (short form of is)\n• His = possessive adjective (his car, his brother)',
    crucialRule: {
      title: 'His vs. Her vs. Possessive \'s',
      transformation: 'For a man: his book | For a woman: her book | For a name: Emily\'s book',
      explanation: 'Use "his" for men/boys, "her" for women/girls, and add "\'s" to names.',
    },
    rules: [
      { rule: 'Use "his" for males, "her" for females.', example: 'Marco and his wife. Lisa and her brother.' },
      { rule: 'Add \'s to names for possession.', example: 'This is Sarah\'s bag. Emily\'s apartment has a nice view.' },
      { rule: 'Do not confuse he\'s (he is) with his (possessive).', example: 'He is tall. His name is David.' },
      { rule: 'Plural possession: their.', example: 'My parents and their house.' },
    ],
    examples: [
      { id: 'ex-08-1', english: 'Lisa lives with her brother in a small town.', german: 'Lisa lebt mit ihrem Bruder in einer Kleinstadt.' },
      { id: 'ex-08-2', english: 'David drinks his coffee with milk.', german: 'David trinkt seinen Kaffee mit Milch.' },
      { id: 'ex-08-3', english: 'What is your teacher\'s name?', german: 'Wie heißt dein Lehrer?' },
    ],
    keyVocabularyIds: ['v-live', 'v-work'],
    practiceQuestions: [
      {
        id: 'q-08-1',
        type: 'fill-blank',
        prompt: 'Elena loves music. _______ (She) favourite singer is Adele.',
        expectedAnswer: 'Her',
        alternateAnswers: ['her'],
        explanation: 'Possessive adjective for "she" is "Her".',
      },
      {
        id: 'q-08-2',
        type: 'multiple-choice',
        prompt: 'David is a doctor. _______ hospital is in Manchester.',
        options: ['His', 'He', 'Her', 'Him'],
        expectedAnswer: 'His',
        explanation: 'For a male (David), use possessive "His".',
      },
      {
        id: 'q-08-3',
        type: 'fill-blank',
        prompt: 'This is _______ (Emily) new apartment on the tenth floor.',
        expectedAnswer: "Emily's",
        alternateAnswers: ['Emilys'],
        explanation: 'Add \'s to the person\'s name to show possession: "Emily\'s".',
      },
      {
        id: 'q-08-4',
        type: 'multiple-choice',
        prompt: 'Choose the correct sentence:',
        options: [
          'This is my brother\'s car.',
          'This is my brothers car.',
          'This is my brother car.',
          'This is car my brother.',
        ],
        expectedAnswer: 'This is my brother\'s car.',
        explanation: 'Possession requires \'s: "brother\'s car".',
      },
      {
        id: 'q-08-5',
        type: 'fill-blank',
        prompt: 'We live in Canada. _______ (We) apartment is in Vancouver.',
        expectedAnswer: 'Our',
        alternateAnswers: ['our'],
        explanation: 'Possessive adjective for "we" is "Our".',
      },
      {
        id: 'q-08-6',
        type: 'multiple-choice',
        prompt: 'My parents sold _______ old house.',
        options: ['their', 'there', 'they\'re', 'them'],
        expectedAnswer: 'their',
        explanation: 'Possessive for plural third person (parents/they) is "their".',
      },
      {
        id: 'q-08-7',
        type: 'fill-blank',
        prompt: '"Is this _______ (you) dictionary on the desk?"',
        expectedAnswer: 'your',
        explanation: 'Possessive for "you" is "your".',
      },
      {
        id: 'q-08-8',
        type: 'multiple-choice',
        prompt: 'Which word correctly completes: "Marco and _______ girlfriend live in Rome."',
        options: ['his', 'her', 'he\'s', 'him'],
        expectedAnswer: 'his',
        explanation: 'Marco is male, so use "his girlfriend".',
      },
      {
        id: 'q-08-9',
        type: 'fill-blank',
        prompt: 'The dog wagged _______ (it) tail.',
        expectedAnswer: 'its',
        explanation: 'Possessive for an animal/thing is "its" (without apostrophe).',
      },
      {
        id: 'q-08-10',
        type: 'multiple-choice',
        prompt: 'What is the difference between "he\'s" and "his"?',
        options: [
          '"he\'s" means "he is", while "his" shows possession.',
          '"he\'s" shows possession, while "his" means "he is".',
          'They have the exact same meaning.',
          '"his" is only used for women.',
        ],
        expectedAnswer: '"he\'s" means "he is", while "his" shows possession.',
        explanation: 'He\'s is the contraction of "he is". His indicates ownership (his bag).',
      },
    ],
  },

  // ==========================================
  // LESSON 9: Articles, Plurals, Demonstratives & Imperatives
  // ==========================================
  {
    id: 'lesson-09',
    number: 9,
    title: 'Articles, Plural Nouns, Demonstratives & Imperatives',
    unit: 'Unit 1B & 1C',
    category: 'Foundations & Vocabulary',
    estimatedMinutes: 20,
    description: 'Learn a vs. an, irregular plurals, this/that/these/those, and simple classroom instructions.',
    explanation:
      '1. Articles:\n• Use A before consonant sounds: a book, a dictionary, a pen, a university (/j/).\n• Use AN before vowel sounds (a, e, i, o, u): an apple, an apartment, an hour (/aʊ/).\n\n2. Plural Nouns:\n• Most nouns add -s: book ➔ books.\n• Ending in -ch, -sh, -ss, -x: add -es: glass ➔ glasses, watch ➔ watches.\n• Irregular plurals: child ➔ children, man ➔ men, woman ➔ women, person ➔ people.\n\n3. Demonstratives:\n• Near: THIS (singular), THESE (plural)\n• Far: THAT (singular), THOSE (plural)\n\n4. Imperatives (Classroom commands):\n• Base verb for commands: Open your book! Listen! Write your name!\n• Negative imperative: Don\'t speak German! Don\'t look!',
    rules: [
      { rule: 'A before consonant sounds; AN before vowel sounds.', example: 'an apple, a notebook, an apartment' },
      { rule: 'Irregular plurals must be memorised.', example: 'child ➔ children, woman ➔ women, person ➔ people' },
      { rule: 'This/These = near speaker; That/Those = far from speaker.', example: 'These keys in my hand. That picture on the wall.' },
      { rule: 'Negative imperatives use "Don\'t + verb".', example: 'Don\'t open your books yet.' },
    ],
    examples: [
      { id: 'ex-09-1', english: 'Take an apple and a sandwich for lunch.', german: 'Nimm einen Apfel und ein Sandwich zum Mittagessen.' },
      { id: 'ex-09-2', english: 'These are my house keys on the table.', german: 'Das hier sind meine Hausschlüssel auf dem Tisch.' },
      { id: 'ex-09-3', english: 'Open your books at page 14, please.', german: 'Öffnet bitte eure Bücher auf Seite 14.' },
    ],
    keyVocabularyIds: ['v-tea', 'v-coffee'],
    practiceQuestions: [
      {
        id: 'q-09-1',
        type: 'multiple-choice',
        prompt: 'Complete with the correct articles: "He has _______ apple and _______ dictionary."',
        options: ['an / a', 'a / an', 'an / an', 'a / a'],
        expectedAnswer: 'an / a',
        explanation: '"Apple" begins with vowel sound (/æ/) ➔ an. "Dictionary" begins with consonant (/d/) ➔ a.',
      },
      {
        id: 'q-09-2',
        type: 'fill-blank',
        prompt: 'Emily lives in _______ (a / an) apartment on the tenth floor.',
        expectedAnswer: 'an',
        explanation: '"Apartment" starts with a vowel sound, so use "an apartment".',
      },
      {
        id: 'q-09-3',
        type: 'multiple-choice',
        prompt: 'What is the plural of "child"?',
        options: ['children', 'childs', 'childrens', 'childes'],
        expectedAnswer: 'children',
        explanation: '"child" is irregular: one child, two children.',
      },
      {
        id: 'q-09-4',
        type: 'multiple-choice',
        prompt: 'Look at the keys here in my hand! _______ are my keys.',
        options: ['These', 'Those', 'This', 'That'],
        expectedAnswer: 'These',
        explanation: 'Plural (keys) and near the speaker uses "These".',
      },
      {
        id: 'q-09-5',
        type: 'multiple-choice',
        prompt: 'Look at that woman over there across the street! Who is _______ woman?',
        options: ['that', 'this', 'those', 'these'],
        expectedAnswer: 'that',
        explanation: 'Singular and far from the speaker uses "that".',
      },
      {
        id: 'q-09-6',
        type: 'fill-blank',
        prompt: 'What is the plural of "watch" (die Armbanduhr)?',
        expectedAnswer: 'watches',
        explanation: 'Words ending in -ch add -es in the plural: "watches".',
      },
      {
        id: 'q-09-7',
        type: 'multiple-choice',
        prompt: 'Choose the correct negative classroom instruction:',
        options: [
          'Don\'t speak German during the test!',
          'Not speak German during the test!',
          'Doesn\'t speak German during the test!',
          'No speaking German during the test!',
        ],
        expectedAnswer: 'Don\'t speak German during the test!',
        explanation: 'Negative imperatives use "Don\'t + base verb": "Don\'t speak".',
      },
      {
        id: 'q-09-8',
        type: 'fill-blank',
        prompt: 'Plural of "man" is: _______',
        expectedAnswer: 'men',
        explanation: 'Irregular vowel change: man ➔ men.',
      },
      {
        id: 'q-09-9',
        type: 'multiple-choice',
        prompt: '"_______ your dictionaries and turn to page 20." (Classroom instruction)',
        options: ['Open', 'Opens', 'Opening', 'To open'],
        expectedAnswer: 'Open',
        explanation: 'Imperative instructions use the base form of the verb: "Open".',
      },
      {
        id: 'q-09-10',
        type: 'fill-blank',
        prompt: 'Complete with this/that/these/those: "Look at _______ birds far away in the sky!"',
        expectedAnswer: 'those',
        explanation: 'Plural (birds) and far away uses "those".',
      },
    ],
  },

  // ==========================================
  // LESSON 10: Lisa's Weekend Routine (Verified Course Text)
  // ==========================================
  {
    id: 'lesson-10',
    number: 10,
    title: 'Daily Routines & Reading: Lisa\'s Weekend',
    unit: 'Unit 2B & Repetition Worksheet',
    category: 'Reading & Routines',
    estimatedMinutes: 20,
    description: 'Practise reading comprehension based on Lisa\'s authentic routine from your course revision notes.',
    explanation:
      'This reading passage is based directly on the six course notes covering Lisa\'s routine. Pay attention to how the Simple Present is used to describe habitual actions on Saturdays, what she eats and drinks, and how she travels.',
    readingPassage: {
      title: 'Lisa\'s Routine — Revision Practice from Course Notes',
      text: 'Lisa lives in a small town near the mountains. She works at a hotel. On Saturdays, she goes to the mountains with her brother. They have breakfast together, drink tea and eat sandwiches. In the afternoon, Lisa reads a book, and her brother takes photos. In the evening, they take the train home.',
    },
    rules: [
      { rule: 'Third person -s for routines: lives, works, goes, reads, takes.', example: 'Lisa lives near the mountains. Her brother takes photos.' },
      { rule: 'Plural routines: have, drink, eat, take.', example: 'They have breakfast and drink tea.' },
      { rule: 'Time expressions with days: On Saturdays (every Saturday).', example: 'On Saturdays, she goes to the mountains.' },
    ],
    examples: [
      { id: 'ex-10-1', english: 'Where does Lisa live? In a small town near the mountains.', german: 'Wo wohnt Lisa? In einer Kleinstadt in der Nähe der Berge.' },
      { id: 'ex-10-2', english: 'Where does she work? At a hotel.', german: 'Wo arbeitet sie? In einem Hotel.' },
      { id: 'ex-10-3', english: 'What do they drink? They drink tea.', german: 'Was trinken sie? Sie trinken Tee.' },
    ],
    keyVocabularyIds: ['v-live', 'v-work', 'v-tea'],
    practiceQuestions: [
      {
        id: 'q-10-1',
        type: 'multiple-choice',
        prompt: 'Where does Lisa live?',
        options: [
          'In a small town near the mountains',
          'In a big city near the beach',
          'In London with her friend',
          'In Berlin near a hospital',
        ],
        expectedAnswer: 'In a small town near the mountains',
        explanation: 'The text states: "Lisa lives in a small town near the mountains."',
      },
      {
        id: 'q-10-2',
        type: 'multiple-choice',
        prompt: 'Where does Lisa work?',
        options: ['At a hotel', 'At a hospital', 'In an office', 'In a school'],
        expectedAnswer: 'At a hotel',
        explanation: 'The text explicitly says: "She works at a hotel."',
      },
      {
        id: 'q-10-3',
        type: 'multiple-choice',
        prompt: 'Who does Lisa go to the mountains with on Saturdays?',
        options: ['Her brother', 'Her boyfriend', 'Her teacher', 'Her friend Claire'],
        expectedAnswer: 'Her brother',
        explanation: 'The text states: "On Saturdays, she goes to the mountains with her brother."',
      },
      {
        id: 'q-10-4',
        type: 'fill-blank',
        prompt: 'What do Lisa and her brother drink for breakfast? They drink _______.',
        expectedAnswer: 'tea',
        explanation: 'The passage says: "drink tea and eat sandwiches."',
      },
      {
        id: 'q-10-5',
        type: 'multiple-choice',
        prompt: 'What do they eat for breakfast in the mountains?',
        options: ['Sandwiches', 'Pancakes', 'Pizza', 'Salad'],
        expectedAnswer: 'Sandwiches',
        explanation: 'The text states: "...drink tea and eat sandwiches."',
      },
      {
        id: 'q-10-6',
        type: 'multiple-choice',
        prompt: 'What does Lisa\'s brother do in the afternoon?',
        options: [
          'He takes photos.',
          'He reads a book.',
          'He goes skiing.',
          'He plays football.',
        ],
        expectedAnswer: 'He takes photos.',
        explanation: 'The text states: "...and her brother takes photos."',
      },
      {
        id: 'q-10-7',
        type: 'fill-blank',
        prompt: 'How do Lisa and her brother travel home in the evening? They take the _______.',
        expectedAnswer: 'train',
        explanation: 'The passage concludes: "In the evening, they take the train home."',
      },
      {
        id: 'q-10-8',
        type: 'multiple-choice',
        prompt: 'What does Lisa do in the afternoon while her brother takes photos?',
        options: ['She reads a book.', 'She sleeps.', 'She works at the hotel.', 'She buys food.'],
        expectedAnswer: 'She reads a book.',
        explanation: 'The text says: "Lisa reads a book, and her brother takes photos."',
      },
    ],
  },

  // ==========================================
  // LESSON 11: Emily in Canada (Verified Course Text)
  // ==========================================
  {
    id: 'lesson-11',
    number: 11,
    title: 'Reading Comprehension: Emily in Canada',
    unit: 'Unit 1A & 2A',
    category: 'Reading Comprehension',
    estimatedMinutes: 20,
    description: 'Interactive reading practice with audio pronunciation, word lookup, and comprehension checks.',
    explanation:
      'Read Emily\'s profile carefully. Notice how she uses the Simple Present for her current home, transport, boyfriend, and activities, and the Past Simple ("moved") for her relocation three years ago.',
    readingPassage: {
      title: 'Emily — revision practice based on my course notes',
      text: 'Emily is 29 years old and comes from Bristol, England. She is a graphic designer. Three years ago, she moved to Canada. Now, she lives in Vancouver in an apartment on the tenth floor. Her apartment has a beautiful view of the mountains and the city, and it is near a park. After work, she often walks in the park. She has a Canadian boyfriend. She takes the bus to work because her office is far away. In Vancouver, the weather is colder than in England, and it snows in winter. In winter, Emily goes skiing with her boyfriend, and in summer she goes hiking. She loves Canada, but she misses her family, her friends, and English tea.',
    },
    rules: [
      { rule: 'Scan for specific facts: age, job, transport, weather.', example: 'Age: 29 | Job: graphic designer | Transport: bus' },
      { rule: 'Contrast because (reason) vs but (contrast).', example: 'She takes the bus because her office is far away. She loves Canada, but she misses English tea.' },
    ],
    examples: [
      { id: 'ex-11-1', english: 'Where does Emily come from? She comes from Bristol, England.', german: 'Woher kommt Emily? Sie kommt aus Bristol, England.' },
      { id: 'ex-11-2', english: 'Why does she take the bus? Because her office is far away.', german: 'Warum nimmt sie den Bus? Weil ihr Büro weit weg ist.' },
    ],
    keyVocabularyIds: ['v-uk-british', 'v-live', 'v-work', 'v-tea'],
    practiceQuestions: [
      {
        id: 'q-11-1',
        type: 'multiple-choice',
        prompt: 'Where does Emily come from?',
        options: ['Bristol, England', 'Vancouver, Canada', 'Manchester, UK', 'London, England'],
        expectedAnswer: 'Bristol, England',
        explanation: 'The text states: "Emily is 29 years old and comes from Bristol, England."',
      },
      {
        id: 'q-11-2',
        type: 'multiple-choice',
        prompt: 'What is Emily\'s job?',
        options: ['Graphic designer', 'English teacher', 'Doctor', 'Hotel receptionist'],
        expectedAnswer: 'Graphic designer',
        explanation: 'The text says: "She is a graphic designer."',
      },
      {
        id: 'q-11-3',
        type: 'multiple-choice',
        prompt: 'Why does Emily take the bus to work?',
        options: [
          'Because her office is far away',
          'Because she does not have a bicycle',
          'Because it is too cold',
          'Because she likes buses',
        ],
        expectedAnswer: 'Because her office is far away',
        explanation: 'The text states: "She takes the bus to work because her office is far away."',
      },
      {
        id: 'q-11-4',
        type: 'fill-blank',
        prompt: 'What outdoor activity does Emily do in winter with her boyfriend? She goes _______.',
        expectedAnswer: 'skiing',
        explanation: 'The text says: "In winter, Emily goes skiing with her boyfriend."',
      },
      {
        id: 'q-11-5',
        type: 'multiple-choice',
        prompt: 'What does Emily miss about England?',
        options: [
          'Her family, her friends, and English tea',
          'The weather and the buses',
          'Her apartment and her job',
          'The mountains and the parks',
        ],
        expectedAnswer: 'Her family, her friends, and English tea',
        explanation: 'The text ends: "...she misses her family, her friends, and English tea."',
      },
      {
        id: 'q-11-6',
        type: 'fill-blank',
        prompt: 'How old is Emily? She is _______ years old.',
        expectedAnswer: '29',
        alternateAnswers: ['twenty-nine', 'twenty nine'],
        explanation: 'The text begins: "Emily is 29 years old..."',
      },
      {
        id: 'q-11-7',
        type: 'multiple-choice',
        prompt: 'Where is Emily\'s apartment located?',
        options: [
          'On the tenth floor in Vancouver',
          'On the first floor in Bristol',
          'In a small village near Munich',
          'Inside an office building',
        ],
        expectedAnswer: 'On the tenth floor in Vancouver',
        explanation: 'The text says: "...in an apartment on the tenth floor."',
      },
      {
        id: 'q-11-8',
        type: 'fill-blank',
        prompt: 'What does Emily do in summer? She goes _______.',
        expectedAnswer: 'hiking',
        explanation: 'The text states: "...and in summer she goes hiking."',
      },
    ],
  },

  // ==========================================
  // LESSON 12: Classroom Objects & Personal Possessions
  // ==========================================
  {
    id: 'lesson-12',
    number: 12,
    title: 'Classroom Objects & Everyday Possessions',
    unit: 'Unit 1B & 1C',
    category: 'Foundations & Vocabulary',
    estimatedMinutes: 15,
    description: 'Learn everyday objects: dictionary, notebook, pen, umbrella, keys, glasses, laptop.',
    explanation:
      'Master the vocabulary for objects you have in your bag and in the classroom. Learn the distinction between singular items (a pen, an umbrella) and plural items that always take a plural verb (glasses, scissors).',
    rules: [
      { rule: '"Glasses" is always plural.', example: 'My glasses are on the table. (NOT is on the table).' },
      { rule: 'Articles with objects: a pen, an umbrella, a dictionary.', example: 'Do you have an umbrella?' },
    ],
    examples: [
      { id: 'ex-12-1', english: 'I have a notebook and two pens in my bag.', german: 'Ich habe ein Notizbuch und zwei Stifte in meiner Tasche.' },
      { id: 'ex-12-2', english: 'Where are my glasses? They are on your head!', german: 'Wo ist meine Brille? Sie ist auf deinem Kopf!' },
    ],
    keyVocabularyIds: ['v-pen', 'v-dictionary', 'v-notebook', 'v-glasses'],
    practiceQuestions: [
      {
        id: 'q-12-1',
        type: 'multiple-choice',
        prompt: 'What do you use to look up the meaning of an English word?',
        options: ['A dictionary', 'An umbrella', 'A wallet', 'A ticket'],
        expectedAnswer: 'A dictionary',
        explanation: 'German "das Wörterbuch" = English "a dictionary".',
      },
      {
        id: 'q-12-2',
        type: 'fill-blank',
        prompt: 'Translate into English: "die Brille" = _______',
        expectedAnswer: 'glasses',
        alternateAnswers: ['a pair of glasses'],
        explanation: 'German "die Brille" is always plural in English: "glasses".',
      },
      {
        id: 'q-12-3',
        type: 'multiple-choice',
        prompt: '"Are these your house _______ on the table?"',
        options: ['keys', 'key', 'keyes', 'pen'],
        expectedAnswer: 'keys',
        explanation: 'Plural of key is "keys".',
      },
      {
        id: 'q-12-4',
        type: 'fill-blank',
        prompt: 'Translate into English: "der Regenschirm" = an _______',
        expectedAnswer: 'umbrella',
        explanation: '"der Regenschirm" = "umbrella".',
      },
      {
        id: 'q-12-5',
        type: 'multiple-choice',
        prompt: 'Which verb form is correct with "glasses"?',
        options: ['My glasses are on the desk.', 'My glasses is on the desk.', 'My glasses be on the desk.', 'My glass are on the desk.'],
        expectedAnswer: 'My glasses are on the desk.',
        explanation: '"glasses" takes a plural verb (are).',
      },
      {
        id: 'q-12-6',
        type: 'fill-blank',
        prompt: 'Translate: "der Kugelschreiber" = a _______',
        expectedAnswer: 'pen',
        alternateAnswers: ['ballpoint pen'],
        explanation: '"der Kugelschreiber" = "pen" or "ballpoint pen".',
      },
      {
        id: 'q-12-7',
        type: 'multiple-choice',
        prompt: 'Which item protects you from rain?',
        options: ['An umbrella', 'A dictionary', 'A pencil', 'A notebook'],
        expectedAnswer: 'An umbrella',
        explanation: 'An umbrella protects against rain.',
      },
      {
        id: 'q-12-8',
        type: 'fill-blank',
        prompt: 'Translate into English: "das Notizbuch" = a _______',
        expectedAnswer: 'notebook',
        explanation: '"das Notizbuch" = "notebook".',
      },
    ],
  },

  // ==========================================
  // LESSON 13: Drinks, Snacks & Ordering in a Café
  // ==========================================
  {
    id: 'lesson-13',
    number: 13,
    title: 'Drinks, Snacks & Ordering in a Café',
    unit: 'Unit 2A',
    category: 'Vocabulary & Communication',
    estimatedMinutes: 15,
    description: 'Practise café vocabulary (tea, coffee, mineral water) and polite requests with "Could I have...?"',
    explanation:
      'In an English café, we order politely using:\n• "Could I have a coffee, please?"\n• "Can I have an orange juice, please?"\n• "How much is that?" (asking for price)\n\nNever order with "I want a coffee" — that sounds rude to native speakers!',
    rules: [
      { rule: 'Polite ordering formula: Could I have + item + please?', example: 'Could I have a cup of tea, please?' },
      { rule: 'Asking price: How much is that? / How much are the sandwiches?', example: 'How much is a bottle of mineral water?' },
    ],
    examples: [
      { id: 'ex-13-1', english: 'Could I have a coffee and a croissant, please?', german: 'Könnte ich bitte einen Kaffee und ein Croissant haben?' },
      { id: 'ex-13-2', english: 'Still or sparkling water? Still, please.', german: 'Wasser mit oder ohne Kohlensäure? Ohne, bitte.' },
    ],
    keyVocabularyIds: ['v-tea', 'v-coffee'],
    practiceQuestions: [
      {
        id: 'q-13-1',
        type: 'multiple-choice',
        prompt: 'How do you ask politely for a drink in an English café?',
        options: [
          'Could I have a coffee, please?',
          'I want a coffee now.',
          'Give me a coffee.',
          'Coffee is for me.',
        ],
        expectedAnswer: 'Could I have a coffee, please?',
        explanation: '"Could I have..., please?" is standard polite English in cafés.',
      },
      {
        id: 'q-13-2',
        type: 'fill-blank',
        prompt: 'In the morning, I _______ (drink) a cup of tea with milk.',
        expectedAnswer: 'drink',
        explanation: 'Subject "I" takes the base form: "I drink".',
      },
      {
        id: 'q-13-3',
        type: 'multiple-choice',
        prompt: 'How do you ask for the price?',
        options: ['How much is that?', 'How many is that?', 'What cost is that?', 'How money is that?'],
        expectedAnswer: 'How much is that?',
        explanation: 'We ask "How much is that?" for prices.',
      },
      {
        id: 'q-13-4',
        type: 'fill-blank',
        prompt: 'Translate into English: "das Mineralwasser" = mineral _______',
        expectedAnswer: 'water',
        explanation: '"Mineralwasser" = "mineral water".',
      },
      {
        id: 'q-13-5',
        type: 'multiple-choice',
        prompt: '"Still or sparkling?" What does "still water" mean?',
        options: ['Water without gas / bubbles', 'Water with gas / bubbles', 'Hot water', 'Cold tea'],
        expectedAnswer: 'Water without gas / bubbles',
        explanation: 'Still water has no bubbles (ohne Kohlensäure).',
      },
      {
        id: 'q-13-6',
        type: 'fill-blank',
        prompt: 'Complete the polite phrase: "Could I _______ a sandwich, please?"',
        expectedAnswer: 'have',
        explanation: '"Could I have..." is the polite request formula.',
      },
      {
        id: 'q-13-7',
        type: 'multiple-choice',
        prompt: 'Which word means "der Kaffee"?',
        options: ['coffee', 'tea', 'milk', 'beer'],
        expectedAnswer: 'coffee',
        explanation: 'German "der Kaffee" = English "coffee".',
      },
      {
        id: 'q-13-8',
        type: 'word-order',
        prompt: 'Put the polite order in order: "a / have / tea / please / Could / I / ?"',
        expectedAnswer: 'Could I have a tea please?',
        alternateAnswers: ['Could I have a tea, please?'],
        words: ['Could', 'I', 'have', 'a', 'tea', 'please', '?'],
        explanation: 'Could I have a tea, please?',
      },
    ],
  },

  // ==========================================
  // LESSON 14: Free-Time Activities & Collocations
  // ==========================================
  {
    id: 'lesson-14',
    number: 14,
    title: 'Free-Time Activities & Collocations',
    unit: 'Unit 2B',
    category: 'Vocabulary & Communication',
    estimatedMinutes: 15,
    description: 'Learn common verb-noun collocations: play football, listen to music, go skiing/hiking.',
    explanation:
      'In English, verbs pair with specific activities:\n• PLAY: sports with a ball or games (play football, play tennis, play video games)\n• GO + -ing: sports and movement activities (go skiing, go hiking, go swimming)\n• LISTEN TO: always requires "to" (listen to pop music, listen to the radio)\n• READ: read a book, read the newspaper\n• WATCH: watch television, watch a film',
    rules: [
      { rule: 'Listen always takes "to": listen to music.', example: 'I listen to music on Sundays. (NOT I listen music).' },
      { rule: 'Go + verb-ing for sports/movement.', example: 'go skiing, go hiking, go shopping' },
      { rule: 'Play for ball sports and games.', example: 'play football, play tennis' },
    ],
    examples: [
      { id: 'ex-14-1', english: 'Emily goes skiing in winter and goes hiking in summer.', german: 'Emily fährt im Winter Ski und wandert im Sommer.' },
      { id: 'ex-14-2', english: 'I love to listen to music in the evening.', german: 'Ich liebe es, abends Musik zu hören.' },
    ],
    keyVocabularyIds: ['v-play', 'v-listen', 'v-go'],
    practiceQuestions: [
      {
        id: 'q-14-1',
        type: 'fill-blank',
        prompt: 'I love to listen _______ (preposition) music after work.',
        expectedAnswer: 'to',
        explanation: '"listen" always pairs with preposition "to": listen to music.',
      },
      {
        id: 'q-14-2',
        type: 'multiple-choice',
        prompt: 'Which collocation is correct?',
        options: ['play football', 'go football', 'do football', 'make football'],
        expectedAnswer: 'play football',
        explanation: 'Ball sports use "play": play football.',
      },
      {
        id: 'q-14-3',
        type: 'multiple-choice',
        prompt: 'In winter, they _______ skiing in the mountains.',
        options: ['go', 'play', 'do', 'make'],
        expectedAnswer: 'go',
        explanation: 'Activities ending in -ing use "go": go skiing.',
      },
      {
        id: 'q-14-4',
        type: 'fill-blank',
        prompt: 'On Saturday afternoons, Lisa _______ (read) a book.',
        expectedAnswer: 'reads',
        explanation: 'Subject "Lisa" (she) takes -s: "reads".',
      },
      {
        id: 'q-14-5',
        type: 'multiple-choice',
        prompt: 'Which verb pairs with "television"?',
        options: ['watch', 'see', 'listen', 'look'],
        expectedAnswer: 'watch',
        explanation: 'We say "watch television" or "watch TV".',
      },
      {
        id: 'q-14-6',
        type: 'fill-blank',
        prompt: 'Do you _______ (play / go) tennis at the weekend?',
        expectedAnswer: 'play',
        explanation: 'Tennis is a ball sport, so use "play tennis".',
      },
      {
        id: 'q-14-7',
        type: 'multiple-choice',
        prompt: 'Her brother _______ (take) beautiful photos of the mountains.',
        options: ['takes', 'take', 'takeing', 'is take'],
        expectedAnswer: 'takes',
        explanation: 'Third person singular: "takes photos".',
      },
      {
        id: 'q-14-8',
        type: 'fill-blank',
        prompt: 'In summer, Emily goes _______ (wandern) in the Canadian mountains.',
        expectedAnswer: 'hiking',
        explanation: 'German "wandern" = English "hiking".',
      },
    ],
  },

  // ==========================================
  // LESSON 15: Family Members & Relationships
  // ==========================================
  {
    id: 'lesson-15',
    number: 15,
    title: 'Family Members & Relationships',
    unit: 'Unit 2C',
    category: 'Vocabulary & Communication',
    estimatedMinutes: 15,
    description: 'Learn family terms: mother, father, brother, sister, parents, children, husband, wife.',
    explanation:
      'Learn the family vocabulary pairs:\n• mother & father ➔ parents (Eltern)\n• brother & sister ➔ siblings\n• husband (Ehemann) & wife (Ehefrau)\n• son & daughter ➔ children (Kinder)\n• boyfriend & girlfriend',
    rules: [
      { rule: 'Parents = mother and father together.', example: 'My parents live in Manchester.' },
      { rule: 'Children = plural of child.', example: 'They have two children.' },
    ],
    examples: [
      { id: 'ex-15-1', english: 'Lisa goes to the mountains with her brother.', german: 'Lisa geht mit ihrem Bruder in die Berge.' },
      { id: 'ex-15-2', english: 'Michael lives in Berlin with his wife, Sarah.', german: 'Michael lebt in Berlin mit seiner Frau, Sarah.' },
    ],
    keyVocabularyIds: ['v-family', 'v-parents', 'v-brother', 'v-sister'],
    practiceQuestions: [
      {
        id: 'q-15-1',
        type: 'fill-blank',
        prompt: 'My mother and father are my _______. (German: Eltern)',
        expectedAnswer: 'parents',
        explanation: 'Mother and father together are your "parents".',
      },
      {
        id: 'q-15-2',
        type: 'multiple-choice',
        prompt: 'What is the male partner in a marriage?',
        options: ['Husband', 'Wife', 'Brother', 'Son'],
        expectedAnswer: 'Husband',
        explanation: 'German "Ehemann" = English "husband".',
      },
      {
        id: 'q-15-3',
        type: 'fill-blank',
        prompt: 'A boy child is a son; a girl child is a _______.',
        expectedAnswer: 'daughter',
        explanation: 'German "Tochter" = English "daughter".',
      },
      {
        id: 'q-15-4',
        type: 'multiple-choice',
        prompt: 'What is the plural of "child"?',
        options: ['children', 'childs', 'childes', 'childrens'],
        expectedAnswer: 'children',
        explanation: 'One child, two children.',
      },
      {
        id: 'q-15-5',
        type: 'fill-blank',
        prompt: 'Lisa has one _______ (Bruder). His name is Marco.',
        expectedAnswer: 'brother',
        explanation: 'German "Bruder" = English "brother".',
      },
      {
        id: 'q-15-6',
        type: 'multiple-choice',
        prompt: 'What does "sister" mean?',
        options: ['Schwester', 'Bruder', 'Tante', 'Mutter'],
        expectedAnswer: 'Schwester',
        explanation: '"sister" = Schwester.',
      },
      {
        id: 'q-15-7',
        type: 'fill-blank',
        prompt: 'Emily has a Canadian _______ (Freund / Partner).',
        expectedAnswer: 'boyfriend',
        explanation: 'Male romantic partner = "boyfriend".',
      },
      {
        id: 'q-15-8',
        type: 'multiple-choice',
        prompt: 'Which word means "Frau" in a marriage?',
        options: ['Wife', 'Husband', 'Daughter', 'Sister'],
        expectedAnswer: 'Wife',
        explanation: 'German "Ehefrau" = English "wife".',
      },
    ],
  },

  // ==========================================
  // LESSON 16: Describing People & Social English
  // ==========================================
  {
    id: 'lesson-16',
    number: 16,
    title: 'Describing People: Appearance, Clothes & Social English',
    unit: 'Unit 1A & 2D',
    category: 'Writing & Speaking',
    estimatedMinutes: 20,
    description: 'Describe height, build, hair, eyes, facial features, and introduce yourself politely.',
    explanation:
      'When describing someone:\n1. Age & Height/Build use the verb TO BE: "He is around 40 years old. He is tall and slim."\n2. Hair, eyes & facial features use HAVE / HAS: "He has short dark hair. He has blue eyes and a beard."\n3. Accessories: "He wears glasses." / "He is wearing a suit."\n\nSocial English Introductions:\n• "Pleased to meet you." / "Nice to meet you."\n• "This is my friend, Marco."\n• "Where are you from?" "I\'m from Germany."',
    rules: [
      { rule: 'Use BE for height/build (is tall/slim); use HAVE for hair/eyes (has dark hair).', example: 'He is tall and has blue eyes.' },
      { rule: 'Glasses and beard: has a beard, wears glasses.', example: 'He has a beard and wears glasses.' },
      { rule: 'Polite introduction response: Pleased to meet you.', example: 'Hello, this is David. — Pleased to meet you, David.' },
    ],
    examples: [
      { id: 'ex-16-1', english: 'Mr. Green is tall and slim, and he wears glasses.', german: 'Herr Green ist groß und schlank, und er trägt eine Brille.' },
      { id: 'ex-16-2', english: 'This is my sister, Lisa. — Pleased to meet you, Lisa.', german: 'Das ist meine Schwester, Lisa. — Freut mich, dich kennenzulernen.' },
    ],
    keyVocabularyIds: ['v-tall', 'v-slim', 'v-glasses', 'v-beard'],
    practiceQuestions: [
      {
        id: 'q-16-1',
        type: 'multiple-choice',
        prompt: 'Which verb completes height and build: "He _______ tall and slim."',
        options: ['is', 'has', 'have', 'are'],
        expectedAnswer: 'is',
        explanation: 'Height and build take the verb "to be": "He is tall and slim."',
      },
      {
        id: 'q-16-2',
        type: 'fill-blank',
        prompt: 'Translate into English: "Er hat einen Bart." ➔ He has a _______.',
        expectedAnswer: 'beard',
        explanation: 'German "der Bart" = English "beard".',
      },
      {
        id: 'q-16-3',
        type: 'multiple-choice',
        prompt: 'Which sentence correctly describes hair?',
        options: [
          'She has long dark hair.',
          'She is long dark hair.',
          'She has long dark hairs.',
          'She have long dark hair.',
        ],
        expectedAnswer: 'She has long dark hair.',
        explanation: 'Hair is uncountable: "She has long dark hair".',
      },
      {
        id: 'q-16-4',
        type: 'fill-blank',
        prompt: 'German "schlank" in English is: _______',
        expectedAnswer: 'slim',
        alternateAnswers: ['slender'],
        explanation: '"schlank" = "slim".',
      },
      {
        id: 'q-16-5',
        type: 'multiple-choice',
        prompt: 'What is the natural polite response when someone is introduced to you?',
        options: [
          'Pleased to meet you.',
          'I am fine, thank you.',
          'Yes, please.',
          'See you later.',
        ],
        expectedAnswer: 'Pleased to meet you.',
        explanation: '"Pleased to meet you" or "Nice to meet you" is standard polite social English.',
      },
      {
        id: 'q-16-6',
        type: 'fill-blank',
        prompt: 'He _______ (wear) black glasses for reading.',
        expectedAnswer: 'wears',
        alternateAnswers: ['is wearing'],
        explanation: 'Third person singular: "wears glasses".',
      },
      {
        id: 'q-16-7',
        type: 'multiple-choice',
        prompt: 'Which word describes eye colour?',
        options: ['blue', 'tall', 'slim', 'young'],
        expectedAnswer: 'blue',
        explanation: '"blue" is an eye colour.',
      },
      {
        id: 'q-16-8',
        type: 'word-order',
        prompt: 'Put words in order: "sister / This / my / is / Lisa"',
        expectedAnswer: 'This is my sister Lisa.',
        alternateAnswers: ['This is my sister Lisa'],
        words: ['This', 'is', 'my', 'sister', 'Lisa', '.'],
        explanation: '"This is my sister Lisa" is used to introduce someone.',
      },
    ],
  },
];
