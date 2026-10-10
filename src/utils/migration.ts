import { UserProgress, DailyQuest } from '../types/lesson';

export const CURRENT_STORAGE_VERSION = 2;
export const STORAGE_KEY_V2 = 'lizulingo_progress_v2';
export const LEGACY_KEY_V1 = 'lizulingo_user_progress_v1';
export const LEGACY_KEY_INTERMEDIATE = 'lizulingo_user_progress_v2';

export const defaultDailyQuests: DailyQuest[] = [
  { id: 'finish_lesson', title: 'გაიარე 2 გაკვეთილი', description: 'დაასრულე ნებისმიერი 2 გაკვეთილი', current: 0, target: 2, completed: false, rewardXp: 20 },
  { id: 'combo_10', title: '10 სწორი პასუხი ზედიზედ', description: 'მიაღწიე 10-იან კომბოს', current: 0, target: 10, completed: false, rewardXp: 15 },
  { id: 'practice_mistakes', title: 'შეცდომების გამეორება', description: 'გაიმეორე შეცდომები ერთხელ მაინც', current: 0, target: 1, completed: false, rewardXp: 10 },
];

export function createDefaultProgress(): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  return {
    version: CURRENT_STORAGE_VERSION,
    xp: 0,
    streak: 0,
    lastActiveDate: '',
    todayXp: 0,
    hearts: 5,
    maxHearts: 5,
    lastHeartLossTime: 0,
    completedLessons: {},
    lessonRounds: {},
    unlockedLessons: ['1.1'],
    mistakes: [],
    soundEnabled: true,
    typingModeEnabled: false,
    darkMode: true,
    wordsLearned: [],
    achievements: {},
    placementCompleted: false,
    dailyQuests: defaultDailyQuests,
    runningLesson: null,
    wordStats: {},
    dailyXpHistory: { [today]: 0 },
    soundVolume: 0.8,
    soundEffectsEnabled: true,
    germanVoiceEnabled: true,
    speechSpeed: 1.0,
    totalLearningSeconds: 0,
    totalAnswersCount: 0,
    correctAnswersCount: 0,
  };
}

/**
 * Step-by-step migration engine for older progress formats
 */
export function migrate(data: any): UserProgress {
  if (!data || typeof data !== 'object') {
    return createDefaultProgress();
  }

  let current = { ...data };

  // If data lacks a version, assume version 1
  const version = typeof current.version === 'number' ? current.version : 1;

  // Upgrade v1 -> v2
  if (version < 2) {
    const today = new Date().toISOString().split('T')[0];
    const initialHistory: Record<string, number> = {};
    if (current.todayXp) {
      initialHistory[today] = current.todayXp;
    }

    current = {
      ...current,
      version: 2,
      runningLesson: current.runningLesson || null,
      wordStats: current.wordStats || {},
      dailyXpHistory: current.dailyXpHistory || initialHistory,
      soundVolume: typeof current.soundVolume === 'number' ? current.soundVolume : 0.8,
      soundEffectsEnabled: current.soundEnabled !== false,
      germanVoiceEnabled: true,
      speechSpeed: typeof current.speechSpeed === 'number' ? current.speechSpeed : 1.0,
      totalLearningSeconds: current.totalLearningSeconds || 0,
      totalAnswersCount: current.totalAnswersCount || 0,
      correctAnswersCount: current.correctAnswersCount || 0,
      wordsLearned: Array.isArray(current.wordsLearned) ? current.wordsLearned : [],
      achievements: current.achievements || {},
      placementCompleted:
        current.placementCompleted !== undefined
          ? current.placementCompleted
          : Object.keys(current.completedLessons || {}).length > 0,
      dailyQuests: current.dailyQuests || defaultDailyQuests,
    };
  }

  // Sanitize arrays and essential properties
  if (!Array.isArray(current.unlockedLessons) || current.unlockedLessons.length === 0) {
    current.unlockedLessons = ['1.1'];
  }
  if (!current.unlockedLessons.includes('1.1')) {
    current.unlockedLessons.unshift('1.1');
  }

  if (typeof current.xp !== 'number' || isNaN(current.xp)) current.xp = 0;
  if (!current.completedLessons || typeof current.completedLessons !== 'object') {
    current.completedLessons = {};
  }

  // Part 2: Rounds migration (a lesson in completedLessons gets rounds = 5, stays complete)
  if (!current.lessonRounds || typeof current.lessonRounds !== 'object') {
    current.lessonRounds = {};
  }
  for (const lessonId of Object.keys(current.completedLessons)) {
    if (current.lessonRounds[lessonId] === undefined) {
      current.lessonRounds[lessonId] = 5;
    }
  }

  current.darkMode = true;

  const completedCount = Object.keys(current.completedLessons).length;
  if (completedCount === 0) {
    current.streak = 0;
  } else if (typeof current.streak !== 'number' || isNaN(current.streak) || current.streak < 1) {
    current.streak = 1;
  }
  if (typeof current.hearts !== 'number' || isNaN(current.hearts)) current.hearts = 5;
  if (!Array.isArray(current.mistakes)) current.mistakes = [];

  return current as UserProgress;
}

/**
 * Loads progress from localStorage, migrating old formats and backing up corrupted data
 */
export function loadAndMigrateProgress(): { progress: UserProgress; corrupted: boolean } {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { progress: createDefaultProgress(), corrupted: false };
  }

  let raw: string | null = null;
  let sourceKey = STORAGE_KEY_V2;

  try {
    raw = localStorage.getItem(STORAGE_KEY_V2);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_KEY_V1);
      sourceKey = LEGACY_KEY_V1;
    }
    if (!raw) {
      raw = localStorage.getItem(LEGACY_KEY_INTERMEDIATE);
      sourceKey = LEGACY_KEY_INTERMEDIATE;
    }

    if (!raw) {
      const fresh = createDefaultProgress();
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(fresh));
      return { progress: fresh, corrupted: false };
    }

    // Try parsing
    const parsed = JSON.parse(raw);
    const migrated = migrate(parsed);

    // Save under STORAGE_KEY_V2
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated));

    // Migration succeeded: safe to clean up older legacy keys
    if (sourceKey === LEGACY_KEY_V1) {
      localStorage.removeItem(LEGACY_KEY_V1);
    }
    if (sourceKey === LEGACY_KEY_INTERMEDIATE) {
      localStorage.removeItem(LEGACY_KEY_INTERMEDIATE);
    }

    return { progress: migrated, corrupted: false };
  } catch (err) {
    console.error('Failed to parse progress data, creating backup:', err);
    try {
      if (raw) {
        const corruptKey = `lizulingo_progress_corrupt_${new Date().toISOString().replace(/[:.]/g, '-')}`;
        localStorage.setItem(corruptKey, raw);
      }
    } catch {}

    const fresh = createDefaultProgress();
    fresh.isStorageCorrupted = true;
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(fresh));
    } catch {}

    return { progress: fresh, corrupted: true };
  }
}

/**
 * Requests browser persistent storage
 */
export function requestStoragePersistence() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }
}
