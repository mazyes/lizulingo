import React from 'react';

export type MascotMood = 'happy' | 'sad' | 'celebrating' | 'explaining';

interface LiziMascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
  bubbleText?: string;
}

export const LiziMascot: React.FC<LiziMascotProps> = ({
  mood = 'happy',
  size = 140,
  className = '',
  bubbleText,
}) => {
  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Optional Speech Bubble */}
      {bubbleText && (
        <div className="mb-2 relative animate-bounce-subtle">
          <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-bold text-sm sm:text-base px-4 py-2 rounded-2xl shadow-md border-2 border-lizu-gray dark:border-gray-700 max-w-[220px] text-center">
            {bubbleText}
          </div>
          <div className="w-3 h-3 bg-white dark:bg-gray-800 border-r-2 border-b-2 border-lizu-gray dark:border-gray-700 transform rotate-45 mx-auto -mt-1.5" />
        </div>
      )}

      {/* Mascot SVG */}
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size ? `${size}px` : '100%', maxWidth: '100%', height: 'auto', aspectRatio: '1/1' }}
        className="transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="foxBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7AB8" />
            <stop offset="100%" stopColor="#F0388F" />
          </linearGradient>
          <linearGradient id="foxBelly" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF9F2" />
            <stop offset="100%" stopColor="#FFE7D0" />
          </linearGradient>
          <linearGradient id="earInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFB3B3" />
            <stop offset="100%" stopColor="#FF8F94" />
          </linearGradient>
          <linearGradient id="partyHat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFC800" />
            <stop offset="100%" stopColor="#FF4B4B" />
          </linearGradient>
        </defs>

        {/* Tail */}
        <path
          d={
            mood === 'celebrating'
              ? 'M115 110 C145 105 160 70 145 50 C130 35 110 65 112 90 Z'
              : mood === 'sad'
              ? 'M115 125 C135 135 145 140 140 150 C130 155 115 140 110 130 Z'
              : 'M115 115 C145 110 155 80 140 65 C125 55 115 85 112 100 Z'
          }
          fill="url(#foxBody)"
        />
        {/* Tail white tip */}
        <path
          d={
            mood === 'celebrating'
              ? 'M145 50 C148 45 140 38 132 42 C135 48 140 52 145 50 Z'
              : mood === 'sad'
              ? 'M140 150 C142 153 138 156 133 154 C134 150 138 148 140 150 Z'
              : 'M140 65 C145 60 138 52 128 58 C132 63 136 67 140 65 Z'
          }
          fill="#FFF9F2"
        />

        {/* Ears */}
        {mood === 'sad' ? (
          // Droopy ears
          <>
            <path d="M38 65 C22 68 15 88 28 92 C38 92 48 80 48 68 Z" fill="url(#foxBody)" />
            <path d="M34 70 C24 73 20 84 29 88 C36 88 42 79 42 72 Z" fill="url(#earInner)" />

            <path d="M122 65 C138 68 145 88 132 92 C122 92 112 80 112 68 Z" fill="url(#foxBody)" />
            <path d="M126 70 C136 73 140 84 131 88 C124 88 118 79 118 72 Z" fill="url(#earInner)" />
          </>
        ) : (
          // Alert cute ears
          <>
            <path d="M42 62 C32 30 52 15 65 35 C70 45 66 58 55 62 Z" fill="url(#foxBody)" />
            <path d="M46 54 C40 35 52 25 60 38 C63 45 60 52 53 54 Z" fill="url(#earInner)" />

            <path d="M118 62 C128 30 108 15 95 35 C90 45 94 58 105 62 Z" fill="url(#foxBody)" />
            <path d="M114 54 C120 35 108 25 100 38 C97 45 100 52 107 54 Z" fill="url(#earInner)" />
          </>
        )}

        {/* Body */}
        <ellipse cx="80" cy="115" rx="36" ry="32" fill="url(#foxBody)" />
        {/* White chest */}
        <ellipse cx="80" cy="118" rx="22" ry="24" fill="url(#foxBelly)" />

        {/* Head */}
        <circle cx="80" cy="72" r="38" fill="url(#foxBody)" />
        {/* Cheeks white patches */}
        <path d="M44 75 C44 95 62 104 80 104 C98 104 116 95 116 75 C108 85 92 88 80 88 C68 88 52 85 44 75 Z" fill="url(#foxBelly)" />

        {/* Blush */}
        <ellipse cx="58" cy="84" rx="6" ry="4" fill="#FF8F94" opacity="0.6" />
        <ellipse cx="102" cy="84" rx="6" ry="4" fill="#FF8F94" opacity="0.6" />

        {/* Eyes & Eyebrows */}
        {mood === 'happy' && (
          <>
            {/* Happy curved eyes (crescent) */}
            <path d="M62 70 Q69 63 76 70" stroke="#2D231E" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M84 70 Q91 63 98 70" stroke="#2D231E" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Sparkle highlights */}
            <circle cx="70" cy="63" r="1.5" fill="#FFF" />
            <circle cx="92" cy="63" r="1.5" fill="#FFF" />
          </>
        )}

        {mood === 'sad' && (
          <>
            {/* Droopy sad eyes */}
            <ellipse cx="68" cy="72" rx="4.5" ry="5.5" fill="#2D231E" />
            <ellipse cx="92" cy="72" rx="4.5" ry="5.5" fill="#2D231E" />
            <circle cx="66" cy="70" r="1.5" fill="#FFF" />
            <circle cx="90" cy="70" r="1.5" fill="#FFF" />
            {/* Tear */}
            <path d="M60 82 C58 87 64 87 62 82 Z" fill="#60A5FA" />
            {/* Sad eyebrows */}
            <path d="M60 63 Q67 67 74 65" stroke="#2D231E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M86 65 Q93 67 100 63" stroke="#2D231E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {mood === 'celebrating' && (
          <>
            {/* Wide sparkling starry/open eyes */}
            <ellipse cx="68" cy="70" rx="5.5" ry="6.5" fill="#2D231E" />
            <ellipse cx="92" cy="70" rx="5.5" ry="6.5" fill="#2D231E" />
            <circle cx="66" cy="67" r="2.5" fill="#FFF" />
            <circle cx="70" cy="72" r="1" fill="#FFF" />
            <circle cx="90" cy="67" r="2.5" fill="#FFF" />
            <circle cx="94" cy="72" r="1" fill="#FFF" />
            {/* Party Hat */}
            <polygon points="80,15 64,48 96,48" fill="url(#partyHat)" />
            <circle cx="80" cy="13" r="4.5" fill="#FFF9F2" />
            {/* Decorative hat stripes */}
            <line x1="72" y1="32" x2="88" y2="32" stroke="#FFF" strokeWidth="2.5" />
            <line x1="68" y1="40" x2="92" y2="40" stroke="#58CC02" strokeWidth="2.5" />
          </>
        )}

        {/* Snout and Nose */}
        <polygon points="76,82 84,82 80,87" fill="#2D231E" />

        {/* Mouth */}
        {mood === 'sad' ? (
          <path d="M75 95 Q80 90 85 95" stroke="#2D231E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : mood === 'celebrating' ? (
          <path d="M73 90 Q80 102 87 90 Z" fill="#E11D48" stroke="#2D231E" strokeWidth="2" strokeLinejoin="round" />
        ) : (
          <path d="M74 89 Q80 96 86 89" stroke="#2D231E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Paws */}
        {mood === 'celebrating' ? (
          <>
            {/* Paws raised in joy */}
            <circle cx="48" cy="85" r="9" fill="url(#foxBody)" />
            <circle cx="48" cy="85" r="5" fill="#2D231E" opacity="0.15" />
            <circle cx="112" cy="85" r="9" fill="url(#foxBody)" />
            <circle cx="112" cy="85" r="5" fill="#2D231E" opacity="0.15" />
          </>
        ) : (
          <>
            {/* Resting cozy paws */}
            <circle cx="62" cy="132" r="8" fill="#FFF9F2" stroke="url(#foxBody)" strokeWidth="2" />
            <circle cx="98" cy="132" r="8" fill="#FFF9F2" stroke="url(#foxBody)" strokeWidth="2" />
          </>
        )}
      </svg>
    </div>
  );
};
