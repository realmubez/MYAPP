import React, { useState } from 'react';
import { Calendar, Clock, X, Check, Trash2 } from 'lucide-react';

interface SetExamDateModalProps {
  isOpen: boolean;
  currentDate: string | null;
  onClose: () => void;
  onSave: (dateStr: string | null) => void;
}

export const SetExamDateModal: React.FC<SetExamDateModalProps> = ({
  isOpen,
  currentDate,
  onClose,
  onSave,
}) => {
  // Convert current ISO or default to HTML datetime-local format
  const getInitialValue = () => {
    if (!currentDate) {
      // Default to 14 days from now at 09:00
      const d = new Date();
      d.setDate(d.getDate() + 14);
      d.setHours(9, 0, 0, 0);
      return d.toISOString().slice(0, 16);
    }
    try {
      const d = new Date(currentDate);
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const [dateInput, setDateInput] = useState<string>(getInitialValue);

  if (!isOpen) return null;

  const calculatePreview = () => {
    if (!dateInput) return null;
    try {
      const target = new Date(dateInput).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        return { isPast: true, text: 'This date is in the past.' };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return {
        isPast: false,
        text: `${days} day${days === 1 ? '' : 's'} and ${hours} hour${hours === 1 ? '' : 's'} remaining`,
      };
    } catch {
      return null;
    }
  };

  const preview = calculatePreview();

  const handleSave = () => {
    if (!dateInput) {
      onSave(null);
    } else {
      onSave(new Date(dateInput).toISOString());
    }
    onClose();
  };

  const handleClear = () => {
    onSave(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exam-date-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-[#161310] border border-amber-500/30 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 text-neutral-100 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 id="exam-date-title" className="text-base font-bold text-white">
                Set Exam Date
              </h2>
              <p className="text-xs text-neutral-400">
                Configure your target English exam date
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <div className="space-y-3">
          <div>
            <label
              htmlFor="exam-datetime-input"
              className="block text-xs font-semibold text-neutral-300 mb-1.5"
            >
              Target Date and Time:
            </label>
            <input
              id="exam-datetime-input"
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#1f1a16] border border-neutral-700 focus:border-amber-400 text-white text-sm outline-none transition-colors"
            />
          </div>

          {/* Live countdown preview */}
          {preview && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                preview.isPast
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{preview.text}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800">
          {currentDate ? (
            <button
              type="button"
              onClick={handleClear}
              className="min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-300 border border-neutral-700 hover:border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Date</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Date</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
