import React from 'react';
import { KeyboardGeometry, DeviceTier } from './keyboardData';

interface HandGuideProps {
  geo: KeyboardGeometry;
  isSpace: boolean;
  tier: DeviceTier;
}

export const HandGuide: React.FC<HandGuideProps> = ({ geo, isSpace, tier }) => {
  const isMobile = tier === 'mobile';

  return (
    <div className="hand-guide-layer pointer-events-none select-none">
      {/* Left Palm Base */}
      <div
        style={{
          position: 'absolute',
          left: geo.palmLeft.x,
          top: geo.palmLeft.y,
          width: geo.palmLeft.w,
          height: geo.palmLeft.h,
          borderRadius: isMobile ? '20px 20px 28px 28px' : '24px 24px 36px 36px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
          zIndex: 1,
        }}
      />

      {/* Right Palm Base */}
      <div
        style={{
          position: 'absolute',
          left: geo.palmRight.x,
          top: geo.palmRight.y,
          width: geo.palmRight.w,
          height: geo.palmRight.h,
          borderRadius: isMobile ? '20px 20px 28px 28px' : '24px 24px 36px 36px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
          zIndex: 1,
        }}
      />

      {/* Left Thumb (Angled toward spacebar) */}
      <div
        style={{
          position: 'absolute',
          left: geo.thumbLeft.x,
          top: geo.thumbLeft.y,
          width: geo.thumbLeft.w,
          height: geo.thumbLeft.h,
          borderRadius: '10px 10px 8px 8px',
          transform: `rotate(${geo.thumbLeft.angle}deg)`,
          transformOrigin: 'bottom left',
          background: isSpace
            ? 'rgba(245, 185, 66, 0.45)'
            : 'rgba(255, 255, 255, 0.04)',
          border: isSpace
            ? '1.5px solid #F5B942'
            : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isSpace
            ? '0 0 12px rgba(245, 185, 66, 0.55), inset 0 0 6px rgba(245, 185, 66, 0.3)'
            : 'none',
          transition:
            'background 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
          zIndex: isSpace ? 5 : 2,
        }}
      />

      {/* Right Thumb (Angled toward spacebar) */}
      <div
        style={{
          position: 'absolute',
          left: geo.thumbRight.x,
          top: geo.thumbRight.y,
          width: geo.thumbRight.w,
          height: geo.thumbRight.h,
          borderRadius: '10px 10px 8px 8px',
          transform: `rotate(${geo.thumbRight.angle}deg)`,
          transformOrigin: 'bottom right',
          background: isSpace
            ? 'rgba(245, 185, 66, 0.45)'
            : 'rgba(255, 255, 255, 0.04)',
          border: isSpace
            ? '1.5px solid #F5B942'
            : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isSpace
            ? '0 0 12px rgba(245, 185, 66, 0.55), inset 0 0 6px rgba(245, 185, 66, 0.3)'
            : 'none',
          transition:
            'background 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
          zIndex: isSpace ? 5 : 2,
        }}
      />
    </div>
  );
};
