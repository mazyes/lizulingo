import React, { useEffect } from 'react';
import { ListenQuestion } from '../../types/lesson';
import { Volume2, Snail, RotateCcw } from 'lucide-react';
import { tts } from '../../utils/tts';
import { sound } from '../../utils/sound';

interface Props {
  question: ListenQuestion;
  selectedWords: string[];
  onChange: (words: string[]) => void;
  disabled?: boolean;
}

export const ListenQuestionView: React.FC<Props> = ({
  question,
  selectedWords,
  onChange,
  disabled,
}) => {
  // Auto-play audio on question mount
  useEffect(() => {
    const timer = setTimeout(() => {
      tts.speak(question.targetSentence, 0.85);
    }, 400);
    return () => clearTimeout(timer);
  }, [question.targetSentence]);

  const handleSelectChip = (word: string) => {
    if (disabled) return;
    sound.playClick();
    onChange([...selectedWords, word]);
  };

  const handleRemoveWord = (index: number) => {
    if (disabled) return;
    sound.playClick();
    const next = [...selectedWords];
    next.splice(index, 1);
    onChange(next);
  };

  const handleReset = () => {
    if (disabled) return;
    sound.playClick();
    onChange([]);
  };

  const getUsedTokensIndices = (): number[] => {
    const used: number[] = [];
    const remainingSelected = [...selectedWords];

    question.tokens.forEach((token, idx) => {
      const matchIndex = remainingSelected.indexOf(token);
      if (matchIndex !== -1) {
        used.push(idx);
        remainingSelected.splice(matchIndex, 1);
      }
    });

    return used;
  };

  const usedIndices = getUsedTokensIndices();

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-lizu-blue">
          მოსმენის სავარჯიშო
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          მოუსმინეთ და ააწყვეთ წინადადება:
        </h2>
        {question.georgianHint && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {question.georgianHint}
          </p>
        )}
      </div>

      {/* Big Audio Play Buttons */}
      <div className="flex items-center justify-center gap-4 py-2">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            tts.speak(question.targetSentence, 0.9);
          }}
          className="w-20 h-20 rounded-3xl bg-lizu-blue text-white shadow-3d-blue active:translate-y-1 active:shadow-none transition-all flex items-center justify-center hover:brightness-105"
          title="ნორმალური სიჩქარით მოსმენა"
        >
          <Volume2 className="w-10 h-10" />
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            tts.speak(question.targetSentence, 0.65);
          }}
          className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 border-2 border-lizu-gray dark:border-gray-700 shadow-3d-white active:translate-y-1 active:shadow-none text-lizu-blue hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center justify-center transition-all"
          title="ნელი სიჩქარით მოსმენა"
        >
          <Snail className="w-7 h-7" />
        </button>
      </div>

      {/* Sentence Assembly Area */}
      <div className="min-h-[85px] p-4 bg-white dark:bg-gray-800 rounded-3xl border-2 border-lizu-gray dark:border-gray-700 shadow-sm flex flex-wrap gap-2 items-center content-start">
        {selectedWords.length === 0 ? (
          <span className="text-gray-400 dark:text-gray-500 font-semibold text-sm select-none italic">
            დააჭირეთ მოსმენილ სიტყვებს...
          </span>
        ) : (
          selectedWords.map((word, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleRemoveWord(idx)}
              className="chip-3d bg-blue-50 dark:bg-blue-950/60 border-lizu-blue border-b-lizu-blue-dark text-lizu-blue"
            >
              {word}
            </button>
          ))
        )}
      </div>

      {selectedWords.length > 0 && !disabled && (
        <div className="flex justify-end -mt-3">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-bold text-lizu-red hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            გასუფთავება
          </button>
        </div>
      )}

      {/* Chips Pool */}
      <div className="flex flex-wrap gap-2.5 pt-2">
        {question.tokens.map((token, idx) => {
          const isUsed = usedIndices.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled || isUsed}
              onClick={() => handleSelectChip(token)}
              className={`chip-3d text-base ${
                isUsed ? 'chip-3d-selected' : ''
              }`}
            >
              {token}
            </button>
          );
        })}
      </div>
    </div>
  );
};
