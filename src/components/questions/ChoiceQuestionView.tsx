import React from 'react';
import { ChoiceQuestion } from '../../types/lesson';
import { AnalogClock } from '../common/AnalogClock';
import { Volume2 } from 'lucide-react';
import { tts } from '../../utils/tts';
import { sound } from '../../utils/sound';

interface Props {
  question: ChoiceQuestion;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  disabled?: boolean;
}

export const ChoiceQuestionView: React.FC<Props> = ({
  question,
  selectedAnswer,
  onSelect,
  disabled,
}) => {
  const hasVoice = tts.hasGermanVoice();

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {/* Question Header & Prompt */}
      <div className="flex flex-col gap-2">
        {question.georgianHint && (
          <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
            {question.georgianHint}
          </span>
        )}
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
            {question.prompt}
          </h2>
          {hasVoice && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                tts.speak(question.audioText || question.prompt);
              }}
              className="p-2 rounded-xl bg-lizu-blue/10 text-lizu-blue hover:bg-lizu-blue/20 transition-colors"
              title="გერმანულად მოსმენა"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Analog Clock visual if available */}
      {question.clockTime && (
        <div className="my-2 flex justify-center">
          <AnalogClock hour={question.clockTime.hour} minute={question.clockTime.minute} />
        </div>
      )}

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => {
                sound.playClick();
                onSelect(option);
              }}
              className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-base sm:text-lg transition-all flex items-center justify-between border-2 border-b-4 ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-lizu-blue border-b-lizu-blue-dark text-lizu-blue shadow-sm'
                  : 'bg-white dark:bg-gray-800 border-lizu-gray dark:border-gray-700 border-b-lizu-gray-dark dark:border-b-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750'
              } ${disabled ? 'cursor-not-allowed opacity-90' : 'active:translate-y-0.5 active:border-b-2'}`}
            >
              <span>{option}</span>
              <span
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                  isSelected
                    ? 'border-lizu-blue bg-lizu-blue text-white'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
