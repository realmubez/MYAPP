import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Type,
  Eye,
  Languages,
  Send,
  Bot,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  LogOut,
  Sparkles,
  Radio,
  Check,
  Download,
  Smartphone,
} from 'lucide-react';
import { AppSettings } from '../types';
import { storageService } from '../services/storage';
import { typingSoundService } from '../services/typingSoundService';
import { translationService } from '../services/translationPreference';
import { useAuth } from '../context/AuthContext';
import { usePwaInstall } from '../hooks/usePwaInstall';

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

export function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isInstallable, isInstalled, isStandalone, isIOS, installApp } = usePwaInstall();
  const [isInstalling, setIsInstalling] = useState(false);

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

  useEffect(() => {
    setSettings(storageService.getSettings());
    const lang = translationService.getLanguage('en');
    setTranslationLang(lang === 'sv' || lang === 'off' ? lang : 'so');
    fetchTelegramStatus();
  }, []);

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

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      id="settings-page-container"
      className="w-full max-w-3xl lg:max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-24 lg:pb-16 text-neutral-100"
    >
      {/* 1. Page Header */}
      <div className="flex items-center gap-3.5 pt-1 sm:pt-2">
        <button
          type="button"
          id="settings-back-btn"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-800 bg-[#141210] text-neutral-400 hover:text-white hover:border-neutral-700 active:scale-95 transition-all cursor-pointer shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage your learning experience
          </p>
        </div>
      </div>

      {/* 2. LEARNING SECTION */}
      <section id="settings-section-learning" className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
            Learning
          </span>
        </div>

        {/* Translation Help Card */}
        <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 shrink-0">
                <Languages className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Translation Help</p>
                <p className="text-xs text-neutral-400">
                  Select your preferred helper language for lessons & exercises
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1">
            {[
              { id: 'so' as const, label: 'Somali', hint: 'Af-Soomaali' },
              { id: 'sv' as const, label: 'Swedish', hint: 'Svenska' },
              { id: 'off' as const, label: 'Off', hint: 'Immersion' },
            ].map((opt) => (
              <button
                key={opt.id}
                id={`settings-translation-${opt.id}-btn`}
                type="button"
                onClick={() => handleTranslationSelect(opt.id)}
                className={`py-3 px-3 text-xs font-semibold rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  translationLang === opt.id
                    ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 shadow-sm'
                    : 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <span className="text-xs font-bold">{opt.label}</span>
                <span className="text-[10px] text-neutral-500 font-normal">{opt.hint}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AUDIO & LANGUAGE SECTION */}
      <section id="settings-section-audio" className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
            Audio & Language
          </span>
        </div>

        <div className="space-y-3">
          {/* Lesson Audio Notice Card */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-white">Lesson Audio</p>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed pl-10 sm:pl-10.5">
              Natural speech is enabled for Swedish, English, and Somali explanations.
            </p>
          </div>

          {/* Typing Sounds & Volume */}
          <div className="space-y-3 rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 shadow-sm">
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
                  <p className="text-sm font-semibold text-white">
                    Typing Sounds
                  </p>
                  <p className="text-xs text-neutral-400">
                    Keyboard mechanical feedback during typing
                  </p>
                </div>
              </div>
              <button
                id="settings-toggle-sound-btn"
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

            {/* Volume slider */}
            <div
              className={`space-y-1.5 pt-3 border-t border-neutral-800/70 transition-opacity ${
                settings.soundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Volume</span>
                <span className="font-mono text-amber-400 font-bold text-xs">
                  {Math.round((settings.typingSoundVolume ?? 0.4) * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <VolumeX className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <input
                  type="range"
                  id="settings-volume-slider"
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
        </div>
      </section>

      {/* 4. TELEGRAM COMPANION SECTION */}
      <section id="settings-section-telegram" className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
            Telegram Companion
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 space-y-4 shadow-sm">
          {/* Header Row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-sky-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Review Companion Bot</p>
                <p className="text-xs text-neutral-400">
                  Private spaced reviews and TTS audio on your mobile device
                </p>
              </div>
            </div>

            {/* Connection Status Pill */}
            {telegramLoading ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Checking...</span>
              </div>
            ) : telegramStatus?.configured ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Connected ({telegramStatus.allowedUserMask || 'Allowed'})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500/80" />
                <span>Setup needed</span>
              </div>
            )}
          </div>

          {/* Bot Connection & Link Card */}
          {telegramStatus?.configured && telegramStatus.botUsername && (
            <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-neutral-200 font-medium">
                  <Bot className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Bot: @{telegramStatus.botUsername}</span>
                  {telegramStatus.botFirstName && (
                    <span className="text-neutral-400">({telegramStatus.botFirstName})</span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {telegramStatus.chatEstablished
                    ? 'Chat is active and messages are flowing.'
                    : 'First time? Tap "Start" in Telegram first to authorize the bot.'}
                </p>
              </div>

              <a
                href={telegramStatus.chatLink || `https://t.me/${telegramStatus.botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                id="settings-open-telegram-btn"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-200 text-xs font-medium transition-all shrink-0 active:scale-[0.98]"
              >
                <span>Open @{telegramStatus.botUsername}</span>
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              </a>
            </div>
          )}

          {/* Review & Connection Test Action Buttons */}
          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium text-neutral-300">Connection & Review Tests:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Button 1: Send Telegram Test */}
              <button
                type="button"
                id="settings-send-telegram-test-btn"
                onClick={() => triggerTelegramAction('test')}
                disabled={actionLoading !== null}
                className="px-3 py-2.5 rounded-xl text-xs font-medium border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                id="settings-send-telegram-vocab-btn"
                onClick={() => triggerTelegramAction('sample-vocab')}
                disabled={actionLoading !== null}
                className="px-3 py-2.5 rounded-xl text-xs font-medium border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                id="settings-send-telegram-somali-btn"
                onClick={() => triggerTelegramAction('sample-somali')}
                disabled={actionLoading !== null}
                className="px-3 py-2.5 rounded-xl text-xs font-medium border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

            {/* Webhook Status & Register Webhook */}
            {telegramStatus?.configured && (
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-400 border-t border-neutral-800/60 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 font-medium">Webhook Status:</span>
                  {telegramStatus.webhook?.url ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>Webhook Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-400 text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Not Registered</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  id="settings-setup-telegram-webhook-btn"
                  onClick={setupTelegramWebhook}
                  disabled={actionLoading !== null}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 self-start sm:self-auto"
                >
                  {actionLoading === 'webhook' ? (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                  ) : (
                    <Radio className="w-3 h-3 text-neutral-400" />
                  )}
                  <span>{telegramStatus.webhook?.url ? 'Re-sync Webhook' : 'Register Webhook'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Feedback Banner */}
          {actionFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed transition-all space-y-2 ${
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800/60 border border-red-700/60 text-red-100 text-xs font-medium transition-all"
                >
                  <span>👉 Open @{telegramStatus.botUsername} in Telegram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Setup Guide Accordion */}
          <div className="pt-2 border-t border-neutral-800/60">
            <button
              type="button"
              id="settings-toggle-setup-help-btn"
              onClick={() => setShowSetupHelp(!showSetupHelp)}
              className="text-xs text-neutral-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{showSetupHelp ? 'Hide' : 'Show'} Telegram Bot Setup Guide</span>
            </button>

            {showSetupHelp && (
              <div className="mt-3 p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 space-y-2.5">
                <p className="font-semibold text-amber-400">Private Bot Configuration (Vercel & Local):</p>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 leading-relaxed">
                  <li>Create your private bot on Telegram with <code>@BotFather</code> and copy the token.</li>
                  <li>Get your numeric Telegram User ID (e.g. from <code>@userinfobot</code>).</li>
                  <li>
                    Add two environment variables in <b>Vercel Project Settings → Environment Variables</b> (and in your local <code>.env</code> file):
                    <div className="my-1.5 p-2 rounded-lg bg-neutral-950 font-mono text-[11px] text-neutral-200 border border-neutral-800">
                      TELEGRAM_BOT_TOKEN=123456:ABC-DEF...<br />
                      TELEGRAM_ALLOWED_USER_ID=987654321
                    </div>
                  </li>
                  <li>Start a chat with your bot on Telegram and tap <code>/start</code>.</li>
                </ol>
                <p className="text-neutral-400 text-[11px]">
                  Only your numerical user ID is allowed. All other accounts are strictly blocked.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. APPEARANCE SECTION */}
      <section id="settings-section-appearance" className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
            Appearance
          </span>
        </div>

        <div className="space-y-3">
          {/* Caret Style Card */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Caret Style</p>
                <p className="text-xs text-neutral-400">
                  Cursor visual styling in typing exercises
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1">
              {(['line', 'block', 'underline'] as const).map((style) => (
                <button
                  key={style}
                  id={`settings-caret-style-${style}-btn`}
                  type="button"
                  onClick={() => updateSetting('caretStyle', style)}
                  className={`py-2.5 px-3 text-xs font-semibold rounded-xl border capitalize flex items-center justify-center transition-all cursor-pointer ${
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

          {/* Typing Font Size Card */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 shrink-0">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Typing Font Size</p>
                <p className="text-xs text-neutral-400">
                  Text scale in focus typing drills
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1">
              {(['medium', 'large', 'extra-large'] as const).map((size) => (
                <button
                  key={size}
                  id={`settings-font-size-${size}-btn`}
                  type="button"
                  onClick={() => updateSetting('fontSize', size)}
                  className={`py-2.5 px-3 text-xs font-semibold rounded-xl border capitalize flex items-center justify-center transition-all cursor-pointer ${
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
        </div>
      </section>

      {/* 6. APPLICATION & INSTALLATION SECTION */}
      <section id="settings-section-pwa" className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
            Application
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">MY LEARNING App</p>
                  {isStandalone ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Installed
                    </span>
                  ) : isInstallable ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Installable
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isStandalone
                    ? 'Running as an installed standalone application.'
                    : 'Install on your Android device or desktop for a fullscreen app experience.'}
                </p>
              </div>
            </div>

            {/* Install Button / State */}
            {isStandalone ? (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 self-start sm:self-auto">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Installed</span>
              </div>
            ) : isInstallable ? (
              <button
                type="button"
                id="settings-install-pwa-btn"
                disabled={isInstalling}
                onClick={async () => {
                  setIsInstalling(true);
                  try {
                    await installApp();
                  } finally {
                    setIsInstalling(false);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-neutral-950 text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isInstalling ? 'Installing...' : 'Install MY LEARNING'}</span>
              </button>
            ) : isIOS ? (
              <div className="text-[11px] text-neutral-400 bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                To install on iOS: tap <span className="text-white font-semibold">Share</span> and select <span className="text-white font-semibold">“Add to Home Screen”</span>.
              </div>
            ) : (
              <div className="text-[11px] text-neutral-500 font-mono self-start sm:self-auto">
                PWA Ready · Browser Mode
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. ACCOUNT SECTION */}
      <section id="settings-section-account" className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
            Account
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#141210] p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Private Session</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                End your authenticated learning session on this device
              </p>
            </div>

            <button
              id="settings-logout-session-btn"
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-800 hover:border-red-900/60 bg-neutral-900/90 hover:bg-red-950/30 text-xs font-semibold text-neutral-300 hover:text-red-300 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
              ) : (
                <LogOut className="w-4 h-4 text-neutral-400 group-hover:text-red-400" />
              )}
              <span>{isLoggingOut ? 'Logging out...' : 'Log out of session'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
