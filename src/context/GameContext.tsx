import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question, UserProgress, DailyQuest } from '../types/lesson';
import { sound } from '../utils/sound';

interface GameContextType {
  progress: UserProgress;
  addXp: (amount: number) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  completeLesson: (lessonId: string, stars?: number) => void;
  recordMistake: (question: Question) => void;
  clearMistakes: () => void;
  removeMistake: (questionId: string) => void;
  toggleSound: () => void;
  toggleTypingMode: () => void;
  toggleDarkMode: () => void;
  resetProgress: () => void;
  heartRecoveryRemainingMinutes: number;
  recordWordLearned: (word: string) => void;
  setPlacementCompleted: (unlocked?: string[]) => void;
  updateDailyQuest: (questType: 'finish_lesson' | 'combo_10' | 'practice_mistakes', increment?: number) => void;
}

const STORAGE_KEY = 'lizulingo_user_progress_v2';
const OLD_STORAGE_KEY = 'lizulingo_user_progress_v1';
const HEARTS_REFILL_TIME_MS = 30 * 60 * 1000; // 30 minutes

const defaultDailyQuests: DailyQuest[] = [
  { id: 'finish_lesson', title: 'გაიარე 2 გაკვეთილი', description: 'დაასრულე ნებისმიერი 2 გაკვეთილი', current: 0, target: 2, completed: false, rewardXp: 20 },
  { id: 'combo_10', title: '10 სწორი პასუხი ზედიზედ', description: 'მიაღწიე 10-იან კომბოს', current: 0, target: 10, completed: false, rewardXp: 15 },
  { id: 'practice_mistakes', title: 'შეცდომების გამეორება', description: 'გაიმეორე შეცდომები ერთხელ მაინც', current: 0, target: 1, completed: false, rewardXp: 10 },
];

const defaultProgress: UserProgress = {
  xp: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  todayXp: 0,
  hearts: 5,
  maxHearts: 5,
  lastHeartLossTime: 0,
  completedLessons: {},
  unlockedLessons: ['1.1'],
  mistakes: [],
  soundEnabled: true,
  typingModeEnabled: false,
  darkMode: false,
  wordsLearned: [],
  achievements: {},
  placementCompleted: false,
  dailyQuests: defaultDailyQuests,
};

const FULL_LESSON_SEQUENCE: string[] = [
  '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1-boss',
  '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2-boss',
  '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3-boss',
  '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4-boss',
  '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5-boss',
  '6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6-boss',
];

function loadStoredProgress(): UserProgress {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // Migration from v1
    if (!raw) {
      const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
      if (oldRaw) {
        raw = oldRaw;
      }
    }

    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw);

    // Verify streak and today's XP reset on day change
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (parsed.lastActiveDate !== yesterday) {
        parsed.streak = 1;
      }
      parsed.todayXp = 0;
      parsed.lastActiveDate = today;
      // Reset daily quests on new day
      parsed.dailyQuests = defaultDailyQuests;
    }

    // Auto refill hearts if 30 minutes elapsed
    if (parsed.hearts < (parsed.maxHearts || 5) && parsed.lastHeartLossTime) {
      const elapsed = Date.now() - parsed.lastHeartLossTime;
      if (elapsed >= HEARTS_REFILL_TIME_MS) {
        parsed.hearts = parsed.maxHearts || 5;
        parsed.lastHeartLossTime = 0;
      }
    }

    if (!parsed.unlockedLessons) {
      parsed.unlockedLessons = ['1.1'];
    }
    if (!parsed.unlockedLessons.includes('1.1')) {
      parsed.unlockedLessons.unshift('1.1');
    }

    // Ensure array fields exist
    parsed.wordsLearned = parsed.wordsLearned || [];
    parsed.achievements = parsed.achievements || {};
    parsed.dailyQuests = parsed.dailyQuests || defaultDailyQuests;
    if (parsed.placementCompleted === undefined) {
      // If user had existing progress in v1, mark placement as completed so they are not prompted
      parsed.placementCompleted = Object.keys(parsed.completedLessons || {}).length > 0;
    }

    return { ...defaultProgress, ...parsed };
  } catch (err) {
    console.warn('Failed to read localStorage:', err);
    return defaultProgress;
  }
}

function saveProgress(data: UserProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to write localStorage:', err);
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(loadStoredProgress);
  const [now, setNow] = useState<number>(Date.now());

  // Heart timer tick every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      if (progress.hearts < progress.maxHearts && progress.lastHeartLossTime) {
        const elapsed = Date.now() - progress.lastHeartLossTime;
        if (elapsed >= HEARTS_REFILL_TIME_MS) {
          setProgress(prev => {
            const updated = { ...prev, hearts: prev.maxHearts, lastHeartLossTime: 0 };
            saveProgress(updated);
            return updated;
          });
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [progress.hearts, progress.maxHearts, progress.lastHeartLossTime]);

  // Sync dark mode class
  useEffect(() => {
    if (progress.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [progress.darkMode]);

  // Sync sound engine
  useEffect(() => {
    sound.setEnabled(progress.soundEnabled);
  }, [progress.soundEnabled]);

  const addXp = (amount: number) => {
    setProgress(prev => {
      const today = new Date().toISOString().split('T')[0];
      const updated: UserProgress = {
        ...prev,
        xp: prev.xp + amount,
        todayXp: prev.todayXp + amount,
        lastActiveDate: today,
      };
      saveProgress(updated);
      return updated;
    });
  };

  const loseHeart = () => {
    setProgress(prev => {
      const newHearts = Math.max(0, prev.hearts - 1);
      const updated: UserProgress = {
        ...prev,
        hearts: newHearts,
        lastHeartLossTime: prev.lastHeartLossTime === 0 ? Date.now() : prev.lastHeartLossTime,
      };
      saveProgress(updated);
      return updated;
    });
  };

  const refillHearts = () => {
    setProgress(prev => {
      const updated: UserProgress = {
        ...prev,
        hearts: prev.maxHearts,
        lastHeartLossTime: 0,
      };
      saveProgress(updated);
      return updated;
    });
  };

  const completeLesson = (lessonId: string, stars: number = 3) => {
    setProgress(prev => {
      const today = new Date().toISOString().split('T')[0];
      const completed = { ...prev.completedLessons };
      const currentStar = completed[lessonId]?.stars || 0;
      completed[lessonId] = {
        stars: Math.max(currentStar, stars),
        completedAt: new Date().toISOString(),
      };

      // Calculate next unlock in full sequence
      const unlocked = [...prev.unlockedLessons];
      const currentIndex = FULL_LESSON_SEQUENCE.indexOf(lessonId);
      if (currentIndex !== -1 && currentIndex + 1 < FULL_LESSON_SEQUENCE.length) {
        const nextId = FULL_LESSON_SEQUENCE[currentIndex + 1];
        if (!unlocked.includes(nextId)) {
          unlocked.push(nextId);
        }
      }

      // Update quests for completing a lesson
      const quests = (prev.dailyQuests || defaultDailyQuests).map(q => {
        if (q.id === 'finish_lesson') {
          const newCur = q.current + 1;
          return { ...q, current: newCur, completed: newCur >= q.target };
        }
        return q;
      });

      const updated: UserProgress = {
        ...prev,
        completedLessons: completed,
        unlockedLessons: unlocked,
        lastActiveDate: today,
        dailyQuests: quests,
      };
      saveProgress(updated);
      return updated;
    });
  };

  const recordMistake = (question: Question) => {
    setProgress(prev => {
      const existing = prev.mistakes.filter(m => m.question.id !== question.id);
      const updated: UserProgress = {
        ...prev,
        mistakes: [{ question, failedAt: Date.now() }, ...existing].slice(0, 50),
      };
      saveProgress(updated);
      return updated;
    });
  };

  const removeMistake = (questionId: string) => {
    setProgress(prev => {
      const updated: UserProgress = {
        ...prev,
        mistakes: prev.mistakes.filter(m => m.question.id !== questionId),
      };
      saveProgress(updated);
      return updated;
    });
  };

  const clearMistakes = () => {
    setProgress(prev => {
      const updated: UserProgress = {
        ...prev,
        mistakes: [],
      };
      saveProgress(updated);
      return updated;
    });
  };

  const toggleSound = () => {
    setProgress(prev => {
      const updated: UserProgress = { ...prev, soundEnabled: !prev.soundEnabled };
      saveProgress(updated);
      return updated;
    });
  };

  const toggleTypingMode = () => {
    setProgress(prev => {
      const updated: UserProgress = { ...prev, typingModeEnabled: !prev.typingModeEnabled };
      saveProgress(updated);
      return updated;
    });
  };

  const toggleDarkMode = () => {
    setProgress(prev => {
      const updated: UserProgress = { ...prev, darkMode: !prev.darkMode };
      saveProgress(updated);
      return updated;
    });
  };

  const resetProgress = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(OLD_STORAGE_KEY);
    } catch {}
    setProgress(defaultProgress);
  };

  const recordWordLearned = (word: string) => {
    setProgress(prev => {
      if ((prev.wordsLearned || []).includes(word)) return prev;
      const updated: UserProgress = {
        ...prev,
        wordsLearned: [...(prev.wordsLearned || []), word],
      };
      saveProgress(updated);
      return updated;
    });
  };

  const setPlacementCompleted = (unlocked?: string[]) => {
    setProgress(prev => {
      const newUnlocked = Array.from(new Set([...(prev.unlockedLessons || ['1.1']), ...(unlocked || [])]));
      const updated: UserProgress = {
        ...prev,
        placementCompleted: true,
        unlockedLessons: newUnlocked,
      };
      saveProgress(updated);
      return updated;
    });
  };

  const updateDailyQuest = (questType: 'finish_lesson' | 'combo_10' | 'practice_mistakes', increment: number = 1) => {
    setProgress(prev => {
      const quests = (prev.dailyQuests || defaultDailyQuests).map(q => {
        if (q.id === questType) {
          const newCur = q.current + increment;
          return { ...q, current: newCur, completed: newCur >= q.target };
        }
        return q;
      });
      const updated: UserProgress = { ...prev, dailyQuests: quests };
      saveProgress(updated);
      return updated;
    });
  };

  // Heart refill countdown calculation
  let heartRecoveryRemainingMinutes = 0;
  if (progress.hearts < progress.maxHearts && progress.lastHeartLossTime) {
    const elapsed = now - progress.lastHeartLossTime;
    const remainingMs = Math.max(0, HEARTS_REFILL_TIME_MS - elapsed);
    heartRecoveryRemainingMinutes = Math.ceil(remainingMs / 60000);
  }

  return (
    <GameContext.Provider
      value={{
        progress,
        addXp,
        loseHeart,
        refillHearts,
        completeLesson,
        recordMistake,
        clearMistakes,
        removeMistake,
        toggleSound,
        toggleTypingMode,
        toggleDarkMode,
        resetProgress,
        heartRecoveryRemainingMinutes,
        recordWordLearned,
        setPlacementCompleted,
        updateDailyQuest,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
}
