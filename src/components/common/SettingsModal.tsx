import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Volume2, VolumeX, Type, Eye, Languages, Send, Bot, CheckCircle, AlertCircle, Loader2, ExternalLink, LogOut } from 'lucide-react';
import { AppSettings } from '../../types';
import { storageService } from '../../services/storage';
import { typingSoundService } from '../../services/typingSoundService';
import { translationService, TranslationLang } from '../../services/translationPreference';
import { useAuth } from '../../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TelegramStatus {
  configured: boolean;
  hasBotToken: boolean;
  hasAllowedUserId: boolean;
  allowedUserMask: string | null;
  botUsername?: string | null;
  botFirstName?: string | null;
  chatLink?: string | null;
  chatEstablished?: boolean;
  webhook?: {
    url?: string;
    pendingUpdateCount?: number;
    lastErrorMessage?: string | null;
  };
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [translationLang, setTranslationLang] = useState<'so' | 'sv' | 'off'>(() => {
    const lang = translationService.getLanguage('en');
    if (lang === 'sv' || lang === 'off') return lang;
    return 'so';
  });

  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSetupHelp, setShowSetupHelp] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      onClose();
      await logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSettings(storageService.getSettings());
      const lang = translationService.getLanguage('en');
      setTranslationLang(lang === 'sv' || lang === 'off' ? lang : 'so');
      fetchTelegramStatus();
    }
  }, [isOpen]);

  const fetchTelegramStatus = async () => {
    try {
      setTelegramLoading(true);
      const res = await fetch('/api/telegram/status');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = (await res.json().catch(() => null)) as TelegramStatus | null;
        if (data) {
          setTelegramStatus(data);
        }
      }
    } catch {
      // Offline or error
    } finally {
      setTelegramLoading(false);
    }
  };

  const triggerTelegramAction = async (action: 'test' | 'sample-vocab' | 'sample-somali') => {
    setActionLoading(action);
    setActionFeedback(null);
    try {
      const endpoint =
        action === 'test'
          ? '/api/telegram/test'
          : action === 'sample-vocab'
          ? '/api/telegram/send-sample-vocab'
          : '/api/telegram/send-sample-somali';

      const res = await fetch(endpoint, { method: 'POST' });
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? ((await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; error?: string; description?: string })
        : {};

      if (res.ok && data.ok) {
        setActionFeedback({
          type: 'success',
          text: data.message || 'Sent successfully to your Telegram account!',
        });
      } else {
        setActionFeedback({
          type: 'error',
          text: data.error || data.description || 'Failed to send message. Check server logs/env.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionFeedback({
        type: 'error',
        text: `Network error: ${msg}`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const setupTelegramWebhook = async () => {
    setActionLoading('webhook');
    setActionFeedback(null);
    try {
      const res = await fetch('/api/telegram/setup-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: window.location.origin }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; description?: string; webhookUrl?: string };
      if (res.ok && data.ok) {
        setActionFeedback({
          type: 'success',
          text: `Webhook registered! URL: ${data.webhookUrl || 'active'}`,
        });
        await fetchTelegramStatus();
      } else {
        setActionFeedback({
          type: 'error',
          text: data.error || data.description || 'Failed to register webhook.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionFeedback({
        type: 'error',
        text: `Network error registering webhook: ${msg}`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    updateSetting('soundEnabled', next);
    typingSoundService.setEnabled(next);
    if (next) {
      typingSoundService.playCorrectKey();
    }
  };

  const handleVolumeChange = (val: number) => {
    updateSetting('typingSoundVolume', val);
    typingSoundService.setVolume(val);
  };

  const previewSound = () => {
    if (settings.soundEnabled) {
      typingSoundService.playCorrectKey();
    }
  };

  const handleTranslationSelect = (lang: 'so' | 'sv' | 'off') => {
    setTranslationLang(lang);
    translationService.setLanguage(lang, 'en');
    translationService.setPythonLanguage(lang);
    if (lang === 'so' || lang === 'off') {
      translationService.setLanguage(lang, 'sv');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="settings-modal-card"
        className="w-[calc(100%-24px)] max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-neutral-800 bg-[#141210] p-4 sm:p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Learning Settings
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Preferences for typing and audio
            </p>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer shrink-0"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Setting Groups */}
        <div className="space-y-4">
          {/* 1. Typing Sounds & Volume */}
          <div className="space-y-3 rounded-2xl border border-neutral-800/80 bg-[#181614] p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 shrink-0">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    Typing Sounds
                  </p>
                  <p className="text-[11px] sm:text-xs text-neutral-400">
                    Keyboard feedback
                  </p>
                </div>
              </div>
              <button
                id="toggle-sound-btn"
                type="button"
                onClick={handleToggleSound}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                  settings.soundEnabled ? 'bg-amber-500' : 'bg-neutral-800'
                }`}
                aria-label="Toggle typing sounds"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-neutral-950 transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Volume slider directly underneath */}
            <div
              className={`space-y-1.5 pt-2.5 border-t border-neutral-800/70 transition-opacity ${
                settings.soundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Volume</span>
                <span className="font-mono text-amber-400 font-bold text-[11px] sm:text-xs">
                  {Math.round((settings.typingSoundVolume ?? 0.4) * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <VolumeX className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <input
                  type="range"
                  id="typing-sound-volume-slider"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.typingSoundVolume ?? 0.4}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  onMouseUp={previewSound}
                  onTouchEnd={previewSound}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  aria-label="Typing sound volume"
                />
                <Volume2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </div>
            </div>
          </div>

          {/* 2. Translation Help */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-200">
              <Languages className="w-4 h-4 text-amber-400" />
              <span>Translation Help</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'so' as const, label: 'Somali' },
                { id: 'sv' as const, label: 'Swedish' },
                { id: 'off' as const, label: 'Off' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  id={`translation-help-${opt.id}-btn`}
                  type="button"
                  onClick={() => handleTranslationSelect(opt.id)}
                  className={`h-11 sm:h-12 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    translationLang === opt.id
                      ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 shadow-sm'
                      : 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Caret Style */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-200">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Caret Style</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['line', 'block', 'underline'] as const).map((style) => (
                <button
                  key={style}
                  id={`caret-style-${style}-btn`}
                  type="button"
                  onClick={() => updateSetting('caretStyle', style)}
                  className={`h-11 sm:h-12 px-3 text-xs font-semibold rounded-xl border capitalize flex items-center justify-center transition-all cursor-pointer ${
                    settings.caretStyle === style
                      ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 shadow-sm'
                      : 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Focus Typing Font Size */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-200">
              <Type className="w-4 h-4 text-amber-400" />
              <span>Typing Font Size</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['medium', 'large', 'extra-large'] as const).map((size) => (
                <button
                  key={size}
                  id={`font-size-${size}-btn`}
                  type="button"
                  onClick={() => updateSetting('fontSize', size)}
                  className={`h-11 sm:h-12 px-3 text-xs font-semibold rounded-xl border capitalize flex items-center justify-center transition-all cursor-pointer ${
                    settings.fontSize === size
                      ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 shadow-sm'
                      : 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {size.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Lesson Audio Notice */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#181614] p-3.5 space-y-1">
            <p className="text-xs font-semibold text-white">Lesson Audio</p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Edge TTS natural speech is enabled for Swedish, English, and Somali explanations.
            </p>
          </div>

          {/* 6. Telegram Private Learning Companion */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#151412] p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">Telegram Companion</p>
                  <p className="text-[11px] text-neutral-400">Private personal reviews & audio</p>
                </div>
              </div>

              {/* Status badge */}
              {telegramLoading ? (
                <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Checking...</span>
                </div>
              ) : telegramStatus?.configured ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[10px] font-medium">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Connected ({telegramStatus.allowedUserMask})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] font-medium">
                  <AlertCircle className="w-3 h-3 text-amber-500/80" />
                  <span>Setup needed</span>
                </div>
              )}
            </div>

            {/* Bot Quick Connection & Status */}
            {telegramStatus?.configured && telegramStatus.botUsername && (
              <div className="p-2.5 rounded-xl border border-sky-900/60 bg-sky-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-sky-300 font-medium">
                    <Bot className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Bot: @{telegramStatus.botUsername}</span>
                    {telegramStatus.botFirstName && (
                      <span className="text-[11px] text-neutral-400">({telegramStatus.botFirstName})</span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {telegramStatus.chatEstablished
                      ? 'Chat is active and messages are flowing.'
                      : 'First time? Tap "Start" in Telegram first to authorize the bot.'}
                  </p>
                </div>

                <a
                  href={telegramStatus.chatLink || `https://t.me/${telegramStatus.botUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-200 text-xs font-medium transition-all shrink-0 active:scale-[0.98]"
                >
                  <span>Open @{telegramStatus.botUsername}</span>
                  <ExternalLink className="w-3 h-3 text-sky-400" />
                </a>
              </div>
            )}

            {/* Test Actions */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-medium text-neutral-300">Connection & Review Tests:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Button 1: Send Telegram Test */}
                <button
                  type="button"
                  id="send-telegram-test-btn"
                  onClick={() => triggerTelegramAction('test')}
                  disabled={actionLoading !== null}
                  className="px-2.5 py-2 rounded-xl text-xs font-medium border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Sends: Telegram connected successfully. I learn by typing. ⌨️"
                >
                  {actionLoading === 'test' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                  )}
                  <span>Send Test</span>
                </button>

                {/* Button 2: Send Sample Vocab */}
                <button
                  type="button"
                  id="send-telegram-vocab-btn"
                  onClick={() => triggerTelegramAction('sample-vocab')}
                  disabled={actionLoading !== null}
                  className="px-2.5 py-2 rounded-xl text-xs font-medium border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Sends: pay-as-you-go + word audio + sentence audio"
                >
                  {actionLoading === 'sample-vocab' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <span className="text-amber-400 text-xs">🇬🇧</span>
                  )}
                  <span>Sample Vocab</span>
                </button>

                {/* Button 3: Send Somali TTS Test */}
                <button
                  type="button"
                  id="send-telegram-somali-btn"
                  onClick={() => triggerTelegramAction('sample-somali')}
                  disabled={actionLoading !== null}
                  className="px-2.5 py-2 rounded-xl text-xs font-medium border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Sends: Variable concept + Somali TTS audio (Muuse)"
                >
                  {actionLoading === 'sample-somali' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <span className="text-emerald-400 text-xs">🐍</span>
                  )}
                  <span>Somali TTS</span>
                </button>
              </div>

              {/* Webhook Status & Setup Button */}
              {telegramStatus?.configured && (
                <div className="pt-1.5 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800/60 mt-2">
                  <div className="flex items-center gap-1.5 truncate max-w-[260px]">
                    <span className="text-neutral-500">Webhook:</span>
                    {telegramStatus.webhook?.url ? (
                      <span className="text-emerald-400 font-mono truncate text-[10px]">
                        Active
                      </span>
                    ) : (
                      <span className="text-amber-400 text-[10px]">Unregistered</span>
                    )}
                  </div>
                  <button
                    type="button"
                    id="setup-telegram-webhook-btn"
                    onClick={setupTelegramWebhook}
                    disabled={actionLoading !== null}
                    className="px-2 py-1 rounded-lg text-[10px] font-medium border border-sky-800/60 bg-sky-950/30 text-sky-300 hover:text-white hover:bg-sky-900/40 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    {actionLoading === 'webhook' && <Loader2 className="w-2.5 h-2.5 animate-spin text-sky-400" />}
                    <span>{telegramStatus.webhook?.url ? 'Re-sync Webhook' : 'Register Webhook'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Action Feedback Banner */}
            {actionFeedback && (
              <div
                className={`p-2.5 rounded-xl border text-xs leading-relaxed transition-all space-y-2 ${
                  actionFeedback.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-red-950/40 border-red-800/60 text-red-300'
                }`}
              >
                <div>{actionFeedback.text}</div>
                {actionFeedback.type === 'error' && telegramStatus?.botUsername && (
                  <a
                    href={telegramStatus.chatLink || `https://t.me/${telegramStatus.botUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800/60 border border-red-700/60 text-red-100 text-xs font-medium transition-all"
                  >
                    <span>👉 Open @{telegramStatus.botUsername} in Telegram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Setup info toggle */}
            <div className="pt-1 border-t border-neutral-800/60">
              <button
                type="button"
                onClick={() => setShowSetupHelp(!showSetupHelp)}
                className="text-[11px] text-neutral-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{showSetupHelp ? 'Hide' : 'Show'} Telegram Bot Setup Guide</span>
              </button>

              {showSetupHelp && (
                <div className="mt-2 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-300 space-y-2">
                  <p className="font-semibold text-amber-400">Private Bot Configuration (Vercel & Local):</p>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-300 leading-relaxed">
                    <li>Create your private bot on Telegram with <code>@BotFather</code> and copy the token.</li>
                    <li>Get your numeric Telegram User ID (e.g. from <code>@userinfobot</code>).</li>
                    <li>
                      Add two environment variables in <b>Vercel Project Settings → Environment Variables</b> (and in your local <code>.env</code> file):
                      <div className="my-1.5 p-1.5 rounded bg-neutral-950 font-mono text-[10px] text-neutral-200 border border-neutral-800">
                        TELEGRAM_BOT_TOKEN=123456:ABC-DEF...<br />
                        TELEGRAM_ALLOWED_USER_ID=987654321
                      </div>
                    </li>
                    <li>Start a chat with your bot on Telegram and tap <code>/start</code>.</li>
                  </ol>
                  <p className="text-neutral-400 text-[10px]">
                    Only your numerical user ID is allowed. All other accounts are strictly blocked.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 7. Done Button & Subtle Logout */}
        <div className="pt-2 border-t border-neutral-800 space-y-2">
          <button
            id="done-settings-btn"
            type="button"
            onClick={onClose}
            className="w-full h-12 flex items-center justify-center text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            Done
          </button>

          <div className="flex items-center justify-between px-1 pt-1">
            <button
              id="logout-session-btn"
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-400 transition-colors cursor-pointer py-1 disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? 'Logging out...' : 'Log out of session'}</span>
            </button>
            <span className="text-[10px] text-neutral-600 font-mono">
              MY LEARNING
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
