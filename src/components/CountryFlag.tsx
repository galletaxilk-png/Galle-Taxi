import React from 'react';
import { CurrencyCode } from '../types';

interface CountryFlagProps {
  code: CurrencyCode | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ code, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-5 h-3.5',
    lg: 'w-6 h-4',
  }[size];

  switch (code) {
    case 'LKR':
      return (
        <svg
          viewBox="0 0 600 300"
          className={`shrink-0 rounded-[2px] shadow-sm overflow-hidden border border-black/25 ${sizeClasses} ${className}`}
          aria-label="Flag of Sri Lanka"
        >
          {/* Gold Outer Border */}
          <rect width="600" height="300" fill="#FFBE29" />
          {/* Green & Orange Hoist Stripes */}
          <rect x="25" y="25" width="60" height="250" fill="#005A36" />
          <rect x="85" y="25" width="60" height="250" fill="#EB7400" />
          {/* Maroon Main Field */}
          <rect x="170" y="25" width="405" height="250" fill="#8D153A" />
          {/* 4 Golden Bo Leaves */}
          <path d="M 195 45 C 190 60 200 70 215 65 C 205 55 210 40 195 45 Z" fill="#FFBE29" />
          <path d="M 195 255 C 190 240 200 230 215 235 C 205 245 210 260 195 255 Z" fill="#FFBE29" />
          <path d="M 550 45 C 555 60 545 70 530 65 C 540 55 535 40 550 45 Z" fill="#FFBE29" />
          <path d="M 550 255 C 555 240 545 230 530 235 C 540 245 535 260 550 255 Z" fill="#FFBE29" />
          {/* Sinhalese Lion holding sword */}
          <g fill="#FFBE29" transform="translate(250, 55) scale(0.95)">
            {/* Sword */}
            <path d="M 130 15 L 210 15 L 210 23 L 130 23 Z" />
            <path d="M 205 10 L 218 19 L 205 28 Z" />
            <circle cx="125" cy="19" r="6" />
            {/* Body */}
            <path d="M 50 120 C 30 110 30 60 70 50 C 90 20 130 20 150 45 C 170 40 185 55 180 75 C 190 85 185 105 170 115 C 180 140 160 160 130 150 C 100 160 70 150 50 120 Z" />
            <path d="M 55 120 L 45 165 L 65 165 L 75 130 Z" />
            <path d="M 125 130 L 135 165 L 155 165 L 145 125 Z" />
            <path d="M 45 90 C 20 70 15 30 40 20 C 45 35 30 55 45 70 Z" />
          </g>
        </svg>
      );

    case 'USD':
      return (
        <svg
          viewBox="0 0 741 390"
          className={`shrink-0 rounded-[2px] shadow-sm overflow-hidden border border-black/25 ${sizeClasses} ${className}`}
          aria-label="Flag of United States"
        >
          {/* 13 Stripes */}
          <rect width="741" height="390" fill="#B22234" />
          <path d="M0,30H741M0,90H741M0,150H741M0,210H741M0,270H741M0,330H741" stroke="#FFFFFF" strokeWidth="30" />
          {/* Blue Canton */}
          <rect width="296" height="210" fill="#3C3B6E" />
          {/* Star matrix */}
          <g fill="#FFFFFF">
            {[30, 80, 130, 180, 230].map((x) =>
              [25, 65, 105, 145, 185].map((y) => (
                <circle key={`us-s1-${x}-${y}`} cx={x} cy={y} r="6" />
              ))
            )}
            {[55, 105, 155, 205].map((x) =>
              [45, 85, 125, 165].map((y) => (
                <circle key={`us-s2-${x}-${y}`} cx={x} cy={y} r="5" />
              ))
            )}
          </g>
        </svg>
      );

    case 'EUR':
      return (
        <svg
          viewBox="0 0 810 540"
          className={`shrink-0 rounded-[2px] shadow-sm overflow-hidden border border-black/25 ${sizeClasses} ${className}`}
          aria-label="Flag of European Union"
        >
          {/* Blue Background */}
          <rect width="810" height="540" fill="#003399" />
          {/* Circle of 12 Stars */}
          <g fill="#FFCC00" transform="translate(405, 270)">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const radius = 135;
              const x = radius * Math.sin(angle);
              const y = -radius * Math.cos(angle);
              return <circle key={`eu-star-${i}`} cx={x} cy={y} r="14" />;
            })}
          </g>
        </svg>
      );

    case 'INR':
      return (
        <svg
          viewBox="0 0 900 600"
          className={`shrink-0 rounded-[2px] shadow-sm overflow-hidden border border-black/25 ${sizeClasses} ${className}`}
          aria-label="Flag of India"
        >
          {/* Saffron, White, Green Bands */}
          <rect width="900" height="200" fill="#FF9933" />
          <rect y="200" width="900" height="200" fill="#FFFFFF" />
          <rect y="400" width="900" height="200" fill="#138808" />
          {/* Ashoka Chakra */}
          <g transform="translate(450, 300)" stroke="#000080" fill="none">
            <circle r="75" strokeWidth="6" />
            <circle r="14" fill="#000080" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={`in-spoke-${i}`}
                x1="0"
                y1="0"
                x2={70 * Math.cos((i * 15 * Math.PI) / 180)}
                y2={70 * Math.sin((i * 15 * Math.PI) / 180)}
                strokeWidth="2.5"
              />
            ))}
          </g>
        </svg>
      );

    case 'GBP':
      return (
        <svg
          viewBox="0 0 600 300"
          className={`shrink-0 rounded-[2px] shadow-sm overflow-hidden border border-black/25 ${sizeClasses} ${className}`}
          aria-label="Flag of United Kingdom"
        >
          {/* Blue field */}
          <rect width="600" height="300" fill="#012169" />
          {/* White diagonal saltire */}
          <path d="M0,0 L600,300 M600,0 L0,300" stroke="#FFFFFF" strokeWidth="60" />
          {/* Red diagonal saltire */}
          <path d="M0,0 L600,300" stroke="#C8102E" strokeWidth="20" />
          <path d="M600,0 L0,300" stroke="#C8102E" strokeWidth="20" />
          {/* White cross */}
          <path d="M300,0 V300 M0,150 H600" stroke="#FFFFFF" strokeWidth="100" />
          {/* Red cross */}
          <path d="M300,0 V300 M0,150 H600" stroke="#C8102E" strokeWidth="60" />
        </svg>
      );

    case 'AUD':
      return (
        <svg
          viewBox="0 0 600 300"
          className={`shrink-0 rounded-[2px] shadow-sm overflow-hidden border border-black/25 ${sizeClasses} ${className}`}
          aria-label="Flag of Australia"
        >
          <rect width="600" height="300" fill="#00008B" />
          {/* Mini Union Jack canton */}
          <g transform="scale(0.5)">
            <rect width="600" height="300" fill="#012169" />
            <path d="M0,0 L600,300 M600,0 L0,300" stroke="#FFFFFF" strokeWidth="60" />
            <path d="M0,0 L600,300" stroke="#C8102E" strokeWidth="20" />
            <path d="M600,0 L0,300" stroke="#C8102E" strokeWidth="20" />
            <path d="M300,0 V300 M0,150 H600" stroke="#FFFFFF" strokeWidth="100" />
            <path d="M300,0 V300 M0,150 H600" stroke="#C8102E" strokeWidth="60" />
          </g>
          {/* Commonwealth Star */}
          <circle cx="150" cy="225" r="22" fill="#FFFFFF" />
          {/* Southern Cross stars */}
          <circle cx="450" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="490" cy="110" r="7" fill="#FFFFFF" />
          <circle cx="450" cy="230" r="10" fill="#FFFFFF" />
          <circle cx="410" cy="140" r="7" fill="#FFFFFF" />
          <circle cx="470" cy="160" r="5" fill="#FFFFFF" />
        </svg>
      );

    default:
      return (
        <div
          className={`shrink-0 rounded-[2px] bg-[#27272A] border border-[#3F3F46] flex items-center justify-center font-mono text-[9px] font-black text-[#F5B91B] uppercase ${sizeClasses} ${className}`}
          title={String(code)}
        >
          {String(code).slice(0, 2)}
        </div>
      );
  }
};
