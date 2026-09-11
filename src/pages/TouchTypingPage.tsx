import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TouchTypingEngine } from '../components/typing/TouchTypingEngine';
import { TYPING_CURRICULUM, DAY_1_TYPING } from '../data/typingCurriculum';

export function TouchTypingPage() {
  const { dayNumber } = useParams<{ dayNumber?: string }>();
  const navigate = useNavigate();

  // Parse day parameter: supports "1", "day-1", "day1", etc.
  let parsedDay = 1;
  if (dayNumber) {
    const matchedNum = dayNumber.replace(/\D/g, '');
    if (matchedNum) {
      parsedDay = parseInt(matchedNum, 10);
    }
  }

  const selectedDayData = TYPING_CURRICULUM[parsedDay] || DAY_1_TYPING;

  return (
    <TouchTypingEngine
      dayData={selectedDayData}
      onExit={() => navigate('/typing')}
    />
  );
}
