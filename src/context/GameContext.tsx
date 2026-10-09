import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question, UserProgress } from '../types/lesson';
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
}

const STORAGE_KEY = 'lizulingo_user_progress_v1';
const HEARTS_REFILL_TIME_MS = 30 * 60 * 1000; // 30 minutes

const defaultProgress: UserProgress = {
  xp: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  todayXp: 0,
  hearts: 5,
  maxHearts: 5,
  lastHeartLossTime: 0,
  completedLessons: {},
  unlockedLessons: ['2.1'], // Initially first lesson unlocked
  mistakes: [],
  soundEnabled: true,
  typingModeEnabled: false,
  darkMode: false,
};

function loadStoredProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw);

    // Verify streak and today's XP reset on day change
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (parsed.lastActiveDate !== yesterday) {
        // missed more than 1 day
        parsed.streak = 1;
      }
      parsed.todayXp = 0;
      parsed.lastActiveDate = today;
    }

    // Auto refill hearts if 30 minutes elapsed
    if (parsed.hearts < parsed.maxHearts && parsed.lastHeartLossTime) {
      const elapsed = Date.now() - parsed.lastHeartLossTime;
      if (elapsed >= HEARTS_REFILL_TIME_MS) {
        parsed.hearts = parsed.maxHearts;
        parsed.lastHeartLossTime = 0;
      }
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

      // Calculate next unlock
      const unlocked = [...prev.unlockedLessons];
      const sequence = [
        '2.1', '2.2', '2.3', '2.4', '2.5', '2-boss',
        '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3-boss'
      ];
      const currentIndex = sequence.indexOf(lessonId);
      if (currentIndex !== -1 && currentIndex + 1 < sequence.length) {
        const nextId = sequence[currentIndex + 1];
        if (!unlocked.includes(nextId)) {
          unlocked.push(nextId);
        }
      }

      const updated: UserProgress = {
        ...prev,
        completedLessons: completed,
        unlockedLessons: unlocked,
        lastActiveDate: today,
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
    } catch {}
    setProgress(defaultProgress);
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
