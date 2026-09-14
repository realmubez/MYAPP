import { SubjectId, ReviewItem, MasteryLevel, ReviewSessionSummary } from '../types';
import { SWEDISH_UNITS } from '../data/swedishUnits';
import { ENGLISH_UNITS } from '../data/englishUnits';
import { SWEDISH_LESSONS } from '../data/swedishLessons';
import { ENGLISH_LESSONS } from '../data/englishLessons';
import { PYTHON_UNITS } from '../data/pythonUnits';

export const REVIEW_STORAGE_KEY = 'mylearning_review_items_v1';
export const REVIEW_UPDATED_EVENT = 'mylearning_review_changed';
const LEGACY_DIFFICULT_WORDS_KEY = 'my-learning-difficult-words';

/**
 * Determine Mastery Level from score (0 to 100)
 * 0–39  = Needs Practice
 * 40–79 = Improving
 * 80–100 = Mastered
 */
export function getMasteryLevel(score: number): MasteryLevel {
  if (score >= 80) return 'mastered';
  if (score >= 40) return 'improving';
  return 'needs_practice';
}

/**
 * Helper to safely convert any date input to ISO string without throwing RangeError
 */
function safeIsoDate(input?: unknown): string {
  if (!input) return new Date().toISOString();
  try {
    const d = new Date(input as any);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {}
  return new Date().toISOString();
}

/**
 * Normalizes any raw/persisted item into a guaranteed, valid ReviewItem
 */
function normalizeReviewItem(raw: any, fallbackKey: string): ReviewItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id || fallbackKey);
  const text = String(raw.text || raw.word || raw.codeSnippet || '').trim();
  if (!text) return null;

  const subjectId: SubjectId =
    raw.subjectId === 'english' || raw.subjectId === 'python' || raw.subjectId === 'typing'
      ? raw.subjectId
      : 'swedish';

  const mistakeCount = typeof raw.mistakeCount === 'number'
    ? raw.mistakeCount
    : (Number(raw.mistakes) || 1);
  const correctCount = typeof raw.correctCount === 'number' ? raw.correctCount : 0;
  const masteryScore = typeof raw.masteryScore === 'number'
    ? Math.max(0, Math.min(100, raw.masteryScore))
    : Math.max(10, 40 - mistakeCount * 8);

  return {
    id,
    subjectId,
    text,
    displayTitle: String(raw.displayTitle || text),
    category: raw.category || (subjectId === 'python' ? 'Code & Syntax' : 'Vocabulary'),
    unitId: raw.unitId ? String(raw.unitId) : undefined,
    unitTitle: raw.unitTitle ? String(raw.unitTitle) : undefined,
    lessonId: raw.lessonId ? String(raw.lessonId) : undefined,
    concept: raw.concept ? String(raw.concept) : undefined,
    prompt: raw.prompt ? String(raw.prompt) : undefined,
    codeSnippet: raw.codeSnippet ? String(raw.codeSnippet) : undefined,
    exampleSentence: raw.exampleSentence && typeof raw.exampleSentence === 'object' && typeof raw.exampleSentence.text === 'string'
      ? {
          text: raw.exampleSentence.text,
          translation: raw.exampleSentence.translation ? String(raw.exampleSentence.translation) : undefined,
        }
      : undefined,
    mistakeCount,
    correctCount,
    lastMistakeDate: safeIsoDate(raw.lastMistakeDate || raw.lastMistakeAt),
    lastReviewedDate: raw.lastReviewedDate ? safeIsoDate(raw.lastReviewedDate) : undefined,
    masteryScore,
    language: raw.language === 'en' ? 'en' : raw.language === 'python' ? 'python' : 'sv',
  };
}

/**
 * Helper to look up an example sentence for a given word in the curriculum
 */
function findExampleSentenceForWord(
  word: string,
  lang: 'sv' | 'en'
): { text: string; translation?: string; unitTitle?: string } | undefined {
  if (!word || typeof word !== 'string') return undefined;
  const clean = word.toLowerCase().trim();

  try {
    if (lang === 'sv') {
      // Check Swedish units
      if (Array.isArray(SWEDISH_UNITS)) {
        for (const unit of SWEDISH_UNITS) {
          if (!unit || !Array.isArray(unit.exercises)) continue;
          for (const ex of unit.exercises) {
            if (!ex || !ex.lesson || !Array.isArray(ex.lesson.sentences)) continue;
            for (const s of ex.lesson.sentences) {
              if (!s || typeof s.text !== 'string') continue;
              const words = s.text.toLowerCase().split(/\s+/);
              if (words.some((w) => w.replace(/[^a-zåäöA-ZÅÄÖ]/g, '') === clean) && s.text.length > clean.length) {
                return {
                  text: s.text,
                  translation: s.translation,
                  unitTitle: unit.title,
                };
              }
            }
          }
        }
      }
      // Check standalone Swedish lessons
      if (Array.isArray(SWEDISH_LESSONS)) {
        for (const lesson of SWEDISH_LESSONS) {
          if (!lesson || !Array.isArray(lesson.sentences)) continue;
          for (const s of lesson.sentences) {
            if (!s || typeof s.text !== 'string') continue;
            const words = s.text.toLowerCase().split(/\s+/);
            if (words.some((w) => w.replace(/[^a-zåäöA-ZÅÄÖ]/g, '') === clean) && s.text.length > clean.length) {
              return {
                text: s.text,
                translation: s.translation,
                unitTitle: lesson.title,
              };
            }
          }
        }
      }
    } else {
      // Check English units
      if (Array.isArray(ENGLISH_UNITS)) {
        for (const unit of ENGLISH_UNITS) {
          if (!unit || !Array.isArray(unit.exercises)) continue;
          for (const ex of unit.exercises) {
            if (!ex || !ex.lesson || !Array.isArray(ex.lesson.sentences)) continue;
            for (const s of ex.lesson.sentences) {
              if (!s || typeof s.text !== 'string') continue;
              const words = s.text.toLowerCase().split(/\s+/);
              if (words.some((w) => w.replace(/[^a-zA-Z]/g, '') === clean) && s.text.length > clean.length) {
                return {
                  text: s.text,
                  translation: s.translation,
                  unitTitle: unit.title,
                };
              }
            }
          }
        }
      }
      // Check standalone English lessons
      if (Array.isArray(ENGLISH_LESSONS)) {
        for (const lesson of ENGLISH_LESSONS) {
          if (!lesson || !Array.isArray(lesson.sentences)) continue;
          for (const s of lesson.sentences) {
            if (!s || typeof s.text !== 'string') continue;
            const words = s.text.toLowerCase().split(/\s+/);
            if (words.some((w) => w.replace(/[^a-zA-Z]/g, '') === clean) && s.text.length > clean.length) {
              return {
                text: s.text,
                translation: s.translation,
                unitTitle: lesson.title,
              };
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('findExampleSentenceForWord error:', e);
  }

  return undefined;
}

class ReviewService {
  private cache: Record<string, ReviewItem> | null = null;

  constructor() {
    // Run migration safely on startup
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;
    try {
      this.loadAndMigrate();
    } catch (e) {
      console.warn('ReviewService init error caught:', e);
      this.cache = {};
    }
  }

  private loadAndMigrate(): Record<string, ReviewItem> {
    if (this.cache) return this.cache;

    let items: Record<string, ReviewItem> = {};

    // 1. Try to read current schema
    try {
      const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const rawEntries = Array.isArray(parsed)
            ? parsed.map((it, idx) => [it?.id || `item-${idx}`, it])
            : Object.entries(parsed);

          for (const [key, val] of rawEntries) {
            const normalized = normalizeReviewItem(val, key);
            if (normalized) {
              items[normalized.id] = normalized;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not parse review items from storage:', e);
    }

    // 2. Migrate legacy 'my-learning-difficult-words' if present
    try {
      const legacyRaw = localStorage.getItem(LEGACY_DIFFICULT_WORDS_KEY);
      if (legacyRaw) {
        const legacyList = JSON.parse(legacyRaw);
        if (Array.isArray(legacyList)) {
          legacyList.forEach((leg: any) => {
            if (leg && leg.word) {
              const lang = leg.language === 'en' ? 'en' : 'sv';
              const subjectId: SubjectId = lang === 'en' ? 'english' : 'swedish';
              const cleanWord = String(leg.word).toLowerCase().trim();
              const key = `${subjectId}:${cleanWord}`;

              if (!items[key]) {
                const mistakes = Number(leg.mistakes) || 1;
                const example = findExampleSentenceForWord(cleanWord, lang);
                items[key] = {
                  id: key,
                  subjectId,
                  text: cleanWord,
                  displayTitle: cleanWord,
                  category: 'Vocabulary',
                  unitTitle: example?.unitTitle,
                  exampleSentence: example ? { text: example.text, translation: example.translation } : undefined,
                  mistakeCount: mistakes,
                  correctCount: 0,
                  lastMistakeDate: safeIsoDate(leg.lastMistakeAt),
                  masteryScore: Math.max(10, 40 - mistakes * 8),
                  language: lang,
                };
              }
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error during legacy difficult words migration:', e);
    }

    // 3. Migrate from central progress difficultWords if any exist
    try {
      const progressRaw = localStorage.getItem('mylearning_progress_v1');
      if (progressRaw) {
        const prog = JSON.parse(progressRaw);
        if (prog && prog.difficultWords && typeof prog.difficultWords === 'object') {
          const list = Array.isArray(prog.difficultWords)
            ? prog.difficultWords
            : Object.values(prog.difficultWords);

          list.forEach((dw: any) => {
            if (dw && dw.word) {
              const subId: SubjectId = dw.subjectId || 'swedish';
              const lang = subId === 'english' ? 'en' : 'sv';
              const cleanWord = String(dw.word).toLowerCase().trim();
              const key = `${subId}:${cleanWord}`;

              if (!items[key]) {
                const mistakes = Number(dw.mistakes) || 1;
                const example = findExampleSentenceForWord(cleanWord, lang);
                items[key] = {
                  id: key,
                  subjectId: subId,
                  text: cleanWord,
                  displayTitle: cleanWord,
                  category: 'Vocabulary',
                  unitTitle: example?.unitTitle,
                  exampleSentence: example ? { text: example.text, translation: example.translation } : undefined,
                  mistakeCount: mistakes,
                  correctCount: 0,
                  lastMistakeDate: safeIsoDate(dw.lastMistakeAt),
                  masteryScore: Math.max(10, 40 - mistakes * 8),
                  language: lang,
                };
              }
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error during progress difficultWords migration:', e);
    }

    this.cache = items;
    this.save(items);
    return items;
  }

  private save(items: Record<string, ReviewItem>): void {
    this.cache = items;
    try {
      localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save review items to localStorage:', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(REVIEW_UPDATED_EVENT, { detail: items }));
    }
  }

  /**
   * Get all review items, optionally filtered by subject
   */
  public getReviewItems(subjectId?: SubjectId | 'all'): ReviewItem[] {
    try {
      const items = this.loadAndMigrate();
      const list = Object.values(items).filter((item): item is ReviewItem => !!item && typeof item === 'object');
      const filtered = (!subjectId || subjectId === 'all')
        ? list
        : list.filter((item) => item.subjectId === subjectId);

      return filtered.sort((a, b) => {
        const aScore = typeof a.masteryScore === 'number' ? a.masteryScore : 0;
        const bScore = typeof b.masteryScore === 'number' ? b.masteryScore : 0;
        const aMistakes = typeof a.mistakeCount === 'number' ? a.mistakeCount : 0;
        const bMistakes = typeof b.mistakeCount === 'number' ? b.mistakeCount : 0;
        return aScore - bScore || bMistakes - aMistakes;
      });
    } catch (e) {
      console.warn('Error in getReviewItems:', e);
      return [];
    }
  }

  /**
   * Get review items grouped by Mastery level (Needs Practice, Improving, Mastered)
   */
  public getReviewItemsByMastery(subjectId?: SubjectId | 'all'): {
    needsPractice: ReviewItem[];
    improving: ReviewItem[];
    mastered: ReviewItem[];
  } {
    try {
      const all = this.getReviewItems(subjectId);
      const needsPractice: ReviewItem[] = [];
      const improving: ReviewItem[] = [];
      const mastered: ReviewItem[] = [];

      all.forEach((item) => {
        if (!item) return;
        const level = getMasteryLevel(typeof item.masteryScore === 'number' ? item.masteryScore : 0);
        if (level === 'needs_practice') {
          needsPractice.push(item);
        } else if (level === 'improving') {
          improving.push(item);
        } else {
          mastered.push(item);
        }
      });

      return { needsPractice, improving, mastered };
    } catch (e) {
      console.warn('Error in getReviewItemsByMastery:', e);
      return { needsPractice: [], improving: [], mastered: [] };
    }
  }

  /**
   * Record a mistake in Swedish or English
   */
  public recordLanguageMistake(options: {
    word: string;
    language: 'sv' | 'en';
    sentenceText?: string;
    sentenceTranslation?: string;
    unitId?: string;
    unitTitle?: string;
    lessonId?: string;
  }): void {
    const cleanWord = options.word.toLowerCase().replace(/[^a-zåäöA-ZÅÄÖ]/g, '').trim();
    if (!cleanWord || cleanWord.length < 2) return;

    const subjectId: SubjectId = options.language === 'en' ? 'english' : 'swedish';
    const key = `${subjectId}:${cleanWord}`;
    const items = this.loadAndMigrate();
    const nowIso = new Date().toISOString();

    const existing = items[key];

    if (existing) {
      existing.mistakeCount += 1;
      existing.lastMistakeDate = nowIso;
      // Decrease mastery score on repeated mistakes
      existing.masteryScore = Math.max(0, existing.masteryScore - 15);
      if (options.sentenceText && (!existing.exampleSentence || existing.exampleSentence.text.length < options.sentenceText.length)) {
        existing.exampleSentence = {
          text: options.sentenceText,
          translation: options.sentenceTranslation,
        };
      }
    } else {
      let example = options.sentenceText
        ? { text: options.sentenceText, translation: options.sentenceTranslation }
        : findExampleSentenceForWord(cleanWord, options.language);

      items[key] = {
        id: key,
        subjectId,
        text: cleanWord,
        displayTitle: cleanWord,
        category: 'Vocabulary',
        unitId: options.unitId,
        unitTitle: options.unitTitle,
        lessonId: options.lessonId,
        exampleSentence: example ? { text: example.text, translation: example.translation } : undefined,
        mistakeCount: 1,
        correctCount: 0,
        lastMistakeDate: nowIso,
        masteryScore: 25, // Initial mastery starts in Needs Practice
        language: options.language,
      };
    }

    this.save(items);
  }

  /**
   * Record a mistake on a Python exercise
   */
  public recordPythonMistake(options: {
    exerciseId: string;
    exerciseTitle: string;
    conceptPrompt?: string;
    contentToType: string;
    unitId?: string;
    unitTitle?: string;
    explanation?: string;
    mistakesCount?: number;
  }): void {
    const key = `python:${options.exerciseId}`;
    const items = this.loadAndMigrate();
    const nowIso = new Date().toISOString();
    const mistakes = options.mistakesCount || 1;

    const existing = items[key];
    const displayTopic = options.unitTitle || options.exerciseTitle || 'Python Syntax';

    if (existing) {
      existing.mistakeCount += mistakes;
      existing.lastMistakeDate = nowIso;
      existing.masteryScore = Math.max(0, existing.masteryScore - 15);
    } else {
      items[key] = {
        id: key,
        subjectId: 'python',
        text: options.contentToType,
        displayTitle: displayTopic,
        category: 'Code & Syntax',
        unitId: options.unitId,
        unitTitle: options.unitTitle,
        concept: options.unitTitle || 'Python Basics',
        prompt: options.conceptPrompt || options.explanation || 'Type the code accurately:',
        codeSnippet: options.contentToType,
        mistakeCount: mistakes,
        correctCount: 0,
        lastMistakeDate: nowIso,
        masteryScore: 25, // Initial mastery in Needs Practice
        language: 'python',
      };
    }

    this.save(items);
  }

  /**
   * Record outcome of practicing a specific review item during a session
   */
  public recordSessionItemResult(itemId: string, isCorrect: boolean, mistakesMade: number): void {
    const items = this.loadAndMigrate();
    const item = items[itemId];
    if (!item) return;

    const nowIso = new Date().toISOString();
    item.lastReviewedDate = nowIso;

    if (isCorrect && mistakesMade === 0) {
      item.correctCount += 1;
      // Increase mastery (+25 points)
      item.masteryScore = Math.min(100, item.masteryScore + 25);
    } else {
      item.mistakeCount += Math.max(1, mistakesMade);
      item.lastMistakeDate = nowIso;
      // Drop mastery (-15 points)
      item.masteryScore = Math.max(0, item.masteryScore - 15);
    }

    this.save(items);
  }

  /**
   * Select a prioritized set of items for a review session
   */
  public getReviewSessionItems(subjectId?: SubjectId | 'all', maxCount: number = 8): ReviewItem[] {
    try {
      const all = this.getReviewItems(subjectId);
      if (all.length === 0) return [];

      // Prioritization:
      // 1. Needs Practice items first (< 40)
      // 2. Improving items next (40-79)
      // 3. Mastered items last (for occasional refresh)
      const needsPractice = all.filter((i) => (typeof i.masteryScore === 'number' ? i.masteryScore : 0) < 40);
      const improving = all.filter((i) => {
        const score = typeof i.masteryScore === 'number' ? i.masteryScore : 0;
        return score >= 40 && score < 80;
      });
      const mastered = all.filter((i) => (typeof i.masteryScore === 'number' ? i.masteryScore : 0) >= 80);

      // Sort within buckets by mistakeCount descending, then most recent mistake
      const sortByHardest = (a: ReviewItem, b: ReviewItem) => {
        const aMistakes = typeof a.mistakeCount === 'number' ? a.mistakeCount : 0;
        const bMistakes = typeof b.mistakeCount === 'number' ? b.mistakeCount : 0;
        if (bMistakes !== aMistakes) {
          return bMistakes - aMistakes;
        }
        const aTime = a.lastMistakeDate ? new Date(a.lastMistakeDate).getTime() : 0;
        const bTime = b.lastMistakeDate ? new Date(b.lastMistakeDate).getTime() : 0;
        return (isNaN(bTime) ? 0 : bTime) - (isNaN(aTime) ? 0 : aTime);
      };

      needsPractice.sort(sortByHardest);
      improving.sort(sortByHardest);
      mastered.sort(sortByHardest);

      const selected: ReviewItem[] = [];

      // Fill up to maxCount
      for (const item of needsPractice) {
        if (selected.length < maxCount) selected.push(item);
      }
      for (const item of improving) {
        if (selected.length < maxCount) selected.push(item);
      }
      for (const item of mastered) {
        if (selected.length < maxCount) selected.push(item);
      }

      return selected;
    } catch (e) {
      console.warn('Error in getReviewSessionItems:', e);
      return [];
    }
  }

  /**
   * Overall counts and stats for the Dashboard & Review views
   */
  public getStats() {
    try {
      const all = this.getReviewItems();
      let swedishCount = 0;
      let englishCount = 0;
      let pythonCount = 0;
      let needsPracticeCount = 0;
      let improvingCount = 0;
      let masteredCount = 0;

      all.forEach((item) => {
        if (!item) return;
        if (item.subjectId === 'swedish') swedishCount++;
        else if (item.subjectId === 'english') englishCount++;
        else if (item.subjectId === 'python') pythonCount++;

        const lvl = getMasteryLevel(typeof item.masteryScore === 'number' ? item.masteryScore : 0);
        if (lvl === 'needs_practice') needsPracticeCount++;
        else if (lvl === 'improving') improvingCount++;
        else masteredCount++;
      });

      return {
        totalCount: all.length,
        swedishCount,
        englishCount,
        pythonCount,
        needsPracticeCount,
        improvingCount,
        masteredCount,
      };
    } catch (e) {
      console.warn('Error in getStats:', e);
      return {
        totalCount: 0,
        swedishCount: 0,
        englishCount: 0,
        pythonCount: 0,
        needsPracticeCount: 0,
        improvingCount: 0,
        masteredCount: 0,
      };
    }
  }

  /**
   * Remove or reset a review item if explicitly requested
   */
  public deleteReviewItem(id: string): void {
    const items = this.loadAndMigrate();
    if (items[id]) {
      delete items[id];
      this.save(items);
    }
  }

  /**
   * Reset all review items
   */
  public resetAll(): void {
    this.save({});
  }
}

export const reviewService = new ReviewService();
