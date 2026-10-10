import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  Keyboard,
  ChevronDown,
  BookOpen,
  Languages,
  Code,
  Calculator,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { aiService, AIMessage, AIStatusResponse } from '../../services/aiService';
import { getTTSUrl, fetchTTSAudioBlobUrl, cleanSpeechText } from '../../services/tts';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTypingText?: (text: string) => void;
  initialPrompt?: string;
}

const QUICK_PROMPTS = [
  {
    icon: '🇬🇧',
    label: 'Generate Typing Text',
    prompt: 'Generate a short 30-word descriptive English story about a person in a library for typing practice.',
  },
  {
    icon: '🇩🇪',
    label: 'German B1 Grammar',
    prompt: 'Explain the difference between German "weil" and "denn" with clear example sentences and translations.',
  },
  {
    icon: '🇸🇴',
    label: 'Somali Translation',
    prompt: 'Translate this to Somali and explain the grammar: "She is learning mathematics and German every day."',
  },
  {
    icon: '🧮',
    label: 'Math Step-by-Step',
    prompt: 'Explain step-by-step how to solve: 3(2x - 4) = 18 with worked solutions.',
  },
  {
    icon: '🐍',
    label: 'Python Code Example',
    prompt: 'Write a clean Python function that counts the frequency of words in a sentence and explain each line.',
  },
];

export function AIChatDrawer({ isOpen, onClose, onSelectTypingText, initialPrompt }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content:
        '👋 Hello! I am your **MY LEARNING AI Tutor** powered by ultra-fast **Groq (14.4k requests/day Free Tier)**.\n\nAsk me anything about English, German B1, Swedish, Somali, Mathematics, or Python — or ask me to generate custom typing exercises!',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [status, setStatus] = useState<AIStatusResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    aiService.getStatus().then((st) => setStatus(st));
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialPrompt && initialPrompt.trim()) {
        setInputMessage(initialPrompt.trim());
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const newMessages: AIMessage[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage({
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        model: selectedModel,
      });

      if (response.ok && response.message) {
        setMessages([...newMessages, { role: 'assistant', content: response.message }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: `⚠️ ${response.error || 'Unable to generate response. Please verify your GROQ_API_KEY.'}`,
          },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: '⚠️ Failed to connect to AI server. Please verify your connection.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePlayAudio = async (text: string, idx: number) => {
    if (playingAudioIndex === idx && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingAudioIndex(null);
      return;
    }

    try {
      const clean = cleanSpeechText(text.slice(0, 300));
      const url = getTTSUrl({ text: clean, voice: 'en-GB-RyanNeural' });
      const audioUrl = await fetchTTSAudioBlobUrl(url).catch(() => url);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlayingAudioIndex(idx);

      audio.onended = () => {
        setPlayingAudioIndex(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        // Fallback to browser TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(clean);
          utterance.lang = 'en-GB';
          utterance.onend = () => setPlayingAudioIndex(null);
          utterance.onerror = () => setPlayingAudioIndex(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setPlayingAudioIndex(null);
        }
      };

      await audio.play();
    } catch {
      setPlayingAudioIndex(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0e0c0a] border-l border-neutral-800 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800/80 bg-[#14110e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">AI Learning Messages</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                  Groq 14.4k/day
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">Fast AI tutor for languages, math, code & typing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model Selector Strip */}
        <div className="px-4 py-2.5 bg-[#110f0d] border-b border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-neutral-400">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/60 cursor-pointer"
            >
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile)</option>
              <option value="llama-3.1-8b-instant">Llama 3.1 8B (Ultra Instant)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B (32k)</option>
              <option value="gemma2-9b-it">Gemma 2 9B</option>
            </select>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
                    isUser
                      ? 'bg-amber-500 text-neutral-950 font-medium rounded-tr-xs'
                      : 'bg-[#161310] border border-neutral-800 text-neutral-200 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed select-text">{m.content}</div>

                  {/* Assistant Message Actions */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center gap-2 text-[11px] text-neutral-400">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(m.content, idx)}
                        className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Copy message"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>

                      {/* Listen via Ryan (Neural) */}
                      <button
                        onClick={() => handlePlayAudio(m.content, idx)}
                        className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Listen with Ryan Neural UK"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{playingAudioIndex === idx ? 'Speaking...' : 'Listen'}</span>
                      </button>

                      {/* Send to Typing Engine if applicable */}
                      {onSelectTypingText && (
                        <button
                          onClick={() => {
                            // Extract clean text
                            const cleanText = m.content
                              .replace(/[#*`_]/g, '')
                              .replace(/^🤖.*?\n\n/s, '')
                              .trim();
                            onSelectTypingText(cleanText);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors ml-auto font-semibold cursor-pointer"
                          title="Practice this text in Typing Engine"
                        >
                          <Keyboard className="w-3.5 h-3.5" />
                          <span>Practice Typing</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in duration-150">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#161310] border border-neutral-800 text-neutral-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Generating with Groq {selectedModel}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="px-4 py-2 border-t border-neutral-800/80 bg-[#120f0d] flex items-center gap-2 overflow-x-auto scrollbar-none">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 hover:text-amber-300 whitespace-nowrap transition-all cursor-pointer"
            >
              <span>{qp.icon}</span>
              <span>{qp.label}</span>
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-neutral-800 bg-[#14110e]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={inputValMessage(inputMessage)}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about German, Somali, Math, Code, or generate typing text..."
                rows={2}
                className="w-full p-3 rounded-xl bg-[#090807] border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/60 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="h-11 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold text-xs transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-md shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 text-[10px] text-neutral-500 flex items-center justify-between">
            <span>Press Enter to send • Shift + Enter for new line</span>
            <span className="font-mono text-amber-500/70">14.4k Free RPD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function inputValMessage(val: string): string {
  return val;
}
