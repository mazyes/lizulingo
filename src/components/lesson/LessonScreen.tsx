import React, { useState, useEffect } from 'react';
import { Lesson, Question } from '../../types/lesson';
import { useGame } from '../../context/GameContext';
import { ChoiceQuestionView } from '../questions/ChoiceQuestionView';
import { FillQuestionView } from '../questions/FillQuestionView';
import { BuildQuestionView } from '../questions/BuildQuestionView';
import { TrueFalseQuestionView } from '../questions/TrueFalseQuestionView';
import { OddQuestionView } from '../questions/OddQuestionView';
import { MatchQuestionView } from '../questions/MatchQuestionView';
import { ListenQuestionView } from '../questions/ListenQuestionView';
import { DialogQuestionView } from '../questions/DialogQuestionView';
import { WordSearchQuestionView } from '../questions/WordSearchQuestionView';
import { LiziMascot } from '../mascot/LiziMascot';
import { normalizeGerman, isAnswerMatch, isSentenceMatch } from '../../utils/normalize';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { X, Heart, Clock, Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  lesson: Lesson;
  onExit: () => void;
  isPracticeMistakes?: boolean;
}

const PRAISES = ['Super! 🌟', 'Toll! 🎉', 'Prima! 👏', 'ყოჩაღ! ✨'];

export const LessonScreen: React.FC<Props> = ({
  lesson,
  onExit,
  isPracticeMistakes = false,
}) => {
  const {
    progress,
    loseHeart,
    addXp,
    refillHearts,
    completeLesson,
    recordMistake,
    removeMistake,
  } = useGame();

  // Lesson question queue (cloned so wrong answers can be re-queued)
  const [questionQueue, setQuestionQueue] = useState<Question[]>(() => {
    if (isPracticeMistakes) return [...lesson.questions];
    if (lesson.isBoss) return [...lesson.questions].sort(() => Math.random() - 0.5).slice(0, 20);
    // Regular lesson: pick 10-12
    return [...lesson.questions].sort(() => Math.random() - 0.5).slice(0, Math.min(11, lesson.questions.length));
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [initialTotal] = useState<number>(questionQueue.length);
  const [mistakeCount, setMistakeCount] = useState<number>(0);

  // User input states for current question
  const [choiceAnswer, setChoiceAnswer] = useState<string | null>(null);
  const [fillValues, setFillValues] = useState<string[]>([]);
  const [buildWords, setBuildWords] = useState<string[]>([]);
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [oddIndex, setOddIndex] = useState<number | null>(null);
  const [dialogAnswer, setDialogAnswer] = useState<unknown>(null);

  // Feedback Sheet State: null | 'correct' | 'wrong'
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [praiseText, setPraiseText] = useState<string>('');
  const [correctAnswerDisplay, setCorrectAnswerDisplay] = useState<string>('');
  const [explanationDisplay, setExplanationDisplay] = useState<string>('');

  // Lesson end state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Timing
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Timer interval
  useEffect(() => {
    if (isCompleted || isGameOver) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isCompleted, isGameOver]);

  const currentQ = questionQueue[currentIndex];

  // Clear inputs when question changes
  const resetInputs = () => {
    setChoiceAnswer(null);
    setFillValues([]);
    setBuildWords([]);
    setTfAnswer(null);
    setOddIndex(null);
    setDialogAnswer(null);
    setFeedback(null);
  };

  // Determine if user has provided an answer to enable Check button
  const canCheck = (): boolean => {
    if (!currentQ || feedback !== null) return false;

    switch (currentQ.type) {
      case 'choice':
        return choiceAnswer !== null;
      case 'fill': {
        const gaps = (currentQ.sentence.match(/___/g) || []).length;
        return fillValues.length === gaps && fillValues.every(v => v.trim() !== '');
      }
      case 'build':
        return buildWords.length > 0;
      case 'truefalse':
        return tfAnswer !== null;
      case 'odd':
        return oddIndex !== null;
      case 'dialog':
        return dialogAnswer !== null && dialogAnswer !== undefined;
      case 'match':
      case 'listen':
        return buildWords.length > 0;
      case 'wordsearch':
        return true;
      default:
        return false;
    }
  };

  // Check Answer Handler
  const handleCheck = () => {
    if (!canCheck() || !currentQ) return;

    let isCorrect = false;
    let expectedText = '';
    let explanation = currentQ.georgianHint || '';

    switch (currentQ.type) {
      case 'choice': {
        isCorrect = normalizeGerman(choiceAnswer || '') === normalizeGerman(currentQ.correctAnswer);
        expectedText = currentQ.correctAnswer;
        explanation = currentQ.explanation || explanation;
        break;
      }
      case 'fill': {
        // Check each gap
        isCorrect = currentQ.answers.every((ansArr, idx) => {
          const userVal = fillValues[idx] || '';
          return isAnswerMatch(userVal, ansArr);
        });
        expectedText = currentQ.answers.map(arr => arr[0]).join(' / ');
        explanation = currentQ.explanation || explanation;
        break;
      }
      case 'build': {
        const userBuilt = buildWords.join(' ');
        isCorrect = isSentenceMatch(userBuilt, currentQ.targetSentence, currentQ.acceptableSentences);
        expectedText = currentQ.targetSentence;
        explanation = currentQ.explanation || explanation;
        break;
      }
      case 'truefalse': {
        isCorrect = tfAnswer === currentQ.isTrue;
        expectedText = currentQ.isTrue ? 'Richtig (სწორია)' : 'Falsch (მცდარია)';
        explanation = currentQ.explanation || explanation;
        break;
      }
      case 'odd': {
        isCorrect = oddIndex === currentQ.oddIndex;
        expectedText = currentQ.options[currentQ.oddIndex];
        explanation = currentQ.reason;
        break;
      }
      case 'dialog': {
        if (currentQ.subQuestion.type === 'choice') {
          isCorrect = normalizeGerman((dialogAnswer as string) || '') === normalizeGerman(currentQ.subQuestion.correctAnswer);
          expectedText = currentQ.subQuestion.correctAnswer;
          explanation = currentQ.subQuestion.explanation || explanation;
        } else if (currentQ.subQuestion.type === 'truefalse') {
          isCorrect = dialogAnswer === currentQ.subQuestion.isTrue;
          expectedText = currentQ.subQuestion.isTrue ? 'Richtig' : 'Falsch';
          explanation = currentQ.subQuestion.explanation || explanation;
        }
        break;
      }
      case 'listen': {
        const userBuilt = buildWords.join(' ');
        isCorrect = isSentenceMatch(userBuilt, currentQ.targetSentence, currentQ.acceptableSentences);
        expectedText = currentQ.targetSentence;
        explanation = currentQ.explanation || explanation;
        break;
      }
      case 'match':
      case 'wordsearch': {
        isCorrect = true;
        break;
      }
    }

    if (isCorrect) {
      sound.playCorrect();
      setPraiseText(PRAISES[Math.floor(Math.random() * PRAISES.length)]);
      setFeedback('correct');

      if (isPracticeMistakes) {
        removeMistake(currentQ.id);
      }
    } else {
      sound.playWrong();
      setFeedback('wrong');
      setCorrectAnswerDisplay(expectedText);
      setExplanationDisplay(explanation);
      setMistakeCount(prev => prev + 1);
      recordMistake(currentQ);

      // Deduct heart
      loseHeart();

      // Append question to the end so user repeats it
      setQuestionQueue(prev => [...prev, currentQ]);

      // Check if hearts reached 0
      if (progress.hearts <= 1) {
        setTimeout(() => {
          setIsGameOver(true);
        }, 800);
      }
    }
  };

  // Next / Continue button after feedback
  const handleContinue = () => {
    if (currentIndex + 1 < questionQueue.length) {
      setCurrentIndex(prev => prev + 1);
      resetInputs();
    } else {
      // Completed all questions in the queue!
      sound.playComplete();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const baseXP = 10;
      const bonusXP = mistakeCount === 0 ? 5 : 0;
      const earnedXP = baseXP + bonusXP;
      addXp(earnedXP);

      const starsAwarded = mistakeCount === 0 ? 3 : mistakeCount <= 2 ? 2 : 1;
      completeLesson(lesson.id, starsAwarded);

      if (isPracticeMistakes) {
        refillHearts(); // Practice refills hearts!
      }

      setIsCompleted(true);
    }
  };

  // Progress Bar percentage
  // Total steps to complete is initialTotal; completed correctly is initialTotal - remaining unique
  const progressPercent = Math.min(
    100,
    Math.round(((currentIndex) / Math.max(1, questionQueue.length)) * 100)
  );

  // Time format helper
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Accuracy calculation
  const accuracy = Math.max(
    0,
    Math.round((initialTotal / Math.max(1, initialTotal + mistakeCount)) * 100)
  );

  // --- GAME OVER SCREEN (0 Hearts) ---
  if (isGameOver) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#131F24] flex flex-col justify-between p-6 max-w-md mx-auto">
        <div className="flex justify-start">
          <button
            onClick={onExit}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center gap-4 py-8">
          <LiziMascot mood="sad" size={160} bubbleText="ნუ გეშინია, თავიდან ვცადოთ!" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            გულები ამოგეწურა!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed px-4">
            გულები აღდგება 30 წუთში, ან შეგიძლია გაიარო შეცდომების გამეორება და მყისიერად აღიდგინო ისინი.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onExit}
            className="btn-3d-blue py-4 text-base font-black w-full"
          >
            მთავარ გვერდზე დაბრუნება
          </button>
        </div>
      </div>
    );
  }

  // --- LESSON COMPLETED RESULTS SCREEN ---
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#131F24] flex flex-col justify-between p-6 max-w-lg mx-auto">
        <div className="pt-6 flex flex-col items-center text-center gap-4">
          <LiziMascot mood="celebrating" size={170} bubbleText="ყოჩაღ! გაკვეთილი დასრულდა!" />
          <h2 className="text-3xl font-black text-lizu-yellow-dark dark:text-lizu-yellow tracking-tight">
            გაკვეთილი ჩაბარებულია!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 font-semibold text-base">
            {lesson.title}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 my-6">
          {/* XP */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 flex flex-col items-center text-center">
            <Award className="w-6 h-6 text-lizu-yellow mb-1" />
            <span className="text-xs font-bold text-gray-500 uppercase">XP ჯილდო</span>
            <span className="text-xl font-black text-amber-700 dark:text-amber-300">
              +{mistakeCount === 0 ? '15' : '10'}
            </span>
          </div>

          {/* Accuracy */}
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border-2 border-green-300 dark:border-green-700 flex flex-col items-center text-center">
            <CheckCircle2 className="w-6 h-6 text-lizu-green mb-1" />
            <span className="text-xs font-bold text-gray-500 uppercase">სიზუსტე</span>
            <span className="text-xl font-black text-lizu-green-dark dark:text-lizu-green">
              {accuracy}%
            </span>
          </div>

          {/* Time */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-300 dark:border-blue-700 flex flex-col items-center text-center">
            <Clock className="w-6 h-6 text-lizu-blue mb-1" />
            <span className="text-xs font-bold text-gray-500 uppercase">დრო</span>
            <span className="text-xl font-black text-blue-700 dark:text-blue-300">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        <div className="pb-4">
          <button
            onClick={onExit}
            className="btn-3d-green py-4 text-lg font-black w-full"
          >
            გაგრძელება
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE QUESTION PLAY SCREEN ---
  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#131F24] flex flex-col justify-between selection:bg-none">
      {/* Top Header Bar */}
      <header className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Exit Button */}
        <button
          type="button"
          onClick={() => setShowExitConfirm(true)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          title="გასვლა"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-lizu-green rounded-full transition-all duration-300 shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hearts Count */}
        <div className="flex items-center gap-1.5 font-black text-lizu-red text-lg select-none">
          <Heart className="w-6 h-6 fill-lizu-red text-lizu-red" />
          <span>{progress.hearts}</span>
        </div>
      </header>

      {/* Main Question Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-4 flex flex-col justify-center">
        {currentQ && (
          <>
            {currentQ.type === 'choice' && (
              <ChoiceQuestionView
                question={currentQ}
                selectedAnswer={choiceAnswer}
                onSelect={setChoiceAnswer}
                disabled={feedback !== null}
              />
            )}
            {currentQ.type === 'fill' && (
              <FillQuestionView
                question={currentQ}
                values={fillValues}
                onChange={setFillValues}
                isTypingMode={progress.typingModeEnabled}
                disabled={feedback !== null}
              />
            )}
            {currentQ.type === 'build' && (
              <BuildQuestionView
                question={currentQ}
                selectedWords={buildWords}
                onChange={setBuildWords}
                disabled={feedback !== null}
              />
            )}
            {currentQ.type === 'truefalse' && (
              <TrueFalseQuestionView
                question={currentQ}
                selectedAnswer={tfAnswer}
                onSelect={setTfAnswer}
                disabled={feedback !== null}
              />
            )}
            {currentQ.type === 'odd' && (
              <OddQuestionView
                question={currentQ}
                selectedIndex={oddIndex}
                onSelect={setOddIndex}
                disabled={feedback !== null}
              />
            )}
            {currentQ.type === 'match' && (
              <MatchQuestionView
                question={currentQ}
                onAllMatched={() => {
                  sound.playCorrect();
                  setPraiseText(PRAISES[Math.floor(Math.random() * PRAISES.length)]);
                  setFeedback('correct');
                }}
                disabled={feedback !== null}
              />
            )}
            {currentQ.type === 'listen' && (
              <ListenQuestionView
                question={currentQ}
                selectedWords={buildWords}
                onChange={setBuildWords}
                disabled={feedback !== null}
              />
            )}
            {currentQ.type === 'dialog' && (
              <DialogQuestionView
                question={currentQ}
                selectedAnswer={dialogAnswer}
                onSelect={setDialogAnswer}
                disabled={feedback !== null}
              />
            )}
            {currentQ.type === 'wordsearch' && (
              <WordSearchQuestionView
                question={currentQ}
                onComplete={() => {
                  sound.playCorrect();
                  setPraiseText(PRAISES[Math.floor(Math.random() * PRAISES.length)]);
                  setFeedback('correct');
                }}
                disabled={feedback !== null}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Action / Feedback Sheet */}
      <footer
        className={`w-full border-t-2 transition-all duration-200 ${
          feedback === 'correct'
            ? 'bg-[#D7FFB8] dark:bg-[#16381C] border-[#58CC02]'
            : feedback === 'wrong'
            ? 'bg-[#FFDFE0] dark:bg-[#40181A] border-[#FF4B4B]'
            : 'bg-white dark:bg-gray-800 border-lizu-gray dark:border-gray-700'
        }`}
      >
        <div className="max-w-xl mx-auto px-4 py-4 sm:py-5 flex flex-col gap-3">
          {/* Feedback details */}
          {feedback === 'correct' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lizu-green flex items-center justify-center text-white">
                  <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-lizu-green-dark dark:text-lizu-green">
                    {praiseText}
                  </h3>
                  <span className="text-xs font-bold text-green-700 dark:text-green-300">
                    სწორი პასუხია!
                  </span>
                </div>
              </div>
              <LiziMascot mood="happy" size={55} />
            </div>
          )}

          {feedback === 'wrong' && (
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-lizu-red flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-6 h-6 stroke-[3]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-black text-lizu-red-dark dark:text-red-400">
                    სწორი პასუხი:
                  </h3>
                  <p className="font-extrabold text-gray-900 dark:text-gray-100 text-base">
                    {correctAnswerDisplay}
                  </p>
                  {explanationDisplay && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                      {explanationDisplay}
                    </p>
                  )}
                </div>
              </div>
              <LiziMascot mood="sad" size={55} />
            </div>
          )}

          {/* Action Button */}
          {feedback === null ? (
            <button
              type="button"
              disabled={!canCheck()}
              onClick={handleCheck}
              className={`py-4 w-full text-base font-black ${
                canCheck()
                  ? 'btn-3d-green'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-2xl cursor-not-allowed uppercase font-extrabold tracking-wider'
              }`}
            >
              შემოწმება
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              className={`py-4 w-full text-base font-black ${
                feedback === 'correct' ? 'btn-3d-green' : 'btn-3d-red'
              }`}
            >
              გაგრძელება
            </button>
          )}
        </div>
      </footer>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full border-2 border-lizu-gray dark:border-gray-700 shadow-xl flex flex-col gap-4 text-center">
            <LiziMascot mood="sad" size={100} />
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
              ნამდვილად გსურთ გამოსვლა?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              თუ ახლა დატოვებთ გაკვეთილს, ამ სესიის პროგრესი დაიკარგება.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="btn-3d-blue py-3 font-black text-sm"
              >
                სწავლის გაგრძელება
              </button>
              <button
                type="button"
                onClick={onExit}
                className="text-xs font-bold text-gray-400 hover:text-lizu-red py-2"
              >
                გაკვეთილის დატოვება
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
