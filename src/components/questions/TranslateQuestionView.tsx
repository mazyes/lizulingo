import React from 'react';
import { TranslateQuestion } from '../../types/lesson';
import { Volume2, Snail, Eye } from 'lucide-react';
import { tts } from '../../utils/tts';

interface Props {
  question: TranslateQuestion;
  selectedWords: string[];
  onChange: (words: string[]) => void;
  disabled?: boolean;
}

export const TranslateQuestionView: React.FC<Props> = ({
  question,
  selectedWords,
  onChange,
  disabled = false,
}) => {
  const [showTranslation, setShowTranslation] = React.useState(false);

  // Remaining available tokens
  const availableTokens = React.useMemo(() => {
    const counts = new Map<string, number>();
    question.tokens.forEach(t => counts.set(t, (counts.get(t) || 0) + 1));
    selectedWords.forEach(t => {
      const c = counts.get(t);
      if (c && c > 0) counts.set(t, c - 1);
    });
    return counts;
  }, [question.tokens, selectedWords]);

  const handleAddToken = (token: string) => {
    if (disabled) return;
    onChange([...selectedWords, token]);
  };

  const handleRemoveToken = (indexToRemove: number) => {
    if (disabled) return;
    onChange(selectedWords.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAudio = (slow: boolean = false) => {
    const textToSpeak = question.fromGeorgian ? question.targetSentence : question.sourceSentence;
    tts.speak(textToSpeak, { slow });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      {/* Georgian Hint */}
      {question.georgianHint && (
        <div className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
          💡 {question.georgianHint}
        </div>
      )}

      {/* Source Prompt Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-lizu-gray dark:border-gray-700 shadow-sm flex flex-col gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {question.fromGeorgian ? 'გადათარგმნეთ გერმანულად:' : 'გადათარგმნეთ ქართულად:'}
        </span>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
            {question.sourceSentence}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleAudio(false)}
              className="p-2 rounded-xl text-lizu-blue hover:bg-blue-50 dark:hover:bg-blue-950/60"
              title="მოსმენა"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleAudio(true)}
              className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60"
              title="ნელა მოსმენა"
            >
              <Snail className="w-5 h-5" />
            </button>
            {question.translation && (
              <button
                type="button"
                onClick={() => setShowTranslation(prev => !prev)}
                className="px-2 py-1 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {showTranslation && question.translation && (
          <div className="p-2 mt-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs font-bold text-amber-800 dark:text-amber-300">
            {question.translation}
          </div>
        )}
      </div>

      {/* Selected Words (Answer Construction Area) */}
      <div className="min-h-[70px] p-3 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 flex flex-wrap gap-2 items-center">
        {selectedWords.length === 0 ? (
          <span className="text-xs text-gray-400 font-semibold px-2">
            დააჭირეთ ქვემოთ მოცემულ სიტყვებს ასაწყობად...
          </span>
        ) : (
          selectedWords.map((word, idx) => (
            <button
              key={`${word}-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => handleRemoveToken(idx)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-extrabold text-sm border-2 border-gray-300 dark:border-gray-500 shadow-xs hover:border-red-400 transition-all active:scale-95"
            >
              {word}
            </button>
          ))
        )}
      </div>

      {/* Available Word Chips */}
      <div className="flex flex-wrap gap-2 justify-center pt-2">
        {question.tokens.map((token, idx) => {
          const count = availableTokens.get(token) || 0;
          const isUsed = count === 0;

          return (
            <button
              key={`${token}-${idx}`}
              type="button"
              disabled={isUsed || disabled}
              onClick={() => handleAddToken(token)}
              className={`px-4 py-2.5 rounded-xl font-black text-sm border-2 transition-all shadow-xs ${
                isUsed
                  ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed opacity-40'
                  : 'bg-white dark:bg-gray-800 border-lizu-gray dark:border-gray-600 hover:border-lizu-blue text-gray-900 dark:text-gray-100 active:scale-95'
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
