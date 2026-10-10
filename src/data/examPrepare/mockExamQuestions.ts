/**
 * Mock Exam Question Pool for Straightforward Elementary (Units 1–2D)
 * Simulates a realistic elementary English test covering:
 * Grammar (40%), Vocabulary (25%), Reading (20%), Writing (15%).
 * Verified against course notes (Emily & Lisa routines).
 */

export interface MockExamQuestion {
  id: string;
  section: 'grammar' | 'vocabulary' | 'reading' | 'writing';
  questionNumber?: number;
  prompt: string;
  contextPassage?: string;
  type: 'multiple-choice' | 'fill-blank';
  options?: string[];
  expectedAnswer: string;
  alternateAnswers?: string[];
  explanation: string;
  points: number;
}

export const MOCK_EXAM_POOL: MockExamQuestion[] = [
  // --- Grammar Section (10 questions) ---
  {
    id: 'me-g-1',
    section: 'grammar',
    type: 'multiple-choice',
    prompt: 'Choose the correct form: "Where _______ your brother work?"',
    options: ['does', 'do', 'is', 'are'],
    expectedAnswer: 'does',
    explanation: 'Singular third person (your brother = he) in present simple questions uses auxiliary "does".',
    points: 1,
  },
  {
    id: 'me-g-2',
    section: 'grammar',
    type: 'fill-blank',
    prompt: 'She _______ (not be) French. She is from Italy.',
    expectedAnswer: 'is not',
    alternateAnswers: ["isn't", 'isnt'],
    explanation: 'Third person singular negative form of "to be" is "is not" or "isn\'t".',
    points: 1,
  },
  {
    id: 'me-g-3',
    section: 'grammar',
    type: 'multiple-choice',
    prompt: '"Is this _______ umbrella on the chair?"',
    options: ['your', 'you', 'yours', 'you are'],
    expectedAnswer: 'your',
    explanation: 'Possessive adjective "your" precedes the noun "umbrella".',
    points: 1,
  },
  {
    id: 'me-g-4',
    section: 'grammar',
    type: 'multiple-choice',
    prompt: 'Look at the keys in my hand. _______ are my house keys.',
    options: ['These', 'Those', 'This', 'That'],
    expectedAnswer: 'These',
    explanation: 'Plural and near the speaker uses "These".',
    points: 1,
  },
  {
    id: 'me-g-5',
    section: 'grammar',
    type: 'fill-blank',
    prompt: 'Complete with a or an: "I need _______ dictionary for the English class."',
    expectedAnswer: 'a',
    explanation: '"Dictionary" begins with a consonant sound (/d/), so we use "a".',
    points: 1,
  },
  {
    id: 'me-g-6',
    section: 'grammar',
    type: 'multiple-choice',
    prompt: 'Which negative sentence is grammatically correct?',
    options: [
      "David doesn't drink tea in the morning.",
      "David doesn't drinks tea in the morning.",
      'David not drinks tea in the morning.',
      "David isn't drink tea in the morning.",
    ],
    expectedAnswer: "David doesn't drink tea in the morning.",
    explanation: 'After doesn\'t, the main verb is in base form: "doesn\'t drink".',
    points: 1,
  },
  {
    id: 'me-g-7',
    section: 'grammar',
    type: 'fill-blank',
    prompt: 'Complete the question: "_______ old are you?" "I am 24."',
    expectedAnswer: 'How',
    alternateAnswers: ['how'],
    explanation: 'We ask "How old...?" to inquire about someone\'s age.',
    points: 1,
  },
  {
    id: 'me-g-8',
    section: 'grammar',
    type: 'multiple-choice',
    prompt: '"Does Lisa work at a hotel?" What is the correct positive short answer?',
    options: ['Yes, she does.', 'Yes, she works.', 'Yes, she is.', 'Yes, does she.'],
    expectedAnswer: 'Yes, she does.',
    explanation: 'Questions starting with "Does" use "does" in positive short answers: "Yes, she does."',
    points: 1,
  },
  {
    id: 'me-g-9',
    section: 'grammar',
    type: 'multiple-choice',
    prompt: 'Where does the frequency adverb go? "She _______ in the park."',
    options: ['often walks', 'walks often', 'often walk', 'walk often'],
    expectedAnswer: 'often walks',
    explanation: 'Frequency adverbs go BEFORE the main verb: "often walks".',
    points: 1,
  },
  {
    id: 'me-g-10',
    section: 'grammar',
    type: 'fill-blank',
    prompt: '"Are you and Sarah students?" "Yes, we _______."',
    expectedAnswer: 'are',
    explanation: 'Positive short answer for we: "Yes, we are." (Never contract to Yes, we\'re).',
    points: 1,
  },

  // --- Vocabulary Section (7 questions) ---
  {
    id: 'me-v-1',
    section: 'vocabulary',
    type: 'multiple-choice',
    prompt: 'What is the English word for "der Bart"?',
    options: ['beard', 'bear', 'bird', 'bread'],
    expectedAnswer: 'beard',
    explanation: 'German "der Bart" translates to English "beard".',
    points: 1,
  },
  {
    id: 'me-v-2',
    section: 'vocabulary',
    type: 'fill-blank',
    prompt: 'A person from Spain has the nationality: _______',
    expectedAnswer: 'Spanish',
    alternateAnswers: ['spanish'],
    explanation: 'The nationality for Spain is "Spanish".',
    points: 1,
  },
  {
    id: 'me-v-3',
    section: 'vocabulary',
    type: 'multiple-choice',
    prompt: 'Which word means slim and gracefully thin (German: schlank)?',
    options: ['slim', 'heavy', 'short', 'tall'],
    expectedAnswer: 'slim',
    explanation: 'German "schlank" = English "slim".',
    points: 1,
  },
  {
    id: 'me-v-4',
    section: 'vocabulary',
    type: 'fill-blank',
    prompt: 'Translate to English: "die Brille" = _______',
    expectedAnswer: 'glasses',
    explanation: '"Brille" in English is "glasses" (plural noun).',
    points: 1,
  },
  {
    id: 'me-v-5',
    section: 'vocabulary',
    type: 'multiple-choice',
    prompt: 'Which day comes after Tuesday?',
    options: ['Wednesday', 'Thursday', 'Monday', 'Friday'],
    expectedAnswer: 'Wednesday',
    explanation: 'The sequence of weekdays is: Monday, Tuesday, Wednesday...',
    points: 1,
  },
  {
    id: 'me-v-6',
    section: 'vocabulary',
    type: 'multiple-choice',
    prompt: 'How do you ask politely for a drink in an English café?',
    options: [
      'Could I have a coffee, please?',
      'I want a coffee.',
      'Give me coffee.',
      'Coffee is good for me.',
    ],
    expectedAnswer: 'Could I have a coffee, please?',
    explanation: '"Could I have..., please?" is the polite ordering formula.',
    points: 1,
  },
  {
    id: 'me-v-7',
    section: 'vocabulary',
    type: 'fill-blank',
    prompt: 'A mother and father together are your _______ (German: Eltern).',
    expectedAnswer: 'parents',
    explanation: 'Mother and father = "parents".',
    points: 1,
  },

  // --- Reading Section (Emily & Lisa course texts - 5 questions) ---
  {
    id: 'me-r-1',
    section: 'reading',
    type: 'multiple-choice',
    contextPassage:
      'Emily is 29 years old and comes from Bristol, England. She is a graphic designer. Three years ago, she moved to Canada. Now, she lives in Vancouver in an apartment on the tenth floor. She takes the bus to work because her office is far away. In winter, Emily goes skiing with her Canadian boyfriend, and in summer she goes hiking.',
    prompt: 'What is Emily\'s job and where is she from?',
    options: [
      'Graphic designer from Bristol, England',
      'English teacher from Vancouver',
      'Doctor from London',
      'Hotel receptionist from Munich',
    ],
    expectedAnswer: 'Graphic designer from Bristol, England',
    explanation: 'The passage says: "Emily is 29 years old and comes from Bristol, England. She is a graphic designer."',
    points: 2,
  },
  {
    id: 'me-r-2',
    section: 'reading',
    type: 'fill-blank',
    contextPassage:
      'Emily lives in Vancouver in an apartment on the tenth floor. She takes the bus to work because her office is far away.',
    prompt: 'Why does Emily take the bus to work? Because her office is _______ _______.',
    expectedAnswer: 'far away',
    alternateAnswers: ['far'],
    explanation: 'The text states: "...because her office is far away."',
    points: 2,
  },
  {
    id: 'me-r-3',
    section: 'reading',
    type: 'multiple-choice',
    contextPassage:
      'In winter, Emily goes skiing with her boyfriend, and in summer she goes hiking. She loves Canada, but she misses her family, her friends, and English tea.',
    prompt: 'What outdoor activity does Emily do in winter?',
    options: ['Skiing', 'Hiking', 'Tennis', 'Football'],
    expectedAnswer: 'Skiing',
    explanation: 'The text says: "In winter, Emily goes skiing with her boyfriend..."',
    points: 2,
  },
  {
    id: 'me-r-4',
    section: 'reading',
    type: 'multiple-choice',
    contextPassage:
      'Lisa lives in a small town near the mountains. She works at a hotel. On Saturdays, she goes to the mountains with her brother. They have breakfast together, drink tea and eat sandwiches. In the afternoon, Lisa reads a book, and her brother takes photos. In the evening, they take the train home.',
    prompt: 'Where does Lisa work?',
    options: ['At a hotel', 'In a hospital', 'In a bank', 'In an office'],
    expectedAnswer: 'At a hotel',
    explanation: 'The text states: "Lisa lives in a small town near the mountains. She works at a hotel."',
    points: 2,
  },
  {
    id: 'me-r-5',
    section: 'reading',
    type: 'fill-blank',
    contextPassage:
      'In the afternoon, Lisa reads a book, and her brother takes photos. In the evening, they take the train home.',
    prompt: 'How do Lisa and her brother travel home in the evening? They take the _______.',
    expectedAnswer: 'train',
    explanation: 'The passage concludes: "In the evening, they take the train home."',
    points: 2,
  },

  // --- Writing Section (3 questions) ---
  {
    id: 'me-w-1',
    section: 'writing',
    type: 'multiple-choice',
    prompt: 'Choose the best 3-sentence description of an English teacher:',
    options: [
      'Mr. Green is 40 years old and from the UK. He is tall and slim, and he wears glasses. Today he is wearing a dark blue suit.',
      'Mr. Green has 40 years from UK. He tall and has glasses wear. Today he wearing dark blue suit.',
      'Mr. Green is 40 years. He have slim build with glasses. He wears suit blue today.',
      'Mr. Green is UK teacher with 40 years. He is wearing glasses and tall body.',
    ],
    expectedAnswer:
      'Mr. Green is 40 years old and from the UK. He is tall and slim, and he wears glasses. Today he is wearing a dark blue suit.',
    explanation: 'This option follows standard English grammar: "is 40 years old", "from the UK", "is tall and slim", "wears glasses", and "is wearing a dark blue suit".',
    points: 3,
  },
  {
    id: 'me-w-2',
    section: 'writing',
    type: 'fill-blank',
    prompt: 'Put the words in order: "at / hotel / doesn\'t / She / work / a" ➔ She _______ _______ _______ _______ _______.',
    expectedAnswer: "doesn't work at a hotel",
    alternateAnswers: ['does not work at a hotel', "doesnt work at a hotel", "doesn't work at a hotel."],
    explanation: 'Subject (She) + doesn\'t + base verb (work) + prepositional phrase (at a hotel).',
    points: 3,
  },
  {
    id: 'me-w-3',
    section: 'writing',
    type: 'fill-blank',
    prompt: 'Transform into question: "Lisa lives in a small town." ➔ _______ Lisa _______ in a small town?',
    expectedAnswer: 'Does / live',
    alternateAnswers: [
      'Does live',
      'does / live',
      'does live',
      'Does, live',
      'does, live',
      'Does - live',
      'does - live',
    ],
    explanation: 'Question formula: Does + Lisa + base verb "live"? Either type "Does live" or "Does / live".',
    points: 3,
  },
];

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateMockExam(questionCount: number = 15): MockExamQuestion[] {
  const grammar = shuffleArray(MOCK_EXAM_POOL.filter((q) => q.section === 'grammar'));
  const vocab = shuffleArray(MOCK_EXAM_POOL.filter((q) => q.section === 'vocabulary'));
  const reading = shuffleArray(MOCK_EXAM_POOL.filter((q) => q.section === 'reading'));
  const writing = shuffleArray(MOCK_EXAM_POOL.filter((q) => q.section === 'writing'));

  const selected: MockExamQuestion[] = [];

  if (questionCount <= 10) {
    // 10 questions: 4 grammar + 3 vocab + 2 reading + 1 writing = 10
    selected.push(...grammar.slice(0, 4));
    selected.push(...vocab.slice(0, 3));
    selected.push(...reading.slice(0, 2));
    selected.push(...writing.slice(0, 1));
  } else if (questionCount <= 15) {
    // 15 questions: 6 grammar + 4 vocab + 3 reading + 2 writing = 15
    selected.push(...grammar.slice(0, 6));
    selected.push(...vocab.slice(0, 4));
    selected.push(...reading.slice(0, 3));
    selected.push(...writing.slice(0, 2));
  } else {
    // 20 questions: 8 grammar + 5 vocab + 4 reading + 3 writing = 20
    selected.push(...grammar.slice(0, 8));
    selected.push(...vocab.slice(0, 5));
    selected.push(...reading.slice(0, 4));
    selected.push(...writing.slice(0, 3));
  }

  // Shuffle selected questions so sections appear in natural variety, while keeping reading context intact
  const randomizedExam = shuffleArray(selected);

  // Assign clean sequential question numbers
  return randomizedExam.map((q, index) => ({
    ...q,
    questionNumber: index + 1,
  }));
}
