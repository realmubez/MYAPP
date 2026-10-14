import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronLeft,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Camera,
  Maximize2,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Headphones,
  Play,
  Copy,
  Check,
  Trash2,
  X,
  Radio,
  Image as ImageIcon,
  CheckCheck,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  imageUrl?: string;
  timestamp: string;
  audioChunk?: string;
}

type LanguageCode = 'so' | 'en' | 'de' | 'all';

// Pre-recorded test speech phrases for Demo Audio Mode
export const DEMO_TEST_PHRASES = [
  {
    id: 'demo-so',
    lang: 'so',
    title: '🇸🇴 Somali Greeting',
    text: 'Asc macallin, maanta waxaan rabaa inaan barto hadalka Soomaaliga.',
  },
  {
    id: 'demo-en',
    lang: 'en',
    title: '🇬🇧 English Conversation',
    text: 'Hello teacher! Can we practice a friendly conversation about daily life?',
  },
  {
    id: 'demo-de',
    lang: 'de',
    title: '🇩🇪 Deutsch Sprechen',
    text: 'Hallo Lehrer! Kannst du mir helfen, deutsche Sätze für den Alltag zu üben?',
  },
  {
    id: 'demo-grammar',
    lang: 'en',
    title: '🎯 Grammar Practice',
    text: 'Can you teach me 3 common mistakes learners make and how to avoid them?',
  },
  {
    id: 'demo-tri',
    lang: 'all',
    title: '✨ Trilingual Test',
    text: 'How do you say "Have a blessed day" in Somali, English, and German?',
  },
];

// Audio helper: convert Float32Array to 16-bit PCM base64
function floatTo16BitPCMBase64(input: Float32Array): string {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  let binary = '';
  const bytes = new Uint8Array(output.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert 16-bit PCM base64 to AudioBuffer (24kHz) with even byte-length alignment
function pcmBase64ToAudioBuffer(
  ctx: AudioContext,
  base64: string,
  sampleRate = 24000
): AudioBuffer | null {
  try {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const evenLen = len - (len % 2);
    if (evenLen === 0) return null;
    const int16 = new Int16Array(bytes.buffer, 0, evenLen / 2);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
    audioBuffer.copyToChannel(float32, 0);
    return audioBuffer;
  } catch (err) {
    console.warn('[AUDIO_DECODE_ERR]', err);
    return null;
  }
}

export function AITutorPage() {
  const navigate = useNavigate();

  // 1. Dual-View State ('voice' | 'chat')
  const [viewMode, setViewMode] = useState<'voice' | 'chat'>('voice');

  // 2. Active Session & Audio States
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Voice Studio Ready');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('so');

  // Demo Audio Mode States (for preview iframe & blocked mic environments)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [liveSessionReady, setLiveSessionReady] = useState<boolean>(false);
  const [demoQuickPrompt, setDemoQuickPrompt] = useState<string>('');

  // Debug Logs State for troubleshooting live voice & publishing issues
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebugDrawer, setShowDebugDrawer] = useState<boolean>(false);

  const addDebugLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formatted = `[${timestamp}] ${msg}`;
    console.log(formatted);
    setDebugLogs((prev) => [...prev.slice(-49), formatted]);
  }, []);

  // 3. Chat and Input States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: '👋 Asc! Welcome to MY LEARNING AI Tutor. I can speak and write in Somali, English, and German. Ask any question, practice conversation, or upload photos of your exercises!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // References for Audio & WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef<boolean>(true);
  const isDemoModeRef = useRef<boolean>(false);
  const liveSessionReadyRef = useRef<boolean>(false);
  const speechRecognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const selectedLangRef = useRef<LanguageCode>('so');
  const messagesRef = useRef<ChatMessage[]>(messages);
  const sessionStartedRef = useRef<boolean>(false);

  // Keep refs in sync with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isDemoModeRef.current = isDemoMode;
  }, [isDemoMode]);

  useEffect(() => {
    selectedLangRef.current = selectedLang;
  }, [selectedLang]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Unlock and resume output audio context on user action
  const ensureAudioUnlocked = useCallback(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!outputAudioCtxRef.current && AudioCtx) {
      try {
        const outputCtx = new AudioCtx({ sampleRate: 24000 });
        outputAudioCtxRef.current = outputCtx;
        nextStartTimeRef.current = outputCtx.currentTime;
      } catch (e) {
        console.warn('[AUDIO_UNLOCK_INIT]', e);
      }
    }
    if (outputAudioCtxRef.current && outputAudioCtxRef.current.state === 'suspended') {
      outputAudioCtxRef.current.resume().catch(() => {});
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (viewMode === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping, viewMode]);

  // Helper: Format system instructions based on language
  const getLanguagePrompt = useCallback(() => {
    switch (selectedLangRef.current) {
      case 'so':
        return 'Please communicate primarily in Somali (Af-Soomaali), with translations to English or German when helpful.';
      case 'en':
        return 'Please communicate primarily in clear, natural British English, explaining difficult words simply.';
      case 'de':
        return 'Please communicate primarily in German (Deutsch B1 level), with vocabulary definitions in English and Somali.';
      default:
        return 'You are trilingual (Somali, English, and German). Match whichever language the student uses.';
    }
  }, []);

  // Text-To-Speech Fallback (Browser Web Speech)
  const speakTextFallback = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      // Clean markdown tags for spoken audio
      const cleanText = text.replace(/[*_#`]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Select voice based on language
      if (selectedLangRef.current === 'de') {
        utterance.lang = 'de-DE';
      } else if (selectedLangRef.current === 'so') {
        utterance.lang = 'so-SO';
      } else {
        utterance.lang = 'en-GB';
      }
      utterance.rate = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setStatusText('Tutor is speaking...');
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setStatusText(isMutedRef.current ? 'Microphone Muted' : 'Listening to you...');
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setStatusText(isMutedRef.current ? 'Microphone Muted' : 'Listening to you...');
      };

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  // Send message to backend AI API or Gemini Live WebSocket
  const sendChatMessage = useCallback(
    async (textToSend: string, imageBase64?: string | null) => {
      if (!textToSend.trim() && !imageBase64) return;
      ensureAudioUnlocked();

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: textToSend,
        imageUrl: imageBase64 || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setDemoQuickPrompt('');
      setAttachedImage(null);
      setIsAiTyping(true);
      setStatusText('Tutor is thinking...');

      // 1. If Gemini Live session is connected via WebSocket, send real-time input directly
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && liveSessionReadyRef.current) {
        try {
          wsRef.current.send(
            JSON.stringify({
              text: textToSend,
              image: imageBase64 ? imageBase64.split(',')[1] || imageBase64 : undefined,
            })
          );
          // Real-time audio chunks from Gemini will stream back and play via AudioQueuePlayer
          return;
        } catch (wsErr) {
          console.warn('[LIVE_WS_SEND_WARN] Falling back to standard chat endpoint:', wsErr);
        }
      }

      // 2. Fallback to standard chat endpoint (hybrid synthesis mode)
      try {
        const history = [...messagesRef.current, userMsg].map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

        const systemPrompt = `You are the AI Learning Tutor for "MY LEARNING".
${getLanguagePrompt()}
Keep spoken answers concise, natural, encouraging, and easy to understand.
Provide helpful corrections, translations, and pronunciations when relevant.`;

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            systemPrompt,
            image: imageBase64 || undefined,
            imageType: 'image/jpeg',
          }),
        });

        const data = await res.json();
        const replyText = data.message || "I'm here to help you learn! Ask me anything.";

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsAiTyping(false);

        // Speak aloud via browser speech
        speakTextFallback(replyText);
      } catch (err) {
        console.warn('[AI_CHAT_CLIENT]', err);
        setIsAiTyping(false);
        setStatusText(
          isDemoModeRef.current
            ? 'Demo Audio Mode active • Voice & Audio live'
            : isMutedRef.current
            ? 'Microphone Muted'
            : 'Voice Studio Ready'
        );
      }
    },
    [ensureAudioUnlocked, getLanguagePrompt, speakTextFallback]
  );

  // Send pre-recorded test speech (simulates speech transmission + triggers Gemini Live voice)
  const handleSendTestSpeech = useCallback(
    (speechText: string) => {
      ensureAudioUnlocked();
      setIsListening(true);
      setStatusText(`Speaking: "${speechText.slice(0, 30)}..."`);
      setAudioLevel(1.5);

      setTimeout(() => {
        setIsListening(false);
        setAudioLevel(0);
        sendChatMessage(speechText);
      }, 600);
    },
    [ensureAudioUnlocked, sendChatMessage]
  );

  // Web Speech Continuous Recognition Setup
  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log('Web SpeechRecognition not supported on this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang =
        selectedLangRef.current === 'de' ? 'de-DE' : selectedLangRef.current === 'so' ? 'so-SO' : 'en-US';

      recognition.onstart = () => {
        if (!isMutedRef.current) {
          setIsListening(true);
          setStatusText('Listening to you...');
        }
      };

      recognition.onresult = (event: any) => {
        if (isMutedRef.current) return;

        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript.trim()) {
          console.log('[USER_SPOKE]', finalTranscript);
          sendChatMessage(finalTranscript);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('[SPEECH_REC_ERROR]', e.error);
        }
      };

      recognition.onend = () => {
        // Auto-restart if unmuted
        if (!isMutedRef.current) {
          try {
            recognition.start();
          } catch {
            // ignore
          }
        }
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (e) {
      console.warn('[SPEECH_INIT_ERROR]', e);
    }
  }, [sendChatMessage]);

  // Safe Microphone Stream Setup - strictly called on user gesture
  const setupMicrophone = useCallback(async (): Promise<boolean> => {
    addDebugLog('Requesting microphone access via getUserMedia...');
    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      addDebugLog('ERROR: navigator.mediaDevices.getUserMedia unavailable');
      setMicPermissionState('denied');
      setIsMuted(true);
      isMutedRef.current = true;
      setStatusText('Microphone unavailable (type below)');
      return false;
    }

    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (inputAudioCtxRef.current) {
        try {
          inputAudioCtxRef.current.close();
        } catch {
          // ignore
        }
        inputAudioCtxRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      addDebugLog('Microphone access granted successfully');

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const inputCtx = new AudioCtx({ sampleRate: 16000 });
        if (inputCtx.state === 'suspended') {
          inputCtx.resume().catch(() => {});
        }
        inputAudioCtxRef.current = inputCtx;

        const source = inputCtx.createMediaStreamSource(stream);
        const analyser = inputCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (isMutedRef.current) {
            setAudioLevel(0);
          } else {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(avg / 128); // 0 to ~2
          }
          animFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();

        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        source.connect(processor);
        processor.connect(inputCtx.destination);

        // Uses isMutedRef.current: dropping frames when muted without touching WS or connection state
        processor.onaudioprocess = (e) => {
          if (isMutedRef.current) return;
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBase64 = floatTo16BitPCMBase64(inputData);
            wsRef.current.send(JSON.stringify({ audio: pcmBase64 }));
          }
        };
      }

      setMicPermissionState('granted');
      setIsMuted(false);
      isMutedRef.current = false;
      setIsListening(true);
      setStatusText('Listening to you...');
      return true;
    } catch (err: any) {
      addDebugLog(`ERROR: Microphone permission denied or error: ${err?.name} - ${err?.message}`);
      setMicPermissionState('denied');
      setIsMuted(true);
      isMutedRef.current = true;
      setIsListening(false);
      setStatusText('Microphone permission denied');
      return false;
    }
  }, [addDebugLog]);

  // Setup WebSocket connection to Gemini Live API - runs ONCE on mount without requesting mic
  const connectLiveSession = useCallback(() => {
    try {
      setStatusText('Voice Studio Ready');
      addDebugLog('Initializing Gemini Live WebSocket session...');

      // 1. Initialize Output Audio Context
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        try {
          const outputCtx = new AudioCtx({ sampleRate: 24000 });
          outputAudioCtxRef.current = outputCtx;
          nextStartTimeRef.current = outputCtx.currentTime;
          addDebugLog('Output AudioContext initialized at 24kHz');
        } catch (e) {
          addDebugLog(`WARN: Output AudioContext init error: ${e}`);
        }
      }

      // 2. WebSocket setup
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      addDebugLog(`Connecting WebSocket to ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        addDebugLog('WebSocket connection opened successfully');
        setIsConnected(true);
        setStatusText(
          isDemoModeRef.current
            ? 'Demo Audio Mode active • Voice & Audio live'
            : mediaStreamRef.current
            ? isMutedRef.current
              ? 'Microphone Muted'
              : 'Listening to you...'
            : 'Tap mic or enable Demo Audio Mode'
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // Status & Model handshake
          if (msg.type === 'status') {
            if (msg.status === 'connected') {
              liveSessionReadyRef.current = true;
              setLiveSessionReady(true);
              addDebugLog(`Gemini Live session active (Model: ${msg.model || 'gemini-3.8-live'})`);
            } else if (msg.status === 'ready_fallback') {
              liveSessionReadyRef.current = false;
              setLiveSessionReady(false);
              addDebugLog('Server in hybrid fallback mode, enabling Web Speech');
              setupSpeechRecognition();
            }
          }

          // Audio chunk from Gemini Live
          if (msg.type === 'audio' && msg.audio) {
            setIsSpeaking(true);
            setIsAiTyping(false);
            setStatusText('Tutor is speaking...');

            if (outputAudioCtxRef.current) {
              const ctx = outputAudioCtxRef.current;
              if (ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
              }
              const audioBuffer = pcmBase64ToAudioBuffer(ctx, msg.audio, 24000);
              if (audioBuffer) {
                const sourceNode = ctx.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(ctx.destination);

                const now = ctx.currentTime;
                const startAt = Math.max(now, nextStartTimeRef.current);
                sourceNode.start(startAt);
                nextStartTimeRef.current = startAt + audioBuffer.duration;

                sourceNode.onended = () => {
                  if (ctx.currentTime >= nextStartTimeRef.current - 0.05) {
                    setIsSpeaking(false);
                    setStatusText(
                      isDemoModeRef.current
                        ? 'Demo Audio Mode active • Voice & Audio live'
                        : mediaStreamRef.current
                        ? isMutedRef.current
                          ? 'Microphone Muted'
                          : 'Listening to you...'
                        : 'Tap mic to start speaking'
                    );
                  }
                };
              }
            }
          }

          // User interrupted the model
          if (msg.type === 'interrupted') {
            setIsSpeaking(false);
            if (outputAudioCtxRef.current) {
              nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
            }
            setStatusText(
              isDemoModeRef.current
                ? 'Demo Audio Mode active • Voice & Audio live'
                : mediaStreamRef.current
                ? isMutedRef.current
                  ? 'Microphone Muted'
                  : 'Listening to you...'
                : 'Tap mic to start speaking'
            );
          }

          // Realtime text transcript
          if (msg.type === 'text' && msg.text) {
            setMessages((prev) => [
              ...prev,
              {
                id: `live-${Date.now()}`,
                sender: 'assistant',
                text: msg.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            setIsAiTyping(false);
          }
        } catch (e) {
          addDebugLog(`WARN: WS message parse error: ${e}`);
        }
      };

      ws.onerror = (err) => {
        addDebugLog('WebSocket unavailable (serverless environment). Switching to Hybrid REST + Speech Mode.');
        setIsConnected(true);
        setStatusText('Hybrid Audio Mode active • Voice & Audio live');
        setupSpeechRecognition();
      };

      ws.onclose = () => {
        if (!liveSessionReadyRef.current) {
          addDebugLog('WebSocket closed; running in Hybrid REST + Speech Mode.');
          setIsConnected(true);
          setStatusText('Hybrid Audio Mode active • Voice & Audio live');
        } else {
          addDebugLog('WebSocket connection closed');
          setIsConnected(false);
          liveSessionReadyRef.current = false;
          setLiveSessionReady(false);
        }
      };
    } catch (err) {
      addDebugLog(`ERROR: Live session init exception: ${err}`);
      setStatusText('Ready (Text Mode)');
      setIsConnected(true);
    }
  }, [addDebugLog, setupSpeechRecognition]);

  // Disconnect & End call
  const disconnectSession = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch {
        // ignore
      }
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch {
        // ignore
      }
      outputAudioCtxRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    liveSessionReadyRef.current = false;
    setLiveSessionReady(false);
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setStatusText('Call ended');
  }, []);

  // Initialize call strictly ONCE on component mount
  useEffect(() => {
    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;
    connectLiveSession();

    return () => {
      disconnectSession();
      sessionStartedRef.current = false;
    };
  }, [connectLiveSession, disconnectSession]);

  // Toggle Demo Audio Mode (for iframe previews or headless environments where mic is blocked)
  const toggleDemoMode = useCallback(() => {
    ensureAudioUnlocked();
    setIsDemoMode((prev) => {
      const next = !prev;
      isDemoModeRef.current = next;
      if (next) {
        setIsMuted(false);
        isMutedRef.current = false;
        setStatusText('Demo Audio Mode active • Voice & Audio live');
        // Ensure WebSocket is connected
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          connectLiveSession();
        }
      } else {
        if (!mediaStreamRef.current) {
          setIsMuted(true);
          isMutedRef.current = true;
          setStatusText(
            micPermissionState === 'denied'
              ? 'Microphone permission denied'
              : 'Voice Studio Ready'
          );
        }
      }
      return next;
    });
  }, [connectLiveSession, ensureAudioUnlocked, micPermissionState]);

  // Toggle Mute / Request Mic:
  // - In Demo Mode: triggers simulated speech transmission with pre-recorded phrase.
  // - If mic is not granted yet: requests mic via getUserMedia() directly on user gesture.
  // - If mic was already granted: seamlessly toggles track.enabled without re-prompting or reconnecting socket.
  const toggleMute = async () => {
    ensureAudioUnlocked();

    // If Demo Mode is active, tapping mic triggers immediate test speech
    if (isDemoMode) {
      handleSendTestSpeech(DEMO_TEST_PHRASES[0].text);
      return;
    }

    // 1. If mic stream not acquired yet, prompt user directly from this click gesture
    if (!mediaStreamRef.current || micPermissionState !== 'granted') {
      setStatusText('Requesting microphone...');
      const ok = await setupMicrophone();
      if (!ok) {
        // Permission denied: state already set to 'denied'
        return;
      }
      return;
    }

    // 2. Stream already active: toggle mute on/off seamlessly
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;

    mediaStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !nextMuted;
    });

    if (nextMuted) {
      setIsListening(false);
      setAudioLevel(0);
      setStatusText('Microphone Muted');
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    } else {
      setIsListening(true);
      setStatusText('Listening to you...');
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch {
          // ignore
        }
      }
    }
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAttachedImage(base64);

      // If in WebSocket live mode, can also send image frame
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            image: base64.split(',')[1] || base64,
            mimeType: file.type || 'image/jpeg',
          })
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy text to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Waveform Bar count
  const waveformBars = 14;

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#090705] text-[#f3ece4] flex flex-col items-center justify-between font-sans selection:bg-[#f59e0b] selection:text-neutral-950">
      {/* Hidden File Input for Camera/Gallery */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* ========================================================
          VIEW 1: FULL VOICE STUDIO (18939.jpg)
          ======================================================== */}
      {viewMode === 'voice' && (
        <div className="w-full max-w-[420px] md:max-w-md mx-auto h-screen max-h-screen overflow-hidden px-4 pt-3 pb-6 flex flex-col justify-between">
          {/* TOP BAR */}
          <header className="flex items-center justify-between pt-1 shrink-0">
            {/* Left: Minimize / Return */}
            <button
              type="button"
              onClick={() => navigate('/')}
              title="Return to Dashboard"
              className="w-10 h-10 rounded-full bg-[#140e09] border border-[#2b1d12] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronDown className="w-5 h-5 text-zinc-300" />
            </button>

            {/* Center: VOICE STUDIO Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18110b] border border-[#f59e0b]/25 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black tracking-widest text-[#f59e0b] uppercase">
                Voice Studio
              </span>
              {isDemoMode && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#f59e0b] text-[#090705] tracking-normal">
                  DEMO
                </span>
              )}
            </div>

            {/* Right: Demo Mode Toggle & Switch to Chat View */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleDemoMode}
                title={isDemoMode ? 'Exit Demo Audio Mode' : 'Enable Demo Audio Mode (for iframe previews)'}
                className={`h-9 px-2.5 rounded-full text-[10px] md:text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 border ${
                  isDemoMode
                    ? 'bg-[#f59e0b] text-[#090705] border-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                    : 'bg-[#18110b] text-zinc-400 border-[#2b1d12] hover:text-[#f59e0b] hover:border-[#f59e0b]/40'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{isDemoMode ? 'Demo ON' : 'Demo Mode'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDebugDrawer(true)}
                title="View Debug Logs & Connection Diagnostics"
                className="h-9 px-2.5 rounded-full bg-[#18110b] border border-[#2b1d12] hover:border-[#f59e0b]/40 text-zinc-400 hover:text-[#f59e0b] text-[10px] md:text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              >
                <span>🐞 Debug</span>
                {debugLogs.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#f59e0b] text-[#090705] text-[9px] font-black flex items-center justify-center">
                    {debugLogs.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewMode('chat')}
                title="Open Chat Screen"
                className="w-9 h-9 rounded-full bg-[#18110b] border border-[#f59e0b]/40 text-[#f59e0b] hover:bg-[#f59e0b]/15 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95"
              >
                <MessageSquare className="w-4 h-4 fill-[#f59e0b]/20" />
              </button>
            </div>
          </header>

          {/* STAGE AREA (Center) */}
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto min-h-0 py-2 md:py-4">
            {/* Pulsing Avatar Mascot (Clickable to start/unmute or test speech) */}
            <div
              onClick={isDemoMode ? () => handleSendTestSpeech(DEMO_TEST_PHRASES[0].text) : isMuted ? toggleMute : undefined}
              title={isDemoMode ? 'Tap to send test speech to tutor' : isMuted ? 'Tap to start speaking' : 'Tutor active'}
              className="relative mb-3 md:mb-5 flex items-center justify-center cursor-pointer active:scale-95"
            >
              {/* Outer pulsing rings */}
              <div
                className={`absolute rounded-full transition-all duration-500 ${
                  isSpeaking
                    ? 'w-42 h-42 md:w-46 md:h-46 bg-amber-500/20 ring-4 ring-amber-500/40 animate-pulse'
                    : isListening
                    ? 'w-42 h-42 md:w-46 md:h-46 bg-emerald-500/20 ring-4 ring-emerald-500/40 animate-pulse'
                    : isDemoMode
                    ? 'w-40 h-40 md:w-44 md:h-44 bg-amber-500/15 ring-2 ring-amber-500/30'
                    : 'w-38 h-38 md:w-42 md:h-42 bg-amber-500/10 ring-2 ring-amber-500/20'
                }`}
              />
              <div
                className={`absolute rounded-full transition-all duration-300 ${
                  isSpeaking
                    ? 'w-36 h-36 md:w-40 md:h-40 bg-amber-500/30 ring-2 ring-amber-400'
                    : isListening
                    ? 'w-36 h-36 md:w-40 md:h-40 bg-emerald-500/30 ring-2 ring-emerald-400'
                    : isDemoMode
                    ? 'w-34 h-34 md:w-38 md:h-38 bg-[#18110b] ring-1 ring-amber-500/40'
                    : 'w-32 h-32 md:w-36 md:h-36 bg-[#18110b]'
                }`}
              />

              {/* Main Mascot Avatar */}
              <img
                src="https://i.postimg.cc/MTGJ6zYs/18275-modified.png"
                alt="AI Learning Tutor"
                className={`relative z-10 w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 shadow-2xl transition-all duration-300 ${
                  isSpeaking
                    ? 'border-[#f59e0b] shadow-[0_0_40px_rgba(245,158,11,0.5)] scale-105'
                    : isListening
                    ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-105'
                    : isDemoMode
                    ? 'border-[#f59e0b] shadow-[0_0_25px_rgba(245,158,11,0.3)] scale-100 hover:scale-102'
                    : 'border-[#382718] shadow-lg scale-100 hover:border-[#f59e0b]/50'
                }`}
              />
            </div>

            {/* Status Title */}
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white mb-1">
              {statusText}
            </h2>

            {/* Subtitle */}
            <p className="text-xs text-zinc-400 max-w-[280px] leading-relaxed mb-2.5">
              {isDemoMode
                ? 'Demo Audio Mode active. Tap any test speech phrase or type below to hear real-time Gemini voice!'
                : micPermissionState === 'denied'
                ? 'Microphone blocked by preview. Tap Demo Audio Mode below to talk with real-time Gemini voice!'
                : !mediaStreamRef.current
                ? 'Tap the mic or button below to start speaking in Somali, English, or German.'
                : 'Speak naturally in Somali, English, or German. Tap chat top-right to switch to text.'}
            </p>

            {/* Action Callout Button (Direct User Gesture & Demo Audio Mode Options) */}
            {micPermissionState === 'denied' && !isDemoMode ? (
              <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-[#1e130a] border border-[#f59e0b]/40 shadow-lg text-center max-w-[320px]">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                  <Headphones className="w-3.5 h-3.5 text-amber-400" />
                  <span>Microphone Blocked in Iframe</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-tight mb-2.5">
                  Preview iframes block microphone permissions. Use Demo Audio Mode to test live voice conversation without mic access.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={toggleDemoMode}
                    className="px-3.5 py-1.5 rounded-xl bg-[#f59e0b] text-[#090705] hover:bg-[#fbbf24] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Demo Audio Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-[11px] font-medium transition-all cursor-pointer"
                  >
                    Retry Mic
                  </button>
                </div>
              </div>
            ) : !mediaStreamRef.current && micPermissionState === 'prompt' && !isDemoMode ? (
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="px-4 py-2 rounded-xl bg-[#f59e0b] text-[#090705] hover:bg-[#fbbf24] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                >
                  <Mic className="w-4 h-4" />
                  Tap to Start Speaking
                </button>
                <button
                  type="button"
                  onClick={toggleDemoMode}
                  className="px-3 py-2 rounded-xl bg-[#1a120b] border border-[#3d2716] text-[#f59e0b] hover:bg-[#25190f] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  Demo Mode
                </button>
              </div>
            ) : null}

            {/* DEMO AUDIO MODE: Interactive Test Speech Prompts & Quick Prompt Bar */}
            {isDemoMode && (
              <div className="w-full max-w-[340px] mb-3 flex flex-col gap-2">
                {/* Pre-recorded Speech Chips */}
                <div className="p-2.5 rounded-2xl bg-[#150f09]/95 border border-[#382617] shadow-md">
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Send Test Speech to Tutor
                    </span>
                    <span className="text-[9px] text-zinc-500">Tap to speak</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center max-h-24 overflow-y-auto">
                    {DEMO_TEST_PHRASES.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSendTestSpeech(p.text)}
                        className="px-2 py-1 rounded-lg bg-[#22170e] hover:bg-[#2d1e12] border border-[#3f2715] text-[10px] text-zinc-200 hover:text-amber-300 transition-all cursor-pointer text-left flex items-center gap-1 active:scale-95"
                      >
                        <Play className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{p.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inline Quick Prompt Bar for Voice Studio */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (demoQuickPrompt.trim()) {
                      handleSendTestSpeech(demoQuickPrompt);
                    }
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={demoQuickPrompt}
                    onChange={(e) => setDemoQuickPrompt(e.target.value)}
                    placeholder="Or type custom test speech..."
                    className="flex-1 bg-[#160f09] border border-[#2b1d12] focus:border-[#f59e0b] text-xs text-white placeholder-zinc-500 rounded-xl px-3 py-1.5 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!demoQuickPrompt.trim()}
                    title="Send test speech to Gemini Live"
                    className="px-3 py-1.5 rounded-xl bg-[#f59e0b] text-[#090705] font-bold text-xs hover:bg-[#fbbf24] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            )}

            {/* Animated Bouncing Waveform Bars */}
            <div className="flex items-center justify-center gap-1.5 h-11 px-5 py-2 rounded-2xl bg-[#140e09]/80 border border-[#2b1d12] backdrop-blur-sm">
              {Array.from({ length: waveformBars }).map((_, i) => {
                const multiplier = Math.sin((i / waveformBars) * Math.PI);
                const heightVal = isMuted && !isDemoMode
                  ? 4
                  : isSpeaking
                  ? Math.max(12, 10 + 34 * multiplier * (0.6 + Math.random() * 0.4))
                  : isListening
                  ? Math.max(8, 8 + (audioLevel * 30 + 10) * multiplier)
                  : isDemoMode
                  ? Math.max(6, 6 + 6 * multiplier)
                  : 4;

                return (
                  <div
                    key={i}
                    style={{ height: `${heightVal}px` }}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isMuted && !isDemoMode
                        ? 'bg-zinc-800/80 opacity-40'
                        : isSpeaking
                        ? 'bg-gradient-to-t from-amber-600 to-amber-300'
                        : isListening
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-300'
                        : isDemoMode
                        ? 'bg-[#f59e0b]/40'
                        : 'bg-zinc-700'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* ATTACHED IMAGE PREVIEW (IF ANY) */}
          {attachedImage && (
            <div className="relative mb-2 mx-auto flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[#18110b] border border-[#f59e0b]/40 shadow-lg shrink-0">
              <img
                src={attachedImage}
                alt="Uploaded"
                className="w-9 h-9 rounded-lg object-cover"
              />
              <span className="text-xs text-amber-300 font-medium">Image attached</span>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="ml-auto w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* BOTTOM CONTROLS DOCK */}
          <div className="flex flex-col gap-3 pb-1 shrink-0">
            {/* Action Buttons Row */}
            <div className="flex items-center justify-center gap-5">
              {/* Mic Mute / Unmute */}
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                className={`w-13 h-13 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isMuted
                    ? 'bg-[#1e130c] border border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-[#f59e0b] text-[#090705] hover:bg-[#fbbf24] shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
              </button>

              {/* Camera / Image Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach photo or exercise"
                className="w-13 h-13 md:w-14 md:h-14 rounded-full bg-[#18110b] border border-[#382718] text-zinc-300 hover:text-white hover:border-[#f59e0b] flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Camera className="w-5 h-5 md:w-6 md:h-6 text-[#f59e0b]" />
              </button>

              {/* End Call / Disconnect */}
              <button
                type="button"
                onClick={isConnected ? disconnectSession : connectLiveSession}
                title={isConnected ? 'End voice call' : 'Start voice call'}
                className={`w-13 h-13 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isConnected
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                }`}
              >
                {isConnected ? <PhoneOff className="w-5 h-5 md:w-6 md:h-6" /> : <Radio className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
            </div>

            {/* Language Selector Chips */}
            <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-[#140e09] border border-[#2b1d12] w-fit mx-auto">
              {(
                [
                  { code: 'so', label: '🇸🇴 Soomaali' },
                  { code: 'en', label: '🇬🇧 English' },
                  { code: 'de', label: '🇩🇪 Deutsch' },
                  { code: 'all', label: '🌐 All 3' },
                ] as const
              ).map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] md:text-[11px] font-bold transition-all cursor-pointer ${
                    selectedLang === lang.code
                      ? 'bg-[#f59e0b] text-[#090705] shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 2: WHATSAPP-STYLE CHAT SCREEN (18941.jpg)
          ======================================================== */}
      {viewMode === 'chat' && (
        <div className="w-full max-w-[480px] md:max-w-xl mx-auto h-screen flex flex-col bg-[#090705] border-x border-[#1c140e]">
          {/* 1. ONGOING VOICE BANNER (Pinned to top when call is active) */}
          {isConnected && (
            <div className="bg-[#18110b]/95 border-b border-[#f59e0b]/30 px-3.5 py-2 flex items-center justify-between backdrop-blur-md z-30">
              {/* Left Indicator */}
              <div
                className="flex items-center gap-2 cursor-pointer flex-1"
                onClick={() => setViewMode('voice')}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isSpeaking ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isSpeaking ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  ></span>
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[#f59e0b] tracking-wide">
                      Voice Studio Active
                    </span>
                    {isDemoMode && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
                        Demo Mode
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 truncate max-w-[200px]">{statusText}</span>
                </div>
              </div>

              {/* Right Mini Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleDemoMode}
                  title={isDemoMode ? 'Exit Demo Mode' : 'Enable Demo Audio Mode'}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isDemoMode
                      ? 'bg-[#f59e0b]/20 border-[#f59e0b]/50 text-[#f59e0b]'
                      : 'bg-[#18110b] border-[#2b1d12] text-zinc-400'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  title={isDemoMode ? 'Send Demo Speech' : isMuted ? 'Unmute' : 'Mute'}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                    isMuted && !isDemoMode
                      ? 'bg-red-950/40 border-red-500/40 text-red-400'
                      : 'bg-[#23170e] border-[#3d2715] text-[#f59e0b]'
                  }`}
                >
                  {isMuted && !isDemoMode ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('voice')}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] text-[11px] font-bold hover:bg-[#f59e0b]/25 cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Voice</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. CHAT HEADER */}
          <header className="px-3 py-2.5 bg-[#120d09] border-b border-[#24170e] flex items-center justify-between">
            {/* Left: Back & Avatar Info */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/40 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div
                className="relative cursor-pointer"
                onClick={() => setViewMode('voice')}
                title="Tap to switch to Voice Studio"
              >
                <img
                  src="https://i.postimg.cc/MTGJ6zYs/18275-modified.png"
                  alt="AI Tutor"
                  className="w-9 h-9 rounded-full object-cover border border-[#f59e0b]/50"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#120d09]" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold text-white tracking-tight">AI Tutor</h1>
                  <span className="text-[10px] bg-[#f59e0b]/15 text-[#f59e0b] px-1.5 py-0.2 rounded font-mono font-bold">
                    LIVE
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 leading-tight">
                  {isConnected ? 'Online • Multimodal' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Right: Switch to Voice Studio & Clear Chat */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode('voice')}
                title="Open Voice Studio"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#f59e0b] text-[#090705] font-bold text-xs hover:bg-[#fbbf24] transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Voice</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: `cleared-${Date.now()}`,
                      sender: 'system',
                      text: 'Chat history cleared.',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                title="Clear conversation"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* 3. MESSAGE STREAM (WhatsApp / Telegram style) */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-radial from-[#130d08] to-[#090705]"
          >
            {/* Date divider pill */}
            <div className="flex justify-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 bg-[#140e09] border border-[#26190f] px-2.5 py-1 rounded-full">
                Today
              </span>
            </div>

            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSys = msg.sender === 'system';

              if (isSys) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="text-xs text-zinc-500 italic">{msg.text}</span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm ${
                      isUser
                        ? 'bg-[#24170d] border border-[#f59e0b]/35 text-[#fdf8f4] rounded-tr-xs'
                        : 'bg-[#150e09] border border-[#2b1d12] text-[#f0e7df] rounded-tl-xs'
                    }`}
                  >
                    {/* Attached Image if user sent photo */}
                    {msg.imageUrl && (
                      <div className="mb-2 overflow-hidden rounded-xl border border-white/10">
                        <img
                          src={msg.imageUrl}
                          alt="Attached"
                          className="max-h-60 w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Message Body with clean typography */}
                    <div className="whitespace-pre-wrap leading-relaxed select-text font-normal">
                      {msg.text}
                    </div>

                    {/* Footer Row: Timestamp + Actions */}
                    <div className="mt-1 flex items-center justify-end gap-2 text-[10px] text-zinc-400">
                      <span>{msg.timestamp}</span>

                      {/* Listen audio button for assistant */}
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => speakTextFallback(msg.text)}
                          title="Listen to pronunciation"
                          className="text-zinc-400 hover:text-[#f59e0b] cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Copy message */}
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy text"
                        className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      {/* Double Checkmark for user */}
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#f59e0b]" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <div className="flex items-center gap-2 text-zinc-400 bg-[#150e09] border border-[#2b1d12] w-fit px-3 py-2 rounded-2xl rounded-tl-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#f59e0b] animate-spin" />
                <span className="text-xs">Tutor is thinking...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
            )}
          </div>

          {/* 4. CHAT BOTTOM INPUT BAR */}
          <div className="p-3 bg-[#120d09] border-t border-[#24170e]">
            {/* Quick Test Speech Prompts (Drive voice in Demo Mode) */}
            {isDemoMode && (
              <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-bold text-amber-400 shrink-0 flex items-center gap-1">
                  <Headphones className="w-3 h-3" /> Test Speech:
                </span>
                {DEMO_TEST_PHRASES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSendTestSpeech(p.text)}
                    className="px-2.5 py-1 rounded-full bg-[#1e130b] hover:bg-[#2c1c10] border border-[#3f2715] text-[10px] text-zinc-300 hover:text-amber-300 whitespace-nowrap shrink-0 transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Play className="w-2 h-2 text-amber-400" />
                    <span>{p.title}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Attached Image Thumbnail Preview */}
            {attachedImage && (
              <div className="mb-2 flex items-center gap-2 p-1.5 px-3 rounded-xl bg-[#1b120b] border border-[#f59e0b]/40 w-fit">
                <img
                  src={attachedImage}
                  alt="Thumbnail"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <span className="text-xs text-[#f59e0b] font-medium">Photo attached</span>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendChatMessage(inputText, attachedImage);
              }}
              className="flex items-center gap-2"
            >
              {/* Image / Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach photo or exercise"
                className="p-2.5 rounded-xl bg-[#19110b] border border-[#2e1d11] text-zinc-400 hover:text-[#f59e0b] hover:border-[#f59e0b]/40 transition-all cursor-pointer"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isDemoMode
                    ? 'Type prompt to hear Gemini voice live...'
                    : selectedLang === 'so'
                    ? 'Ku qor fariin Af-Soomaali...'
                    : selectedLang === 'de'
                    ? 'Schreibe eine Nachricht auf Deutsch...'
                    : 'Type a message in Somali, English, or German...'
                }
                className="flex-1 bg-[#18100a] border border-[#2b1d12] focus:border-[#f59e0b] text-sm text-white placeholder-zinc-500 rounded-xl px-3.5 py-2.5 outline-none transition-all"
              />

              {/* Mic / Talk Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                title={isDemoMode ? 'Send Demo Speech' : isMuted ? 'Unmute microphone' : 'Mute microphone'}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isMuted && !isDemoMode
                    ? 'bg-red-950/40 border-red-500/40 text-red-400'
                    : 'bg-[#19110b] border-[#2e1d11] text-[#f59e0b]'
                }`}
              >
                {isMuted && !isDemoMode ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() && !attachedImage}
                aria-label="Send message"
                className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-md active:scale-95 ${
                  inputText.trim() || attachedImage
                    ? 'bg-[#f59e0b] text-[#090705] hover:bg-[#fbbf24] shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-[#22160e] text-zinc-600 border border-[#2f1e13] cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
      {/* DEBUG LOGS DRAWER / MODAL */}
      {showDebugDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#140e09] border border-[#f59e0b]/40 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2b1d12] bg-[#1a120a]">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold text-sm">🛠️ Voice Studio Diagnostics</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {debugLogs.length} logs
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDebugDrawer(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Logs Body */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-zinc-300 space-y-1 bg-[#090705]">
              {debugLogs.length === 0 ? (
                <div className="text-zinc-500 text-center py-8 italic">No debug events recorded yet. Try starting a call or enabling Demo Mode.</div>
              ) : (
                debugLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-zinc-900 pb-1 break-all">
                    {log}
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#2b1d12] bg-[#140e09]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = debugLogs.join('\n');
                    navigator.clipboard.writeText(text);
                    alert('Debug logs copied to clipboard!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#f59e0b] text-[#090705] font-bold text-xs hover:bg-[#fbbf24] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All Logs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDebugLogs([])}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  disconnectSession();
                  connectLiveSession();
                  addDebugLog('[MANUAL_ACTION] Re-initiated WebSocket connection');
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                Reconnect WS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
