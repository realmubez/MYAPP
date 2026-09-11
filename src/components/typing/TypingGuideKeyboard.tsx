import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  DeviceTier,
  ROW_NUM,
  ROW_TOP,
  ROW_HOME,
  ROW_BOT,
  CHAR_FINGER,
  FINGER_LABELS,
  getKeyboardGeometry,
} from './keyboardData';
import { KeyboardKey } from './KeyboardKey';
import { HandGuide } from './HandGuide';
import { FingerGuide } from './FingerGuide';

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
  const kbWrapRef = useRef<HTMLDivElement | null>(null);

  // Initial responsive tier detection
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.min(window.innerWidth - 32, 780);
    }
    return 500;
  });

  // Observe container width continuously to guarantee responsive fitting
  useEffect(() => {
    if (!kbWrapRef.current) return;
    const el = kbWrapRef.current;

    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setContainerWidth(w);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  // Determine device tier
  const tier: DeviceTier = useMemo(() => {
    if (containerWidth < 768) return 'mobile';
    if (containerWidth < 1024) return 'tablet';
    return 'desktop';
  }, [containerWidth]);

  // Centralized keyboard geometry for current tier
  const geo = useMemo(() => {
    return getKeyboardGeometry(tier);
  }, [tier]);

  // Scaled dimensions calculation:
  // Visible keyboard NEVER exceeds container width (accounting for safety margins)
  const scale = useMemo(() => {
    const horizontalPadding = tier === 'mobile' ? 8 : 16;
    const usableWidth = Math.max(260, containerWidth - horizontalPadding);
    const maxScale = tier === 'mobile' ? 1.0 : tier === 'tablet' ? 1.15 : 1.1;
    const calculatedScale = usableWidth / geo.naturalWidth;
    return Math.min(maxScale, calculatedScale);
  }, [containerWidth, geo.naturalWidth, tier]);

  // Allowed keys set for Day 1
  const allowedKeysSet = useMemo(() => {
    return new Set(allowedKeys.map((k) => k.toLowerCase()));
  }, [allowedKeys]);

  const normalizedNext = nextChar ? nextChar.toLowerCase() : null;
  const isSpace = normalizedNext === ' ';
  const activeFinger = normalizedNext
    ? isSpace
      ? 'thumb'
      : CHAR_FINGER[normalizedNext] || null
    : null;
  const activeKeyPos = normalizedNext ? geo.keyPos[normalizedNext] || null : null;

  // Active finger instruction banner
  const activeFingerInfo = useMemo(() => {
    if (!normalizedNext) return null;
    if (isSpace) {
      return {
        label: 'THUMB',
        handText: 'BOTH HANDS',
        keyText: 'SPACE',
        isSpace: true,
      };
    }
    const fid = CHAR_FINGER[normalizedNext];
    const info = fid ? FINGER_LABELS[fid] : null;
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

  // Measured wrapper dimensions: exactly match visible scaled size
  const scaledWidth = Math.round(geo.naturalWidth * scale);
  const scaledHeight = Math.round(geo.naturalHeight * scale);

  return (
    <div
      ref={kbWrapRef}
      className="w-full flex flex-col items-center select-none"
      style={{
        overflow: 'hidden',
        maxWidth: tier === 'desktop' ? '820px' : tier === 'tablet' ? '680px' : '100%',
      }}
    >
      {/* Active Finger & Key Instruction Banner */}
      <div className="h-7 sm:h-8 flex items-center justify-center text-xs font-mono mb-1.5 sm:mb-2">
        {activeFingerInfo ? (
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 animate-in fade-in duration-150 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold tracking-wide text-[11px] sm:text-xs">
              {activeFingerInfo.label}
            </span>
            <span className="text-neutral-500 text-[10px]">→</span>
            <span className="text-white font-bold bg-[#241e18] px-2 py-0.5 rounded border border-amber-500/40 text-[11px] sm:text-xs">
              {activeFingerInfo.keyText}
            </span>
          </div>
        ) : (
          <div className="text-neutral-500 text-[11px] font-mono">
            Home Row Position · A S D F &nbsp; J K L ;
          </div>
        )}
      </div>

      {/* Sized Wrapper Matching Visible Scaled Dimensions (Zero Horizontal Overflow) */}
      <div
        id="visual-keyboard-container"
        style={{
          width: scaledWidth,
          height: scaledHeight,
          position: 'relative',
          overflow: 'visible',
          flexShrink: 0,
        }}
      >
        {/* Unscaled Coordinate Stage with Exact scale() Transform */}
        <div
          style={{
            width: geo.naturalWidth,
            height: geo.naturalHeight,
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Hands and Palms */}
          <HandGuide geo={geo} isSpace={isSpace} tier={tier} />

          {/* 8 Fingers on Home Row */}
          <FingerGuide
            geo={geo}
            activeFinger={activeFinger}
            activeKeyPos={activeKeyPos}
            tier={tier}
          />

          {/* Number Row */}
          {ROW_NUM.map((k) => (
            <KeyboardKey
              key={k}
              label={k}
              pos={geo.keyPos[k]}
              isTargetKey={normalizedNext === k}
              isAllowed={allowedKeysSet.has(k)}
              isHomeRow={false}
              tier={tier}
              onClick={() => onKeyClick?.(k)}
            />
          ))}

          {/* Top Row (QWERTY) */}
          {ROW_TOP.map((k) => (
            <KeyboardKey
              key={k}
              label={k}
              pos={geo.keyPos[k]}
              isTargetKey={normalizedNext === k}
              isAllowed={allowedKeysSet.has(k)}
              isHomeRow={false}
              tier={tier}
              onClick={() => onKeyClick?.(k)}
            />
          ))}

          {/* Home Row (A-;) */}
          {ROW_HOME.map((k) => (
            <KeyboardKey
              key={k}
              label={k}
              pos={geo.keyPos[k]}
              isTargetKey={normalizedNext === k}
              isAllowed={allowedKeysSet.has(k)}
              isHomeRow={true}
              tier={tier}
              onClick={() => onKeyClick?.(k)}
            />
          ))}

          {/* Bottom Row (Z-/) */}
          {ROW_BOT.map((k) => (
            <KeyboardKey
              key={k}
              label={k}
              pos={geo.keyPos[k]}
              isTargetKey={normalizedNext === k}
              isAllowed={allowedKeysSet.has(k)}
              isHomeRow={false}
              tier={tier}
              onClick={() => onKeyClick?.(k)}
            />
          ))}

          {/* Spacebar */}
          <KeyboardKey
            label=" "
            pos={geo.keyPos[' ']}
            isTargetKey={normalizedNext === ' '}
            isAllowed={allowedKeysSet.has(' ')}
            isHomeRow={false}
            tier={tier}
            onClick={() => onKeyClick?.(' ')}
          />
        </div>
      </div>

      {/* Hands Guide Label beneath keyboard */}
      <div className="flex items-center justify-between w-full max-w-[320px] text-[10px] sm:text-[11px] text-neutral-500 font-mono mt-1.5 px-2">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
          <span>LEFT HAND</span>
        </span>
        <span className="text-neutral-700 text-[9px]">·</span>
        <span className="flex items-center gap-1.5">
          <span>RIGHT HAND</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
        </span>
      </div>
    </div>
  );
};
