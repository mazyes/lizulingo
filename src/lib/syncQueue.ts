import { UserProgress } from '../types/lesson';
import { progressApi, isAppwriteEnabled, getDeviceId, leaderboardApi, getMondayKey } from './appwrite';
import { mergeProgress } from '../utils/syncMerge';

export type SyncStatus = 'synced' | 'syncing' | 'offline';

export interface SyncEngineOptions {
  userId: string | null;
  getLocalProgress: () => UserProgress;
  setLocalProgress: (merged: UserProgress) => void;
  onStatusChange?: (status: SyncStatus) => void;
}

const isOnlineNow = (): boolean => {
  if (typeof window === 'undefined') return true;
  return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true;
};

export class SyncEngine {
  private userId: string | null = null;
  private getLocalProgress: () => UserProgress;
  private setLocalProgress: (merged: UserProgress) => void;
  private onStatusChange?: (status: SyncStatus) => void;

  private debounceTimer: any = null;
  private status: SyncStatus = 'synced';
  private lastSyncedHash: string = '';
  private lastCloudUpdatedAt: string = '';
  private retryBackoffMs = 2000;
  private isPushing = false;
  private unsubscribeRealtime: (() => void) | null = null;

  constructor(options: SyncEngineOptions) {
    this.userId = options.userId;
    this.getLocalProgress = options.getLocalProgress;
    this.setLocalProgress = options.setLocalProgress;
    this.onStatusChange = options.onStatusChange;

    this.setStatus(isOnlineNow() ? 'synced' : 'offline');
    this.setupListeners();
  }

  private setStatus(s: SyncStatus) {
    if (this.status !== s) {
      this.status = s;
      this.onStatusChange?.(s);
    }
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public setUserId(newUserId: string | null) {
    if (this.userId === newUserId) return;
    this.userId = newUserId;
    this.lastSyncedHash = '';
    this.unsubscribeRealtime?.();
    this.unsubscribeRealtime = null;

    if (newUserId && isAppwriteEnabled()) {
      this.setupRealtime(newUserId);
      this.syncOnLogin(newUserId);
    }
  }

  private setupListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.retryBackoffMs = 2000;
      this.setStatus('synced');
      this.pushImmediately();
      if (this.userId) {
        this.pullAndMerge(this.userId);
      }
    });

    window.addEventListener('offline', () => {
      this.setStatus('offline');
    });

    // Page hide / visibilitychange: flush save immediately
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.pushImmediately();
        } else if (document.visibilityState === 'visible' && this.userId) {
          this.pullAndMerge(this.userId);
        }
      });
    }

    window.addEventListener('pagehide', () => {
      this.pushImmediately();
    });
  }

  private setupRealtime(userId: string) {
    this.unsubscribeRealtime?.();
    this.unsubscribeRealtime = progressApi.subscribeToProgress(userId, (payload) => {
      try {
        const myDeviceId = getDeviceId();
        if (payload?.deviceId && payload.deviceId === myDeviceId) {
          return; // Ignore own pushes
        }
        if (payload?.data) {
          const remoteProgress: UserProgress = JSON.parse(payload.data);
          const currentLocal = this.getLocalProgress();
          const merged = mergeProgress(currentLocal, remoteProgress);
          this.setLocalProgress(merged);
          this.lastSyncedHash = this.computeHash(merged);
          this.lastCloudUpdatedAt = payload.updatedAt || new Date().toISOString();
        }
      } catch (err) {
        console.warn('Realtime sync payload parse error:', err);
      }
    });
  }

  private computeHash(p: UserProgress): string {
    return `${p.xp}_${p.streak}_${Object.keys(p.completedLessons).length}_${(p.wordsLearned || []).length}_${(p.mistakes || []).length}`;
  }

  /**
   * Called on user login: pulls cloud row and merges with local progress.
   */
  public async syncOnLogin(userId: string) {
    if (!isAppwriteEnabled() || !isOnlineNow()) return;
    this.setStatus('syncing');

    try {
      const local = this.getLocalProgress();
      const cloud = await progressApi.getCloudProgress(userId);

      if (!cloud) {
        // No cloud row: upload local progress
        await progressApi.saveCloudProgress(userId, local, getDeviceId());
        this.lastSyncedHash = this.computeHash(local);
        this.lastCloudUpdatedAt = new Date().toISOString();
      } else {
        // Both exist: merge them
        const merged = mergeProgress(local, cloud.data);
        this.setLocalProgress(merged);
        await progressApi.saveCloudProgress(userId, merged, getDeviceId());
        this.lastSyncedHash = this.computeHash(merged);
        this.lastCloudUpdatedAt = cloud.updatedAt || new Date().toISOString();
      }

      this.setStatus('synced');
    } catch (err) {
      console.warn('Sync on login error:', err);
      this.setStatus(isOnlineNow() ? 'synced' : 'offline');
    }
  }

  /**
   * Pulls and merges if cloud has newer data from another device
   */
  public async pullAndMerge(userId: string) {
    if (!isAppwriteEnabled() || !isOnlineNow() || this.isPushing) return;
    try {
      const cloud = await progressApi.getCloudProgress(userId);
      if (!cloud) return;

      const myDeviceId = getDeviceId();
      if (cloud.deviceId && cloud.deviceId !== myDeviceId) {
        if (!this.lastCloudUpdatedAt || new Date(cloud.updatedAt) > new Date(this.lastCloudUpdatedAt)) {
          const local = this.getLocalProgress();
          const merged = mergeProgress(local, cloud.data);
          this.setLocalProgress(merged);
          this.lastSyncedHash = this.computeHash(merged);
          this.lastCloudUpdatedAt = cloud.updatedAt;
        }
      }
    } catch (err) {
      console.warn('Pull & merge error:', err);
    }
  }

  /**
   * Debounced push (5 seconds) triggered after every local save
   */
  public schedulePush() {
    if (!this.userId || !isAppwriteEnabled()) return;

    if (!isOnlineNow()) {
      this.setStatus('offline');
      return;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.pushImmediately();
    }, 5000);
  }

  /**
   * Executes push immediately without waiting for debounce
   */
  public async pushImmediately() {
    if (!this.userId || !isAppwriteEnabled() || !isOnlineNow() || this.isPushing) return;

    const current = this.getLocalProgress();
    const hash = this.computeHash(current);

    if (hash === this.lastSyncedHash) {
      return; // Data has not changed
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.isPushing = true;
    this.setStatus('syncing');

    try {
      const myDeviceId = getDeviceId();
      await progressApi.saveCloudProgress(this.userId, current, myDeviceId);

      // Also update leaderboard profile
      leaderboardApi.upsertProfile({
        userId: this.userId,
        displayName: (typeof localStorage !== 'undefined' ? localStorage.getItem('lizulingo_display_name') : null) || 'მოსწავლე',
        mascotColor: (typeof localStorage !== 'undefined' ? localStorage.getItem('lizulingo_mascot_color') : null) || 'green',
        totalXp: current.xp,
        weeklyXp: current.todayXp,
        weekStart: getMondayKey(),
        streak: current.streak,
      }).catch(() => null);

      this.lastSyncedHash = hash;
      this.lastCloudUpdatedAt = new Date().toISOString();
      this.retryBackoffMs = 2000;
      this.setStatus('synced');
    } catch (err) {
      console.warn('Cloud sync push failed, will retry with backoff:', err);
      this.setStatus(isOnlineNow() ? 'synced' : 'offline');

      // Retry with exponential backoff
      setTimeout(() => {
        if (this.userId && isOnlineNow()) {
          this.pushImmediately();
        }
      }, this.retryBackoffMs);
      this.retryBackoffMs = Math.min(this.retryBackoffMs * 2, 60000);
    } finally {
      this.isPushing = false;
    }
  }

  public destroy() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.unsubscribeRealtime?.();
    this.unsubscribeRealtime = null;
  }
}
