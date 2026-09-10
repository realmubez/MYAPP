import { useState, useEffect, useRef, useCallback } from 'react';
import { getTTSUrl, TTSRate } from '../services/tts';
import { Language } from '../types/lessons';

export interface UseLessonAudioOptions {
  text: string;
  language: Language;
  voice: string;
  rate?: TTSRate;
  autoPlay?: boolean;
}

export interface UseLessonAudioReturn {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  replay: () => Promise<void>;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

// In-memory cache for audio object URLs to allow instant replay without network re-fetching
const audioBlobCache = new Map<string, string>();

async function getAudioBlobUrl(url: string, signal: AbortSignal): Promise<string> {
  const cached = audioBlobCache.get(url);
  if (cached) {
    return cached;
  }

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`TTS server responded with ${response.status}: ${response.statusText}`);
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error('TTS server returned an empty audio file');
  }

  const objectUrl = URL.createObjectURL(blob);
  audioBlobCache.set(url, objectUrl);
  return objectUrl;
}

export function useLessonAudio({
  text,
  voice,
  rate = '0%',
}: UseLessonAudioOptions): UseLessonAudioReturn {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    // 1. Abort any pending network request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 2. Tear down active HTMLAudioElement without firing false error events
    if (audioRef.current) {
      try {
        const audio = audioRef.current;
        // Detach handlers first so clearing src does not dispatch an error event
        audio.oncanplay = null;
        audio.onplaying = null;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute('src');
        audio.load();
      } catch {
        // Safe to ignore
      }
      audioRef.current = null;
    }

    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const play = useCallback(async () => {
    if (!text || !text.trim()) {
      return;
    }

    // 1. Stop any previous audio
    stop();

    // 2. Prepare state
    setError(null);
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const targetUrl = getTTSUrl({ text, voice, rate });

    try {
      // 3. Obtain audio source (fetch as Blob for reliable media streaming, with direct URL fallback)
      let resolvedSrc = targetUrl;
      try {
        resolvedSrc = await getAudioBlobUrl(targetUrl, abortController.signal);
      } catch (fetchErr: unknown) {
        if (abortController.signal.aborted) {
          return;
        }
        console.warn('Blob fetch fallback to direct URL:', fetchErr);
      }

      if (abortController.signal.aborted) {
        return;
      }

      // 4. Create and mount HTMLAudioElement
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = 1;
      audio.muted = false;
      audio.src = resolvedSrc;

      audioRef.current = audio;

      // 5. Attach event listeners
      audio.oncanplay = () => {
        if (audioRef.current === audio) {
          setIsLoading(false);
        }
      };

      audio.onplaying = () => {
        if (audioRef.current === audio) {
          setIsPlaying(true);
          setIsLoading(false);
        }
      };

      audio.onended = () => {
        if (audioRef.current === audio) {
          setIsPlaying(false);
          setIsLoading(false);
        }
      };

      audio.onerror = () => {
        // Ignore if this audio instance was superseded or stopped
        if (!audioRef.current || audioRef.current !== audio) {
          return;
        }
        if (audio.error && audio.error.code === MediaError.MEDIA_ERR_ABORTED) {
          return;
        }

        console.error('Remote TTS playback failed for URL:', targetUrl, audio.error);
        setIsLoading(false);
        setIsPlaying(false);
        setError('Audio unavailable. Tap to retry.');
      };

      // 6. Play
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (playError: unknown) {
      if (abortController.signal.aborted) {
        return;
      }

      const err = playError as { name?: string };
      // If blocked by browser autoplay policy on mobile, stay silent without error banner
      if (err?.name === 'NotAllowedError' || err?.name === 'AbortError') {
        console.log('[useLessonAudio] Autoplay blocked by browser policy without gesture. Tap 🔊 to play manually.');
        setIsLoading(false);
        setIsPlaying(false);
        return;
      }

      console.error('Remote TTS playback failed:', playError);
      setIsLoading(false);
      setIsPlaying(false);
      setError('Audio unavailable. Tap to retry.');
    }
  }, [text, voice, rate, stop]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const replay = useCallback(async () => {
    await play();
  }, [play]);

  // When text changes, stop any ongoing playback without destroying ref
  useEffect(() => {
    stop();
  }, [text, stop]);

  // Cleanup strictly on component unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    play,
    pause,
    stop,
    replay,
    isPlaying,
    isLoading,
    error,
  };
}


