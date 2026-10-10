import React from 'react';
import { Lesson } from '../../types/lesson';

interface Props {
  lessons: Lesson[];
  completedLessons: Record<string, { stars: number; completedAt?: string; date?: string } | undefined>;
  lessonRounds?: Record<string, number>;
  getHorizontalOffset: (idx: number) => number;
  unitColor: string;
}

export const PathConnectorTrack: React.FC<Props> = ({
  lessons,
  completedLessons,
  lessonRounds = {},
  getHorizontalOffset,
  unitColor,
}) => {
  if (lessons.length <= 1) return null;

  const nodeSpacing = 108; // px vertical distance between node centers
  const startY = 40; // center of first node
  const centerX = 150; // center of viewBox (viewBox="0 0 300 totalHeight")
  const totalHeight = (lessons.length - 1) * nodeSpacing + startY * 2;

  // Compute node center coordinates
  const points = lessons.map((l, idx) => ({
    x: centerX + getHorizontalOffset(idx),
    y: startY + idx * nodeSpacing,
    isCompleted: (lessonRounds[l.id] || 0) >= (l.rounds || (l.isBoss ? 1 : 3)) || !!completedLessons[l.id],
  }));

  const getStrokeColor = () => {
    switch (unitColor) {
      case 'green': return '#10B981';
      case 'blue': return '#3B82F6';
      case 'purple': return '#A855F7';
      case 'teal': return '#14B8A6';
      case 'amber': return '#F59E0B';
      case 'rose': return '#F43F5E';
      default: return '#10B981';
    }
  };

  return (
    <svg
      className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none w-[300px] z-0 overflow-visible"
      height={totalHeight}
      viewBox={`0 0 300 ${totalHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`grad-${unitColor}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={getStrokeColor()} stopOpacity="0.9" />
          <stop offset="100%" stopColor={getStrokeColor()} stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Render curved segments connecting each pair of nodes */}
      {points.map((p, i) => {
        if (i === points.length - 1) return null;
        const nextP = points[i + 1];
        const cpY1 = p.y + nodeSpacing * 0.5;
        const cpY2 = nextP.y - nodeSpacing * 0.5;
        const d = `M ${p.x} ${p.y} C ${p.x} ${cpY1}, ${nextP.x} ${cpY2}, ${nextP.x} ${nextP.y}`;
        const isSegmentDone = p.isCompleted && nextP.isCompleted;

        return (
          <React.Fragment key={i}>
            {/* Background dashed track */}
            <path
              d={d}
              stroke="currentColor"
              className="text-gray-300/60 dark:text-gray-700/60"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="6 8"
            />
            {/* Completed active glow track */}
            {isSegmentDone && (
              <path
                d={d}
                stroke={`url(#grad-${unitColor})`}
                strokeWidth="8"
                strokeLinecap="round"
                className="transition-all duration-700 shadow-sm"
              />
            )}
          </React.Fragment>
        );
      })}
    </svg>
  );
};
