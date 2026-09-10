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

export type LanguageLesson = {
  id: string;
  language: Language;
  title: string;
  description: string;
  category: LessonCategory;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  sentences: LessonSentence[];
};

export type LessonStage = 'listen_type' | 'understand' | 'recall' | 'completed';

export interface DifficultWord {
  word: string;
  language: Language;
  mistakes: number;
  lastMistakeAt: number;
}
