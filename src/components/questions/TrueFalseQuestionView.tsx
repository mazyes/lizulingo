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
      <div className="p-5 sm:p-6 bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between gap-4">
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 break-words flex-1 leading-snug">
          "{question.statement}"
        </p>
        {hasVoice && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              tts.speak(question.statement);
            }}
            className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 shrink-0"
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Richtig (True) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            sound.playClick();
            onSelect(true);
          }}
          className={`py-4 sm:py-5 px-3 sm:px-4 rounded-2xl font-black text-sm sm:text-lg flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 border-2 border-b-4 transition-all ${
            selectedAnswer === true
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 border-b-emerald-700 text-emerald-600 dark:text-emerald-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-b-gray-300 dark:border-b-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750'
          } ${disabled ? 'cursor-not-allowed opacity-90' : 'active:translate-y-0.5 active:border-b-2'}`}
        >
          <Check className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0" />
          <span className="text-center leading-tight">Richtig <span className="text-xs opacity-75 sm:inline block">(სწორია)</span></span>
        </button>

        {/* Falsch (False) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            sound.playClick();
            onSelect(false);
          }}
          className={`py-4 sm:py-5 px-3 sm:px-4 rounded-2xl font-black text-sm sm:text-lg flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 border-2 border-b-4 transition-all ${
            selectedAnswer === false
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 border-b-rose-700 text-rose-600 dark:text-rose-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-b-gray-300 dark:border-b-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750'
          } ${disabled ? 'cursor-not-allowed opacity-90' : 'active:translate-y-0.5 active:border-b-2'}`}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 shrink-0" />
          <span className="text-center leading-tight">Falsch <span className="text-xs opacity-75 sm:inline block">(მცდარია)</span></span>
        </button>
      </div>
    </div>
  );
};
