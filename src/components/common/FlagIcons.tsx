import React from 'react';

interface FlagIconProps {
  className?: string;
  size?: number;
}

export function SwedishFlagIcon({ className = '', size = 44 }: FlagIconProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden shadow-md flex-shrink-0 bg-neutral-900 border border-neutral-800 p-2 ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="w-full shrink-0 overflow-hidden rounded-[3px] shadow-sm border border-white/15">
        <svg
          viewBox="0 0 16 10"
          className="w-full h-auto block"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blue background */}
          <rect width="16" height="10" fill="#006aa7" />
          {/* Yellow cross vertical */}
          <rect x="5" width="2" height="10" fill="#fecc00" />
          {/* Yellow cross horizontal */}
          <rect y="4" width="16" height="2" fill="#fecc00" />
          {/* Subtle 3D shine overlay */}
          <linearGradient id="flag-shine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
          </linearGradient>
          <rect width="16" height="10" fill="url(#flag-shine)" />
        </svg>
      </div>
    </div>
  );
}

export function BritishFlagIcon({ className = '', size = 44 }: FlagIconProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden shadow-md flex-shrink-0 bg-neutral-900 border border-neutral-800 p-2 ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="w-full shrink-0 overflow-hidden rounded-[3px] shadow-sm border border-white/15">
        <svg
          viewBox="0 0 60 30"
          className="w-full h-auto block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <clipPath id="gb-s">
            <path d="M0,0 v30 h60 v-30 z" />
          </clipPath>
          <clipPath id="gb-t">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <g clipPath="url(#gb-s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path
              d="M0,0 L60,30 M60,0 L0,30"
              clipPath="url(#gb-t)"
              stroke="#C8102E"
              strokeWidth="4"
            />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
          </g>
          <linearGradient id="gb-shine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
          </linearGradient>
          <rect width="60" height="30" fill="url(#gb-shine)" />
        </svg>
      </div>
    </div>
  );
}

export function PythonLogoIcon({ className = '', size = 44 }: FlagIconProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden shadow-md flex-shrink-0 bg-neutral-900 border border-neutral-800 p-2 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 110 110"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M54.2 2c-26.6 0-25 11.5-25 11.5l.1 11.9h25.4v3.6H19.2S2 27.2 2 54.1c0 26.9 15 26 15 26h8.9v-12.5s-.5-14.9 14.7-14.9h25.2s14.2-.2 14.2-13.8V15.7S81.8 2 54.2 2zM40.1 9.7c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5z"
          fill="#3776ab"
        />
        <path
          d="M55.8 108c26.6 0 25-11.5 25-11.5l-.1-11.9H55.3V81h35.5s17.2 1.8 17.2-25.1c0-26.9-15-26-15-26h-8.9v12.5s.5 14.9-14.7 14.9H44.2s-14.2.2-14.2 13.8v13.2S28.2 108 55.8 108zm14.1-7.7c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"
          fill="#ffd43b"
        />
      </svg>
    </div>
  );
}
