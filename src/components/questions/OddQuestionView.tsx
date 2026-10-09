import React from 'react';
import { OddQuestion } from '../../types/lesson';
import { sound } from '../../utils/sound';

interface Props {
  question: OddQuestion;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export const OddQuestionView: React.FC<Props> = ({
  question,
  selectedIndex,
  onSelect,
  disabled,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-lizu-orange">
          გამონაკლისის პოვნა
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          {question.prompt || 'რომელი არ ერგება?'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          იპოვეთ ერთი სიტყვა ან გამოთქმა, რომელიც არ ეკუთვნის ამ ჯგუფს:
        </p>
      </div>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {question.options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => {
                sound.playClick();
                onSelect(idx);
              }}
              className={`p-5 rounded-2xl font-black text-center text-lg sm:text-xl border-2 border-b-4 transition-all tracking-wide ${
                isSelected
                  ? 'bg-orange-50 dark:bg-orange-950/40 border-lizu-orange border-b-lizu-orange-dark text-lizu-orange shadow-sm'
                  : 'bg-white dark:bg-gray-800 border-lizu-gray dark:border-gray-700 border-b-lizu-gray-dark dark:border-b-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750'
              } ${disabled ? 'cursor-not-allowed opacity-90' : 'active:translate-y-0.5 active:border-b-2'}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
