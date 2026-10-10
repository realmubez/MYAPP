import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Layers,
  FileQuestion,
  Award,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { ExamDashboardHeader } from '../components/examPrepare/ExamDashboardHeader';
import { ExamVoiceSettingsBar } from '../components/examPrepare/ExamVoiceSettingsBar';
import { SetExamDateModal } from '../components/examPrepare/SetExamDateModal';
import { ExamLessonsList } from '../components/examPrepare/ExamLessonsList';
import { ExamLessonDetail } from '../components/examPrepare/ExamLessonDetail';
import { ExamVocabularyView } from '../components/examPrepare/ExamVocabularyView';
import { ExamPracticeView } from '../components/examPrepare/ExamPracticeView';
import { ExamMockTestView } from '../components/examPrepare/ExamMockTestView';
import { ExamMistakesReview } from '../components/examPrepare/ExamMistakesReview';
import { FingerScratchpad } from '../components/math/FingerScratchpad';
import { EXAM_LESSONS, ExamLesson } from '../data/examPrepare/straightforwardUnits';
import {
  examProgressService,
  ExamProgressState,
} from '../../src/services/examProgressService';

export function ExamPreparePage() {
  const [progressState, setProgressState] = useState<ExamProgressState>(() =>
    examProgressService.getState()
  );
  const [activeTab, setActiveTab] = useState<
    'lessons' | 'vocabulary' | 'practice' | 'mock-exam' | 'mistakes'
  >('lessons');
  const [activeLesson, setActiveLesson] = useState<ExamLesson | null>(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);

  // Subscribe to progress changes
  useEffect(() => {
    const unsub = examProgressService.subscribe(() => {
      setProgressState(examProgressService.getState());
    });
    return () => unsub();
  }, []);

  // Continue studying logic: finds first uncompleted lesson, or the last studied one
  const handleContinueStudying = () => {
    const uncompleted = EXAM_LESSONS.find(
      (l) => !progressState.completedLessonIds.includes(l.id)
    );
    const targetLesson =
      uncompleted ||
      EXAM_LESSONS.find((l) => l.id === progressState.lastStudiedLessonId) ||
      EXAM_LESSONS[0];

    setActiveTab('lessons');
    setActiveLesson(targetLesson);
    examProgressService.setLastStudied(targetLesson.id);
  };

  const handleSelectLesson = (lesson: ExamLesson) => {
    setActiveLesson(lesson);
    examProgressService.setLastStudied(lesson.id);
  };

  const handleToggleComplete = (lessonId: string, completed: boolean) => {
    examProgressService.setLessonCompleted(lessonId, completed);
  };

  const handleToggleBookmark = (lessonId: string) => {
    examProgressService.toggleBookmark(lessonId);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 animate-fadeIn">
      {/* 1. Header with countdown, exam name, progress & tabs */}
      <ExamDashboardHeader
        progressState={progressState}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'lessons') {
            setActiveLesson(null);
          }
        }}
        onContinueStudying={handleContinueStudying}
        onOpenSetDateModal={() => setIsDateModalOpen(true)}
        onOpenScratchpad={() => setIsScratchpadOpen(true)}
        totalLessons={EXAM_LESSONS.length}
      />

      {/* 2. Web Speech Voice Settings & Edge indicator bar */}
      <ExamVoiceSettingsBar />

      {/* 3. Main Body Content Based on Active Tab or Active Lesson */}
      <main className="w-full">
        {activeTab === 'lessons' && (
          <div>
            {activeLesson ? (
              <ExamLessonDetail
                lesson={activeLesson}
                isCompleted={progressState.completedLessonIds.includes(activeLesson.id)}
                isBookmarked={progressState.bookmarkedLessonIds.includes(activeLesson.id)}
                onBackToList={() => setActiveLesson(null)}
                onSelectLesson={(id) => {
                  const target = EXAM_LESSONS.find((l) => l.id === id);
                  if (target) handleSelectLesson(target);
                }}
                onToggleComplete={(done) =>
                  handleToggleComplete(activeLesson.id, done)
                }
                onToggleBookmark={() => handleToggleBookmark(activeLesson.id)}
                allLessons={EXAM_LESSONS}
              />
            ) : (
              <ExamLessonsList
                completedLessonIds={progressState.completedLessonIds}
                bookmarkedLessonIds={progressState.bookmarkedLessonIds}
                onSelectLesson={handleSelectLesson}
              />
            )}
          </div>
        )}

        {activeTab === 'vocabulary' && <ExamVocabularyView />}

        {activeTab === 'practice' && <ExamPracticeView />}

        {activeTab === 'mock-exam' && (
          <ExamMockTestView
            onBackToLessons={() => setActiveTab('lessons')}
            onReviewMistakes={() => setActiveTab('mistakes')}
          />
        )}

        {activeTab === 'mistakes' && (
          <ExamMistakesReview
            mistakes={progressState.mistakes || []}
            onBackToStudy={() => setActiveTab('lessons')}
          />
        )}
      </main>

      {/* Set Exam Date Modal */}
      <SetExamDateModal
        isOpen={isDateModalOpen}
        currentDate={progressState.targetExamDate}
        onClose={() => setIsDateModalOpen(false)}
        onSave={(newDate) => examProgressService.setExamDate(newDate)}
      />

      {/* Handwriting / Finger Scratchpad for English spelling and notes */}
      <FingerScratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        title="English Handwriting Scratchpad ✍️"
        subtitle="Write spellings, complete sentences & notes with your finger"
        storageKey="my_learning_exam_prepare_scratchpad"
        showSomali={false}
      />
    </div>
  );
}
