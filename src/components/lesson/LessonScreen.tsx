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
import { PictureQuestionView } from '../questions/PictureQuestionView';
import { TranslateQuestionView } from '../questions/TranslateQuestionView';
import { SpeakQuestionView } from '../questions/SpeakQuestionView';
import { TeachCardView } from '../teach/TeachCardView';
import { TreasureChestModal } from '../common/TreasureChestModal';
import { LiziMascot } from '../mascot/LiziMascot';
import { checkAnswer, getExpectedAnswer } from '../../utils/normalize';
import { getQuestionsForRound, getRoundInfo } from '../../data/expand';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { X, Heart, Clock, Award, CheckCircle2, AlertCircle, Flame, Volume2, VolumeX, Trophy, ChevronRight } from 'lucide-react';
import { FlagGE } from '../common/AppIcon';
import { AnimatedNumber } from '../common/AnimatedNumber';

interface Props {
  lesson: Lesson;
  onExit: () => void;
  isPracticeMistakes?: boolean;
  round?: number;
}

const PRAISES = ['Super!', 'Toll!', 'Prima!', 'Sehr gut!', 'ყოჩაღ!'];

export const LessonScreen: React.FC<Props> = ({
  lesson,
  onExit,
  isPracticeMistakes = false,
  round,
}) => {
  const {
    progress,
    loseHeart,
    addXp,
    refillHearts,
    completeRound,
    recordMistake,
    removeMistake,
    recordWordLearned,
    updateDailyQuest,
    saveRunningLesson,
    clearRunningLesson,
    recordWordStat,
    recordAnswerResult,
    toggleSound,
  } = useGame();

  const totalRounds = lesson.rounds || (lesson.isBoss ? 1 : 3);

  // Check if resuming an existing running lesson session
  const existingRunning = progress.runningLesson && progress.runningLesson.lessonId === lesson.id ? progress.runningLesson : null;

  // Active round: explicitly passed > resumed from running state > computed from stored user rounds > 1
  const initialRound = round ?? existingRunning?.currentRound ?? Math.min(totalRounds, (progress.lessonRounds?.[lesson.id] || 0) + 1);
  const [currentRound, setCurrentRound] = useState<number>(initialRound);

  // Teach cards: show only on round 1 (or 1 reminder card on round > 1)
  const teachCardsToShow = currentRound === 1
    ? (lesson.teachCards || [])
    : (lesson.teachCards && lesson.teachCards.length > 0 ? [lesson.teachCards[0]] : []);

  const [phase1Active, setPhase1Active] = useState<boolean>(() => {
    return Boolean(!isPracticeMistakes && teachCardsToShow.length > 0);
  });

  // Track if this run achieved a new record
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Lesson question queue (12-15 questions per round via expand.ts)
  const [questionQueue, setQuestionQueue] = useState<Question[]>(() => {
    if (isPracticeMistakes) return [...lesson.questions];
    return getQuestionsForRound(lesson, currentRound, totalRounds);
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    return existingRunning ? Math.min(existingRunning.currentIndex, questionQueue.length - 1) : 0;
  });
  const [initialTotal] = useState<number>(questionQueue.length);
  const [mistakeCount, setMistakeCount] = useState<number>(() => {
    return existingRunning ? existingRunning.mistakeCount : 0;
  });

  // Combo Streak state
  const [comboCount, setComboCount] = useState<number>(0);
  const [showComboAlert, setShowComboAlert] = useState<boolean>(false);

  // User input states for current question
  const [choiceAnswer, setChoiceAnswer] = useState<string | null>(null);
  const [fillValues, setFillValues] = useState<string[]>([]);
  const [buildWords, setBuildWords] = useState<string[]>([]);
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [oddIndex, setOddIndex] = useState<number | null>(null);
  const [dialogAnswer, setDialogAnswer] = useState<unknown>(null);
  const [pictureSelectedId, setPictureSelectedId] = useState<string | null>(null);

  // Feedback Sheet State: null | 'correct' | 'wrong'
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [praiseText, setPraiseText] = useState<string>('');
  const [correctAnswerDisplay, setCorrectAnswerDisplay] = useState<string>('');
  const [explanationDisplay, setExplanationDisplay] = useState<string>('');

  // Lesson end state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showTreasureModal, setShowTreasureModal] = useState<boolean>(false);
  const [lastEarnedXp, setLastEarnedXp] = useState<number>(15);

  // Timing
  const [startTime] = useState<number>(() => existingRunning?.startTime || Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Save running lesson to local storage after every question
  useEffect(() => {
    if (isCompleted || isGameOver || phase1Active || isPracticeMistakes) return;
    saveRunningLesson({
      lessonId: lesson.id,
      currentIndex,
      mistakeCount,
      hearts: progress.hearts,
      startTime,
      questionQueueIds: questionQueue.map(q => q.id),
      currentRound,
    });
  }, [currentIndex, mistakeCount, progress.hearts, lesson.id, isCompleted, isGameOver, phase1Active, isPracticeMistakes, questionQueue, saveRunningLesson, startTime, currentRound]);

  // Timer interval
  useEffect(() => {
    if (isCompleted || isGameOver || phase1Active) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isCompleted, isGameOver, phase1Active]);

  const currentQ = questionQueue[currentIndex];

  // Clear inputs when question changes
  const resetInputs = () => {
    setChoiceAnswer(null);
    setFillValues([]);
    setBuildWords([]);
    setTfAnswer(null);
    setOddIndex(null);
    setDialogAnswer(null);
    setPictureSelectedId(null);
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
      case 'translate':
      case 'listen':
        return buildWords.length > 0;
      case 'truefalse':
        return tfAnswer !== null;
      case 'odd':
        return oddIndex !== null;
      case 'dialog':
        return dialogAnswer !== null && dialogAnswer !== undefined;
      case 'picture':
        return pictureSelectedId !== null;
      case 'match':
      case 'wordsearch':
      case 'speak':
        return true;
      default:
        return false;
    }
  };

  // Check Answer Handler
  const handleCheck = () => {
    if (!canCheck() || !currentQ) return;

    let userInput: unknown = null;
    switch (currentQ.type) {
      case 'choice':
        userInput = choiceAnswer;
        break;
      case 'fill':
        userInput = currentQ.answers.map((_, idx) => fillValues[idx] || '');
        break;
      case 'build':
      case 'translate':
      case 'listen':
        userInput = buildWords;
        break;
      case 'picture':
        userInput = pictureSelectedId;
        break;
      case 'truefalse':
        userInput = tfAnswer;
        break;
      case 'odd':
        userInput = oddIndex;
        break;
      case 'dialog':
        userInput = dialogAnswer;
        break;
      case 'match':
        userInput = true;
        break;
      case 'wordsearch':
        userInput = true;
        break;
      case 'speak':
        userInput = currentQ.targetSentence;
        break;
      default: {
        const _never: never = currentQ;
        void _never;
        userInput = null;
      }
    }

    const checkRes = checkAnswer(currentQ, userInput);
    const isCorrect = checkRes === 'correct' || checkRes === 'almost';
    const isAlmost = checkRes === 'almost';
    const expectedText = getExpectedAnswer(currentQ);
    const explanation = currentQ.explanation || (currentQ.type === 'odd' ? currentQ.reason : '') || currentQ.georgianHint || '';

    // Record stats for spaced repetition and profile
    recordAnswerResult(isCorrect, 3);
    if ('germanWord' in currentQ && currentQ.germanWord) {
      recordWordStat(currentQ.germanWord, isCorrect);
    }

    if (isCorrect) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(25); } catch {}
      }
      sound.playCorrect();
      if (isAlmost) {
        setPraiseText(`თითქმის სწორია! სწორად იწერება: ${expectedText}`);
      } else {
        setPraiseText(PRAISES[Math.floor(Math.random() * PRAISES.length)]);
      }
      setFeedback('correct');

      // Combo handling
      const nextCombo = comboCount + 1;
      setComboCount(nextCombo);
      if (nextCombo >= 5) {
        setShowComboAlert(true);
        addXp(2);
        updateDailyQuest('combo_10', 1);
        setTimeout(() => setShowComboAlert(false), 2500);
      }

      if (isPracticeMistakes) {
        removeMistake(currentQ.id);
        updateDailyQuest('practice_mistakes', 1);
      }
    } else {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([40, 40, 40]); } catch {}
      }
      sound.playWrong();
      setFeedback('wrong');
      setCorrectAnswerDisplay(expectedText);
      setExplanationDisplay(explanation);
      setMistakeCount(prev => prev + 1);
      setComboCount(0); // Reset combo
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
      // Completed all questions in the queue for this round!
      sound.playComplete();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const isFinalRound = currentRound >= totalRounds;
      // XP reward: +10 round XP, +5 no mistakes bonus, +20 circle completion bonus
      const roundBaseXP = 10;
      const perfectBonus = mistakeCount === 0 ? 5 : 0;
      const circleBonus = isFinalRound ? 20 : 0;
      const earnedXP = roundBaseXP + perfectBonus + circleBonus;
      setLastEarnedXp(earnedXP);
      addXp(earnedXP);

      const starsAwarded = mistakeCount === 0 ? 3 : mistakeCount <= 2 ? 2 : 1;
      const prevRecord = progress.completedLessons[lesson.id];
      const prevStars = prevRecord ? prevRecord.stars : 0;
      if (!prevRecord || starsAwarded > prevStars) {
        setIsNewRecord(true);
      }

      completeRound(lesson.id, currentRound, totalRounds, starsAwarded);
      clearRunningLesson();

      if (isPracticeMistakes) {
        refillHearts(); // Practice refills hearts!
      }

      if (lesson.isBoss && isFinalRound) {
        setShowTreasureModal(true);
      }

      setIsCompleted(true);
    }
  };

  // Keyboard navigation on desktop: 1-4, Enter, Backspace, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || isGameOver || phase1Active) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setShowExitConfirm(prev => !prev);
        return;
      }

      if (showExitConfirm) {
        if (e.key === 'Enter') {
          e.preventDefault();
          setShowExitConfirm(false);
        }
        return;
      }

      const activeEl = document.activeElement;
      const isInputActive = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (e.key === 'Enter') {
        e.preventDefault();
        if (feedback !== null) {
          handleContinue();
        } else if (canCheck()) {
          handleCheck();
        }
        return;
      }

      if (isInputActive) return;

      if (e.key === 'Backspace') {
        if (
          feedback === null &&
          (currentQ?.type === 'build' || currentQ?.type === 'translate' || currentQ?.type === 'listen')
        ) {
          e.preventDefault();
          setBuildWords(prev => (prev.length > 0 ? prev.slice(0, -1) : prev));
          sound.playPop();
        }
        return;
      }

      if (['1', '2', '3', '4'].includes(e.key) && feedback === null && currentQ) {
        const num = parseInt(e.key, 10);
        if (currentQ.type === 'choice' && currentQ.options[num - 1]) {
          e.preventDefault();
          setChoiceAnswer(currentQ.options[num - 1]);
          sound.playTap();
        } else if (currentQ.type === 'truefalse') {
          if (num === 1) {
            e.preventDefault();
            setTfAnswer(true);
            sound.playTap();
          } else if (num === 2) {
            e.preventDefault();
            setTfAnswer(false);
            sound.playTap();
          }
        } else if (currentQ.type === 'odd' && currentQ.options[num - 1]) {
          e.preventDefault();
          setOddIndex(num - 1);
          sound.playTap();
        } else if (currentQ.type === 'picture' && currentQ.options[num - 1]) {
          e.preventDefault();
          setPictureSelectedId(currentQ.options[num - 1].id);
          sound.playTap();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCompleted,
    isGameOver,
    phase1Active,
    showExitConfirm,
    feedback,
    currentQ,
    canCheck,
    choiceAnswer,
    fillValues,
    buildWords,
    tfAnswer,
    oddIndex,
    pictureSelectedId,
    currentIndex,
    questionQueue,
  ]);

  // Progress Bar percentage
  const progressPercent = Math.min(
    100,
    Math.round(((currentIndex) / Math.max(1, questionQueue.length)) * 100)
  );

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const accuracy = Math.max(
    0,
    Math.round((initialTotal / Math.max(1, initialTotal + mistakeCount)) * 100)
  );

  // --- PHASE 1: TEACHING CARDS VIEW ---
  if (phase1Active && teachCardsToShow.length > 0) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#131F24] flex flex-col justify-between selection:bg-none">
        <header className="w-full max-w-2xl mx-auto px-4 pt-[max(0.75rem,env(safe-area-inset-top,0.75rem))] pb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              clearRunningLesson();
              onExit();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="გასვლა"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-gray-500 dark:text-gray-400">
              {lesson.title}
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-lizu-purple/20 text-[#B8A1FF]">
              რაუნდი {currentRound}/{totalRounds}
            </span>
          </div>
          <div className="w-10" />
        </header>

        <main className="flex-1 w-full max-w-xl mx-auto px-4 py-2 flex flex-col justify-center">
          <TeachCardView
            cards={teachCardsToShow}
            onComplete={() => setPhase1Active(false)}
            onWordSeen={(word) => recordWordLearned(word)}
          />
        </main>
      </div>
    );
  }

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

  // --- LESSON / ROUND COMPLETED RESULTS SCREEN ---
  if (isCompleted) {
    const isFinalRound = currentRound >= totalRounds;
    const currentRoundInfo = getRoundInfo(currentRound, totalRounds);

    const handleStartNextRound = () => {
      const nextR = currentRound + 1;
      setCurrentRound(nextR);
      const nextTeach = lesson.teachCards && lesson.teachCards.length > 0 ? [lesson.teachCards[0]] : [];
      setPhase1Active(nextTeach.length > 0);
      setQuestionQueue(getQuestionsForRound(lesson, nextR, totalRounds));
      setCurrentIndex(0);
      setMistakeCount(0);
      resetInputs();
      setIsCompleted(false);
    };

    return (
      <div className="min-h-screen bg-white dark:bg-[#131F24] flex flex-col justify-between p-6 max-w-lg mx-auto">
        <div className="pt-6 flex flex-col items-center text-center gap-3">
          <LiziMascot
            mood="celebrating"
            size={160}
            bubbleText={isFinalRound ? 'ყოჩაღ! გაკვეთილი სრულად ჩაბარდა!' : `რაუნდი ${currentRound} წარმატებით დასრულდა!`}
          />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lizu-purple/20 text-[#B8A1FF] font-black text-xs">
            <span>რაუნდი {currentRound} / {totalRounds}</span>
          </div>

          {isNewRecord && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-400 text-amber-800 dark:text-amber-200 font-black text-sm animate-bounce">
              <Trophy className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>ახალი რეკორდი!</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            {isFinalRound ? 'გაკვეთილი ჩაბარებულია!' : `${currentRoundInfo.name} დასრულდა!`}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 font-semibold text-sm max-w-xs">
            {isFinalRound ? lesson.title : currentRoundInfo.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 flex flex-col items-center text-center card-lift shadow-xs">
            <Award className="w-6 h-6 text-lizu-yellow mb-1 animate-bounce-subtle" />
            <span className="text-xs font-bold text-gray-500 uppercase">XP ჯილდო</span>
            <span className="text-xl font-black text-amber-700 dark:text-amber-300">
              <AnimatedNumber value={lastEarnedXp} prefix="+" durationMs={700} />
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border-2 border-green-300 dark:border-green-700 flex flex-col items-center text-center card-lift shadow-xs">
            <CheckCircle2 className="w-6 h-6 text-lizu-green mb-1" />
            <span className="text-xs font-bold text-gray-500 uppercase">სიზუსტე</span>
            <span className="text-xl font-black text-lizu-green-dark dark:text-lizu-green">
              {accuracy}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-300 dark:border-blue-700 flex flex-col items-center text-center">
            <Clock className="w-6 h-6 text-lizu-blue mb-1" />
            <span className="text-xs font-bold text-gray-500 uppercase">დრო</span>
            <span className="text-xl font-black text-blue-700 dark:text-blue-300">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        <div className="pb-4 flex flex-col gap-2">
          {!isFinalRound ? (
            <>
              <button
                type="button"
                onClick={handleStartNextRound}
                className="btn-3d-green py-4 text-base font-black w-full flex items-center justify-center gap-2"
              >
                <span>შემდეგი რაუნდი ({currentRound + 1}/{totalRounds})</span>
                <ChevronRight className="w-5 h-5 stroke-[3]" />
              </button>
              <button
                type="button"
                onClick={onExit}
                className="py-3 text-xs font-bold text-gray-400 hover:text-gray-200 transition-colors"
              >
                მთავარზე დაბრუნება (შენახულია)
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onExit}
              className="btn-3d-green py-4 text-lg font-black w-full"
            >
              გაგრძელება
            </button>
          )}
        </div>

        {/* Treasure Chest Modal if Boss */}
        <TreasureChestModal
          isOpen={showTreasureModal}
          onClaim={(bonus) => {
            addXp(bonus);
            setShowTreasureModal(false);
          }}
          moduleTitle={lesson.unitTitle}
        />
      </div>
    );
  }

  // --- ACTIVE QUESTION PLAY SCREEN ---
  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-[100dvh] max-h-[100dvh] bg-[#F7F7F7] dark:bg-[#131F24] selection:bg-none relative overflow-hidden">
      {/* Combo Banner floating toast */}
      {showComboAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-amber-500 to-red-500 text-white font-black px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
          <Flame className="w-5 h-5 fill-white" />
          <span>{comboCount} კომბო! +2 XP</span>
        </div>
      )}

      {/* Top Header Bar (Row 1) */}
      <header className="w-full max-w-2xl mx-auto px-4 pt-[max(0.75rem,env(safe-area-inset-top,0.75rem))] pb-3 flex items-center justify-between gap-4">
        {/* Exit Button */}
        <button
          type="button"
          onClick={() => setShowExitConfirm(true)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          title="გასვლა"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Progress Bar + Round Indicator */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-black text-gray-400">
            <span className="truncate max-w-[120px]">{lesson.title}</span>
            <span className="text-[#B8A1FF]">რაუნდი {currentRound}/{totalRounds}</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-lizu-green rounded-full transition-all duration-300 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Combo indicator */}
        {comboCount >= 3 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black text-xs">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{comboCount}</span>
          </div>
        )}

        {/* Audio Mute toggle button */}
        <button
          type="button"
          onClick={toggleSound}
          className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          title={progress.soundEnabled ? 'ხმის გამორთვა' : 'ხმის ჩართვა'}
        >
          {progress.soundEnabled ? (
            <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <VolumeX className="w-5 h-5 text-lizu-red" />
          )}
        </button>

        {/* Hearts Count */}
        <div className="flex items-center gap-1.5 font-black text-lizu-red text-lg select-none">
          <Heart className="w-6 h-6 fill-lizu-red text-lizu-red" />
          <span>{progress.hearts}</span>
        </div>
      </header>

      {/* Main Question Area (Row 2: scrolls and shrinks) */}
      <main className="overflow-y-auto min-h-0 w-full max-w-xl mx-auto px-4 py-3 flex flex-col justify-start">
        {currentQ && (
          <>
            {/* Georgian translation of the German prompt: always visible, so no question is German-only */}
            {(() => {
              const tr = currentQ.translation || (currentQ.type === 'dialog' ? currentQ.subQuestion.translation : undefined);
              if (!tr || ['picture', 'translate', 'build'].includes(currentQ.type)) return null;
              return (
                <div className="mb-3 px-3 py-2 rounded-2xl bg-amber-950/40 border border-amber-800 text-sm font-bold text-amber-200 text-center flex items-center justify-center gap-2">
                  <FlagGE size={14} />
                  <span>{tr}</span>
                </div>
              );
            })()}

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
            {currentQ.type === 'translate' && (
              <TranslateQuestionView
                question={currentQ}
                selectedWords={buildWords}
                onChange={setBuildWords}
                disabled={feedback !== null}
              />
            )}
            {currentQ.type === 'picture' && (
              <PictureQuestionView
                question={currentQ}
                selectedId={pictureSelectedId}
                onSelect={setPictureSelectedId}
                disabled={feedback !== null}
              />
            )}
            {currentQ.type === 'speak' && (
              <SpeakQuestionView
                question={currentQ}
                onCorrect={() => {
                  sound.playCorrect();
                  setPraiseText(PRAISES[Math.floor(Math.random() * PRAISES.length)]);
                  setFeedback('correct');
                }}
                onSkip={() => {
                  // Skip without penalty
                  handleContinue();
                }}
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
        className={`shrink-0 w-full border-t-2 spring-transition shadow-2xl safe-area-bottom ${
          feedback === 'correct'
            ? 'bg-[#D7FFB8] dark:bg-[#16381C] border-[#58CC02] translate-y-0'
            : feedback === 'wrong'
            ? 'bg-[#FFDFE0] dark:bg-[#40181A] border-[#FF4B4B] translate-y-0'
            : 'bg-white dark:bg-gray-800 border-lizu-gray dark:border-gray-700'
        }`}
      >
        <div className="max-w-xl mx-auto px-4 py-4 sm:py-5 flex flex-col gap-3">
          {/* Feedback details */}
          {feedback === 'correct' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lizu-ok flex items-center justify-center text-white">
                  <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-lizu-ok-dark dark:text-lizu-ok">
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
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <h3 className="text-lg font-black text-rose-600 dark:text-rose-400">
                    სწორი პასუხი:
                  </h3>
                  <p className="font-extrabold text-gray-900 dark:text-gray-100 text-base break-words">
                    {correctAnswerDisplay}
                  </p>
                  {explanationDisplay && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium break-words">
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
                feedback === 'correct' ? 'btn-3d bg-lizu-ok text-white border-x-2 border-t-2 border-b-4 border-lizu-ok-dark active:border-b-2 hover:brightness-105' : 'btn-3d-red'
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
                onClick={() => {
                  clearRunningLesson();
                  onExit();
                }}
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
