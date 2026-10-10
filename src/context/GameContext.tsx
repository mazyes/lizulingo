import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Question, UserProgress, RunningLessonState } from '../types/lesson';
import { sound } from '../utils/sound';
import {
  STORAGE_KEY_V2,
  loadAndMigrateProgress,
  requestStoragePersistence,
  createDefaultProgress,
  migrate,
  defaultDailyQuests,
} from '../utils/migration';

interface GameContextType {
  progress: UserProgress;
  isStorageBlocked: boolean;
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
  // Part B upgrades
  saveRunningLesson: (lessonState: RunningLessonState) => void;
  clearRunningLesson: () => void;
  recordWordStat: (word: string, isCorrect: boolean) => void;
  recordAnswerResult: (isCorrect: boolean, secondsSpent?: number) => void;
  setSoundVolume: (vol: number) => void;
  setSoundEffectsEnabled: (enabled: boolean) => void;
  setGermanVoiceEnabled: (enabled: boolean) => void;
  setSpeechSpeed: (speed: number) => void;
  exportProgress: () => string;
  importProgress: (jsonString: string, mode: 'merge' | 'replace') => { success: boolean; error?: string };
  generateTransferCode: () => string;
  importTransferCode: (code: string, mode: 'merge' | 'replace') => { success: boolean; error?: string };
}

const HEARTS_REFILL_TIME_MS = 30 * 60 * 1000; // 30 minutes

const FULL_LESSON_SEQUENCE: string[] = [
  '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1-boss',
  '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2-boss',
  '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3-boss',
  '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4-boss',
  '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5-boss',
  '6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6-boss',
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const { progress: initial } = loadAndMigrateProgress();
    return initial;
  });
  const [isStorageBlocked, setIsStorageBlocked] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return true;
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return false;
    } catch {
      return true;
    }
  });
  const [, setNow] = useState<number>(Date.now());
  const pendingSaveRef = useRef<UserProgress | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Request persistent storage on mount
  useEffect(() => {
    requestStoragePersistence();
  }, []);

  // Sync to localStorage with debounce and flush handlers
  const flushSave = useCallback(() => {
    if (!pendingSaveRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(pendingSaveRef.current));
      setIsStorageBlocked(false);
      pendingSaveRef.current = null;
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
      setIsStorageBlocked(true);
    }
  }, []);

  const queueSave = useCallback((data: UserProgress) => {
    pendingSaveRef.current = data;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(flushSave, 300);
  }, [flushSave]);

  // Flush pending save on pagehide and visibilitychange (hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) flushSave();
    };
    const handlePageHide = () => flushSave();

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [flushSave]);

  // Multi-tab synchronization: reload state when another tab modifies STORAGE_KEY_V2
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_V2 && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          const migrated = migrate(fresh);
          setProgress(migrated);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // Heart timer tick every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      if (progress.hearts < progress.maxHearts && progress.lastHeartLossTime) {
        const elapsed = Date.now() - progress.lastHeartLossTime;
        if (elapsed >= HEARTS_REFILL_TIME_MS) {
          setProgress(prev => {
            const updated: UserProgress = { ...prev, hearts: prev.maxHearts, lastHeartLossTime: 0 };
            queueSave(updated);
            return updated;
          });
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [progress.hearts, progress.maxHearts, progress.lastHeartLossTime, queueSave]);

  // Sync dark mode class
  useEffect(() => {
    // Dark mode only: the app has no light theme anymore.
    document.documentElement.classList.add('dark');
  }, [progress.darkMode]);

  // Sync sound settings
  useEffect(() => {
    sound.setEnabled(progress.soundEnabled && progress.soundEffectsEnabled !== false);
    if (typeof progress.soundVolume === 'number') {
      sound.setVolume(progress.soundVolume);
    }
  }, [progress.soundEnabled, progress.soundEffectsEnabled, progress.soundVolume]);

  const addXp = (amount: number) => {
    setProgress(prev => {
      const today = new Date().toISOString().split('T')[0];
      const history = { ...(prev.dailyXpHistory || {}) };
      history[today] = (history[today] || 0) + amount;

      const updated: UserProgress = {
        ...prev,
        xp: prev.xp + amount,
        todayXp: prev.todayXp + amount,
        lastActiveDate: today,
        dailyXpHistory: history,
      };
      queueSave(updated);
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
      sound.playHeartLost(newHearts > 0);
      queueSave(updated);
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
      queueSave(updated);
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

      // Update streak only on lesson completion
      let newStreak = prev.streak || 0;
      const lastActive = prev.lastActiveDate;
      if (!lastActive || lastActive !== today) {
        if (!lastActive) {
          newStreak = 1;
        } else {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (lastActive === yesterday) {
            newStreak = (prev.streak || 0) + 1;
          } else {
            newStreak = 1;
          }
        }
      }

      // Clear running lesson state once finished
      const updated: UserProgress = {
        ...prev,
        streak: newStreak,
        completedLessons: completed,
        unlockedLessons: unlocked,
        lastActiveDate: today,
        dailyQuests: quests,
        runningLesson: null,
      };
      queueSave(updated);
      return updated;
    });
  };

  const recordMistake = (question: Question) => {
    setProgress(prev => {
      const existing = prev.mistakes.filter(m => m.question.id !== question.id);
      const updated: UserProgress = {
        ...prev,
        mistakes: [...existing, { question, failedAt: Date.now() }],
      };
      queueSave(updated);
      return updated;
    });
  };

  const clearMistakes = () => {
    setProgress(prev => {
      const updated: UserProgress = { ...prev, mistakes: [] };
      queueSave(updated);
      return updated;
    });
  };

  const removeMistake = (questionId: string) => {
    setProgress(prev => {
      const updated: UserProgress = {
        ...prev,
        mistakes: prev.mistakes.filter(m => m.question.id !== questionId),
      };
      queueSave(updated);
      return updated;
    });
  };

  const recordWordLearned = (word: string) => {
    setProgress(prev => {
      const set = new Set(prev.wordsLearned || []);
      set.add(word);
      const updated: UserProgress = {
        ...prev,
        wordsLearned: Array.from(set),
      };
      queueSave(updated);
      return updated;
    });
  };

  const saveRunningLesson = (lessonState: RunningLessonState) => {
    setProgress(prev => {
      const updated: UserProgress = {
        ...prev,
        runningLesson: lessonState,
      };
      queueSave(updated);
      return updated;
    });
  };

  const clearRunningLesson = () => {
    setProgress(prev => {
      const updated: UserProgress = {
        ...prev,
        runningLesson: null,
      };
      queueSave(updated);
      return updated;
    });
  };

  const recordWordStat = (word: string, isCorrect: boolean) => {
    setProgress(prev => {
      const stats = { ...(prev.wordStats || {}) };
      const current = stats[word] || { right: 0, wrong: 0, lastSeen: Date.now() };
      stats[word] = {
        right: isCorrect ? current.right + 1 : current.right,
        wrong: !isCorrect ? current.wrong + 1 : current.wrong,
        lastSeen: Date.now(),
      };
      const updated: UserProgress = { ...prev, wordStats: stats };
      queueSave(updated);
      return updated;
    });
  };

  const recordAnswerResult = (isCorrect: boolean, secondsSpent: number = 0) => {
    setProgress(prev => {
      const total = (prev.totalAnswersCount || 0) + 1;
      const correct = (prev.correctAnswersCount || 0) + (isCorrect ? 1 : 0);
      const seconds = (prev.totalLearningSeconds || 0) + secondsSpent;

      const updated: UserProgress = {
        ...prev,
        totalAnswersCount: total,
        correctAnswersCount: correct,
        totalLearningSeconds: seconds,
      };
      queueSave(updated);
      return updated;
    });
  };

  const setSoundVolume = (vol: number) => {
    setProgress(prev => {
      const updated: UserProgress = { ...prev, soundVolume: vol };
      queueSave(updated);
      return updated;
    });
  };

  const setSoundEffectsEnabled = (enabled: boolean) => {
    setProgress(prev => {
      const updated: UserProgress = { ...prev, soundEffectsEnabled: enabled };
      queueSave(updated);
      return updated;
    });
  };

  const setGermanVoiceEnabled = (enabled: boolean) => {
    setProgress(prev => {
      const updated: UserProgress = { ...prev, germanVoiceEnabled: enabled };
      queueSave(updated);
      return updated;
    });
  };

  const setSpeechSpeed = (speed: number) => {
    setProgress(prev => {
      const updated: UserProgress = { ...prev, speechSpeed: speed };
      queueSave(updated);
      return updated;
    });
  };

  const toggleSound = () => {
    setProgress(prev => {
      const updated: UserProgress = { ...prev, soundEnabled: !prev.soundEnabled };
      queueSave(updated);
      return updated;
    });
  };

  const toggleTypingMode = () => {
    setProgress(prev => {
      const updated: UserProgress = { ...prev, typingModeEnabled: !prev.typingModeEnabled };
      queueSave(updated);
      return updated;
    });
  };

  const toggleDarkMode = () => {
    setProgress(prev => {
      const updated: UserProgress = { ...prev, darkMode: !prev.darkMode };
      queueSave(updated);
      return updated;
    });
  };

  const setPlacementCompleted = (unlockedLessons?: string[]) => {
    setProgress(prev => {
      const list = unlockedLessons && unlockedLessons.length > 0 ? unlockedLessons : ['1.1'];
      const updated: UserProgress = {
        ...prev,
        placementCompleted: true,
        unlockedLessons: Array.from(new Set([...prev.unlockedLessons, ...list])),
      };
      queueSave(updated);
      return updated;
    });
  };

  const updateDailyQuest = (questType: 'finish_lesson' | 'combo_10' | 'practice_mistakes', increment: number = 1) => {
    setProgress(prev => {
      const quests = (prev.dailyQuests || defaultDailyQuests).map(q => {
        if (q.id === questType) {
          const newCurrent = q.current + increment;
          const isNowCompleted = newCurrent >= q.target;
          return {
            ...q,
            current: newCurrent,
            completed: isNowCompleted,
          };
        }
        return q;
      });
      const updated: UserProgress = { ...prev, dailyQuests: quests };
      queueSave(updated);
      return updated;
    });
  };

  const resetProgress = () => {
    const fresh = createDefaultProgress();
    setProgress(fresh);
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(fresh));
    } catch {}
  };

  const exportProgress = (): string => {
    flushSave();
    return JSON.stringify(progress, null, 2);
  };

  const importProgress = (jsonString: string, mode: 'merge' | 'replace'): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'არასწორი ფაილის ფორმატი' };
      }

      const imported = migrate(parsed);

      let finalState: UserProgress;
      if (mode === 'replace') {
        finalState = imported;
      } else {
        // Merge: keep highest XP, union of completed lessons and words, longest streak
        const mergedCompleted = { ...progress.completedLessons };
        for (const [k, v] of Object.entries(imported.completedLessons)) {
          if (!mergedCompleted[k] || v.stars > mergedCompleted[k].stars) {
            mergedCompleted[k] = v;
          }
        }

        const mergedWords = Array.from(new Set([...(progress.wordsLearned || []), ...(imported.wordsLearned || [])]));
        const mergedUnlocked = Array.from(new Set([...progress.unlockedLessons, ...imported.unlockedLessons]));

        finalState = {
          ...progress,
          xp: Math.max(progress.xp, imported.xp),
          streak: Math.max(progress.streak, imported.streak),
          completedLessons: mergedCompleted,
          unlockedLessons: mergedUnlocked,
          wordsLearned: mergedWords,
          achievements: { ...progress.achievements, ...imported.achievements },
        };
      }

      setProgress(finalState);
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(finalState));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'შეცდომა იმპორტისას' };
    }
  };

  const generateTransferCode = (): string => {
    try {
      flushSave();
      const minimal = {
        x: progress.xp,
        s: progress.streak,
        c: Object.keys(progress.completedLessons).map(k => [k, progress.completedLessons[k].stars]),
        w: progress.wordsLearned,
        u: progress.unlockedLessons,
      };
      const jsonStr = JSON.stringify(minimal);
      return btoa(encodeURIComponent(jsonStr));
    } catch {
      return '';
    }
  };

  const importTransferCode = (code: string, mode: 'merge' | 'replace'): { success: boolean; error?: string } => {
    try {
      const jsonStr = decodeURIComponent(atob(code.trim()));
      const min = JSON.parse(jsonStr);

      const completedMap: Record<string, { stars: number; completedAt: string }> = {};
      if (Array.isArray(min.c)) {
        for (const [k, stars] of min.c) {
          completedMap[k] = { stars, completedAt: new Date().toISOString() };
        }
      }

      const dummy = {
        xp: min.x || 0,
        streak: min.s || 1,
        completedLessons: completedMap,
        wordsLearned: min.w || [],
        unlockedLessons: min.u || ['1.1'],
      };

      return importProgress(JSON.stringify(dummy), mode);
    } catch {
      return { success: false, error: 'კოდი არასწორია ან დაზიანებულია' };
    }
  };

  // Remaining minutes for heart recovery
  const heartRecoveryRemainingMinutes = Math.max(
    0,
    Math.ceil((HEARTS_REFILL_TIME_MS - (Date.now() - (progress.lastHeartLossTime || 0))) / 60000)
  );

  return (
    <GameContext.Provider
      value={{
        progress,
        isStorageBlocked,
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
        saveRunningLesson,
        clearRunningLesson,
        recordWordStat,
        recordAnswerResult,
        setSoundVolume,
        setSoundEffectsEnabled,
        setGermanVoiceEnabled,
        setSpeechSpeed,
        exportProgress,
        importProgress,
        generateTransferCode,
        importTransferCode,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
