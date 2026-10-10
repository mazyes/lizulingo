import { describe, it, expect } from 'vitest';
import { mergeProgress } from './syncMerge';
import { createDefaultProgress } from './migration';
import { UserProgress } from '../types/lesson';

describe('mergeProgress: Offline-first cloud and local synchronization', () => {
  it('handles empty cloud progress (first sync from active device)', () => {
    const local: UserProgress = {
      ...createDefaultProgress(),
      xp: 250,
      streak: 5,
      wordsLearned: ['Hallo', 'Guten Morgen'],
      completedLessons: {
        '1.1': { stars: 3, completedAt: '2026-10-09T10:00:00Z' },
      },
    };

    const emptyCloud: UserProgress = createDefaultProgress();

    const merged = mergeProgress(local, emptyCloud);

    expect(merged.xp).toBe(250);
    expect(merged.streak).toBe(5);
    expect(merged.wordsLearned).toEqual(['Hallo', 'Guten Morgen']);
    expect(merged.completedLessons['1.1'].stars).toBe(3);
  });

  it('handles empty local progress (new device logging into existing account)', () => {
    const freshLocal = createDefaultProgress();
    const cloudAccount: UserProgress = {
      ...createDefaultProgress(),
      xp: 1200,
      streak: 14,
      wordsLearned: ['Wasser', 'Brot', 'Kaffee'],
      completedLessons: {
        '1.1': { stars: 3, completedAt: '2026-10-01T10:00:00Z' },
        '1.2': { stars: 3, completedAt: '2026-10-02T10:00:00Z' },
      },
      unlockedLessons: ['1.1', '1.2', '1.3'],
    };

    const merged = mergeProgress(freshLocal, cloudAccount);

    expect(merged.xp).toBe(1200);
    expect(merged.streak).toBe(14);
    expect(merged.wordsLearned).toEqual(['Wasser', 'Brot', 'Kaffee']);
    expect(merged.completedLessons['1.1'].stars).toBe(3);
    expect(merged.completedLessons['1.2'].stars).toBe(3);
    expect(merged.unlockedLessons).toContain('1.3');
  });

  it('keeps highest stars for conflicting lessons', () => {
    const local: UserProgress = {
      ...createDefaultProgress(),
      completedLessons: {
        '1.1': { stars: 2, completedAt: '2026-10-08T10:00:00Z' },
        '1.2': { stars: 3, completedAt: '2026-10-08T11:00:00Z' },
      },
    };

    const remote: UserProgress = {
      ...createDefaultProgress(),
      completedLessons: {
        '1.1': { stars: 3, completedAt: '2026-10-09T10:00:00Z' },
        '1.2': { stars: 1, completedAt: '2026-10-07T09:00:00Z' },
      },
    };

    const merged = mergeProgress(local, remote);

    expect(merged.completedLessons['1.1'].stars).toBe(3);
    expect(merged.completedLessons['1.2'].stars).toBe(3);
  });

  it('unions learned words and deduplicates mistakes', () => {
    const local: UserProgress = {
      ...createDefaultProgress(),
      wordsLearned: ['Hallo', 'Danke'],
      mistakes: [
        { question: { id: 'q1', type: 'choice', prompt: 'test1', answer: 'a', options: [] } as any, failedAt: 100 },
      ],
    };

    const remote: UserProgress = {
      ...createDefaultProgress(),
      wordsLearned: ['Danke', 'Tschüss'],
      mistakes: [
        { question: { id: 'q1', type: 'choice', prompt: 'test1', answer: 'a', options: [] } as any, failedAt: 200 },
        { question: { id: 'q2', type: 'choice', prompt: 'test2', answer: 'b', options: [] } as any, failedAt: 300 },
      ],
    };

    const merged = mergeProgress(local, remote);

    expect(merged.wordsLearned).toEqual(['Hallo', 'Danke', 'Tschüss']);
    expect(merged.mistakes).toHaveLength(2);
    expect(merged.mistakes.map((m) => m.question.id)).toEqual(['q1', 'q2']);
  });

  it('merges xpHistory and trims dates older than 365 days', () => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 400);
    const ancientStr = oldDate.toISOString().slice(0, 10);

    const local: UserProgress = {
      ...createDefaultProgress(),
      xpHistory: {
        [todayStr]: 50,
        [ancientStr]: 100, // Older than 365 days
      },
    };

    const remote: UserProgress = {
      ...createDefaultProgress(),
      xpHistory: {
        [todayStr]: 80, // Remote had more today
      },
    };

    const merged = mergeProgress(local, remote);

    expect(merged.xpHistory?.[todayStr]).toBe(80);
    expect(merged.xpHistory?.[ancientStr]).toBeUndefined();
  });
});
