export type Language = 'sv' | 'en';

export type LessonSentence = {
  id: string;
  text: string;
  translation?: string;
  hint?: string;
};

export type LessonCategory = 
  | 'Lessons'
  | 'Vocabulary'
  | 'Grammar'
  | 'Conversation'
  | 'Daily Life'
  | 'Work & Travel'
  | 'Work'
  | 'Custom Text';

/* =======================================================
   INTERACTIVE LESSON STEP TYPES
======================================================= */

export type LessonStepType =
  | 'concept'
  | 'flashcard'
  | 'choice'
  | 'comparison'
  | 'type'
  | 'sentence_builder'
  | 'dialogue'
  | 'recall';

export interface BaseStep {
  id: string;
  type: LessonStepType;
  stepTitle?: string;
}

export interface ConceptStep extends BaseStep {
  type: 'concept';
  title: string;
  conceptName?: string;
  explanation: string;
  bulletPoints?: string[];
  example?: {
    text: string;
    translation?: string;
  };
  audioText?: string;
}

export interface FlashcardStep extends BaseStep {
  type: 'flashcard';
  term: string;
  phonetic?: string;
  translation: string;
  partOfSpeech?: string;
  explanation?: string;
  exampleSentence?: {
    text: string;
    translation: string;
  };
  audioText?: string;
}

export interface ChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface ChoiceStep extends BaseStep {
  type: 'choice';
  question: string;
  scenario?: string;
  options: ChoiceOption[];
  explanation?: string;
}

export interface ComparisonStep extends BaseStep {
  type: 'comparison';
  title: string;
  subtitle?: string;
  conceptA: {
    title: string;
    description: string;
    items: string[];
    badge?: string;
  };
  conceptB: {
    title: string;
    description: string;
    items: string[];
    badge?: string;
  };
  keyDifference?: string;
}

export interface TypeStep extends BaseStep {
  type: 'type';
  prompt?: string;
  text: string;
  translation?: string;
  hint?: string;
  audioText?: string;
}

export interface SentenceBuilderStep extends BaseStep {
  type: 'sentence_builder';
  prompt: string;
  targetSentence: string;
  translation: string;
  scrambledTokens: string[];
  audioText?: string;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  speakerRole: 'assistant' | 'user' | 'other';
  avatar?: string;
  text: string;
  translation?: string;
  requireTyping?: boolean;
}

export interface DialogueStep extends BaseStep {
  type: 'dialogue';
  scenario: string;
  lines: DialogueLine[];
}

export interface RecallStep extends BaseStep {
  type: 'recall';
  prompt: string;
  targetText: string;
  translation: string;
  hint?: string;
  audioText?: string;
}

export type LessonStep =
  | ConceptStep
  | FlashcardStep
  | ChoiceStep
  | ComparisonStep
  | TypeStep
  | SentenceBuilderStep
  | DialogueStep
  | RecallStep;

export type LanguageLesson = {
  id: string;
  language: Language;
  title: string;
  description: string;
  category: LessonCategory;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  sentences: LessonSentence[];
  steps?: LessonStep[];
};

export type LessonStage = 'listen_type' | 'understand' | 'recall' | 'completed';

export interface DifficultWord {
  word: string;
  language: Language;
  mistakes: number;
  lastMistakeAt: number;
}

