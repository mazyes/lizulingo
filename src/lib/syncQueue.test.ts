import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncEngine } from './syncQueue';
import { createDefaultProgress } from '../utils/migration';
import { UserProgress } from '../types/lesson';

vi.mock('./appwrite', () => ({
  isAppwriteEnabled: vi.fn(() => true),
  getDeviceId: vi.fn(() => 'test-device-id'),
  getMondayKey: vi.fn(() => '2026-10-05'),
  progressApi: {
    saveCloudProgress: vi.fn().mockResolvedValue({}),
    getCloudProgress: vi.fn().mockResolvedValue(null),
    subscribeToProgress: vi.fn(() => () => {}),
  },
  leaderboardApi: {
    upsertProfile: vi.fn().mockResolvedValue({}),
  },
}));

describe('SyncEngine: Background queue & debouncing', () => {
  let mockLocalProgress: UserProgress;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockLocalProgress = {
      ...createDefaultProgress(),
      xp: 100,
      streak: 2,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with synced status if online', () => {
    const engine = new SyncEngine({
      userId: 'test-user',
      getLocalProgress: () => mockLocalProgress,
      setLocalProgress: (p) => {
        mockLocalProgress = p;
      },
    });

    expect(engine.getStatus()).toBe('synced');
    engine.destroy();
  });

  it('debounces multiple push requests to a single call after 5 seconds', async () => {
    const { progressApi } = await import('./appwrite');
    const engine = new SyncEngine({
      userId: 'test-user',
      getLocalProgress: () => mockLocalProgress,
      setLocalProgress: (p) => {
        mockLocalProgress = p;
      },
    });

    engine.schedulePush();
    vi.advanceTimersByTime(2000);
    // User does another action before 5s finishes
    mockLocalProgress.xp = 120;
    engine.schedulePush();
    vi.advanceTimersByTime(2000);
    expect(progressApi.saveCloudProgress).not.toHaveBeenCalled();

    // Advance remainder of debounce
    vi.advanceTimersByTime(3001);
    expect(progressApi.saveCloudProgress).toHaveBeenCalledTimes(1);

    engine.destroy();
  });

  it('skips duplicate push if local progress has not changed', async () => {
    const { progressApi } = await import('./appwrite');
    const engine = new SyncEngine({
      userId: 'test-user',
      getLocalProgress: () => mockLocalProgress,
      setLocalProgress: (p) => {
        mockLocalProgress = p;
      },
    });

    await engine.pushImmediately();
    expect(progressApi.saveCloudProgress).toHaveBeenCalledTimes(1);

    // Call push immediately again with exact same data
    await engine.pushImmediately();
    expect(progressApi.saveCloudProgress).toHaveBeenCalledTimes(1);

    engine.destroy();
  });
});
