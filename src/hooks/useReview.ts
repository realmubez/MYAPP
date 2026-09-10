import { useState, useEffect, useCallback } from 'react';
import { SubjectId, ReviewItem } from '../types';
import { reviewService, REVIEW_UPDATED_EVENT, getMasteryLevel } from '../services/reviewService';

export function useReview(subjectFilter?: SubjectId | 'all') {
  const [items, setItems] = useState<ReviewItem[]>(() =>
    reviewService.getReviewItems(subjectFilter)
  );

  const [stats, setStats] = useState(() => reviewService.getStats());

  useEffect(() => {
    const handleUpdate = () => {
      setItems(reviewService.getReviewItems(subjectFilter));
      setStats(reviewService.getStats());
    };

    window.addEventListener(REVIEW_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(REVIEW_UPDATED_EVENT, handleUpdate);
    };
  }, [subjectFilter]);

  const grouped = {
    needsPractice: items.filter((i) => getMasteryLevel(i.masteryScore) === 'needs_practice'),
    improving: items.filter((i) => getMasteryLevel(i.masteryScore) === 'improving'),
    mastered: items.filter((i) => getMasteryLevel(i.masteryScore) === 'mastered'),
  };

  const getSessionItems = useCallback(
    (count?: number) => {
      return reviewService.getReviewSessionItems(subjectFilter, count);
    },
    [subjectFilter]
  );

  const deleteItem = useCallback((id: string) => {
    reviewService.deleteReviewItem(id);
  }, []);

  return {
    items,
    stats,
    grouped,
    needsPractice: grouped.needsPractice,
    improving: grouped.improving,
    mastered: grouped.mastered,
    getSessionItems,
    deleteItem,
  };
}
