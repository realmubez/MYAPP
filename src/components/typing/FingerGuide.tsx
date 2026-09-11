import React from 'react';
import {
  KeyboardGeometry,
  DeviceTier,
  FINGER_ORDER,
  FINGER_HOME,
  KeyItemPos,
} from './keyboardData';

interface FingerGuideProps {
  geo: KeyboardGeometry;
  activeFinger: string | null;
  activeKeyPos: KeyItemPos | null;
  tier: DeviceTier;
}

export const FingerGuide: React.FC<FingerGuideProps> = ({
  geo,
  activeFinger,
  activeKeyPos,
  tier,
}) => {
  const isMobile = tier === 'mobile';
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="finger-guide-layer pointer-events-none select-none">
      {FINGER_ORDER.map((fid) => {
        const homeChar = FINGER_HOME[fid];
        const homeKey = geo.keyPos[homeChar];
        if (!homeKey) return null;

        const isActive = fid === activeFinger;
        const isLeft = fid.startsWith('l');

        // Finger width calculation based on anatomy
        const fingerW = fid.endsWith('p')
          ? geo.keySize * 0.5
          : fid.endsWith('m')
          ? geo.keySize * 0.58
          : geo.keySize * 0.54;

        // Origin at home key column
        const startX = homeKey.x + homeKey.w / 2 - fingerW / 2;
        // Fingertip rests touching/overlapping the home keycap
        const startY = homeKey.y + homeKey.h * 0.22;
        // Finger extends down into the palm base seamlessly
        const palmAnchorY =
          (isLeft ? geo.palmLeft.y : geo.palmRight.y) + (isMobile ? 16 : 22);
        const fingerH = Math.max(48, palmAnchorY - startY);

        // Active key translation
        const target = isActive && activeKeyPos ? activeKeyPos : homeKey;
        const dx = target.x - homeKey.x;
        const dy = target.y - homeKey.y;

        const transition = prefersReducedMotion
          ? 'none'
          : 'transform 200ms cubic-bezier(0.2, 0, 0, 1), background 180ms ease, border-color 180ms ease, box-shadow 180ms ease';

        return (
          <div
            key={fid}
            data-finger={fid}
            style={{
              position: 'absolute',
              left: startX,
              top: startY,
              width: fingerW,
              height: fingerH,
              borderRadius: isMobile ? 10 : 12,
              background: isActive
                ? 'rgba(245, 185, 66, 0.42)'
                : 'rgba(255, 255, 255, 0.04)',
              border: isActive
                ? '1.5px solid #F5B942'
                : '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: isActive
                ? '0 0 14px rgba(245, 185, 66, 0.55), inset 0 0 8px rgba(245, 185, 66, 0.25)'
                : 'none',
              transform: `translate(${dx}px, ${dy}px)`,
              transformOrigin: '50% 100%',
              transition,
              zIndex: isActive ? 6 : 2,
            }}
          >
            {/* Active Finger Target Elliptical Aura */}
            {isActive && (
              <svg
                width={isMobile ? 38 : 44}
                height={isMobile ? 48 : 56}
                viewBox="0 0 44 56"
                style={{
                  position: 'absolute',
                  left: isMobile ? -6 : -8,
                  top: isMobile ? -10 : -14,
                  overflow: 'visible',
                  pointerEvents: 'none',
                }}
              >
                <ellipse
                  cx="22"
                  cy="26"
                  rx={isMobile ? 15 : 18}
                  ry={isMobile ? 21 : 25}
                  fill="none"
                  stroke="#F5B942"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${isLeft ? -10 : 10} 22 26)`}
                  style={{
                    strokeDasharray: 120,
                    strokeDashoffset: 0,
                    filter: 'drop-shadow(0 0 6px rgba(245,185,66,0.65))',
                  }}
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};
