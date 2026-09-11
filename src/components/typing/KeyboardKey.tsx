import React from 'react';
import { DeviceTier, KeyItemPos } from './keyboardData';

interface KeyboardKeyProps {
  label: string;
  pos: KeyItemPos;
  isTargetKey: boolean;
  isAllowed: boolean;
  isHomeRow: boolean;
  tier: DeviceTier;
  onClick?: () => void;
}

export const KeyboardKey: React.FC<KeyboardKeyProps> = ({
  label,
  pos,
  isTargetKey,
  isAllowed,
  isHomeRow,
  tier,
  onClick,
}) => {
  const isSpace = label === ' ';
  const hasTactileBump = label === 'f' || label === 'j';

  // Responsive typography
  const fontSize = isSpace
    ? tier === 'mobile'
      ? 10
      : tier === 'tablet'
      ? 11
      : 12
    : tier === 'mobile'
    ? 12.5
    : tier === 'tablet'
    ? 14
    : 15;

  const borderRadius = tier === 'mobile' ? 7 : tier === 'tablet' ? 8 : 9;

  // Visual styling priority:
  // 1. Target key (Amber highlight with radiant glow)
  // 2. Allowed Day 1 keys (Prominent readable neutral)
  // 3. Home row untaught keys (Slightly discernible)
  // 4. Other untaught keys (Dark muted context)
  let bg = '#12100e';
  let color = '#443e37';
  let border = '1px solid #1c1815';
  let boxShadow = '0 1px 0 rgba(255,255,255,0.02) inset';
  let zIndex = 3;

  if (isTargetKey) {
    bg = '#F5B942';
    color = '#0F1115';
    border = '1px solid #F5B942';
    boxShadow =
      '0 0 0 3px rgba(245,185,66,0.35), 0 2px 10px rgba(0,0,0,0.6), 0 0 16px rgba(245,185,66,0.5)';
    zIndex = 10;
  } else if (isAllowed) {
    bg = '#201b16';
    color = '#f5efe6';
    border = '1px solid #383027';
    boxShadow = '0 1px 2px rgba(0,0,0,0.35)';
    zIndex = 4;
  } else if (isHomeRow) {
    bg = '#161311';
    color = '#5e564d';
    border = '1px solid #231e1a';
  }

  return (
    <div
      role="button"
      tabIndex={isAllowed ? 0 : -1}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
      aria-label={`Key ${isSpace ? 'Space' : label.toUpperCase()}${
        isTargetKey ? ' - active expected key' : ''
      }`}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: pos.w,
        height: pos.h,
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: isTargetKey || isAllowed ? 600 : 500,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        color,
        background: bg,
        border,
        boxShadow,
        transition:
          'background 120ms ease, box-shadow 120ms ease, color 120ms ease, border 120ms ease, transform 100ms ease',
        zIndex,
        cursor: isAllowed ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <span>{isSpace ? 'space' : label.toUpperCase()}</span>

      {/* Tactile home bump indicators on F and J */}
      {hasTactileBump && (
        <div
          style={{
            position: 'absolute',
            bottom: tier === 'mobile' ? 3.5 : 4.5,
            left: '50%',
            transform: 'translateX(-50%)',
            width: tier === 'mobile' ? 11 : 13,
            height: 2.5,
            borderRadius: 2,
            background: isTargetKey ? '#0F1115' : '#F5B942',
            boxShadow: isTargetKey ? 'none' : '0 0 4px rgba(245,185,66,0.6)',
            transition: 'background 120ms ease',
          }}
        />
      )}
    </div>
  );
};
