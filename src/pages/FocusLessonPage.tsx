import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Terminal } from 'lucide-react';
import { SWEDISH_LESSONS } from '../data/swedishLessons';
import { ENGLISH_LESSONS } from '../data/englishLessons';
import { SWEDISH_UNITS } from '../data/swedishUnits';
import { ENGLISH_UNITS } from '../data/englishUnits';
import { PYTHON_UNITS, PythonExerciseItem } from '../data/pythonUnits';
import { GERMAN_BEGINNER_1_UNITS } from '../data/courses/german';
import { GERMAN_BEGRUSSUNGEN_LESSON } from '../data/courses/german/begrussungenLesson';
import { MATHEMATICS_ARITHMETIC_LESSON } from '../data/courses/mathematics';
import { FocusLesson } from '../components/focus/FocusLesson';
import { PythonFocusLesson } from '../components/focus/PythonFocusLesson';
import { PythonVariablesLessonEngine } from '../components/focus/interactive/PythonVariablesLessonEngine';
import { SwedishStoryLessonEngine } from '../components/focus/interactive/SwedishStoryLessonEngine';
import { AcademicLessonEngine } from '../components/academic/AcademicLessonEngine';
import { LanguageLesson } from '../types/lessons';
import { SAMPLE_EXERCISES } from '../data/mockData';
import { useProfile } from '../hooks/useProfile';
import { SubjectId } from '../types';

export function FocusLessonPage() {
  const { subject, lessonId, id } = useParams<{
    subject?: string;
    lessonId?: string;
    id?: string;
  }>();
  const navigate = useNavigate();
  const { profile, isAdmin } = useProfile();

  // Helper to verify assignment access for students
  const checkAccess = (subjId: SubjectId): boolean => {
    if (isAdmin) return true;
    const assigned = Array.isArray(profile.assignedSubjects) ? profile.assignedSubjects : [];
    return assigned.includes(subjId);
  };

  // Combine query param options
  const targetId = lessonId || id;
  const targetSubject = subject?.toLowerCase();

  // Mathematics academic engine check
  if (targetSubject === 'mathematics' || targetSubject === 'math' || targetId?.startsWith('math-')) {
    if (!checkAccess('mathematics')) {
      return <Navigate to="/" replace />;
    }
    return (
      <AcademicLessonEngine
        lesson={MATHEMATICS_ARITHMETIC_LESSON}
        onExit={() => navigate('/mathematics')}
        onComplete={() => navigate('/mathematics')}
      />
    );
  }

  // Python Variables experimental lesson check
  if (
    targetId === 'py-variables' ||
    targetId === 'py-b1-u02-ex5' ||
    (targetSubject === 'python' && targetId?.includes('variables'))
  ) {
    if (!checkAccess('python')) {
      return <Navigate to="/" replace />;
    }
    return (
      <PythonVariablesLessonEngine
        onExit={() => navigate('/python')}
        onComplete={() => navigate('/python')}
      />
    );
  }

  // Swedish Story: En vanlig morgon
  if (
    targetId === 'sv-en-vanlig-morgon' ||
    targetId === 'en-vanlig-morgon' ||
    (targetSubject === 'swedish' && (targetId?.includes('morgon') || targetId?.includes('en-vanlig-morgon')))
  ) {
    if (!checkAccess('swedish')) {
      return <Navigate to="/" replace />;
    }
    return (
      <SwedishStoryLessonEngine
        onExit={() => navigate('/swedish')}
        onComplete={() => navigate('/swedish')}
      />
    );
  }

  // Python-specific lesson handler
  if (targetSubject === 'python' || targetId?.startsWith('py-')) {
    if (!checkAccess('python')) {
      return <Navigate to="/" replace />;
    }
    const pyUnitExercise = PYTHON_UNITS.flatMap((u) => u.exercises).find(
      (ex) => ex.id === targetId
    );
    if (pyUnitExercise) {
      return (
        <PythonFocusLesson
          exercise={pyUnitExercise}
          onExit={() => navigate('/python')}
        />
      );
    }

    const pyExercise =
      SAMPLE_EXERCISES.find((ex) => ex.id === targetId) ||
      SAMPLE_EXERCISES[0];

    const fallbackExercise: PythonExerciseItem = {
      id: pyExercise.id,
      exerciseNumber: 1,
      title: pyExercise.title,
      mode: pyExercise.type === 'concept' ? 'Concept' : 'Typing',
      icon: '🐍',
      prompt: pyExercise.conceptPrompt || 'Type the statement below:',
      contentToType: pyExercise.contentToType,
      explanation: pyExercise.explanation || '',
    };

    return (
      <PythonFocusLesson
        exercise={fallbackExercise}
        onExit={() => navigate('/python')}
      />
    );
  }

  // Pure typing lesson handler
  if (targetSubject === 'typing' || targetId?.startsWith('type-')) {
    if (!checkAccess('typing')) {
      return <Navigate to="/" replace />;
    }
    const typingEx = SAMPLE_EXERCISES.find((ex) => ex.id === targetId) || SAMPLE_EXERCISES.find((e) => e.subjectId === 'typing');
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full rounded-2xl border border-neutral-800 bg-neutral-900/90 p-8 space-y-6 shadow-2xl">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Terminal size={32} />
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
              Typing Track
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              {typingEx?.title || 'Speed & Accuracy Drill'}
            </h2>
            <p className="text-sm text-neutral-400 mt-2">
              {typingEx?.explanation || 'Practice muscle memory on your keyboard.'}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-sm text-amber-300">
            {typingEx?.contentToType}
          </div>

          <div className="pt-2">
            <Link
              to="/typing"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Typing Practice</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // All registered lessons across course units and fallback lists
  const allSwedishExercises = SWEDISH_UNITS.flatMap((u) => u.exercises);
  const allEnglishExercises = ENGLISH_UNITS.flatMap((u) => u.exercises);
  const allGermanExercises = GERMAN_BEGINNER_1_UNITS.flatMap((u) => u.exercises);

  const allSwedishLessons = [
    ...allSwedishExercises.map((e) => e.lesson),
    ...SWEDISH_LESSONS,
  ];
  const allEnglishLessons = [
    ...allEnglishExercises.map((e) => e.lesson),
    ...ENGLISH_LESSONS,
  ];
  const allGermanLessons = [
    ...allGermanExercises.map((e) => e.lesson),
    GERMAN_BEGRUSSUNGEN_LESSON,
  ];

  // Resolve language lesson based on subject and ID
  let matchedLesson: LanguageLesson | undefined;

  if (targetSubject === 'german' || targetSubject === 'de' || targetId?.startsWith('de-')) {
    const matchedEx = allGermanExercises.find((e) => e.id === targetId || e.lesson.id === targetId);
    matchedLesson = matchedEx?.lesson || (targetId ? allGermanLessons.find((l) => l.id === targetId) : allGermanLessons[0]);
  } else if (targetSubject === 'swedish' || targetSubject === 'sv' || targetId?.startsWith('sv-') || targetId?.startsWith('u')) {
    const matchedEx = allSwedishExercises.find((e) => e.id === targetId || e.lesson.id === targetId);
    matchedLesson = matchedEx?.lesson || (targetId ? allSwedishLessons.find((l) => l.id === targetId) : allSwedishLessons[0]);
  } else if (targetSubject === 'english' || targetSubject === 'en' || targetId?.startsWith('en-')) {
    const matchedEx = allEnglishExercises.find((e) => e.id === targetId || e.lesson.id === targetId);
    matchedLesson = matchedEx?.lesson || (targetId ? allEnglishLessons.find((l) => l.id === targetId) : allEnglishLessons[0]);
  } else if (targetId === 'preview') {
    matchedLesson = allSwedishLessons[0];
  } else if (targetId) {
    // Check if ID matches German, English or Swedish exercise or lesson ID
    const matchedDeEx = allGermanExercises.find((e) => e.id === targetId || e.lesson.id === targetId);
    const matchedEnEx = allEnglishExercises.find((e) => e.id === targetId || e.lesson.id === targetId);
    const matchedSvEx = allSwedishExercises.find((e) => e.id === targetId || e.lesson.id === targetId);
    matchedLesson =
      matchedDeEx?.lesson ||
      matchedEnEx?.lesson ||
      matchedSvEx?.lesson ||
      allGermanLessons.find((l) => l.id === targetId) ||
      allEnglishLessons.find((l) => l.id === targetId) ||
      allSwedishLessons.find((l) => l.id === targetId);
  }

  // If lesson is not found, DO NOT silently open Swedish
  if (!matchedLesson) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full rounded-2xl border border-neutral-800 bg-neutral-900/90 p-8 space-y-6 shadow-2xl">
          <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle size={32} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Lesson not found</h2>
            <p className="text-sm text-neutral-400 mt-2">
              The requested lesson <code className="text-amber-400 font-mono text-xs">{targetId || targetSubject || 'unknown'}</code> could not be found.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check access for matched language lesson
  const resolvedSubject: SubjectId =
    matchedLesson.language === 'de'
      ? 'german'
      : matchedLesson.language === 'en'
      ? 'english'
      : 'swedish';

  if (!checkAccess(resolvedSubject)) {
    return <Navigate to="/" replace />;
  }

  return (
    <FocusLesson
      lesson={matchedLesson}
      onExit={() => navigate('/')}
      onLessonComplete={() => {
        navigate('/');
      }}
    />
  );
}
