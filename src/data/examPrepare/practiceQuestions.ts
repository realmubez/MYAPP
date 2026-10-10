/**
 * Interactive Practice Exercises Dataset for Exam Prepare
 * Covers all 8 required practice formats:
 * 1. Multiple-choice
 * 2. Fill-in-the-blank grammar
 * 3. Sentence ordering
 * 4. English-German vocabulary recall
 * 5. Reading comprehension
 * 6. Question formation
 * 7. Describing people
 * 8. Short writing exercises
 */

export interface PracticeExerciseItem {
  id: string;
  type:
    | 'multiple-choice'
    | 'fill-blank'
    | 'sentence-order'
    | 'vocab-recall'
    | 'reading-comp'
    | 'question-formation'
    | 'describing-people'
    | 'short-writing';
  categoryLabel: string;
  instruction: string;
  prompt: string;
  contextText?: string;
  options?: string[]; // For multiple choice
  wordsToOrder?: string[]; // For sentence ordering
  germanPrompt?: string; // For vocab recall
  expectedAnswer: string;
  alternateAnswers?: string[];
  explanation: string;
  hint?: string;
  modelAnswer?: string; // For short writing
}

export const PRACTICE_EXERCISES: PracticeExerciseItem[] = [
  // 1. Multiple-choice grammar & vocabulary
  {
    id: 'pe-mc-1',
    type: 'multiple-choice',
    categoryLabel: 'Grammar: The Verb To Be',
    instruction: 'Choose the correct form of the verb to be.',
    prompt: 'My parents _______ from Italy, but they live in Manchester.',
    options: ['is', 'are', 'am', 'be'],
    expectedAnswer: 'are',
    explanation: '"Parents" is plural, so we use "are" (they are).',
    hint: 'Parents = plural noun (two people).',
  },
  {
    id: 'pe-mc-2',
    type: 'multiple-choice',
    categoryLabel: 'Articles: a vs an',
    instruction: 'Select the correct article.',
    prompt: 'He carries _______ apple and _______ dictionary in his backpack.',
    options: ['an / a', 'a / an', 'an / an', 'a / a'],
    expectedAnswer: 'an / a',
    explanation: '"Apple" begins with a vowel sound (/æ/) -> "an apple". "Dictionary" begins with a consonant (/d/) -> "a dictionary".',
    hint: 'Check the starting sound of each noun.',
  },
  {
    id: 'pe-mc-3',
    type: 'multiple-choice',
    categoryLabel: 'Present Simple',
    instruction: 'Select the correct present simple form.',
    prompt: 'Marco _______ (work) in a café on Saturday mornings.',
    options: ['works', 'work', 'working', 'is work'],
    expectedAnswer: 'works',
    explanation: 'He/she/it takes the -s ending in the present simple: "Marco works".',
  },

  // 2. Fill-in-the-blank grammar questions
  {
    id: 'pe-fb-1',
    type: 'fill-blank',
    categoryLabel: 'Present Simple Negative',
    instruction: 'Fill in the blank with the negative form of the verb.',
    prompt: 'I drink coffee, but my sister _______ (not drink) coffee.',
    expectedAnswer: "doesn't drink",
    alternateAnswers: ['does not drink', 'doesnt drink'],
    explanation: 'Use "doesn\'t" (does not) with third-person singular (my sister) followed by the base verb "drink".',
    hint: 'Third-person singular negative helper verb is "doesn\'t".',
  },
  {
    id: 'pe-fb-2',
    type: 'fill-blank',
    categoryLabel: 'Possessive Adjectives',
    instruction: 'Complete the sentence with the correct possessive adjective.',
    prompt: 'Elena loves music. _______ (She) favourite singer is Adele.',
    expectedAnswer: 'Her',
    alternateAnswers: ['her'],
    explanation: 'The possessive adjective for a woman (she) is "Her".',
    hint: 'Possessive for she = Her.',
  },
  {
    id: 'pe-fb-3',
    type: 'fill-blank',
    categoryLabel: 'Demonstratives',
    instruction: 'Fill in the blank with this, that, these, or those.',
    prompt: 'Take _______ keys here on the table before you leave. (plural, near)',
    expectedAnswer: 'these',
    alternateAnswers: ['These'],
    explanation: '"These" is used for plural objects near the speaker.',
    hint: 'Plural + near = these.',
  },

  // 3. Sentence ordering
  {
    id: 'pe-so-1',
    type: 'sentence-order',
    categoryLabel: 'Sentence Structure',
    instruction: 'Tap or drag the words into the correct order to form a natural English sentence.',
    prompt: 'Arrange the sentence:',
    wordsToOrder: ['David', 'drinks', 'coffee', 'black', 'every', 'morning.'],
    expectedAnswer: 'David drinks black coffee every morning.',
    explanation: 'Subject (David) + Verb (drinks) + Object (black coffee) + Time expression (every morning).',
    hint: 'Adjectives come before nouns: "black coffee".',
  },
  {
    id: 'pe-so-2',
    type: 'sentence-order',
    categoryLabel: 'Questions with Question Words',
    instruction: 'Arrange the words to form a grammatically correct question.',
    prompt: 'Form the question:',
    wordsToOrder: ['Where', 'do', 'your', 'parents', 'live?'],
    expectedAnswer: 'Where do your parents live?',
    explanation: 'Question word (Where) + Auxiliary (do) + Subject (your parents) + Main verb (live)?',
    hint: 'Question word comes first.',
  },
  {
    id: 'pe-so-3',
    type: 'sentence-order',
    categoryLabel: 'Appearance Description',
    instruction: 'Arrange the words to describe appearance:',
    prompt: 'Form the description sentence:',
    wordsToOrder: ['He', 'is', 'tall', 'and', 'wears', 'glasses.'],
    expectedAnswer: 'He is tall and wears glasses.',
    alternateAnswers: ['He wears glasses and is tall.'],
    explanation: 'Subject (He) + verb phrase (is tall and wears glasses).',
  },

  // 4. English–German vocabulary recall
  {
    id: 'pe-vr-1',
    type: 'vocab-recall',
    categoryLabel: 'Vocabulary Recall: Classroom',
    instruction: 'Type the English word for the German term shown below.',
    prompt: 'Translate to English:',
    germanPrompt: 'das Wörterbuch',
    expectedAnswer: 'dictionary',
    alternateAnswers: ['a dictionary', 'the dictionary'],
    explanation: 'German "das Wörterbuch" = English "dictionary".',
    hint: 'Starts with "d-i-c-t..."',
  },
  {
    id: 'pe-vr-2',
    type: 'vocab-recall',
    categoryLabel: 'Vocabulary Recall: Appearance',
    instruction: 'Type the English adjective for the German word below.',
    prompt: 'Translate to English:',
    germanPrompt: 'schlank / dünn (figurbezogen)',
    expectedAnswer: 'slim',
    alternateAnswers: ['slender'],
    explanation: 'German "schlank" = English "slim".',
    hint: 'Four letters: s-l-i-m.',
  },
  {
    id: 'pe-vr-3',
    type: 'vocab-recall',
    categoryLabel: 'Vocabulary Recall: Appearance',
    instruction: 'Type the English noun for the German word below.',
    prompt: 'Translate to English:',
    germanPrompt: 'der Bart',
    expectedAnswer: 'beard',
    alternateAnswers: ['a beard'],
    explanation: 'German "der Bart" = English "beard".',
    hint: 'Starts with b-e-a-r-d.',
  },

  // 5. Reading comprehension
  {
    id: 'pe-rc-1',
    type: 'reading-comp',
    categoryLabel: 'Reading Comprehension',
    instruction: 'Read the short text and answer the question below.',
    contextText:
      'Lisa is a 29-year-old nurse from Munich in Germany. She works in a busy hospital in London. She lives in a small flat with her British friend Claire. In her free time, Lisa listens to pop music and plays tennis on Sunday mornings. Today, she is wearing a blue coat and black shoes.',
    prompt: 'Where does Lisa live and work?',
    options: [
      'She lives in Munich and works in Berlin.',
      'She lives and works in London.',
      'She lives in Madrid and works in London.',
      'She works on Sunday in Munich.',
    ],
    expectedAnswer: 'She lives and works in London.',
    explanation: 'The passage says: "She works in a busy hospital in London. She lives in a small flat with her British friend Claire."',
  },
  {
    id: 'pe-rc-2',
    type: 'reading-comp',
    categoryLabel: 'Reading Comprehension: Details',
    instruction: 'Read the text above and identify what Lisa is wearing today.',
    contextText:
      'Lisa is a 29-year-old nurse from Munich in Germany. Today, she is wearing a blue coat and black shoes.',
    prompt: 'What is Lisa wearing today?',
    options: [
      'A blue coat and black shoes',
      'A white dress and sneakers',
      'A black coat and red boots',
      'Hospital scrubs and glasses',
    ],
    expectedAnswer: 'A blue coat and black shoes',
    explanation: 'The text specifically notes: "Today, she is wearing a blue coat and black shoes."',
  },

  // 6. Question formation
  {
    id: 'pe-qf-1',
    type: 'question-formation',
    categoryLabel: 'Question Formation: Origin',
    instruction: 'Write the complete question for the given answer.',
    prompt: 'Form the question for: "I am from Madrid in Spain."',
    expectedAnswer: 'Where are you from?',
    alternateAnswers: ['Where do you come from?'],
    explanation: 'To ask about someone\'s country or hometown, we ask: "Where are you from?"',
    hint: 'Use the question word "Where" + "are you from?".',
  },
  {
    id: 'pe-qf-2',
    type: 'question-formation',
    categoryLabel: 'Question Formation: Age',
    instruction: 'Write the question to ask someone their age.',
    prompt: 'Form the question for: "She is 25 years old."',
    expectedAnswer: 'How old is she?',
    alternateAnswers: ['How old is she'],
    explanation: 'To ask about a woman\'s age: "How old is she?"',
    hint: 'Use "How old is...?"',
  },

  // 7. Describing people
  {
    id: 'pe-dp-1',
    type: 'describing-people',
    categoryLabel: 'Describing Appearance',
    instruction: 'Complete the description of the teacher using the appropriate forms.',
    prompt: 'Mr. Adams is around 45 years old. He _______ (be) tall and _______ (have) a grey beard. Today he _______ (wear) black glasses.',
    expectedAnswer: 'is / has / wears',
    alternateAnswers: ['is, has, wears', 'is / has / is wearing'],
    explanation: 'We say: He is tall (be), he has a beard (have), and he wears/is wearing glasses (wear).',
    hint: 'Verb forms: is, has, wears.',
  },

  // 8. Short writing exercises
  {
    id: 'pe-sw-1',
    type: 'short-writing',
    categoryLabel: 'Writing: Self Introduction',
    instruction: 'Write a short 3-sentence introduction including your name, country/city, and what you study or work.',
    prompt: 'Write your introduction below (minimum 15 words):',
    expectedAnswer: 'My name is Alex. I am from Germany. I work in an office and study English.',
    modelAnswer: 'Hello! My name is Maria and I am from Spain. I live in Berlin and I study languages at university. In my free time, I play tennis and read books.',
    explanation: 'A strong beginner self-introduction includes: 1. Your name. 2. Your country or hometown. 3. Your job or what you study.',
  },
  {
    id: 'pe-sw-2',
    type: 'short-writing',
    categoryLabel: 'Writing: Describing a Friend',
    instruction: 'Write a 3-sentence description of a friend\'s appearance and clothes.',
    prompt: 'Describe your friend below (minimum 15 words):',
    expectedAnswer: 'My friend is tall and slim. He has dark hair and wears glasses. Today he is wearing blue jeans and a jacket.',
    modelAnswer: 'My friend David looks around 30 years old. He is tall and slim with short brown hair and a neat beard. Today he is wearing a dark blue sweater and black shoes.',
    explanation: 'Good descriptions combine height/build (tall/slim), hair/facial features (beard, glasses), and clothes (wearing...).',
  },
];
