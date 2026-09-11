import React from 'react';
import { TypingGuideKeyboard } from './TypingGuideKeyboard';

interface TouchTypingKeyboardProps {
  expectedChar: string | null;
  allowedKeys?: string[];
  onKeyClick?: (char: string) => void;
}

export const TouchTypingKeyboard: React.FC<TouchTypingKeyboardProps> = ({
  expectedChar,
  allowedKeys,
  onKeyClick,
}) => {
  return (
    <TypingGuideKeyboard
      nextChar={expectedChar}
      allowedKeys={allowedKeys}
      onKeyClick={onKeyClick}
    />
  );
};

export { TypingGuideKeyboard };
