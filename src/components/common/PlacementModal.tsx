import React, { useState } from 'react';
import { LiziMascot } from '../mascot/LiziMascot';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onSelectFromZero: () => void;
  onCompletePlacement: (unlockedModules: string[]) => void;
}

export const PlacementModal: React.FC<Props> = ({
  isOpen,
  onSelectFromZero,
  onCompletePlacement,
}) => {
  const [mode, setMode] = useState<'prompt' | 'test'>('prompt');
  const [step, setStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!isOpen) return null;

  const testQuestions = [
    {
      prompt: 'როგორ იტყვით გერმანულად: "დილა მშვიდობისა"?',
      options: ['Guten Morgen', 'Gute Nacht', 'Auf Wiedersehen'],
      correct: 'Guten Morgen',
    },
    {
      prompt: 'რომელი არტიკლია სწორი: "___ Buch" (წიგნი)?',
      options: ['der', 'die', 'das'],
      correct: 'das',
    },
    {
      prompt: 'Konjugiere: "Ich ___ Deutsch." (lernen)',
      options: ['lerne', 'lernst', 'lernt'],
      correct: 'lerne',
    },
    {
      prompt: 'დაასრულეთ წინადადება: "Ich komme ___ Georgien."',
      options: ['in', 'aus', 'nach'],
      correct: 'aus',
    },
  ];

  const currentQ = testQuestions[step];

  const handleNextQuestion = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === currentQ.correct;
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(nextCorrect);
    setSelectedOption(null);

    if (step + 1 < testQuestions.length) {
      setStep(prev => prev + 1);
    } else {
      // Test finished!
      // If 4/4 correct -> unlock up to modul-3
      // If 2-3 correct -> unlock up to modul-2
      // If 0-1 -> modul-1
      const unlocked: string[] = ['1.1'];
      if (nextCorrect >= 2) {
        unlocked.push('1.2', '1.3', '1.4', '1.5', '1.6', '1-boss', '2.1');
      }
      if (nextCorrect >= 3) {
        unlocked.push('2.2', '2.3', '2.4', '2.5', '2.6', '2-boss', '3.1');
      }
      onCompletePlacement(unlocked);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-lizu-gray dark:border-gray-700 shadow-2xl flex flex-col items-center text-center animate-pop">
        {mode === 'prompt' ? (
          <>
            <LiziMascot mood="happy" size={130} />
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-4 mb-2">
              მოგესალმებით LIZULINGO-ში! 🇩🇪
            </h2>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              ისწავლეთ გერმანული ნულიდან ქართულად! როგორ გსურთ სწავლის დაწყება?
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                type="button"
                onClick={onSelectFromZero}
                className="btn-3d-green w-full py-4 text-base font-black flex items-center justify-center gap-2"
              >
                <span>ნულიდან ვიწყებ (რეკომენდებული)</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setMode('test')}
                className="w-full py-3.5 rounded-2xl border-2 border-lizu-blue text-lizu-blue dark:text-blue-400 font-black text-sm hover:bg-blue-50 dark:hover:bg-blue-950/40 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>ცოტა ვიცი (დონის განსაზღვრის ტესტი)</span>
              </button>
            </div>
          </>
        ) : (
          /* Short Placement Test */
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs font-black text-gray-400">
              <span>დონის ტესტი</span>
              <span>კითხვა {step + 1} / {testQuestions.length}</span>
            </div>

            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-lizu-blue transition-all duration-300"
                style={{ width: `${((step + 1) / testQuestions.length) * 100}%` }}
              />
            </div>

            <div className="my-2">
              <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                {currentQ.prompt}
              </h3>
            </div>

            <div className="flex flex-col gap-2.5">
              {currentQ.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedOption(opt)}
                  className={`p-3.5 rounded-xl border-2 font-bold text-sm text-left transition-all flex items-center justify-between ${
                    selectedOption === opt
                      ? 'border-lizu-blue bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 font-black'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <span>{opt}</span>
                  {selectedOption === opt && <CheckCircle2 className="w-4 h-4 text-lizu-blue" />}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!selectedOption}
              onClick={handleNextQuestion}
              className={`w-full py-3.5 text-base font-black mt-2 ${
                selectedOption
                  ? 'btn-3d-green'
                  : 'bg-gray-200 text-gray-400 rounded-2xl cursor-not-allowed'
              }`}
            >
              შემდეგი
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
