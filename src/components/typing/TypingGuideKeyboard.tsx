import React, { useRef, useState, useEffect, useMemo } from 'react';

// ---------- Layout constants from TypingGuide ----------
const KEY = 44;
const GAP = 6;
const UNIT = KEY + GAP; // 50px

const ROW_NUM = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const ROW_TOP = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const ROW_HOME = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
const ROW_BOT = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

// Coordinate system where all rows are >= 0 for clean container sizing
const ROW_Y = {
  num: 0,
  top: UNIT,
  home: UNIT * 2,
  bot: UNIT * 3,
  space: UNIT * 4,
};

const ROW_INDENT = {
  num: 0,
  top: 0.5,
  home: 0.75,
  bot: 1.25,
};

function rowKeyMap(row: string[], indent: number, y: number) {
  const map: Record<string, { x: number; y: number; col: number; w?: number }> = {};
  row.forEach((k, i) => {
    map[k] = { x: indent * UNIT + i * UNIT, y, col: i };
  });
  return map;
}

const KEY_POS: Record<string, { x: number; y: number; col?: number; w?: number }> = {
  ...rowKeyMap(ROW_NUM, ROW_INDENT.num, ROW_Y.num),
  ...rowKeyMap(ROW_TOP, ROW_INDENT.top, ROW_Y.top),
  ...rowKeyMap(ROW_HOME, ROW_INDENT.home, ROW_Y.home),
  ...rowKeyMap(ROW_BOT, ROW_INDENT.bot, ROW_Y.bot),
  ' ': { x: ROW_INDENT.home * UNIT + UNIT * 2.5, y: ROW_Y.space, w: UNIT * 5 - GAP },
};

// finger id -> home key
export const FINGER_HOME: Record<string, string> = {
  lp: 'a',
  lr: 's',
  lm: 'd',
  li: 'f',
  ri: 'j',
  rm: 'k',
  rr: 'l',
  rp: ';',
};

// char -> finger id
export const CHAR_FINGER: Record<string, string> = {};
const assign = (fid: string, chars: string[]) => chars.forEach((c) => (CHAR_FINGER[c] = fid));
assign('lp', ['q', 'a', 'z', '1']);
assign('lr', ['w', 's', 'x', '2']);
assign('lm', ['e', 'd', 'c', '3']);
assign('li', ['r', 'f', 'v', 't', 'g', 'b', '4', '5']);
assign('ri', ['y', 'h', 'n', 'u', 'j', 'm', '6', '7']);
assign('rm', ['i', 'k', ',', '8']);
assign('rr', ['o', 'l', '.', '9']);
assign('rp', ['p', ';', '/', '0']);

export const FINGER_ORDER = ['lp', 'lr', 'lm', 'li', 'ri', 'rm', 'rr', 'rp'];

export const FINGER_LABELS: Record<string, { name: string; hand: 'left' | 'right'; fingerName: string }> = {
  lp: { name: 'LEFT PINKY', hand: 'left', fingerName: 'Pinky' },
  lr: { name: 'LEFT RING', hand: 'left', fingerName: 'Ring' },
  lm: { name: 'LEFT MIDDLE', hand: 'left', fingerName: 'Middle' },
  li: { name: 'LEFT INDEX', hand: 'left', fingerName: 'Index' },
  ri: { name: 'RIGHT INDEX', hand: 'right', fingerName: 'Index' },
  rm: { name: 'RIGHT MIDDLE', hand: 'right', fingerName: 'Middle' },
  rr: { name: 'RIGHT RING', hand: 'right', fingerName: 'Ring' },
  rp: { name: 'RIGHT PINKY', hand: 'right', fingerName: 'Pinky' },
};

interface TypingGuideKeyboardProps {
  nextChar: string | null;
  allowedKeys?: string[];
  onKeyClick?: (char: string) => void;
}

export const TypingGuideKeyboard: React.FC<TypingGuideKeyboardProps> = ({
  nextChar,
  allowedKeys = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';', ' '],
  onKeyClick,
}) => {
  const [scale, setScale] = useState(1);
  const [kbSize, setKbSize] = useState({ w: 534, h: 290 });

  const kbWrapRef = useRef<HTMLDivElement | null>(null);
  const kbInnerRef = useRef<HTMLDivElement | null>(null);

  // Set of keys learned for this Day
  const allowedKeysSet = useMemo(() => {
    return new Set(allowedKeys.map((k) => k.toLowerCase()));
  }, [allowedKeys]);

  const normalizedNext = nextChar ? nextChar.toLowerCase() : null;
  const isSpace = normalizedNext === ' ';
  const activeFinger = normalizedNext ? (isSpace ? 'thumb' : CHAR_FINGER[normalizedNext] || null) : null;
  const activeKeyPos = normalizedNext ? KEY_POS[normalizedNext] : null;

  // Active finger display info
  const activeFingerInfo = useMemo(() => {
    if (!normalizedNext) return null;
    if (isSpace) {
      return {
        label: 'THUMB (SPACE)',
        handText: 'BOTH HANDS',
        keyText: 'SPACE',
        isSpace: true,
      };
    }
    const info = CHAR_FINGER[normalizedNext] ? FINGER_LABELS[CHAR_FINGER[normalizedNext]] : null;
    if (info) {
      return {
        label: info.name,
        handText: info.hand === 'left' ? 'LEFT HAND' : 'RIGHT HAND',
        keyText: normalizedNext.toUpperCase(),
        isSpace: false,
      };
    }
    return null;
  }, [normalizedNext, isSpace]);

  // Measure keyboard's natural unscaled width and height once
  useEffect(() => {
    if (!kbInnerRef.current) return;
    const rect = kbInnerRef.current.getBoundingClientRect();
    const naturalW = rect.width / (scale || 1);
    const naturalH = rect.height / (scale || 1);
    if (naturalW > 0 && naturalH > 0) {
      setKbSize((prev) =>
        Math.abs(prev.w - naturalW) < 2 && Math.abs(prev.h - naturalH) < 2
          ? prev
          : { w: naturalW, h: naturalH }
      );
    }
  }, [scale]);

  // Responsive scaling logic from TypingGuide: rescales to fit available width seamlessly
  useEffect(() => {
    if (!kbWrapRef.current || !kbSize.w) return;
    const el = kbWrapRef.current;
    const updateScale = () => {
      const available = el.clientWidth;
      if (available > 0) {
        const next = Math.min(1, (available - 8) / kbSize.w);
        setScale(next > 0 ? next : 1);
      }
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    window.addEventListener('orientationchange', updateScale);
    window.addEventListener('resize', updateScale);

    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', updateScale);
      window.removeEventListener('resize', updateScale);
    };
  }, [kbSize.w]);

  // Keycap rendering helper with Day 1 focus & tactile home indicators
  const renderKeyCap = (label: string, pos: { x: number; y: number; w?: number }, size = KEY) => {
    const isTargetKey = normalizedNext === label;
    const isAllowed = allowedKeysSet.has(label);
    const hasTactileBump = label === 'f' || label === 'j';
    const isHomeRow = ROW_HOME.includes(label);

    // Styling rules:
    // 1. Next expected key: vibrant amber #F5B942 with dark text & glow
    // 2. Allowed Day 1 keys: prominent high-contrast neutral
    // 3. Other keys: dark muted background to establish keyboard context
    let bg = '#12100e';
    let color = '#443e37';
    let border = '1px solid #1c1815';
    let boxShadow = '0 1px 0 rgba(255,255,255,0.02) inset';
    let zIndex = 3;

    if (isTargetKey) {
      bg = '#F5B942';
      color = '#0F1115';
      border = '1px solid #F5B942';
      boxShadow = '0 0 0 3px rgba(245,185,66,0.28), 0 2px 10px rgba(0,0,0,0.6), 0 0 16px rgba(245,185,66,0.45)';
      zIndex = 10;
    } else if (isAllowed) {
      bg = '#201b16';
      color = '#f5efe6';
      border = '1px solid #383027';
      boxShadow = '0 1px 2px rgba(0,0,0,0.35)';
      zIndex = 4;
    } else if (isHomeRow) {
      // Home row unlearned keys (g, h) slightly discernible
      bg = '#161311';
      color = '#61584e';
      border = '1px solid #231e1a';
    }

    return (
      <div
        key={label + pos.x}
        onClick={() => onKeyClick?.(label)}
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          width: pos.w || size,
          height: size,
          borderRadius: 9,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: label === ' ' ? 11 : 14,
          fontWeight: isTargetKey || isAllowed ? 600 : 500,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          color,
          background: bg,
          border,
          boxShadow,
          transition: 'background 120ms ease, box-shadow 120ms ease, color 120ms ease, border 120ms ease',
          zIndex,
          cursor: isAllowed ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        <span>{label === ' ' ? 'space' : label.toUpperCase()}</span>

        {/* Tactile home bump indicators for F and J */}
        {hasTactileBump && (
          <div
            style={{
              position: 'absolute',
              bottom: 5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 13,
              height: 2.5,
              borderRadius: 2,
              background: isTargetKey ? '#0F1115' : '#F5B942',
              boxShadow: isTargetKey ? 'none' : '0 0 4px rgba(245,185,66,0.5)',
              transition: 'background 120ms ease',
            }}
          />
        )}
      </div>
    );
  };

  // Hand layer from TypingGuide: 8 finger capsules resting over home keys
  const renderHandLayer = () => {
    return FINGER_ORDER.map((fid) => {
      const homeChar = FINGER_HOME[fid];
      const home = KEY_POS[homeChar];
      const isActive = fid === activeFinger;

      // For Day 1, fingers rest on home row keys
      // Target position is home key position
      const target = isActive && activeKeyPos ? activeKeyPos : home;
      const dx = target.x - home.x;
      const dy = target.y - home.y;
      const isLeft = fid[0] === 'l';

      return (
        <div
          key={fid}
          style={{
            position: 'absolute',
            left: home.x + KEY / 2 - 13,
            top: ROW_Y.home - 4,
            width: 26,
            height: 76,
            borderRadius: 13,
            background: isActive
              ? 'rgba(245,185,66,0.55)'
              : 'rgba(180,165,145,0.14)',
            border: isActive
              ? '1.5px solid rgba(245,185,66,0.85)'
              : '1px solid rgba(180,165,145,0.22)',
            transform: `translate(${dx}px, ${dy}px)`,
            transition: 'transform 240ms cubic-bezier(.4,0,.2,1), background 160ms, border 160ms',
            transformOrigin: '50% 100%',
            zIndex: isActive ? 6 : 2,
            pointerEvents: 'none',
          }}
        >
          {/* Active finger elliptical glow aura */}
          {isActive && (
            <svg
              width="46"
              height="66"
              viewBox="0 0 46 66"
              style={{
                position: 'absolute',
                left: -10,
                top: -14,
                overflow: 'visible',
              }}
            >
              <ellipse
                cx="23"
                cy="30"
                rx="16"
                ry="26"
                fill="none"
                stroke="#F5B942"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${isLeft ? -10 : 10} 23 30)`}
                style={{
                  strokeDasharray: 130,
                  strokeDashoffset: 0,
                  filter: 'drop-shadow(0 0 6px rgba(245,185,66,0.6))',
                }}
              />
            </svg>
          )}
        </div>
      );
    });
  };

  // Palm base layer from TypingGuide
  const renderPalm = (side: 'left' | 'right') => {
    const cols = side === 'left' ? [0, 1, 2, 3] : [6, 7, 8, 9];
    const xs = cols.map((c) => ROW_INDENT.home * UNIT + c * UNIT);
    const left = Math.min(...xs) - 6;
    const width = Math.max(...xs) - Math.min(...xs) + KEY + 12;
    return (
      <div
        style={{
          position: 'absolute',
          left,
          top: ROW_Y.bot + KEY + 8,
          width,
          height: 42,
          borderRadius: '40% 40% 50% 50%',
          background: 'rgba(180,165,145,0.08)',
          border: '1px solid rgba(180,165,145,0.14)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    );
  };

  return (
    <div className="w-full flex flex-col items-center select-none pt-1">
      {/* Active Finger & Key Instruction Banner */}
      <div className="h-7 flex items-center justify-center text-xs font-mono mb-2">
        {activeFingerInfo ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 animate-in fade-in duration-150 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold tracking-wide">{activeFingerInfo.label}</span>
            <span className="text-neutral-500">→</span>
            <span className="text-white font-bold bg-[#26201a] px-2 py-0.5 rounded border border-amber-500/40">
              {activeFingerInfo.keyText}
            </span>
          </div>
        ) : (
          <div className="text-neutral-500 text-[11px] font-mono">
            Home Row Position · A S D F &nbsp; J K L ;
          </div>
        )}
      </div>

      {/* Keyboard + Hands Wrapper — Scales dynamically to fit screen width */}
      <div
        ref={kbWrapRef}
        style={{
          width: '100%',
          maxWidth: '560px',
          height: kbSize.h * scale,
          overflow: 'visible',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          ref={kbInnerRef}
          style={{
            position: 'relative',
            width: 10 * UNIT - GAP + 40,
            height: ROW_Y.space + KEY + 24,
            margin: '0 auto',
            padding: '16px 20px 20px',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Palms */}
          {renderPalm('left')}
          {renderPalm('right')}

          {/* Hands and fingers */}
          {renderHandLayer()}

          {/* Keyboard Keys: 4 rows + Spacebar */}
          {ROW_NUM.map((k) => renderKeyCap(k, KEY_POS[k]))}
          {ROW_TOP.map((k) => renderKeyCap(k, KEY_POS[k]))}
          {ROW_HOME.map((k) => renderKeyCap(k, KEY_POS[k]))}
          {ROW_BOT.map((k) => renderKeyCap(k, KEY_POS[k]))}
          {renderKeyCap(' ', KEY_POS[' '], KEY)}
        </div>
      </div>

      {/* Hands Guide Label beneath keyboard */}
      <div className="flex items-center justify-between w-full max-w-[340px] text-[11px] text-neutral-400 font-mono mt-1 px-4">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
          <span>LEFT HAND</span>
        </span>
        <span className="text-neutral-600 text-[10px]">·</span>
        <span className="flex items-center gap-1.5">
          <span>RIGHT HAND</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
        </span>
      </div>
    </div>
  );
};
