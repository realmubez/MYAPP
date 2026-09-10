import { useState, useRef, useEffect, type RefObject } from 'react';
import { CharacterState } from '../../hooks/useTypingEngine';

interface TypingTextProps {
  characters: CharacterState[];
  typedLength: number;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  onInputChange: (val: string) => void;
  typedValue: string;
  disabled?: boolean;
  onContainerClick?: () => void;
  isRecallMode?: boolean;
  showHint?: boolean;
  hintText?: string;
  isCode?: boolean;
}

interface CodeLine {
  lineIndex: number;
  items: (CharacterState & { globalIndex: number })[];
  newlineItem: (CharacterState & { globalIndex: number }) | null;
}

function splitCharactersIntoLines(characters: CharacterState[]): CodeLine[] {
  const lines: CodeLine[] = [];
  let currentLineItems: (CharacterState & { globalIndex: number })[] = [];

  for (let i = 0; i < characters.length; i++) {
    const item = characters[i];
    const itemWithIndex = { ...item, globalIndex: i };

    if (item.expectedChar === '\n') {
      lines.push({
        lineIndex: lines.length,
        items: currentLineItems,
        newlineItem: itemWithIndex,
      });
      currentLineItems = [];
    } else {
      currentLineItems.push(itemWithIndex);
    }
  }

  lines.push({
    lineIndex: lines.length,
    items: currentLineItems,
    newlineItem: null,
  });

  return lines;
}

export function TypingText({
  characters,
  typedLength,
  inputRef,
  onInputChange,
  typedValue,
  disabled = false,
  onContainerClick,
  isRecallMode = false,
  showHint = false,
  hintText = '',
  isCode = false,
}: TypingTextProps) {
  const isComposingRef = useRef(false);
  const rawInputRef = useRef(typedValue);
  const [rawInput, setRawInput] = useState(typedValue);

  // Synchronize internal rawInput when typedValue changes externally (e.g. sentence change or reset)
  useEffect(() => {
    setRawInput(typedValue);
    rawInputRef.current = typedValue;
    if (inputRef.current && inputRef.current.value !== typedValue) {
      inputRef.current.value = typedValue;
    }
  }, [typedValue, inputRef]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    onContainerClick?.();
  };

  // Primary live update pipeline - never blocks on composition
  const processInput = (value: string) => {
    if (value === rawInputRef.current) return;
    rawInputRef.current = value;
    setRawInput(value);
    onInputChange(value);
  };

  // Check if code contains newlines or is explicitly code mode
  const isCodeMode = isCode || characters.some((c) => c.expectedChar === '\n');
  const codeLines = isCodeMode ? splitCharactersIntoLines(characters) : [];

  return (
    <div
      className="relative w-full max-w-4xl mx-auto cursor-text select-none py-4 sm:py-8 px-2 sm:px-4"
      onClick={focusInput}
      onTouchStart={focusInput}
    >
      {/* 
        Real mobile-friendly input / textarea element:
        - For Python / Code: invisible <textarea> to capture mobile Enter as \n newline data
        - For Language: invisible <input>
        - Full-width with opacity-0 so mobile virtual keyboards (Gboard/iOS) recognize it as an active editable field
        - Never display:none, visibility:hidden, disabled, or 1px x 1px
        - Driven by onInput as primary live event, onChange / composition fallback for instant character-by-character updates
      */}
      {isCodeMode ? (
        <textarea
          ref={inputRef as any}
          id="focus-typing-code-input"
          value={rawInput}
          onInput={(e) => {
            processInput(e.currentTarget.value);
          }}
          onChange={(e) => {
            processInput(e.currentTarget.value);
          }}
          onKeyDown={(e) => {
            // Tab key support on desktop: inserts 4 spaces
            if (e.key === 'Tab') {
              e.preventDefault();
              processInput(rawInput + '    ');
            }
          }}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionUpdate={(e) => {
            processInput(e.currentTarget.value);
          }}
          onCompositionEnd={(e) => {
            isComposingRef.current = false;
            processInput(e.currentTarget.value);
          }}
          disabled={disabled}
          autoFocus
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          className="fixed left-0 bottom-0 w-full h-12 opacity-0 text-base pointer-events-auto z-[-1] resize-none overflow-hidden"
          aria-label="Type Python code here"
        />
      ) : (
        <input
          ref={inputRef as any}
          type="text"
          id="focus-typing-input"
          value={rawInput}
          onInput={(e) => {
            processInput(e.currentTarget.value);
          }}
          onChange={(e) => {
            processInput(e.currentTarget.value);
          }}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionUpdate={(e) => {
            processInput(e.currentTarget.value);
          }}
          onCompositionEnd={(e) => {
            isComposingRef.current = false;
            processInput(e.currentTarget.value);
          }}
          disabled={disabled}
          autoFocus
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          className="fixed left-0 bottom-0 w-full h-12 opacity-0 text-base pointer-events-auto z-[-1]"
          aria-label="Type the sentence here"
        />
      )}

      {/* Visual Display */}
      {isCodeMode ? (
        /* Python Code Mode Display: Preserves exact newlines, spaces, indentation, line numbers */
        <div className="w-full max-w-2xl mx-auto my-1 sm:my-3">
          <div className="p-4 sm:p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl overflow-x-auto">
            <div className="flex flex-col gap-y-1 sm:gap-y-1.5 font-mono text-base sm:text-xl md:text-2xl leading-relaxed select-none">
              {codeLines.map((line) => (
                <div key={line.lineIndex} className="flex items-start min-h-[1.75em]">
                  {codeLines.length > 1 && (
                    <span className="text-neutral-600 font-mono text-xs sm:text-sm select-none pr-3 sm:pr-4 pt-1 w-6 sm:w-8 text-right shrink-0">
                      {line.lineIndex + 1}
                    </span>
                  )}
                  <div className="flex flex-wrap items-center whitespace-pre font-mono flex-1">
                    {line.items.map((item) => {
                      const isCurrent = item.globalIndex === typedLength;
                      const isTyped = item.globalIndex < typedLength;

                      let colorClass = 'text-neutral-600'; // untyped muted gray
                      let displayChar = item.expectedChar === ' ' ? '\u00A0' : item.expectedChar;

                      if (isTyped) {
                        if (item.status === 'correct') {
                          colorClass = 'text-white font-medium';
                          displayChar = item.char === ' ' ? '\u00A0' : item.char;
                        } else if (item.status === 'incorrect') {
                          colorClass = 'text-red-400 bg-red-950/70 rounded px-0.5 font-medium';
                          displayChar = item.char === ' ' ? '\u00A0' : item.char;
                        }
                      }

                      return (
                        <span key={item.globalIndex} className="relative inline-block">
                          {/* Active Caret */}
                          {isCurrent && (
                            <span className="absolute -left-[1.5px] top-0 bottom-0 w-[2px] sm:w-[2.5px] bg-amber-400 animate-pulse rounded-full z-10 pointer-events-none" />
                          )}
                          <span className={`transition-colors duration-75 ${colorClass}`}>
                            {displayChar}
                          </span>
                        </span>
                      );
                    })}

                    {/* End-of-line newline indicator & caret */}
                    {line.newlineItem && (
                      <span className="relative inline-block ml-0.5">
                        {line.newlineItem.globalIndex === typedLength && (
                          <span className="inline-flex items-center">
                            <span className="inline-block w-[2px] sm:w-[2.5px] h-[1.1em] align-middle bg-amber-400 animate-pulse rounded-full mr-1" />
                            <span className="text-[10px] sm:text-xs text-amber-400/80 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 select-none">
                              ↵
                            </span>
                          </span>
                        )}
                        {line.newlineItem.globalIndex < typedLength && line.newlineItem.status === 'incorrect' && (
                          <span className="text-[10px] sm:text-xs text-red-400 bg-red-950/60 px-1 py-0.5 rounded border border-red-500/20 font-mono select-none">
                            ↵
                          </span>
                        )}
                      </span>
                    )}

                    {/* Final end-of-text caret on the last line when all characters are typed */}
                    {!line.newlineItem && line.lineIndex === codeLines.length - 1 && typedLength === characters.length && (
                      <span className="relative inline-block ml-0.5">
                        <span className="inline-block w-[2px] sm:w-[2.5px] h-[1.1em] align-middle bg-emerald-400 animate-pulse rounded-full" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Mobile Quick Symbol & Indent Helper Row */}
          <div className="mt-3 flex items-center justify-center flex-wrap gap-1.5 px-2 select-none">
            <button
              type="button"
              id="python-helper-tab-btn"
              onClick={(e) => {
                e.stopPropagation();
                processInput(rawInput + '    ');
                focusInput();
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
              title="Insert 4 spaces"
            >
              <span>Indent</span>
              <span className="text-[10px] text-neutral-500">(4 sp)</span>
            </button>

            {[':', '(', ')', '"', "'", '=', '_', ',', '.'].map((sym) => (
              <button
                key={sym}
                type="button"
                id={`python-helper-sym-${sym === '"' ? 'quote' : sym === "'" ? 'squote' : sym === '.' ? 'dot' : sym === ',' ? 'comma' : sym === ':' ? 'colon' : sym === '(' ? 'lparen' : sym === ')' ? 'rparen' : sym === '=' ? 'eq' : 'under'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  processInput(rawInput + sym);
                  focusInput();
                }}
                className="w-8 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white hover:bg-neutral-800 active:scale-95 transition-all flex items-center justify-center shadow-sm"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Visual Language Mode Display (Swedish / English) */
        <div className="font-mono font-medium tracking-normal text-center flex flex-wrap justify-center items-center gap-y-1.5 sm:gap-y-2.5 text-[clamp(1.75rem,7vw,3rem)] leading-[1.4] sm:leading-[1.5] w-full break-words">
          {isRecallMode && !showHint ? (
            // In recall mode without hint: show placeholder tokens or typed characters directly
            characters.map((item, index) => {
              const isTyped = index < typedLength;
              const isCurrent = index === typedLength;

              return (
                <span key={index} className="relative inline-block">
                  {/* Active Caret */}
                  {isCurrent && (
                    <span className="absolute -left-0.5 top-1 bottom-1 w-[2px] sm:w-[3px] bg-amber-400 animate-pulse rounded-full" />
                  )}

                  {isTyped ? (
                    <span
                      className={
                        item.status === 'correct'
                          ? 'text-white'
                          : 'text-red-400 bg-red-950/60 rounded px-0.5'
                      }
                    >
                      {item.char === ' ' ? '\u00A0' : item.char}
                    </span>
                  ) : (
                    // Blank prompt slot
                    <span className="text-neutral-700 mx-0.5 underline decoration-neutral-800 decoration-2 underline-offset-8">
                      {item.expectedChar === ' ' ? '\u00A0\u00A0' : '•'}
                    </span>
                  )}
                </span>
              );
            })
          ) : (
            // Standard / Hinted View: characters rendered with live styling
            characters.map((item, index) => {
              const isCurrent = index === typedLength;
              const isTyped = index < typedLength;

              let colorClass = 'text-neutral-600'; // untyped muted gray
              let displayChar = item.expectedChar === ' ' ? '\u00A0' : item.expectedChar;

              if (isTyped) {
                if (item.status === 'correct') {
                  colorClass = 'text-white font-medium';
                  displayChar = item.char === ' ' ? '\u00A0' : item.char;
                } else if (item.status === 'incorrect') {
                  colorClass = 'text-red-400 bg-red-950/60 rounded px-0.5 font-medium';
                  displayChar = item.char === ' ' ? '\u00A0' : item.char;
                }
              }

              return (
                <span key={index} className="relative inline-block">
                  {/* Caret */}
                  {isCurrent && (
                    <span className="absolute -left-[2px] top-1 bottom-1 w-[2px] sm:w-[3px] bg-amber-400 animate-pulse rounded-full z-10" />
                  )}

                  {/* Character */}
                  <span className={`transition-colors duration-75 ${colorClass}`}>
                    {displayChar}
                  </span>
                </span>
              );
            })
          )}
        </div>
      )}

      {/* Hint display for recall mode */}
      {isRecallMode && showHint && hintText && (
        <div className="mt-3 text-center text-xs sm:text-sm font-mono text-amber-400/90 break-words px-2">
          Hint: {hintText}
        </div>
      )}
    </div>
  );
}
