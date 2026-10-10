import React, { useState, useEffect } from 'react';
import { FillQuestion } from '../../types/lesson';
import { Volume2, RotateCcw } from 'lucide-react';
import { tts } from '../../utils/tts';
import { sound } from '../../utils/sound';

interface Props {
  question: FillQuestion;
  values: string[];
  onChange: (values: string[]) => void;
  isTypingMode: boolean;
  disabled?: boolean;
}

export const FillQuestionView: React.FC<Props> = ({
  question,
  values,
  onChange,
  isTypingMode,
  disabled,
}) => {
  const parts = question.sentence.split('___');
  const gapCount = parts.length - 1;
  const [activeGapIndex, setActiveGapIndex] = useState<number>(0);

  // Initialize values if empty
  useEffect(() => {
    if (values.length !== gapCount) {
      onChange(new Array(gapCount).fill(''));
    }
  }, [gapCount, values.length, onChange]);

  const useTyping = question.typed || isTypingMode;

  const handleChipClick = (chip: string) => {
    if (disabled) return;
    sound.playClick();

    // Fill current active gap or first empty gap
    let targetIdx = activeGapIndex;
    if (values[targetIdx]) {
      const firstEmpty = values.findIndex(v => !v);
      if (firstEmpty !== -1) {
        targetIdx = firstEmpty;
      }
    }

    const nextValues = [...values];
    nextValues[targetIdx] = chip;
    onChange(nextValues);

    // Advance to next empty gap
    const nextEmpty = nextValues.findIndex((v, i) => i > targetIdx && !v);
    if (nextEmpty !== -1) {
      setActiveGapIndex(nextEmpty);
    }
  };

  const handleGapClear = (index: number) => {
    if (disabled) return;
    sound.playClick();
    const nextValues = [...values];
    nextValues[index] = '';
    onChange(nextValues);
    setActiveGapIndex(index);
  };

  const handleTypedChange = (index: number, val: string) => {
    const nextValues = [...values];
    nextValues[index] = val;
    onChange(nextValues);
  };

  const hasVoice = tts.hasGermanVoice();

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {/* Georgian Hint */}
      <div className="flex flex-col gap-1">
        {question.georgianHint && (
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {question.georgianHint}
          </span>
        )}
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase font-extrabold tracking-wider text-lizu-green">
            შეავსეთ გამოტოვებული ადგილი
          </span>
          {hasVoice && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                tts.speak(question.sentence.replace(/___/g, '...'));
              }}
              className="p-1.5 rounded-lg bg-lizu-blue/10 text-lizu-blue hover:bg-lizu-blue/20"
              title="წინადადების მოსმენა"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sentence with gaps */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border-2 border-lizu-gray dark:border-gray-700 shadow-sm leading-relaxed text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 flex flex-wrap items-center gap-2">
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            <span>{part}</span>
            {idx < gapCount && (
              useTyping ? (
                <input
                  type="text"
                  disabled={disabled}
                  value={values[idx] || ''}
                  placeholder="ჩაწერეთ..."
                  onFocus={e => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  onChange={e => handleTypedChange(idx, e.target.value)}
                  className="inline-block px-3 py-2 min-h-[44px] min-w-[100px] max-w-[160px] border-b-4 border-lizu-blue bg-blue-50/50 dark:bg-gray-700 rounded-lg text-center font-bold text-lizu-blue outline-none focus:border-lizu-green focus:bg-white dark:focus:bg-gray-600 transition-all text-base"
                />
              ) : (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleGapClear(idx)}
                  className={`inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 rounded-xl font-extrabold border-2 border-b-4 transition-all text-base ${
                    values[idx]
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-lizu-blue border-b-lizu-blue-dark text-lizu-blue active:scale-95'
                      : activeGapIndex === idx
                      ? 'bg-gray-100 dark:bg-gray-700 border-dashed border-lizu-blue border-b-lizu-blue text-gray-400'
                      : 'bg-gray-50 dark:bg-gray-750 border-dashed border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}
                >
                  {values[idx] || '___'}
                </button>
              )
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Chips Selection Area (if not purely typed) */}
      {!useTyping && question.chips && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              სიტყვები:
            </span>
            {values.some(v => v) && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  sound.playClick();
                  onChange(new Array(gapCount).fill(''));
                  setActiveGapIndex(0);
                }}
                className="text-xs font-bold text-lizu-red hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                გასუფთავება
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {question.chips.map((chip, cIdx) => {
              const isUsed = values.includes(chip);
              return (
                <button
                  key={cIdx}
                  type="button"
                  disabled={disabled || isUsed}
                  onClick={() => handleChipClick(chip)}
                  className={`chip-3d text-base ${
                    isUsed ? 'chip-3d-selected' : ''
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
