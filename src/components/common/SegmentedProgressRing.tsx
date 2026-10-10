import React from 'react';

interface Props {
  totalSegments: number; // 2 to 5 rounds (or 1 for boss)
  completedSegments: number; // Finished rounds
  size?: number; // Size in px
  strokeWidth?: number;
  activeColor?: string; // CSS color or hex
  inactiveColor?: string;
  className?: string;
  isBoss?: boolean;
}

export const SegmentedProgressRing: React.FC<Props> = ({
  totalSegments,
  completedSegments,
  strokeWidth = 5,
  activeColor = '#F58CBA',
  inactiveColor = 'rgba(255, 255, 255, 0.14)',
  className = '',
  isBoss = false,
}) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89

  // If boss or single segment, render full smooth circle
  if (totalSegments <= 1 || isBoss) {
    const isDone = completedSegments >= 1;
    return (
      <svg
        className={`absolute -inset-2.5 w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none -rotate-90 z-10 ${className}`}
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={inactiveColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={isDone ? '#F5A623' : '#F58CBA'}
          strokeWidth={strokeWidth + 1}
          strokeDasharray={circumference}
          strokeDashoffset={isDone ? 0 : circumference}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    );
  }

  // Multi-segment ring for 2 to 5 rounds:
  // We divide circumference into N segments with a clean gap between segments
  const gapAnglePercent = 0.04; // 4% gap per segment
  const segmentSpanPercent = (1 - totalSegments * gapAnglePercent) / totalSegments;
  const segmentStrokeLength = segmentSpanPercent * circumference;

  const segments = Array.from({ length: totalSegments }, (_, i) => {
    const isCompleted = i < completedSegments;
    const isCurrent = i === completedSegments;
    const offset = i * (circumference / totalSegments);

    return (
      <circle
        key={i}
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={isCompleted ? activeColor : isCurrent ? 'rgba(245, 140, 186, 0.45)' : inactiveColor}
        strokeWidth={isCompleted ? strokeWidth + 1 : isCurrent ? strokeWidth : strokeWidth - 1}
        strokeDasharray={`${segmentStrokeLength} ${circumference - segmentStrokeLength}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        className={`transition-all duration-500 ${isCurrent ? 'animate-pulse' : ''}`}
      />
    );
  });

  return (
    <svg
      className={`absolute -inset-2.5 w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none -rotate-90 z-10 ${className}`}
      viewBox="0 0 100 100"
    >
      {segments}
    </svg>
  );
};
