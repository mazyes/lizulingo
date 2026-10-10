import React from 'react';
import { PictureQuestion } from '../../types/lesson';
import { Volume2, Snail, Eye, Lightbulb } from 'lucide-react';
import { tts } from '../../utils/tts';
import { AppIcon, FlagGE } from '../common/AppIcon';

interface Props {
  question: PictureQuestion;
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export const PictureQuestionView: React.FC<Props> = ({
  question,
  selectedId,
  onSelect,
  disabled = false,
}) => {
  const [showTranslation, setShowTranslation] = React.useState(false);

  const handleAudio = (slow: boolean = false) => {
    tts.speak(question.germanWord, { slow });
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-lg mx-auto">
      {/* Georgian Hint */}
      {question.georgianHint && (
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{question.georgianHint}</span>
        </div>
      )}

      {/* Target German Word + Audio */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-lizu-gray dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          {question.article && (
            <span
              className={`px-3 py-1 rounded-xl font-black text-sm text-white shadow-xs ${
                question.article === 'der'
                  ? 'bg-[#1CB0F6]'
                  : question.article === 'die'
                  ? 'bg-[#FF4B4B]'
                  : 'bg-[#58CC02]'
              }`}
            >
              {question.article}
            </span>
          )}
          <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            {question.germanWord}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAudio(false)}
            className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-lizu-blue hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition-all active:scale-95"
            title="მოსმენა"
          >
            <Volume2 className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => handleAudio(true)}
            className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 transition-all active:scale-95"
            title="ნელა მოსმენა"
          >
            <Snail className="w-5 h-5 stroke-[2.5]" />
          </button>
          {question.translation && (
            <button
              type="button"
              onClick={() => setShowTranslation(prev => !prev)}
              className="px-2.5 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <FlagGE size={12} />
              <span>თარგმანი</span>
            </button>
          )}
        </div>
      </div>

      {/* Revealable translation */}
      {showTranslation && question.translation && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold text-center">
          {question.translation}
        </div>
      )}

      {/* 4 Picture Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5 pt-2">
        {question.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(opt.id)}
              className={`p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 transition-all active:scale-95 group ${
                isSelected
                  ? 'border-lizu-green bg-green-50 dark:bg-green-950/40 text-lizu-green-dark shadow-md scale-[1.02]'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-xs'
              } ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
            >
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/60 flex items-center justify-center">
                <AppIcon name={opt.emoji} size={52} />
              </div>
              <span className="text-sm font-black text-gray-800 dark:text-gray-200 text-center">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
