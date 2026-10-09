import React from 'react';
import { TrueFalseQuestion } from '../../types/lesson';
import { Check, X, Volume2 } from 'lucide-react';
import { tts } from '../../utils/tts';
import { sound } from '../../utils/sound';

interface Props {
  question: TrueFalseQuestion;
  selectedAnswer: boolean | null;
  onSelect: (answer: boolean) => void;
  disabled?: boolean;
}

export const TrueFalseQuestionView: React.FC<Props> = ({
  question,
  selectedAnswer,
  onSelect,
  disabled,
}) => {
  const hasVoice = tts.hasGermanVoice();

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {/* Optional Context Box */}
      {question.dialogContext && question.dialogContext.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
            დიალოგის ნაწყვეტი:
          </span>
          {question.dialogContext.map((line, i) => (
            <p key={i} className="text-sm font-medium text-gray-700 dark:text-gray-300 italic">
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Georgian Hint */}
      {question.georgianHint && (
        <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
          {question.georgianHint}
        </span>
      )}

      {/* Statement Card */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border-2 border-lizu-gray dark:border-gray-700 shadow-sm flex items-center justify-between gap-4">
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          "{question.statement}"
        </p>
        {hasVoice && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              tts.speak(question.statement);
            }}
            className="p-2.5 rounded-xl bg-lizu-blue/10 text-lizu-blue hover:bg-lizu-blue/20 flex-shrink-0"
            title="მოსმენა"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="text-center font-bold text-gray-500 dark:text-gray-400 text-sm">
        სწორია თუ მცდარი?
      </div>

      {/* Richtig / Falsch Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Richtig (True) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            sound.playClick();
            onSelect(true);
          }}
          className={`py-5 px-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 border-2 border-b-4 transition-all ${
            selectedAnswer === true
              ? 'bg-green-50 dark:bg-green-950/40 border-lizu-green border-b-lizu-green-dark text-lizu-green'
              : 'bg-white dark:bg-gray-800 border-lizu-gray dark:border-gray-700 border-b-lizu-gray-dark dark:border-b-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750'
          } ${disabled ? 'cursor-not-allowed opacity-90' : 'active:translate-y-0.5 active:border-b-2'}`}
        >
          <Check className="w-6 h-6 text-lizu-green" />
          <span>Richtig (სწორია)</span>
        </button>

        {/* Falsch (False) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            sound.playClick();
            onSelect(false);
          }}
          className={`py-5 px-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 border-2 border-b-4 transition-all ${
            selectedAnswer === false
              ? 'bg-red-50 dark:bg-red-950/40 border-lizu-red border-b-lizu-red-dark text-lizu-red'
              : 'bg-white dark:bg-gray-800 border-lizu-gray dark:border-gray-700 border-b-lizu-gray-dark dark:border-b-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750'
          } ${disabled ? 'cursor-not-allowed opacity-90' : 'active:translate-y-0.5 active:border-b-2'}`}
        >
          <X className="w-6 h-6 text-lizu-red" />
          <span>Falsch (მცდარია)</span>
        </button>
      </div>
    </div>
  );
};
