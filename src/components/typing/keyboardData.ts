export type DeviceTier = 'mobile' | 'tablet' | 'desktop';

export const ROW_NUM = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
export const ROW_TOP = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
export const ROW_HOME = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
export const ROW_BOT = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

// Finger ID -> Home Key
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

// Character -> Finger ID
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

export const FINGER_LABELS: Record<
  string,
  { name: string; hand: 'left' | 'right'; fingerName: string }
> = {
  lp: { name: 'LEFT PINKY', hand: 'left', fingerName: 'Pinky' },
  lr: { name: 'LEFT RING', hand: 'left', fingerName: 'Ring' },
  lm: { name: 'LEFT MIDDLE', hand: 'left', fingerName: 'Middle' },
  li: { name: 'LEFT INDEX', hand: 'left', fingerName: 'Index' },
  ri: { name: 'RIGHT INDEX', hand: 'right', fingerName: 'Index' },
  rm: { name: 'RIGHT MIDDLE', hand: 'right', fingerName: 'Middle' },
  rr: { name: 'RIGHT RING', hand: 'right', fingerName: 'Ring' },
  rp: { name: 'RIGHT PINKY', hand: 'right', fingerName: 'Pinky' },
};

export interface KeyItemPos {
  x: number;
  y: number;
  w: number;
  h: number;
  col?: number;
}

export interface KeyboardGeometry {
  tier: DeviceTier;
  keySize: number;
  gap: number;
  unit: number;
  paddingX: number;
  paddingY: number;
  naturalWidth: number;
  naturalHeight: number;
  keyPos: Record<string, KeyItemPos>;
  palmLeft: { x: number; y: number; w: number; h: number };
  palmRight: { x: number; y: number; w: number; h: number };
  thumbLeft: { x: number; y: number; w: number; h: number; angle: number };
  thumbRight: { x: number; y: number; w: number; h: number; angle: number };
}

/**
 * Calculates deterministic geometry for each responsive tier:
 * - Mobile: compact 38px key, 4.5px gap, 494px natural width
 * - Tablet: balanced 46px key, 6px gap, 608px natural width
 * - Desktop: generous 50px key, 7px gap, 668px natural width
 */
export function getKeyboardGeometry(tier: DeviceTier): KeyboardGeometry {
  const isMobile = tier === 'mobile';
  const isTablet = tier === 'tablet';

  const keySize = isMobile ? 38 : isTablet ? 46 : 50;
  const gap = isMobile ? 4.5 : isTablet ? 6 : 7;
  const unit = keySize + gap;
  const paddingX = isMobile ? 10 : isTablet ? 14 : 18;
  const paddingY = isMobile ? 8 : isTablet ? 12 : 14;

  const rowIndent = {
    num: 0,
    top: 0.5,
    home: 0.75,
    bot: 1.25,
  };

  const rowY = {
    num: paddingY,
    top: paddingY + unit,
    home: paddingY + unit * 2,
    bot: paddingY + unit * 3,
    space: paddingY + unit * 4,
  };

  const keyPos: Record<string, KeyItemPos> = {};

  // Row 1: Numbers
  ROW_NUM.forEach((k, i) => {
    keyPos[k] = {
      x: paddingX + rowIndent.num * unit + i * unit,
      y: rowY.num,
      w: keySize,
      h: keySize,
      col: i,
    };
  });

  // Row 2: Top (Q-P)
  ROW_TOP.forEach((k, i) => {
    keyPos[k] = {
      x: paddingX + rowIndent.top * unit + i * unit,
      y: rowY.top,
      w: keySize,
      h: keySize,
      col: i,
    };
  });

  // Row 3: Home (A-;)
  ROW_HOME.forEach((k, i) => {
    keyPos[k] = {
      x: paddingX + rowIndent.home * unit + i * unit,
      y: rowY.home,
      w: keySize,
      h: keySize,
      col: i,
    };
  });

  // Row 4: Bottom (Z-/)
  ROW_BOT.forEach((k, i) => {
    keyPos[k] = {
      x: paddingX + rowIndent.bot * unit + i * unit,
      y: rowY.bot,
      w: keySize,
      h: keySize,
      col: i,
    };
  });

  // Row 5: Spacebar — centered under home row keys
  // Spans roughly 5 units
  const spaceX = paddingX + rowIndent.home * unit + 2 * unit;
  const spaceW = unit * 5 - gap;
  keyPos[' '] = {
    x: spaceX,
    y: rowY.space,
    w: spaceW,
    h: keySize,
  };

  // Find natural bounding box of keys
  let maxKeyX = 0;
  Object.values(keyPos).forEach((p) => {
    if (p.x + p.w > maxKeyX) maxKeyX = p.x + p.w;
  });

  const naturalWidth = Math.ceil(maxKeyX + paddingX);

  // Palms positioning:
  // Left palm sits beneath columns A, S, D, F and Z, X, C, V
  const leftColStart = keyPos['a'].x - 4;
  const leftColEnd = keyPos['f'].x + keySize + 4;
  const palmW = leftColEnd - leftColStart;
  const palmY = rowY.bot + keySize + (isMobile ? 8 : 12);
  const palmH = isMobile ? 40 : 46;

  const palmLeft = {
    x: leftColStart,
    y: palmY,
    w: palmW,
    h: palmH,
  };

  // Right palm sits beneath columns J, K, L, ; and M, ,, ., /
  const rightColStart = keyPos['j'].x - 4;
  const rightColEnd = keyPos[';'].x + keySize + 4;
  const palmRight = {
    x: rightColStart,
    y: palmY,
    w: palmW,
    h: palmH,
  };

  // Thumbs angling from palm inner edges toward the spacebar
  const thumbW = isMobile ? 18 : 22;
  const thumbH = isMobile ? 26 : 30;

  const thumbLeft = {
    x: leftColEnd - (isMobile ? 12 : 14),
    y: rowY.space - 2,
    w: thumbW,
    h: thumbH,
    angle: 32,
  };

  const thumbRight = {
    x: rightColStart - (isMobile ? 6 : 8),
    y: rowY.space - 2,
    w: thumbW,
    h: thumbH,
    angle: -32,
  };

  const naturalHeight = Math.ceil(palmY + palmH + (isMobile ? 6 : 10));

  return {
    tier,
    keySize,
    gap,
    unit,
    paddingX,
    paddingY,
    naturalWidth,
    naturalHeight,
    keyPos,
    palmLeft,
    palmRight,
    thumbLeft,
    thumbRight,
  };
}
