import { useState, useEffect, useCallback } from 'react';
import {
  SubjectId,
  LearningProgress,
  SubjectProgress,
  UserStats,
  ContinueInfo,
  RecentSessionRecord,
  LastPosition,
} from '../types';
import {
  progressService,
  PROGRESS_UPDATED_EVENT,
} from '../services/progress';

export function useProgress() {
  const [progress, setProgress] = useState<LearningProgress>(() => progressService.getProgress());
  const [userStats, setUserStats] = useState<UserStats>(() => progressService.getUserStats());
  const [continueInfo, setContinueInfo] = useState<ContinueInfo>(() => progressService.getContinueInfo());

  // Listen to global progress changes across all components
  useEffect(() => {
    const handleProgressChange = () => {
      setProgress(progressService.getProgress());
      setUserStats(progressService.getUserStats());
      setContinueInfo(progressService.getContinueInfo());
    };

    window.addEventListener(PROGRESS_UPDATED_EVENT, handleProgressChange);
    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, handleProgressChange);
    };
  }, []);

  const recordCompletion = useCallback(
    (data: {
      subjectId: SubjectId;
      exerciseId: string;
      exerciseTitle: string;
      unitId?: string;
      unitTitle?: string;
      wpm: number;
      accuracy: number;
      mistakes: number;
      durationSeconds: number;
      difficultWords?: string[];
      nextExerciseId?: string;
      nextExerciseTitle?: string;
    }) => {
      progressService.recordExerciseCompletion(data);
    },
    []
  );

  const updateLastPosition = useCallback(
    (position: Partial<LastPosition> & { subjectId: SubjectId }) => {
      progressService.updateLastPosition(position);
    },
    []
  );

  const isExerciseCompleted = useCallback((exerciseId: string) => {
    return progressService.isExerciseCompleted(exerciseId);
  }, [progress]);

  const getSubjectProgress = useCallback((subjectId: SubjectId): SubjectProgress => {
    return progress.subjects[subjectId] || progressService.getSubjectProgress(subjectId);
  }, [progress]);

  const resetAllProgress = useCallback(() => {
    progressService.resetProgress();
  }, []);

  return {
    progress,
    userStats,
    stats: userStats,
    continueInfo,
    recentSessions: progress.recentSessions,
    subjects: progress.subjects,
    isExerciseCompleted,
    getSubjectProgress,
    recordCompletion,
    updateLastPosition,
    resetAllProgress,
  };
}
