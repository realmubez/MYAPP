import React, { useEffect, useRef } from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';
import { typingSoundService } from '../../services/typingSoundService';

interface MathInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  allowNegative?: boolean;
  allowDecimal?: boolean;
  placeholder?: string;
  soundEnabled?: boolean;
}

export function MathInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  allowNegative = true,
  allowDecimal = true,
  placeholder = 'Type answer...',
  soundEnabled = true,
}: MathInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleKeypadPress = (char: string) => {
    if (disabled) return;

    if (char === 'BACKSPACE') {
      if (value.length > 0) {
        if (soundEnabled) typingSoundService.playKeyPress();
        onChange(value.slice(0, -1));
      }
      return;
    }

    if (char === 'ENTER') {
      onSubmit();
      return;
    }

    // Negative sign validation
    if (char === '-') {
      if (!allowNegative) return;
      if (value.includes('-')) return;
      if (soundEnabled) typingSoundService.playKeyPress();
      onChange('-' + value);
      return;
    }

    // Decimal point validation
    if (char === '.') {
      if (!allowDecimal) return;
      if (value.includes('.')) return;
      if (soundEnabled) typingSoundService.playKeyPress();
      onChange(value + '.');
      return;
    }

    // Numbers
    if (/^[0-9]$/.test(char)) {
      if (soundEnabled) typingSoundService.playKeyPress();
      onChange(value + char);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
      return;
    }

    if (e.key === 'Backspace') {
      if (soundEnabled) typingSoundService.playKeyPress();
      return;
    }

    if (e.key === '-' && allowNegative) {
      if (value.includes('-')) {
        e.preventDefault();
      } else {
        if (soundEnabled) typingSoundService.playKeyPress();
      }
      return;
    }

    if (e.key === '.' && allowDecimal) {
      if (value.includes('.')) {
        e.preventDefault();
      } else {
        if (soundEnabled) typingSoundService.playKeyPress();
      }
      return;
    }

    if (/^[0-9]$/.test(e.key)) {
      if (soundEnabled) typingSoundService.playKeyPress();
      return;
    }

    // Block non-math characters
    if (!e.ctrlKey && !e.metaKey && e.key.length === 1) {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Display & Text Input */}
      <div className="relative flex items-center justify-center rounded-2xl border-2 border-neutral-700 bg-neutral-900/90 px-6 py-4 transition-all focus-within:border-amber-500 shadow-inner">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            // Clean input
            let clean = raw.replace(/[^0-9.-]/g, '');
            if (!allowNegative) clean = clean.replace(/-/g, '');
            if (!allowDecimal) clean = clean.replace(/\./g, '');
            onChange(clean);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-transparent text-center font-mono text-3xl sm:text-4xl font-bold tracking-wider text-white placeholder-neutral-600 focus:outline-none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
      </div>

      {/* Numerical Keypad for Touch / Fast Input */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-2 select-none">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => handleKeypadPress(num)}
            className="flex h-12 sm:h-14 items-center justify-center rounded-xl sm:rounded-2xl border border-neutral-800 bg-[#161412] text-xl sm:text-2xl font-mono font-semibold text-neutral-100 transition-all hover:border-amber-500/40 hover:bg-neutral-800 active:scale-95 disabled:opacity-50 shadow-sm"
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          disabled={disabled || !allowNegative}
          onClick={() => handleKeypadPress('-')}
          className="flex h-12 sm:h-14 items-center justify-center rounded-xl sm:rounded-2xl border border-neutral-800 bg-[#161412] text-xl font-mono font-semibold text-neutral-300 transition-all hover:border-amber-500/40 hover:bg-neutral-800 active:scale-95 disabled:opacity-40 shadow-sm"
        >
          − / +
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKeypadPress('0')}
          className="flex h-12 sm:h-14 items-center justify-center rounded-xl sm:rounded-2xl border border-neutral-800 bg-[#161412] text-xl sm:text-2xl font-mono font-semibold text-neutral-100 transition-all hover:border-amber-500/40 hover:bg-neutral-800 active:scale-95 disabled:opacity-50 shadow-sm"
        >
          0
        </button>

        <button
          type="button"
          disabled={disabled || !allowDecimal}
          onClick={() => handleKeypadPress('.')}
          className="flex h-12 sm:h-14 items-center justify-center rounded-xl sm:rounded-2xl border border-neutral-800 bg-[#161412] text-xl font-mono font-semibold text-neutral-300 transition-all hover:border-amber-500/40 hover:bg-neutral-800 active:scale-95 disabled:opacity-40 shadow-sm"
        >
          .
        </button>

        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={() => handleKeypadPress('BACKSPACE')}
          className="col-span-1 flex h-12 sm:h-14 items-center justify-center rounded-xl sm:rounded-2xl border border-neutral-800 bg-neutral-900 text-neutral-400 transition-all hover:border-neutral-700 hover:text-white active:scale-95 disabled:opacity-30 shadow-sm"
        >
          <Delete className="w-5 h-5" />
        </button>

        <button
          type="button"
          disabled={disabled || value.trim().length === 0}
          onClick={onSubmit}
          className="col-span-2 flex h-12 sm:h-14 items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-amber-500/50 bg-amber-500 text-base sm:text-lg font-bold text-neutral-950 transition-all hover:bg-amber-400 active:scale-95 disabled:opacity-40 shadow-md"
        >
          <span>Submit</span>
          <CornerDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
