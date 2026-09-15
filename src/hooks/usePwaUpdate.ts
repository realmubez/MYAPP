import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * usePwaUpdate
 *
 * Coordinates service worker registration and updates safely.
 * When a new version is detected:
 * - Checks if the user is currently engaged in an active lesson, typing drill, or review
 * - Exposes needRefresh flag and an updateServiceWorker() trigger
 * - Gives full control to the user so we NEVER reload abruptly while typing
 */
export function usePwaUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateFunction, setUpdateFunction] = useState<(() => Promise<void>) | null>(null);
  const location = useLocation();

  // Determine if the user is actively typing in a lesson or review
  const isTypingActive =
    location.pathname.startsWith('/lesson') ||
    location.pathname.startsWith('/focus') ||
    location.pathname.startsWith('/typing/day') ||
    location.pathname.startsWith('/review');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import virtual:pwa-register
    let isMounted = true;

    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        if (!isMounted) return;

        const updateSW = registerSW({
          immediate: true,
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onOfflineReady() {
            setOfflineReady(true);
          },
          onRegistered(registration) {
            // Optional: periodically check for SW updates every hour
            if (registration) {
              setInterval(() => {
                registration.update().catch(() => {});
              }, 60 * 60 * 1000);
            }
          },
          onRegisterError(error) {
            console.warn('[PWA] Service worker registration error:', error);
          },
        });

        setUpdateFunction(() => async () => {
          await updateSW(true);
        });
      })
      .catch((err) => {
        // In some dev environments or when SW is unsupported, this will fail safely
        console.debug('[PWA] virtual:pwa-register not available or bypassed:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const dismissRefresh = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  const triggerUpdate = useCallback(async () => {
    if (updateFunction) {
      await updateFunction();
    } else {
      window.location.reload();
    }
  }, [updateFunction]);

  return {
    needRefresh,
    offlineReady,
    isTypingActive,
    triggerUpdate,
    dismissRefresh,
  };
}
