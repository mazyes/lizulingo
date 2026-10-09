import React from 'react';
import { BuildQuestion } from '../../types/lesson';
import { Volume2, RotateCcw } from 'lucide-react';
import { tts } from '../../utils/tts';
import { sound } from '../../utils/sound';

interface Props {
  question: BuildQuestion;
  selectedWords: string[];
  onChange: (words: string[]) => void;
  disabled?: boolean;
}

export const BuildQuestionView: React.FC<Props> = ({
  question,
  selectedWords,
  onChange,
  disabled,
}) => {
  const handleSelectChip = (word: string) => {
    if (disabled) return;
    sound.playClick();
    onChange([...selectedWords, word]);
  };

  const handleRemoveWord = (wordIndex: number) => {
    if (disabled) return;
    sound.playClick();
    const updated = [...selectedWords];
    updated.splice(wordIndex, 1);
    onChange(updated);
  };

  const handleReset = () => {
    if (disabled) return;
    sound.playClick();
    onChange([]);
  };

  // Keep track of which chip indices from tokens have been used
  // Since tokens may have duplicate words, we match by occurrence count
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
  const hasVoice = tts.hasGermanVoice();

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {/* Title & Georgian prompt */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-extrabold tracking-wider text-lizu-green">
            ააწყვეთ წინადადება
          </span>
          {hasVoice && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                tts.speak(question.targetSentence);
              }}
              className="p-1.5 rounded-lg bg-lizu-blue/10 text-lizu-blue hover:bg-lizu-blue/20"
              title="მოსმენა"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
          {question.prompt || question.georgianHint || 'აირჩიეთ სიტყვები სწორი თანმიმდევრობით:'}
        </h2>
      </div>

      {/* Target Assembly Area */}
      <div className="min-h-[90px] p-4 bg-white dark:bg-gray-800 rounded-3xl border-2 border-lizu-gray dark:border-gray-700 shadow-sm flex flex-wrap gap-2 items-center content-start">
        {selectedWords.length === 0 ? (
          <span className="text-gray-400 dark:text-gray-500 font-semibold text-sm select-none italic">
            დააჭირეთ ქვემოთ მოცემულ სიტყვებს...
          </span>
        ) : (
          selectedWords.map((word, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleRemoveWord(idx)}
              className="chip-3d bg-blue-50 dark:bg-blue-950/60 border-lizu-blue border-b-lizu-blue-dark text-lizu-blue animate-in fade-in zoom-in-95 duration-100"
            >
              {word}
            </button>
          ))
        )}
      </div>

      {/* Reset button if any selected */}
      {selectedWords.length > 0 && !disabled && (
        <div className="flex justify-end -mt-3">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-bold text-lizu-red hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            თავიდან აწყობა
          </button>
        </div>
      )}

      {/* Available Word Bank */}
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
