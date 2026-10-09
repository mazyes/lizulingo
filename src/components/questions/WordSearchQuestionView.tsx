import React, { useState } from 'react';
import { WordSearchQuestion } from '../../types/lesson';
import { sound } from '../../utils/sound';
import { tts } from '../../utils/tts';
import { Check, Volume2, Sparkles } from 'lucide-react';

interface Props {
  question: WordSearchQuestion;
  onComplete: () => void;
  disabled?: boolean;
}

export const WordSearchQuestionView: React.FC<Props> = ({
  question,
  onComplete,
  disabled,
}) => {
  const [selectedCells, setSelectedCells] = useState<Array<[number, number]>>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [lastFound, setLastFound] = useState<{ german: string; georgian: string } | null>(null);

  // Helper to extract word from selected cells
  const currentSelectionString = selectedCells
    .map(([r, c]) => question.grid[r][c])
    .join('');

  const handleCellClick = (r: number, c: number) => {
    if (disabled) return;
    sound.playClick();

    // Check if cell already selected; if so, maybe unselect
    const existingIndex = selectedCells.findIndex(([cr, cc]) => cr === r && cc === c);
    let nextCells: Array<[number, number]>;

    if (existingIndex !== -1) {
      nextCells = selectedCells.slice(0, existingIndex);
    } else {
      nextCells = [...selectedCells, [r, c]];
    }

    setSelectedCells(nextCells);

    // Check if nextCells forms any of the target words
    const candidateForward = nextCells.map(([cr, cc]) => question.grid[cr][cc]).join('').toUpperCase();
    const candidateBackward = nextCells.map(([cr, cc]) => question.grid[cr][cc]).reverse().join('').toUpperCase();

    const matchedTarget = question.words.find(w => {
      const g = w.german.toUpperCase();
      return (g === candidateForward || g === candidateBackward) && !foundWords.includes(w.german);
    });

    if (matchedTarget) {
      sound.playCorrect();
      tts.speak(matchedTarget.german);
      const updatedFound = [...foundWords, matchedTarget.german];
      setFoundWords(updatedFound);
      setLastFound(matchedTarget);
      setSelectedCells([]);

      if (updatedFound.length === question.words.length) {
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    }
  };

  const handleQuickTapWord = (targetWord: { german: string; georgian: string }) => {
    if (disabled || foundWords.includes(targetWord.german)) return;
    sound.playCorrect();
    tts.speak(targetWord.german);
    const updated = [...foundWords, targetWord.german];
    setFoundWords(updated);
    setLastFound(targetWord);
    setSelectedCells([]);

    if (updated.length === question.words.length) {
      setTimeout(() => {
        onComplete();
      }, 800);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-lizu-orange">
          სიტყვების ბადე (8 ფერი)
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
          იპოვეთ 8 ფერი ასოების ბადეში:
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          მონიშნეთ ასოები თანმიმდევრობით (ან შეეხეთ ნაპოვნ ფერს):
        </p>
      </div>

      {/* 8x8 Grid */}
      <div className="mx-auto p-2.5 sm:p-3 bg-white dark:bg-gray-800 rounded-3xl border-2 border-lizu-gray dark:border-gray-700 shadow-md">
        <div className="grid grid-cols-8 gap-1 sm:gap-1.5 select-none">
          {question.grid.map((row, rIdx) =>
            row.map((letter, cIdx) => {
              const isSelected = selectedCells.some(([r, c]) => r === rIdx && c === cIdx);
              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-black text-sm sm:text-base flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-lizu-yellow text-gray-950 scale-105 shadow-sm ring-2 ring-lizu-yellow-dark'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95'
                  }`}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Selected sequence display & Clear */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
          მონიშნულია:{' '}
          <span className="font-mono text-lizu-blue font-black tracking-wider text-base">
            {currentSelectionString || '—'}
          </span>
        </div>
        {selectedCells.length > 0 && (
          <button
            type="button"
            onClick={() => setSelectedCells([])}
            className="text-xs font-bold text-lizu-red hover:underline"
          >
            გაუქმება
          </button>
        )}
      </div>

      {/* Last found announcement */}
      {lastFound && (
        <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-lizu-green rounded-2xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-lizu-green" />
            <span className="font-bold text-lizu-green">
              ნაპოვნია: <span className="underline">{lastFound.german}</span> = {lastFound.georgian}!
            </span>
          </div>
          <button
            type="button"
            onClick={() => tts.speak(lastFound.german)}
            className="p-1 rounded-lg text-lizu-green hover:bg-lizu-green/10"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Target Word Badges */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wide">
          <span>საძიებო ფერები ({foundWords.length}/{question.words.length}):</span>
          {foundWords.length >= 4 && (
            <button
              type="button"
              onClick={onComplete}
              className="text-lizu-green font-extrabold hover:underline"
            >
              დასრულება →
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {question.words.map((w, idx) => {
            const isFound = foundWords.includes(w.german);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickTapWord(w)}
                className={`p-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
                  isFound
                    ? 'bg-green-50 dark:bg-green-950/40 border-lizu-green text-lizu-green'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-lizu-yellow'
                }`}
              >
                <span>{w.german}</span>
                {isFound ? (
                  <Check className="w-3.5 h-3.5 text-lizu-green" />
                ) : (
                  <span className="text-[10px] text-gray-400">{w.georgian}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
