import { MultiLangTranslation } from '../services/translationPreference';

export type StorySceneType =
  | 'read_listen'
  | 'vocabulary'
  | 'type_sentence'
  | 'type_phrase'
  | 'read_story'
  | 'read_understand'
  | 'recall'
  | 'dialogue_thought'
  | 'vocabulary_context'
  | 'story_challenge'
  | 'chapter_summary';

export interface StoryVocabularyItem {
  id: string;
  word: string;
  meaning: string;
  somaliTranslation: string;
  englishTranslation: string;
  exampleSentence: string;
  audioText?: string;
  note?: string;
}

export interface StoryScene {
  id: string;
  sceneNumber: number;
  type: StorySceneType;
  badgeLabel: string;
  storyText: string;
  storyTranslations?: MultiLangTranslation;
  audioText?: string;
  highlightWord?: string;
  highlightMeaning?: {
    en: string;
    so: string;
    note?: string;
  };
  icon?: string;
  typingPrompt?: string;
  typingTarget?: string;
  typingTranslations?: MultiLangTranslation;
  isRecallMode?: boolean;
  hint?: string;
  grammarNote?: string;
  speaker?: string;
  actionLabel?: string;
}

export interface StoryChapter {
  id: string;
  unitId: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  description: string;
  fullStoryText: string;
  scenes: StoryScene[];
  vocabulary: StoryVocabularyItem[];
}
