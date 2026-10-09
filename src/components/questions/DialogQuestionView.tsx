import React from 'react';
import { DialogQuestion } from '../../types/lesson';
import { ChoiceQuestionView } from './ChoiceQuestionView';
import { TrueFalseQuestionView } from './TrueFalseQuestionView';
import { Volume2 } from 'lucide-react';
import { tts } from '../../utils/tts';
import { sound } from '../../utils/sound';

interface Props {
  question: DialogQuestion;
  selectedAnswer: unknown;
  onSelect: (answer: unknown) => void;
  disabled?: boolean;
}

export const DialogQuestionView: React.FC<Props> = ({
  question,
  selectedAnswer,
  onSelect,
  disabled,
}) => {
  const hasVoice = tts.hasGermanVoice();

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-lizu-purple">
          დიალოგი
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
          წაიკითხეთ დიალოგი და უპასუხეთ შეკითხვას:
        </h2>
      </div>

      {/* Dialog Chat Feed */}
      <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-3xl border-2 border-lizu-gray dark:border-gray-700">
        {question.dialogLines.map((line, idx) => {
          const isAlternate = idx % 2 === 1;
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isAlternate ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Speaker Avatar / Badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white flex-shrink-0 ${
                  isAlternate ? 'bg-lizu-blue' : 'bg-lizu-green'
                }`}
              >
                {line.speaker.slice(0, 1)}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-sm sm:text-base font-semibold shadow-xs flex items-center justify-between gap-2 ${
                  isAlternate
                    ? 'bg-lizu-blue/15 text-blue-900 dark:text-blue-100 rounded-tr-none'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-tl-none'
                }`}
              >
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    {line.speaker}
                  </span>
                  <span>{line.text}</span>
                </div>
                {hasVoice && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      tts.speak(line.text);
                    }}
                    className="p-1 rounded-lg text-gray-400 hover:text-lizu-blue transition-colors flex-shrink-0"
                    title="მოსმენა"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Follow-up question divider */}
      <div className="pt-2">
        {question.subQuestion.type === 'choice' && (
          <ChoiceQuestionView
            question={question.subQuestion}
            selectedAnswer={(selectedAnswer as string) || null}
            onSelect={ans => onSelect(ans)}
            disabled={disabled}
          />
        )}
        {question.subQuestion.type === 'truefalse' && (
          <TrueFalseQuestionView
            question={question.subQuestion}
            selectedAnswer={(selectedAnswer as boolean | null) ?? null}
            onSelect={ans => onSelect(ans)}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};
