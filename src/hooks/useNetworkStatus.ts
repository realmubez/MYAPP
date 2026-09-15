import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  effectiveType?: string;
  saveData?: boolean;
}

/**
 * useNetworkStatus
 *
 * Lightweight, reusable network status hook.
 * Reactively detects online/offline state changes and exposes connection metadata.
 * Does NOT display noisy UI on its own — consumer components choose when and how
 * to show non-intrusive offline banners or disable remote actions (TTS/Telegram/sync).
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [wasOffline, setWasOffline] = useState<boolean>(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Read optional navigator.connection details if available (Chromium/Android)
  const nav = typeof navigator !== 'undefined' ? (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }) : null;
  const connection = nav?.connection;

  return {
    isOnline,
    wasOffline,
    effectiveType: connection?.effectiveType,
    saveData: connection?.saveData,
  };
}
