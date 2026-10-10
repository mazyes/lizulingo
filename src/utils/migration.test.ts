import { describe, it, expect } from 'vitest';
import { migrate, createDefaultProgress } from './migration';

describe('B1: Storage Migration & Reliability', () => {
  it('migrates a v1 sample object into v2 without losing data', () => {
    const v1Sample = {
      xp: 450,
      streak: 7,
      lastActiveDate: '2026-10-09',
      todayXp: 60,
      hearts: 4,
      maxHearts: 5,
      lastHeartLossTime: 123456789,
      completedLessons: {
        '1.1': { stars: 3, completedAt: '2026-10-08T12:00:00Z' },
        '1.2': { stars: 2, completedAt: '2026-10-09T14:30:00Z' },
      },
      unlockedLessons: ['1.1', '1.2', '1.3'],
      mistakes: [],
      soundEnabled: true,
      typingModeEnabled: true,
      darkMode: true,
      wordsLearned: ['Hallo', 'Guten Tag'],
      achievements: { first_lesson: true },
      placementCompleted: true,
    };

    const migrated = migrate(v1Sample);

    expect(migrated.version).toBe(2);
    expect(migrated.xp).toBe(450);
    expect(migrated.streak).toBe(7);
    expect(migrated.hearts).toBe(4);
    expect(migrated.completedLessons['1.1'].stars).toBe(3);
    expect(migrated.completedLessons['1.2'].stars).toBe(2);
    expect(migrated.unlockedLessons).toContain('1.1');
    expect(migrated.unlockedLessons).toContain('1.3');
    expect(migrated.wordsLearned).toEqual(['Hallo', 'Guten Tag']);
    expect(migrated.achievements.first_lesson).toBe(true);
    expect(migrated.typingModeEnabled).toBe(true);
    expect(migrated.darkMode).toBe(true);
    expect(migrated.soundEffectsEnabled).toBe(true);
    expect(migrated.runningLesson).toBeNull();
    expect(migrated.wordStats).toBeDefined();
  });

  it('safely handles null, undefined, or empty objects with default progress', () => {
    const defaultProg = createDefaultProgress();
    const fromNull = migrate(null);
    const fromEmpty = migrate({});

    expect(fromNull.version).toBe(2);
    expect(fromNull.hearts).toBe(5);
    expect(fromNull.streak).toBe(0);
    expect(fromEmpty.version).toBe(2);
    expect(fromEmpty.unlockedLessons).toContain('1.1');
    expect(fromEmpty.streak).toBe(0);
    expect(defaultProg.version).toBe(2);
    expect(defaultProg.streak).toBe(0);
  });
});
