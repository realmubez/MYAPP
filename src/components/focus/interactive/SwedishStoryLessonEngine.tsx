import { StoryLessonEngine } from '../story/StoryLessonEngine';
import { KAPITEL_1_CHAPTER } from '../../../data/courses/swedish/enVanligMorgonLesson';

interface SwedishStoryLessonEngineProps {
  onExit?: () => void;
  onComplete?: () => void;
}

export function SwedishStoryLessonEngine({
  onExit,
  onComplete,
}: SwedishStoryLessonEngineProps) {
  return (
    <StoryLessonEngine
      chapter={KAPITEL_1_CHAPTER}
      onExit={onExit}
      onLessonComplete={() => {
        if (onComplete) onComplete();
      }}
    />
  );
}
