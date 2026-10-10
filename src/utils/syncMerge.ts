import { UserProgress } from '../types/lesson';

/**
 * Pure function to merge two UserProgress states (e.g. local and cloud).
 * Follows the offline-first rule:
 * - Keep highest XP, highest streak
 * - Union of completed lessons (keeping higher star count for each)
 * - Union of unlocked lessons
 * - Union of words learned
 * - Union of mistakes (deduplicated by question ID)
 * - Merge achievements
 * - Merge xpHistory (taking highest XP for each day)
 * - Retain newest user settings
 * - Trims xpHistory to last 365 days if payload is excessively large
 */
export function mergeProgress(local: UserProgress, remote: UserProgress): UserProgress {
  if (!local && !remote) {
    throw new Error('Both progress objects are null or undefined');
  }
  if (!local) return remote;
  if (!remote) return local;

  // 1. Merge completed lessons (take max stars and newest completedAt)
  const mergedCompleted: Record<string, { stars: number; completedAt: string }> = {
    ...(local.completedLessons || {}),
  };

  for (const [lessonId, remoteRecord] of Object.entries(remote.completedLessons || {})) {
    const existing = mergedCompleted[lessonId];
    if (!existing) {
      mergedCompleted[lessonId] = remoteRecord;
    } else {
      mergedCompleted[lessonId] = {
        stars: Math.max(existing.stars || 0, remoteRecord.stars || 0),
        completedAt:
          existing.completedAt && remoteRecord.completedAt
            ? new Date(existing.completedAt) > new Date(remoteRecord.completedAt)
              ? existing.completedAt
              : remoteRecord.completedAt
            : existing.completedAt || remoteRecord.completedAt,
      };
    }
  }

  // 2. Union of unlocked lessons
  const mergedUnlocked = Array.from(
    new Set([...(local.unlockedLessons || ['1.1']), ...(remote.unlockedLessons || ['1.1'])])
  );

  // 3. Union of words learned
  const mergedWords = Array.from(
    new Set([...(local.wordsLearned || []), ...(remote.wordsLearned || [])])
  );

  // 4. Union of mistakes (deduplicate by question.id or content)
  const mistakeMap = new Map<string, any>();
  for (const m of [...(local.mistakes || []), ...(remote.mistakes || [])]) {
    const key = m?.question?.id || JSON.stringify(m?.question || {});
    if (!mistakeMap.has(key)) {
      mistakeMap.set(key, m);
    }
  }
  const mergedMistakes = Array.from(mistakeMap.values());

  // 5. Merge achievements
  const mergedAchievements = {
    ...(local.achievements || {}),
    ...(remote.achievements || {}),
  };

  // 6. Merge xpHistory
  const mergedXpHistory: Record<string, number> = {
    ...(local.xpHistory || local.dailyXpHistory || {}),
  };
  for (const [date, xp] of Object.entries(remote.xpHistory || remote.dailyXpHistory || {})) {
    mergedXpHistory[date] = Math.max(mergedXpHistory[date] || 0, (xp as number) || 0);
  }

  // Size guard: trim history older than 365 days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 365);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);
  for (const date of Object.keys(mergedXpHistory)) {
    if (date < cutoffStr) {
      delete mergedXpHistory[date];
    }
  }

  // 7. Settings & active progress
  return {
    ...local,
    version: Math.max(local.version || 2, remote.version || 2),
    xp: Math.max(local.xp || 0, remote.xp || 0),
    streak: Math.max(local.streak || 0, remote.streak || 0),
    todayXp: Math.max(local.todayXp || 0, remote.todayXp || 0),
    hearts: Math.max(local.hearts ?? 5, remote.hearts ?? 5),
    unlockedLessons: mergedUnlocked,
    completedLessons: mergedCompleted,
    wordsLearned: mergedWords,
    mistakes: mergedMistakes,
    achievements: mergedAchievements,
    xpHistory: mergedXpHistory,
    dailyXpHistory: mergedXpHistory,
    soundEnabled: local.soundEnabled !== undefined ? local.soundEnabled : remote.soundEnabled,
    darkMode: local.darkMode !== undefined ? local.darkMode : remote.darkMode,
    germanVoiceEnabled:
      local.germanVoiceEnabled !== undefined
        ? local.germanVoiceEnabled
        : remote.germanVoiceEnabled,
    speechSpeed: local.speechSpeed || remote.speechSpeed || 1.0,
    dailyGoalXp: Math.max(local.dailyGoalXp || 30, remote.dailyGoalXp || 30),
  };
}
