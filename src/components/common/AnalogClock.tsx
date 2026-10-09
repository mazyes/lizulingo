import React from 'react';

interface AnalogClockProps {
  hour: number;
  minute: number;
  size?: number;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ hour, minute, size = 160 }) => {
  // 360 degrees / 12 hours = 30 deg per hour + 0.5 deg per minute
  const hourDeg = (hour % 12) * 30 + minute * 0.5;
  // 360 degrees / 60 minutes = 6 deg per minute
  const minuteDeg = minute * 6;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="drop-shadow-md select-none"
      >
        {/* Outer Ring & Face */}
        <circle cx="50" cy="50" r="46" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="4" />
        <circle cx="50" cy="50" r="44" fill="#F8FAFC" />

        {/* Hour Ticks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
          const isMain = deg % 90 === 0;
          return (
            <line
              key={deg}
              x1="50"
              y1={isMain ? "12" : "10"}
              x2="50"
              y2="16"
              stroke="#64748B"
              strokeWidth={isMain ? "2.5" : "1.5"}
              strokeLinecap="round"
              transform={`rotate(${deg} 50 50)`}
            />
          );
        })}

        {/* Hour Numbers 12, 3, 6, 9 */}
        <text x="50" y="24" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#334155">12</text>
        <text x="80" y="53" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#334155">3</text>
        <text x="50" y="82" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#334155">6</text>
        <text x="20" y="53" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#334155">9</text>

        {/* Hour Hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="28"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinecap="round"
          transform={`rotate(${hourDeg} 50 50)`}
        />

        {/* Minute Hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="18"
          stroke="#1CB0F6"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${minuteDeg} 50 50)`}
        />

        {/* Center Pivot Pin */}
        <circle cx="50" cy="50" r="3.5" fill="#E11D48" />
        <circle cx="50" cy="50" r="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
