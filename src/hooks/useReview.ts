import { useState, useEffect, useCallback } from 'react';
import { SubjectId, ReviewItem } from '../types';
import { reviewService, REVIEW_UPDATED_EVENT, getMasteryLevel } from '../services/reviewService';

export function useReview(subjectFilter?: SubjectId | 'all') {
  const [items, setItems] = useState<ReviewItem[]>(() => {
    try {
      return reviewService.getReviewItems(subjectFilter);
    } catch {
      return [];
    }
  });

  const [stats, setStats] = useState(() => {
    try {
      return reviewService.getStats();
    } catch {
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
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        setItems(reviewService.getReviewItems(subjectFilter));
        setStats(reviewService.getStats());
      } catch (e) {
        console.warn('Error handling review update:', e);
      }
    };

    window.addEventListener(REVIEW_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(REVIEW_UPDATED_EVENT, handleUpdate);
    };
  }, [subjectFilter]);

  const safeItems = Array.isArray(items) ? items.filter((i): i is ReviewItem => !!i && typeof i === 'object') : [];
  const grouped = {
    needsPractice: safeItems.filter((i) => getMasteryLevel(typeof i.masteryScore === 'number' ? i.masteryScore : 0) === 'needs_practice'),
    improving: safeItems.filter((i) => getMasteryLevel(typeof i.masteryScore === 'number' ? i.masteryScore : 0) === 'improving'),
    mastered: safeItems.filter((i) => getMasteryLevel(typeof i.masteryScore === 'number' ? i.masteryScore : 0) === 'mastered'),
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
