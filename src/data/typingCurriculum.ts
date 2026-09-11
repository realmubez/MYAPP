export interface TypingExercise {
  id: string;
  day: number;
  exerciseNumber: number;
  targetText: string;
  focusDesc?: string;
}

export interface TypingFingerGuide {
  hand: 'left' | 'right';
  finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
  label: string;
}

export interface TypingDay {
  day: number;
  title: string;
  subtitle: string;
  keysLearned: string[];
  allowedKeys: string[];
  homeKeys: {
    left: string;
    right: string;
  };
  fingerMap: Record<string, TypingFingerGuide>;
  exercises: TypingExercise[];
}

export interface TouchTypingExerciseResult {
  exerciseNumber: number;
  wpm: number;
  accuracy: number;
  mistakes: number;
  durationSeconds: number;
  completedAt: string;
}

export interface TouchTypingProgress {
  day: number;
  currentExerciseIndex: number; // 0-indexed (0 to 9 for 10 exercises)
  completed: boolean;
  bestWpm: number;
  averageAccuracy: number;
  totalCharactersTyped: number;
  totalMistakes: number;
  exerciseResults: TouchTypingExerciseResult[];
  lastActiveAt: string;
  introSeen?: boolean;
}

export const DAY_1_FINGER_MAP: Record<string, TypingFingerGuide> = {
  a: { hand: 'left', finger: 'pinky', label: 'Left pinky' },
  s: { hand: 'left', finger: 'ring', label: 'Left ring' },
  d: { hand: 'left', finger: 'middle', label: 'Left middle' },
  f: { hand: 'left', finger: 'index', label: 'Left index' },
  j: { hand: 'right', finger: 'index', label: 'Right index' },
  k: { hand: 'right', finger: 'middle', label: 'Right middle' },
  l: { hand: 'right', finger: 'ring', label: 'Right ring' },
  ';': { hand: 'right', finger: 'pinky', label: 'Right pinky' },
  ' ': { hand: 'right', finger: 'thumb', label: 'Thumb' },
};

/**
 * DAY 1: Home Row Basics
 * STRICT RULE: Only keys 'a', 's', 'd', 'f', 'j', 'k', 'l', ';', and space.
 * No uppercase, no numbers, no other letters, no unsupported punctuation.
 */
export const DAY_1_TYPING: TypingDay = {
  day: 1,
  title: 'Home Row',
  subtitle: 'Home Row Basics',
  keysLearned: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
  allowedKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';', ' '],
  homeKeys: {
    left: 'f',
    right: 'j',
  },
  fingerMap: DAY_1_FINGER_MAP,
  exercises: [
    {
      id: 'day1-ex1',
      day: 1,
      exerciseNumber: 1,
      targetText: 'asdf jkl;',
      focusDesc: 'Home position drill',
    },
    {
      id: 'day1-ex2',
      day: 1,
      exerciseNumber: 2,
      targetText: 'asdf asdf jkl; jkl;',
      focusDesc: 'Repetition & rhythm',
    },
    {
      id: 'day1-ex3',
      day: 1,
      exerciseNumber: 3,
      targetText: 'aaa sss ddd fff',
      focusDesc: 'Left hand individual keys',
    },
    {
      id: 'day1-ex4',
      day: 1,
      exerciseNumber: 4,
      targetText: 'jjj kkk lll ;;;',
      focusDesc: 'Right hand individual keys',
    },
    {
      id: 'day1-ex5',
      day: 1,
      exerciseNumber: 5,
      targetText: 'asdf fdsa jkl; ;lkj',
      focusDesc: 'Reverse reach drill',
    },
    {
      id: 'day1-ex6',
      day: 1,
      exerciseNumber: 6,
      targetText: 'sad dad fad',
      focusDesc: 'Left hand 3-letter words',
    },
    {
      id: 'day1-ex7',
      day: 1,
      exerciseNumber: 7,
      targetText: 'lad fall sad',
      focusDesc: 'Both hands combined words',
    },
    {
      id: 'day1-ex8',
      day: 1,
      exerciseNumber: 8,
      targetText: 'fall dad lad',
      focusDesc: 'Word flow & spacebar rhythm',
    },
    {
      id: 'day1-ex9',
      day: 1,
      exerciseNumber: 9,
      targetText: 'asdf jkl; fdsa ;lkj',
      focusDesc: 'Speed & muscle memory check',
    },
    {
      id: 'day1-ex10',
      day: 1,
      exerciseNumber: 10,
      targetText: 'asdf jkl; sad fall lad dad flask',
      focusDesc: 'Final comprehensive home-row drill',
    },
  ],
};

/**
 * Validates that every character in a text string belongs strictly to the allowed key set.
 */
export function validateExerciseTarget(text: string, allowedKeys: string[]): boolean {
  const allowedSet = new Set(allowedKeys);
  for (let i = 0; i < text.length; i++) {
    if (!allowedSet.has(text[i])) {
      return false;
    }
  }
  return true;
}

// Runtime check to guarantee Day 1 exercises strictly follow allowed keys rule
DAY_1_TYPING.exercises.forEach((ex) => {
  if (!validateExerciseTarget(ex.targetText, DAY_1_TYPING.allowedKeys)) {
    throw new Error(`Day 1 Exercise ${ex.exerciseNumber} contains unauthorized characters: "${ex.targetText}"`);
  }
});

// Curriculum collection ready for future days (Day 2: G & H, Day 3: E & I, etc.)
export const TYPING_CURRICULUM: Record<number, TypingDay> = {
  1: DAY_1_TYPING,
};

const STORAGE_PREFIX = 'mylearning_touch_typing_day_';

export function getTouchTypingProgress(day: number): TouchTypingProgress {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${day}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to read touch typing progress:', e);
  }

  return {
    day,
    currentExerciseIndex: 0,
    completed: false,
    bestWpm: 0,
    averageAccuracy: 0,
    totalCharactersTyped: 0,
    totalMistakes: 0,
    exerciseResults: [],
    lastActiveAt: new Date().toISOString(),
    introSeen: false,
  };
}

export function saveTouchTypingProgress(progress: TouchTypingProgress): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${progress.day}`,
      JSON.stringify({
        ...progress,
        lastActiveAt: new Date().toISOString(),
      })
    );
  } catch (e) {
    console.warn('Failed to save touch typing progress:', e);
  }
}
