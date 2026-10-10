/**
 * Interactive Practice Exercises Dataset for Exam Prepare
 * Covers all required practice formats:
 * 1. Multiple-choice
 * 2. Fill-in-the-blank grammar
 * 3. Sentence ordering
 * 4. English-German vocabulary recall
 * 5. Reading comprehension (Lisa's Routine & Emily in Canada)
 * 6. Question formation
 * 7. Short answers (do/does & be)
 * 8. Frequency adverbs
 * 9. Describing people
 * 10. Short writing exercises
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
    instruction: 'Select the correct form of the verb to be.',
    prompt: 'My parents _______ from Italy, but they live in Manchester.',
    options: ['is', 'are', 'am', 'be'],
    expectedAnswer: 'are',
    explanation: '"Parents" is plural, so we use "are" (they are).',
    hint: 'Think of the subject pronoun: my parents = they.',
  },
  {
    id: 'pe-mc-2',
    type: 'multiple-choice',
    categoryLabel: 'Articles: a vs an',
    instruction: 'Choose the correct combination of articles.',
    prompt: 'He carries _______ apple and _______ dictionary in his backpack.',
    options: ['an / a', 'a / an', 'an / an', 'a / a'],
    expectedAnswer: 'an / a',
    explanation: '"Apple" begins with a vowel sound (/æ/) -> "an apple". "Dictionary" begins with a consonant (/d/) -> "a dictionary".',
    hint: 'Use "an" before vowel sounds (a, e, i, o, u) and "a" before consonants.',
  },
  {
    id: 'pe-mc-3',
    type: 'multiple-choice',
    categoryLabel: 'Present Simple: Third Person -s',
    instruction: 'Choose the correct form of the verb in the simple present.',
    prompt: 'Marco _______ (work) in a café on Saturday mornings.',
    options: ['works', 'work', 'working', 'is work'],
    expectedAnswer: 'works',
    explanation: 'He/she/it takes the -s ending in the present simple: "Marco works".',
    hint: 'Marco is "he" — remember third person singular!',
  },
  {
    id: 'pe-mc-4',
    type: 'multiple-choice',
    categoryLabel: 'Present Simple: Questions with does',
    instruction: 'Select the grammatically correct question.',
    prompt: 'Which question is correct?',
    options: [
      'Does Lisa work at a hotel?',
      'Does Lisa works at a hotel?',
      'Do Lisa work at a hotel?',
      'Is Lisa work at a hotel?',
    ],
    expectedAnswer: 'Does Lisa work at a hotel?',
    explanation: 'Question formula: Does + subject + base verb. The main verb "work" does NOT have -s after does.',
  },

  // 2. Fill-in-the-blank grammar
  {
    id: 'pe-fb-1',
    type: 'fill-blank',
    categoryLabel: 'Present Simple: Negative Transformation',
    instruction: 'Complete the sentence with the negative form of the verb in brackets.',
    prompt: 'I drink coffee, but my sister _______ (not drink) coffee.',
    expectedAnswer: "doesn't drink",
    alternateAnswers: ['does not drink', 'doesnt drink'],
    explanation: 'Use "doesn\'t" with third-person singular (my sister) followed by the base verb "drink".',
    hint: 'Third-person singular negative: does not / doesn\'t + base verb.',
  },
  {
    id: 'pe-fb-2',
    type: 'fill-blank',
    categoryLabel: 'Possessive Adjectives',
    instruction: 'Fill in the blank with the correct possessive adjective.',
    prompt: 'Elena loves music. _______ (She) favourite singer is Adele.',
    expectedAnswer: 'Her',
    alternateAnswers: ['her'],
    explanation: 'The possessive adjective for a woman (she) is "Her".',
    hint: 'I -> my, you -> your, he -> his, she -> her.',
  },
  {
    id: 'pe-fb-3',
    type: 'fill-blank',
    categoryLabel: 'Demonstratives: this/these',
    instruction: 'Complete the sentence with the correct demonstrative word.',
    prompt: 'Take _______ keys here on the table before you leave. (plural, near)',
    expectedAnswer: 'these',
    alternateAnswers: ['These'],
    explanation: '"These" is used for plural objects near the speaker.',
    hint: 'Singular near: this. Plural near: these.',
  },
  {
    id: 'pe-fb-4',
    type: 'fill-blank',
    categoryLabel: 'Short Answers with does',
    instruction: 'Complete the short answer.',
    prompt: '"Does Emily live in Vancouver?" "Yes, she _______."',
    expectedAnswer: 'does',
    explanation: 'Questions with "Does" use "does" in positive short answers: "Yes, she does."',
    hint: 'Short answer positive with does: Yes, she does.',
  },
  {
    id: 'pe-fb-5',
    type: 'fill-blank',
    categoryLabel: 'Short Answers with do',
    instruction: 'Complete the negative short answer.',
    prompt: '"Do you drink tea in the morning?" "No, I _______."',
    expectedAnswer: "don't",
    alternateAnswers: ['do not', 'dont'],
    explanation: 'Negative short answer with "Do you...?": "No, I don\'t."',
  },

  // 3. Sentence ordering
  {
    id: 'pe-so-1',
    type: 'sentence-order',
    categoryLabel: 'Sentence Structure: Present Simple',
    instruction: 'Put the words in the correct order to form a natural English sentence.',
    prompt: 'Arrange the sentence:',
    wordsToOrder: ['David', 'drinks', 'black', 'coffee', 'every', 'morning.'],
    expectedAnswer: 'David drinks black coffee every morning.',
    explanation: 'Subject (David) + Verb (drinks) + Object (black coffee) + Time expression (every morning).',
    hint: 'Start with the person (David), then the action.',
  },
  {
    id: 'pe-so-2',
    type: 'sentence-order',
    categoryLabel: 'Questions with Question Words',
    instruction: 'Arrange the words into a correct question.',
    prompt: 'Form the question:',
    wordsToOrder: ['Where', 'do', 'your', 'parents', 'live', '?'],
    expectedAnswer: 'Where do your parents live?',
    explanation: 'Question word (Where) + Auxiliary (do) + Subject (your parents) + Main verb (live)?',
    hint: 'Question word goes first: Where...',
  },
  {
    id: 'pe-so-3',
    type: 'sentence-order',
    categoryLabel: 'Frequency Adverbs Position',
    instruction: 'Put the frequency adverb in the correct position before the main verb.',
    prompt: 'Arrange the frequency sentence:',
    wordsToOrder: ['Emily', 'often', 'walks', 'in', 'the', 'park.'],
    expectedAnswer: 'Emily often walks in the park.',
    explanation: 'Frequency adverbs go before main verbs: "often walks".',
    hint: 'Subject (Emily) + adverb (often) + verb (walks).',
  },
  {
    id: 'pe-so-4',
    type: 'sentence-order',
    categoryLabel: 'Appearance Description',
    instruction: 'Form the description sentence.',
    prompt: 'Form the description sentence:',
    wordsToOrder: ['He', 'is', 'tall', 'and', 'wears', 'glasses.'],
    expectedAnswer: 'He is tall and wears glasses.',
    alternateAnswers: ['He wears glasses and is tall.'],
    explanation: 'Subject (He) + verb phrase (is tall and wears glasses).',
    hint: 'Start with "He is tall...".',
  },

  // 4. Vocabulary recall (German -> English)
  {
    id: 'pe-vr-1',
    type: 'vocab-recall',
    categoryLabel: 'Vocabulary Recall: Classroom',
    instruction: 'Translate the German classroom word into English.',
    prompt: 'Translate to English:',
    germanPrompt: 'das Wörterbuch',
    expectedAnswer: 'dictionary',
    alternateAnswers: ['a dictionary', 'the dictionary'],
    explanation: 'German "das Wörterbuch" = English "dictionary".',
    hint: 'Starts with d-i-c-t-i-o-n-a-r-y.',
  },
  {
    id: 'pe-vr-2',
    type: 'vocab-recall',
    categoryLabel: 'Vocabulary Recall: Appearance',
    instruction: 'Translate the German adjective for build into English.',
    prompt: 'Translate to English:',
    germanPrompt: 'schlank',
    expectedAnswer: 'slim',
    alternateAnswers: ['slender'],
    explanation: 'German "schlank" = English "slim".',
    hint: '4 letters, starts with s-l-i-m.',
  },
  {
    id: 'pe-vr-3',
    type: 'vocab-recall',
    categoryLabel: 'Vocabulary Recall: Appearance',
    instruction: 'Translate the German noun into English.',
    prompt: 'Translate to English:',
    germanPrompt: 'der Bart',
    expectedAnswer: 'beard',
    alternateAnswers: ['a beard'],
    explanation: 'German "der Bart" = English "beard".',
    hint: 'Starts with b-e-a-r-d.',
  },

  // 5. Reading comprehension: Lisa's Routine (from verified course notes)
  {
    id: 'pe-rc-1',
    type: 'reading-comp',
    categoryLabel: 'Reading Comprehension: Lisa\'s Routine',
    instruction: 'Read the verified course note passage and answer the question.',
    contextText:
      'Lisa lives in a small town near the mountains. She works at a hotel. On Saturdays, she goes to the mountains with her brother. They have breakfast together, drink tea and eat sandwiches. In the afternoon, Lisa reads a book, and her brother takes photos. In the evening, they take the train home.',
    prompt: 'Where does Lisa live and work?',
    options: [
      'She lives in a small town near the mountains and works at a hotel.',
      'She lives in London and works at a hospital.',
      'She lives in Berlin and works in an office.',
      'She lives in Munich and works on Sundays.',
    ],
    expectedAnswer: 'She lives in a small town near the mountains and works at a hotel.',
    explanation: 'The course notes state: "Lisa lives in a small town near the mountains. She works at a hotel."',
  },
  {
    id: 'pe-rc-2',
    type: 'reading-comp',
    categoryLabel: 'Reading Comprehension: Lisa\'s Weekend',
    instruction: 'Read the text above and identify what Lisa and her brother do on Saturdays.',
    contextText:
      'On Saturdays, Lisa goes to the mountains with her brother. They have breakfast together, drink tea and eat sandwiches. In the afternoon, Lisa reads a book, and her brother takes photos. In the evening, they take the train home.',
    prompt: 'What do Lisa and her brother have for breakfast in the mountains?',
    options: [
      'They drink tea and eat sandwiches.',
      'They drink coffee and eat croissants.',
      'They eat pancakes and drink orange juice.',
      'They drink water and eat fruit.',
    ],
    expectedAnswer: 'They drink tea and eat sandwiches.',
    explanation: 'The text notes: "They have breakfast together, drink tea and eat sandwiches."',
  },
  {
    id: 'pe-rc-3',
    type: 'reading-comp',
    categoryLabel: 'Reading Comprehension: Transport',
    instruction: 'Identify how Lisa and her brother travel home.',
    contextText:
      'In the afternoon, Lisa reads a book, and her brother takes photos. In the evening, they take the train home.',
    prompt: 'How do Lisa and her brother travel home in the evening?',
    options: [
      'They take the train home.',
      'They take the bus home.',
      'They drive a car.',
      'They walk back to the town.',
    ],
    expectedAnswer: 'They take the train home.',
    explanation: 'The passage explicitly concludes: "In the evening, they take the train home."',
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
  {
    id: 'pe-qf-3',
    type: 'question-formation',
    categoryLabel: 'Question Formation: Present Simple',
    instruction: 'Form the question to ask about someone\'s workplace.',
    prompt: 'Form the question for: "Lisa works at a hotel."',
    expectedAnswer: 'Where does Lisa work?',
    alternateAnswers: ['Where does she work?'],
    explanation: 'Question word (Where) + does + subject (Lisa) + base verb (work)?',
    hint: 'Where does Lisa work?',
  },

  // 7. Describing people (Fixed multi-blank option)
  {
    id: 'pe-dp-1',
    type: 'describing-people',
    categoryLabel: 'Describing Appearance',
    instruction: 'Complete the description of the teacher using the appropriate forms (separated by spaces or slashes).',
    prompt: 'Mr. Adams is around 45 years old. He _______ tall, _______ a grey beard, and _______ black glasses.',
    expectedAnswer: 'is / has / wears',
    alternateAnswers: [
      'is has wears',
      'is, has, wears',
      'is - has - wears',
      'is / has / is wearing',
      'is has is wearing',
      'is, has, is wearing',
    ],
    explanation: 'We say: He is tall (be), he has a beard (have), and he wears glasses (wear). Either type "is has wears" or "is / has / wears".',
    hint: 'Use forms: is has wears (spaces or slashes are accepted).',
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
