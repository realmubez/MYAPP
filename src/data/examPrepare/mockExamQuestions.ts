/**
 * Mock Exam Question Pool for Straightforward Elementary (Units 1–2D)
 * Simulates a realistic elementary English test covering:
 * Grammar (40%), Vocabulary (30%), Reading (20%), Writing (10%).
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
  // --- Grammar Section ---
  {
    id: 'me-g-1',
    section: 'grammar',
    type: 'multiple-choice',
    prompt: 'Choose the correct form: "Where _______ your brother work?"',
    options: ['does', 'do', 'is', 'are'],
    expectedAnswer: 'does',
    explanation: 'Singular third person (your brother) in present simple questions uses auxiliary "does".',
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
    explanation: '"Dictionary" begins with a consonant sound, so we use "a".',
    points: 1,
  },
  {
    id: 'me-g-6',
    section: 'grammar',
    type: 'multiple-choice',
    prompt: 'Which sentence is grammatically correct?',
    options: [
      'David doesn\'t drink tea in the morning.',
      'David don\'t drinks tea in the morning.',
      'David not drinks tea in the morning.',
      'David isn\'t drink tea in the morning.',
    ],
    expectedAnswer: 'David doesn\'t drink tea in the morning.',
    explanation: 'He/she/it takes "doesn\'t" + base form "drink".',
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

  // --- Vocabulary Section ---
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
    prompt: 'Which word means attractive and gracefully thin?',
    options: ['slim', 'heavy', 'short', 'tall'],
    expectedAnswer: 'slim',
    explanation: '"Slim" means gracefully thin / schlank.',
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

  // --- Reading Section ---
  {
    id: 'me-r-1',
    section: 'reading',
    type: 'multiple-choice',
    contextPassage:
      'Michael is a 32-year-old software developer from Berlin. He lives in a modern apartment with his wife, Sarah. Michael is tall and slim with short brown hair, and he wears glasses. On weekdays, he wakes up at 7:00, drinks black coffee, and walks to his office. On Saturdays, he plays football with his friends and visits his parents in Munich.',
    prompt: 'What is Michael\'s profession and where is he from?',
    options: [
      'Software developer from Berlin',
      'English teacher from Munich',
      'Doctor from London',
      'Student from Madrid',
    ],
    expectedAnswer: 'Software developer from Berlin',
    explanation: 'The passage says: "Michael is a 32-year-old software developer from Berlin."',
    points: 2,
  },
  {
    id: 'me-r-2',
    section: 'reading',
    type: 'fill-blank',
    contextPassage:
      'Michael is tall and slim with short brown hair, and he wears glasses. On weekdays, he wakes up at 7:00, drinks black coffee, and walks to his office.',
    prompt: 'What does Michael drink on weekday mornings? He drinks _______ _______.',
    expectedAnswer: 'black coffee',
    alternateAnswers: ['coffee'],
    explanation: 'The text states: "...drinks black coffee, and walks to his office."',
    points: 2,
  },
  {
    id: 'me-r-3',
    section: 'reading',
    type: 'multiple-choice',
    contextPassage:
      'On Saturdays, he plays football with his friends and visits his parents in Munich.',
    prompt: 'Who does Michael visit in Munich on Saturdays?',
    options: ['his parents', 'his teacher', 'his children', 'his brother'],
    expectedAnswer: 'his parents',
    explanation: 'The text states: "...visits his parents in Munich."',
    points: 2,
  },

  // --- Writing / Sentence Construction Section ---
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
    prompt: 'Put the words in order: "is / She / wearing / black shoes / today" -> She _______ _______ _______ _______.',
    expectedAnswer: 'is wearing black shoes today',
    alternateAnswers: ['is wearing black shoes today.'],
    explanation: 'Subject (She) + is wearing + object (black shoes) + time (today).',
    points: 3,
  },
];

export function generateMockExam(questionCount: number = 15): MockExamQuestion[] {
  // Balanced sample across sections
  const grammar = MOCK_EXAM_POOL.filter((q) => q.section === 'grammar');
  const vocab = MOCK_EXAM_POOL.filter((q) => q.section === 'vocabulary');
  const reading = MOCK_EXAM_POOL.filter((q) => q.section === 'reading');
  const writing = MOCK_EXAM_POOL.filter((q) => q.section === 'writing');

  const selected: MockExamQuestion[] = [];

  if (questionCount <= 10) {
    selected.push(...grammar.slice(0, 4));
    selected.push(...vocab.slice(0, 3));
    selected.push(...reading.slice(0, 2));
    selected.push(...writing.slice(0, 1));
  } else if (questionCount <= 15) {
    selected.push(...grammar.slice(0, 6));
    selected.push(...vocab.slice(0, 5));
    selected.push(...reading.slice(0, 3));
    selected.push(...writing.slice(0, 1));
  } else {
    // 20-25 questions (all available)
    selected.push(...grammar);
    selected.push(...vocab);
    selected.push(...reading);
    selected.push(...writing);
  }

  // Assign clean sequential question numbers
  return selected.map((q, index) => ({
    ...q,
    questionNumber: index + 1,
  }));
}
