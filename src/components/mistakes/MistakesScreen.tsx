import React from 'react';
import { useGame } from '../../context/GameContext';
import { Lesson, Question } from '../../types/lesson';
import { LiziMascot } from '../mascot/LiziMascot';
import { Play, Trash2, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/sound';

interface Props {
  onStartPractice: (practiceLesson: Lesson) => void;
}

export const MistakesScreen: React.FC<Props> = ({ onStartPractice }) => {
  const { progress, clearMistakes } = useGame();
  const mistakeCount = progress.mistakes.length;

  const handleStart = () => {
    if (mistakeCount === 0) return;
    sound.playClick();

    const practiceLesson: Lesson = {
      id: 'practice-mistakes',
      unitId: 'modul-2',
      unitTitle: 'შეცდომების გამეორება',
      title: 'შეცდომებზე მუშაობა',
      subtitle: `${mistakeCount} შეკითხვა`,
      description: 'გაიმეორეთ ის შეკითხვები, რომლებშიც შეცდომა დაუშვით.',
      icon: 'rotate',
      questions: progress.mistakes.map(m => m.question),
    };

    onStartPractice(practiceLesson);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-6 page-container flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-black uppercase tracking-wider text-lizu-orange">
          გამეორება & ვარჯიში
        </span>
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
          შეცდომების გამეორება
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          ამ სავარჯიშოს დასრულებით აღიდგენთ ყველა დაკარგულ გულს (5/5)!
        </p>
      </div>

      {mistakeCount === 0 ? (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl border-2 border-lizu-gray dark:border-gray-700 shadow-sm flex flex-col items-center text-center gap-4 my-6">
          <LiziMascot mood="celebrating" size={140} bubbleText="შეცდომები არ გაქვს!" />
          <h3 className="text-xl font-black text-gray-800 dark:text-gray-100">
            ყველაფერი იდეალურადაა!
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            ამჟამად შეცდომების სია ცარიელია. განაგრძეთ გაკვეთილების გავლა მთავარი გვერდიდან.
          </p>
          <div className="flex items-center gap-2 text-lizu-green font-black text-sm pt-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>გულები სავსეა</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Practice Banner Card */}
          <div className="p-6 bg-orange-50 dark:bg-orange-950/40 rounded-3xl border-2 border-orange-200 dark:border-orange-900 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-lizu-orange text-white flex items-center justify-center font-black text-xl">
                  {mistakeCount}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 dark:text-gray-100 text-lg">
                    {mistakeCount} შეცდომა შესასწავლია
                  </h4>
                  <span className="text-xs text-orange-700 dark:text-orange-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    ჯილდო: 5-ვე გულის სრული აღდგენა
                  </span>
                </div>
              </div>
              <Heart className="w-8 h-8 fill-lizu-red text-lizu-red animate-pulse" />
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="btn-3d-yellow py-4 text-base font-black w-full flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>ვარჯიშის დაწყება ({mistakeCount} კითხვა)</span>
            </button>
          </div>

          {/* List of saved mistakes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                შენახული შეკითხვები:
              </span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  clearMistakes();
                }}
                className="text-xs font-bold text-gray-400 hover:text-lizu-red flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                სიის გასუფთავება
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {progress.mistakes.map((m, idx) => {
                const q = m.question as Question;
                return (
                  <div
                    key={q.id || idx}
                    className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-1 text-sm font-bold text-gray-800 dark:text-gray-200 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                      <span>ტიპი: {q.type}</span>
                      <span>#{idx + 1}</span>
                    </div>
                    <div>
                      {q.type === 'choice' && q.prompt}
                      {q.type === 'fill' && q.sentence}
                      {q.type === 'build' && q.targetSentence}
                      {q.type === 'truefalse' && q.statement}
                      {q.type === 'odd' && q.prompt}
                      {q.type === 'listen' && q.targetSentence}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
