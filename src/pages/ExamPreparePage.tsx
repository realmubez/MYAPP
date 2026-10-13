import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Layers,
  FileQuestion,
  Award,
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Volume2,
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
import { fetchTTSAudioBlobUrl } from '../services/tts';

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

  // Custom audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const hfUrl = "https://huggingface.co/datasets/realmubez/M/resolve/main/Generated%20Audio%20October%2007%2C%202026%20-%207_09PM%20(1).wav";
    let isMounted = true;

    fetchTTSAudioBlobUrl(hfUrl)
      .then((blobUrl) => {
        if (isMounted && audioRef.current) {
          audioRef.current.src = blobUrl;
        }
      })
      .catch((err) => {
        console.warn('Failed to load audio blob, using direct URL:', err);
        if (isMounted && audioRef.current) {
          audioRef.current.src = hfUrl;
        }
      });

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      isMounted = false;
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((err) => console.log('Audio play error:', err));
    }
  };

  const handleSkip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + seconds, 0), duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleRateChange = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

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

      {/* Ultra-Compact Amber Audio Player */}
      <div className="bg-[#17110c] text-[#eae3db] rounded-xl px-4 py-2.5 shadow-lg border border-[#2a2015] flex flex-col sm:flex-row items-center justify-between gap-3">
        <audio
          ref={audioRef}
          preload="metadata"
          onError={(e) => {
            console.warn('Audio element error handled:', e);
          }}
        />

        {/* Track Info */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0 border border-amber-500/30 text-amber-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-xs text-[#f7e6d4] truncate flex items-center gap-1.5">
              <span>Exam Audio Units 1–2D</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/30">Official</span>
            </div>
            <div className="text-[11px] text-amber-200/50 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>

        {/* Compact Controls */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-end flex-wrap gap-y-1.5">
          {/* Skip back 5s */}
          <button
            onClick={() => handleSkip(-5)}
            className="px-2 py-1 bg-[#211a14] hover:bg-[#2a2015] active:bg-[#17110c] rounded-md text-[11px] font-medium text-amber-200/90 flex items-center gap-0.5 border border-[#2f241a] transition shadow-xs"
            title="Rewind 5 seconds"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>-5s</span>
          </button>

          {/* Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 rounded-md text-xs font-bold text-white flex items-center gap-1 shadow-sm transition border border-amber-500/40"
          >
            {isPlaying ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>Pause</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                <span>Play</span>
              </>
            )}
          </button>

          {/* Skip forward 5s */}
          <button
            onClick={() => handleSkip(5)}
            className="px-2 py-1 bg-[#211a14] hover:bg-[#2a2015] active:bg-[#17110c] rounded-md text-[11px] font-medium text-amber-200/90 flex items-center gap-0.5 border border-[#2f241a] transition shadow-xs"
            title="Forward 5 seconds"
          >
            <span>+5s</span>
            <RotateCw className="w-3 h-3 text-amber-400" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-[#211a14] rounded-md p-0.5 border border-[#2f241a] ml-1">
            {[0.75, 1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => handleRateChange(rate)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition ${
                  playbackRate === rate
                    ? 'bg-amber-600 text-white shadow-xs font-semibold'
                    : 'text-amber-200/60 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

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
