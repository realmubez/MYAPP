/**
 * Notification Architecture Preparation (Phase 2)
 *
 * Prepares interfaces, reminder types, and helper routines for future learning reminders:
 * - Daily learning reminder
 * - Streak reminder
 * - Mistake Review reminder
 * - New lesson reminder
 * - Telegram reminder
 *
 * NOTE: As per Phase 2 instructions:
 * - DO NOT request browser notification permission yet.
 * - DO NOT show a browser notification permission prompt.
 * This file establishes the typed contract for Phase 3+.
 */

export type ReminderType = 'daily' | 'streak' | 'review' | 'new_lesson' | 'telegram';

export interface ReminderConfig {
  enabled: boolean;
  time: string; // "HH:MM" 24h
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  lastTriggered?: string; // ISO 8601
}

export interface NotificationArchitectureSettings {
  dailyReminder: ReminderConfig;
  streakProtection: ReminderConfig;
  mistakeReviewPrompt: ReminderConfig;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationArchitectureSettings = {
  dailyReminder: {
    enabled: false,
    time: '20:00',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
  },
  streakProtection: {
    enabled: false,
    time: '21:30',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
  },
  mistakeReviewPrompt: {
    enabled: false,
    time: '18:00',
    daysOfWeek: [1, 3, 5],
  },
};

/**
 * Check if the current browser environment supports the Web Notifications API
 * without actually triggering a permission prompt.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Read current notification permission state without requesting it.
 */
export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}
