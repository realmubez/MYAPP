import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Languages,
  BookOpen,
  Keyboard,
  Sparkles,
  Trash2,
  Plus,
  ArrowRight,
  AlertCircle,
  Loader2,
  Share2,
  HardDrive,
} from 'lucide-react';
import {
  StudyDocument,
  FileReaderService,
  PRELOADED_STUDY_FILES,
} from '../../services/fileReaderService';
import {
  getTTSUrl,
  fetchTTSAudioBlobUrl,
  cleanSpeechText,
  TTSRate,
  AVAILABLE_RATES,
} from '../../services/tts';
import { VocabularyEntry, findVocabularyByWord } from '../../data/publicVocabulary';
import { PublicVocabularyModal } from '../vocabulary/PublicVocabularyModal';
import { GoogleDrivePickerModal } from '../drive/GoogleDrivePickerModal';

interface PublicDocumentReaderProps {
  onPracticeFileText: (text: string, title: string) => void;
  onOpenAIChatWithPrompt?: (prompt: string) => void;
}

export function PublicDocumentReader({
  onPracticeFileText,
  onOpenAIChatWithPrompt,
}: PublicDocumentReaderProps) {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isGDriveOpen, setIsGDriveOpen] = useState<boolean>(false);

  // Reader Settings
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('large');
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<'en' | 'de' | 'so'>('en');
  const [speechRate, setSpeechRate] = useState<TTSRate>('0%');

  // Audio Playback State
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);

  // Vocabulary Modal
  const [selectedVocabEntry, setSelectedVocabEntry] = useState<VocabularyEntry | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sentenceElementsRef = useRef<(HTMLElement | null)[]>([]);

  // Load documents on mount
  useEffect(() => {
    const loaded = FileReaderService.getStoredFiles();
    setDocuments(loaded);
    if (loaded.length > 0) {
      setSelectedDocId(loaded[0].id);
    }
  }, []);

  const currentDoc =
    documents.find((d) => d.id === selectedDocId) ||
    documents[0] ||
    PRELOADED_STUDY_FILES[0];

  // Split document into sentences/paragraphs for reading & interactive audio
  const paragraphs = React.useMemo(() => {
    if (!currentDoc?.content) return [];
    return currentDoc.content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [currentDoc?.content]);

  const allSentences = React.useMemo(() => {
    const list: { text: string; paragraphIndex: number }[] = [];
    paragraphs.forEach((p, pIdx) => {
      const sMatches = p.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [p];
      sMatches.forEach((s) => {
        const clean = s.trim();
        if (clean) {
          list.push({ text: clean, paragraphIndex: pIdx });
        }
      });
    });
    return list;
  }, [paragraphs]);

  // Audio Voice selection helper
  const getVoiceForLanguage = (lang: 'en' | 'de' | 'so') => {
    switch (lang) {
      case 'de':
        return 'de-DE-KillianNeural';
      case 'so':
        return 'so-SO-MuuseNeural';
      case 'en':
      default:
        return 'en-GB-RyanNeural';
    }
  };

  const stopAudio = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
        activeAudioRef.current.removeAttribute('src');
      } catch {
        // ignore
      }
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAudioLoading(false);
    setIsPlayingAll(false);
    setActiveSentenceIndex(null);
  }, []);

  const playSentenceAudio = useCallback(
    async (sentenceText: string, index: number, onEndedCallback?: () => void) => {
      const clean = cleanSpeechText(sentenceText);
      if (!clean) return;

      stopAudio();
      setIsAudioLoading(true);
      setActiveSentenceIndex(index);

      // Scroll into view
      const elem = sentenceElementsRef.current[index];
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      const voice = getVoiceForLanguage(selectedVoiceLang);
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const targetUrl = getTTSUrl({
        text: clean,
        voice,
        rate: speechRate,
      });

      try {
        let resolvedSrc = targetUrl;
        try {
          resolvedSrc = await fetchTTSAudioBlobUrl(targetUrl, abortController.signal);
        } catch {
          // fallback to direct URL
        }

        const audio = new Audio(resolvedSrc);
        activeAudioRef.current = audio;

        audio.oncanplay = () => {
          setIsAudioLoading(false);
        };

        audio.onended = () => {
          setIsAudioLoading(false);
          activeAudioRef.current = null;
          if (onEndedCallback) {
            onEndedCallback();
          } else {
            setActiveSentenceIndex(null);
          }
        };

        audio.onerror = () => {
          setIsAudioLoading(false);
          activeAudioRef.current = null;
          // Fallback to Web Speech Synthesis
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(clean);
            utterance.lang = selectedVoiceLang === 'de' ? 'de-DE' : 'en-GB';
            utterance.onend = () => {
              if (onEndedCallback) onEndedCallback();
              else setActiveSentenceIndex(null);
            };
            window.speechSynthesis.speak(utterance);
          } else {
            if (onEndedCallback) onEndedCallback();
            else setActiveSentenceIndex(null);
          }
        };

        await audio.play();
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('TTS playback error, falling back:', err);
          setIsAudioLoading(false);
          setActiveSentenceIndex(null);
        }
      }
    },
    [selectedVoiceLang, speechRate, stopAudio]
  );

  // Play whole document sequentially
  const playFromIndex = useCallback(
    (index: number) => {
      if (index >= allSentences.length) {
        setIsPlayingAll(false);
        setActiveSentenceIndex(null);
        return;
      }
      setIsPlayingAll(true);
      playSentenceAudio(allSentences[index].text, index, () => {
        playFromIndex(index + 1);
      });
    },
    [allSentences, playSentenceAudio]
  );

  const togglePlayAll = () => {
    if (isPlayingAll) {
      stopAudio();
    } else {
      playFromIndex(activeSentenceIndex !== null ? activeSentenceIndex : 0);
    }
  };

  // Upload handler
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const parsedDoc = await FileReaderService.parseFile(file);
      setDocuments((prev) => [parsedDoc, ...prev.filter((d) => d.id !== parsedDoc.id)]);
      setSelectedDocId(parsedDoc.id);
      stopAudio();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to read file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCustomDoc = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    FileReaderService.deleteFile(docId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (selectedDocId === docId) {
      const remaining = documents.filter((d) => d.id !== docId);
      if (remaining.length > 0) setSelectedDocId(remaining[0].id);
    }
  };

  /**
   * Render text with clickable vocabulary words.
   * Preserves natural typographic flow and never breaks punctuation onto a new line!
   */
  const renderInteractiveText = (sentenceText: string, sentenceIndex: number) => {
    const tokens = sentenceText.split(/(\s+)/);

    return tokens.map((token, tIdx) => {
      // Whitespace
      if (/^\s+$/.test(token)) {
        return token;
      }

      // Separate punctuation from word to avoid punctuation separation bugs
      const match = token.match(/^([^\w]*)([\w'-]+)([^\w]*)$/);
      if (!match) {
        return <span key={`t-${sentenceIndex}-${tIdx}`}>{token}</span>;
      }

      const [, leadingPunct, coreWord, trailingPunct] = match;
      const vocab = findVocabularyByWord(coreWord.toLowerCase());

      if (vocab) {
        return (
          <span key={`t-${sentenceIndex}-${tIdx}`} className="inline">
            {leadingPunct}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVocabEntry(vocab);
              }}
              className="inline-flex items-center gap-0.5 font-bold text-amber-300 bg-amber-400/20 hover:bg-amber-400/35 border-b-2 border-amber-400/60 rounded px-1 py-0.5 mx-0.5 cursor-pointer transition-all active:scale-95 shadow-xs"
              title={`"${vocab.word}" • German: ${vocab.germanWord} • Somali: ${vocab.somaliWord} (Tap for 3-Language Audio Card)`}
            >
              <span>{coreWord}</span>
              <Volume2 className="w-2.5 h-2.5 opacity-80 shrink-0" />
            </button>
            {trailingPunct}
          </span>
        );
      }

      return <span key={`t-${sentenceIndex}-${tIdx}`}>{token}</span>;
    });
  };

  return (
    <div className="w-full rounded-2xl bg-[#14110e] border border-neutral-800 p-3.5 sm:p-5 space-y-4 sm:space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Document Reader</span>
              <span className="text-[10px] font-mono text-emerald-400 font-normal">
                (Lesen & Audio)
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Tap any sentence to listen · Tap underlined words for definitions
            </p>
          </div>
        </div>

        {/* Action Buttons: Practice, Upload, AI */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            onClick={() => onPracticeFileText(currentDoc.content, currentDoc.title)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Practice Typing</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Upload any PDF or text file"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.md,.doc,.docx,.json"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {/* Google Drive Button */}
          <button
            onClick={() => setIsGDriveOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/40 text-xs text-emerald-300 hover:text-emerald-200 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Import documents from Google Drive (Supabase Auth)"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Drive</span>
          </button>

          {onOpenAIChatWithPrompt && (
            <button
              onClick={() =>
                onOpenAIChatWithPrompt(
                  `Please summarize this document and explain the key German and Somali vocabulary terms:\n\n"${currentDoc.content}"`
                )
              }
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-amber-300 hover:text-amber-200 transition-all cursor-pointer active:scale-95"
              title="Generate summary and vocabulary quiz"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>AI</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload State / Alerts */}
      {isUploading && (
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>Extracting text from file...</span>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Horizontal Document Selection Strip */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Study Files & Documents:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {documents.map((doc) => {
            const isSelected = doc.id === currentDoc.id;
            const isSample = doc.fileType === 'sample';
            return (
              <div
                key={doc.id}
                onClick={() => {
                  stopAudio();
                  setSelectedDocId(doc.id);
                }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                    : 'bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-neutral-950' : 'text-neutral-400'}`} />
                <span className="truncate max-w-[130px] sm:max-w-[180px]">{doc.title}</span>
                {!isSample && (
                  <button
                    onClick={(e) => handleDeleteCustomDoc(doc.id, e)}
                    className="p-0.5 rounded text-neutral-400 hover:text-rose-400 ml-1"
                    title="Delete file"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-dashed border-neutral-700 hover:border-amber-500 text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-950 cursor-pointer"
          >
            <Plus className="w-3 h-3 text-amber-400" />
            <span>+ Add File</span>
          </button>

          <button
            onClick={() => setIsGDriveOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 hover:border-emerald-400 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/20 cursor-pointer transition-all"
            title="Browse Google Drive files"
          >
            <HardDrive className="w-3 h-3 text-emerald-400" />
            <span>Drive</span>
          </button>
        </div>
      </div>

      {/* Document Reader Card & Audio Bar */}
      <div className="rounded-xl bg-neutral-950/90 border border-neutral-800/80 p-3 sm:p-4 space-y-3">
        {/* Voice and Layout Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-neutral-800/60 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-neutral-400 uppercase mr-1">Voice:</span>
            <div className="inline-flex rounded-lg bg-neutral-900 border border-neutral-800 p-0.5 text-xs">
              <button
                onClick={() => {
                  stopAudio();
                  setSelectedVoiceLang('en');
                }}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  selectedVoiceLang === 'en'
                    ? 'bg-amber-500 text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🇬🇧 Ryan (UK)
              </button>
              <button
                onClick={() => {
                  stopAudio();
                  setSelectedVoiceLang('de');
                }}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  selectedVoiceLang === 'de'
                    ? 'bg-amber-500 text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🇩🇪 German
              </button>
              <button
                onClick={() => {
                  stopAudio();
                  setSelectedVoiceLang('so');
                }}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  selectedVoiceLang === 'so'
                    ? 'bg-amber-500 text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🇸🇴 Somali
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <select
              value={speechRate}
              onChange={(e) => {
                setSpeechRate(e.target.value as TTSRate);
                if (activeSentenceIndex !== null) stopAudio();
              }}
              className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500"
            >
              {AVAILABLE_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  Speed: {rate}
                </option>
              ))}
            </select>

            <div className="flex items-center bg-neutral-900 rounded-lg border border-neutral-800 p-0.5 text-xs">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                  fontSize === 'normal' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                  fontSize === 'large' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400'
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xl')}
                className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                  fontSize === 'xl' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400'
                }`}
              >
                A++
              </button>
            </div>
          </div>
        </div>

        {/* Playback Control Strip */}
        <div className="flex items-center justify-between gap-2 bg-neutral-900/90 rounded-xl p-2.5 border border-neutral-800">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={togglePlayAll}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer shrink-0 ${
                isPlayingAll
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-black'
              }`}
            >
              {isAudioLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isPlayingAll ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isPlayingAll ? 'Pause' : 'Read Aloud'}</span>
            </button>

            {activeSentenceIndex !== null && (
              <button
                onClick={stopAudio}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs shrink-0"
                title="Stop audio"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}

            <span className="text-[11px] text-neutral-400 truncate">
              {activeSentenceIndex !== null ? (
                <span className="text-amber-300 font-mono">
                  Sentence {activeSentenceIndex + 1}/{allSentences.length}
                </span>
              ) : (
                <span className="hidden sm:inline">Tap any sentence to play</span>
              )}
            </span>
          </div>

          <span className="text-[10px] font-mono text-amber-400/90 shrink-0">
            EN • DE • SO
          </span>
        </div>

        {/* Fluid Typography Reading Canvas */}
        <div
          className={`rounded-xl bg-[#0e0c0a] p-4 sm:p-6 border border-neutral-900 leading-relaxed font-sans transition-all select-text ${
            fontSize === 'normal'
              ? 'text-sm leading-6 sm:leading-7'
              : fontSize === 'large'
              ? 'text-base sm:text-lg leading-7 sm:leading-8'
              : 'text-lg sm:text-xl leading-8 sm:leading-9'
          }`}
        >
          {paragraphs.map((para, pIdx) => {
            const sentencesInPara =
              para.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) || [
                para,
              ];

            return (
              <p key={`para-${pIdx}`} className="mb-4 sm:mb-5 text-neutral-200 text-left last:mb-0">
                {sentencesInPara.map((sentence, sIdx) => {
                  const globalSentenceIndex = allSentences.findIndex((s) => s.text === sentence);
                  const isCurrentActive = activeSentenceIndex === globalSentenceIndex;

                  return (
                    <span
                      key={`s-${pIdx}-${sIdx}`}
                      ref={(el) => {
                        if (globalSentenceIndex >= 0) {
                          sentenceElementsRef.current[globalSentenceIndex] = el;
                        }
                      }}
                      onClick={() => {
                        if (globalSentenceIndex >= 0) {
                          playSentenceAudio(sentence, globalSentenceIndex);
                        }
                      }}
                      className={`inline rounded-xs transition-colors cursor-pointer ${
                        isCurrentActive
                          ? 'bg-amber-500/20 text-white font-medium underline decoration-amber-400 decoration-2'
                          : 'hover:text-amber-200'
                      }`}
                      title="Tap sentence to listen"
                    >
                      {renderInteractiveText(sentence, globalSentenceIndex)}
                      {' '}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
      </div>

      {/* Vocabulary Modal Popup */}
      <PublicVocabularyModal
        entry={selectedVocabEntry}
        onClose={() => setSelectedVocabEntry(null)}
        onPracticeText={(text) => onPracticeFileText(text, 'Vocabulary Practice')}
      />

      {/* Google Drive Picker Modal (Supabase Auth) */}
      <GoogleDrivePickerModal
        isOpen={isGDriveOpen}
        onClose={() => setIsGDriveOpen(false)}
        onDocumentImported={(doc) => {
          setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
          setSelectedDocId(doc.id);
          stopAudio();
        }}
      />
    </div>
  );
}
