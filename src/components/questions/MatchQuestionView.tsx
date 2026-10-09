import React, { useState, useEffect } from 'react';
import { MatchQuestion, MatchPair } from '../../types/lesson';
import { sound } from '../../utils/sound';
import { Check } from 'lucide-react';

interface Props {
  question: MatchQuestion;
  onAllMatched: () => void;
  disabled?: boolean;
}

export const MatchQuestionView: React.FC<Props> = ({
  question,
  onAllMatched,
  disabled,
}) => {
  // Left items in order, Right items shuffled
  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // stores matched left items
  const [wrongShake, setWrongShake] = useState<{ left: string; right: string } | null>(null);

  // Initialize and shuffle right column
  useEffect(() => {
    const lefts = question.pairs.map(p => p.left);
    const rights = question.pairs.map(p => p.right).sort(() => Math.random() - 0.5);
    setLeftItems(lefts);
    setRightItems(rights);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
  }, [question]);

  const checkMatch = (left: string, right: string) => {
    const match = question.pairs.find((p: MatchPair) => p.left === left && p.right === right);
    if (match) {
      // Correct!
      sound.playCorrect();
      const updated = [...matchedPairs, left];
      setMatchedPairs(updated);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (updated.length === question.pairs.length) {
        setTimeout(() => {
          onAllMatched();
        }, 500);
      }
    } else {
      // Wrong!
      sound.playWrong();
      setWrongShake({ left, right });
      setTimeout(() => {
        setWrongShake(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  const handleLeftClick = (item: string) => {
    if (disabled || matchedPairs.includes(item) || wrongShake) return;
    sound.playClick();

    if (selectedRight) {
      checkMatch(item, selectedRight);
    } else {
      setSelectedLeft(selectedLeft === item ? null : item);
    }
  };

  const handleRightClick = (item: string) => {
    const isMatched = question.pairs.some(p => p.right === item && matchedPairs.includes(p.left));
    if (disabled || isMatched || wrongShake) return;
    sound.playClick();

    if (selectedLeft) {
      checkMatch(selectedLeft, item);
    } else {
      setSelectedRight(selectedRight === item ? null : item);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-lizu-purple">
          დააკავშირეთ წყვილები
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          {question.title || 'შეაერთეთ შესატყვისი სიტყვები:'}
        </h2>
        {question.georgianHint && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {question.georgianHint}
          </p>
        )}
      </div>

      {/* Two Columns Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Left Column */}
        <div className="flex flex-col gap-2.5">
          {leftItems.map((item, idx) => {
            const isMatched = matchedPairs.includes(item);
            const isSelected = selectedLeft === item;
            const isShaking = wrongShake?.left === item;

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled || isMatched}
                onClick={() => handleLeftClick(item)}
                className={`w-full min-h-[56px] px-3 py-2.5 rounded-2xl font-bold text-sm sm:text-base text-center border-2 border-b-4 transition-all flex items-center justify-center gap-1.5 ${
                  isMatched
                    ? 'bg-green-50 dark:bg-green-950/40 border-lizu-green border-b-lizu-green-dark text-lizu-green opacity-80 cursor-default'
                    : isShaking
                    ? 'bg-red-50 dark:bg-red-950/40 border-lizu-red border-b-lizu-red-dark text-lizu-red animate-shake'
                    : isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-lizu-blue border-b-lizu-blue-dark text-lizu-blue scale-102'
                    : 'bg-white dark:bg-gray-800 border-lizu-gray dark:border-gray-700 border-b-lizu-gray-dark dark:border-b-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                <span>{item}</span>
                {isMatched && <Check className="w-4 h-4 text-lizu-green flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-2.5">
          {rightItems.map((item, idx) => {
            const isMatched = question.pairs.some(p => p.right === item && matchedPairs.includes(p.left));
            const isSelected = selectedRight === item;
            const isShaking = wrongShake?.right === item;

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled || isMatched}
                onClick={() => handleRightClick(item)}
                className={`w-full min-h-[56px] px-3 py-2.5 rounded-2xl font-bold text-sm sm:text-base text-center border-2 border-b-4 transition-all flex items-center justify-center gap-1.5 ${
                  isMatched
                    ? 'bg-green-50 dark:bg-green-950/40 border-lizu-green border-b-lizu-green-dark text-lizu-green opacity-80 cursor-default'
                    : isShaking
                    ? 'bg-red-50 dark:bg-red-950/40 border-lizu-red border-b-lizu-red-dark text-lizu-red animate-shake'
                    : isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-lizu-blue border-b-lizu-blue-dark text-lizu-blue scale-102'
                    : 'bg-white dark:bg-gray-800 border-lizu-gray dark:border-gray-700 border-b-lizu-gray-dark dark:border-b-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                <span>{item}</span>
                {isMatched && <Check className="w-4 h-4 text-lizu-green flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
