/// <reference types="vite/client" />
import { Client, Account, TablesDB, Databases, ID, Query, Permission, Role } from 'appwrite';
import { UserProgress } from '../types/lesson';

const ENDPOINT = ((import.meta as any).env?.VITE_APPWRITE_ENDPOINT as string) || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = ((import.meta as any).env?.VITE_APPWRITE_PROJECT_ID as string) || '6ac980c400226dd2e952';


export const isAppwriteEnabled = (): boolean => {
  return Boolean(PROJECT_ID && PROJECT_ID.trim().length > 0);
};

// Singleton Client
const client = new Client();
if (isAppwriteEnabled()) {
  client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
}

export const appwriteClient = client;
export const appwriteAccount = new Account(client);
export const appwriteTables = new TablesDB(client);
export const appwriteDatabases = new Databases(client);

export const DATABASE_ID = 'lizulingo';
export const TABLE_PROGRESS = 'progress';
export const TABLE_PROFILES = 'profiles';

// Persistent Device ID
const DEVICE_ID_KEY = 'lizulingo_device_id';
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return 'browser_device';
  }
}

// User Profile for Leaderboard
export interface CloudUserProfile {
  userId: string;
  displayName: string;
  mascotColor: string;
  totalXp: number;
  weeklyXp: number;
  weekStart: string; // YYYY-MM-DD (Monday)
  streak: number;
}

// Returns the date string of the Monday for the given date (YYYY-MM-DD)
export function getMondayKey(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

// Translate Appwrite error codes to clear Georgian messages
export function getGeorgianErrorMessage(err: any): string {
  if (!navigator.onLine) {
    return 'ინტერნეტთან კავშირი არ არის. გთხოვთ შეამოწმოთ ქსელი.';
  }

  const message = (err?.message || '').toLowerCase();
  const code = err?.code;
  const type = (err?.type || '').toLowerCase();

  if (code === 401 || message.includes('invalid credentials') || type.includes('user_invalid_credentials')) {
    return 'არასწორი ელფოსტა ან პაროლი.';
  }
  if (code === 409 || message.includes('already exists') || type.includes('user_already_exists')) {
    return 'ეს ელფოსტა უკვე დარეგისტრირებულია.';
  }
  if (code === 400 && (message.includes('password') || type.includes('password'))) {
    return 'პაროლი უნდა შედგებოდეს მინიმუმ 8 სიმბოლოსგან.';
  }
  if (code === 429 || type.includes('rate_limit') || message.includes('rate limit')) {
    return 'ძალიან ბევრი მცდელობა. გთხოვთ სცადოთ ცოტა მოგვიანებით.';
  }
  if (code === 404 || type.includes('user_not_found')) {
    return 'მომხმარებელი ამ ელფოსტით ვერ მოიძებნა.';
  }

  return err?.message || 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ ხელახლა.';
}

// --- AUTHENTICATION API ---
export const authApi = {
  async getCurrentUser() {
    if (!isAppwriteEnabled()) return null;
    try {
      return await appwriteAccount.get();
    } catch {
      return null;
    }
  },

  async register(email: string, pass: string, name: string) {
    if (!isAppwriteEnabled()) throw new Error('Appwrite is not configured');
    try {
      const user = await appwriteAccount.create(ID.unique(), email, pass, name);
      await appwriteAccount.createEmailPasswordSession(email, pass);
      return user;
    } catch (err: any) {
      throw new Error(getGeorgianErrorMessage(err));
    }
  },

  async login(email: string, pass: string) {
    if (!isAppwriteEnabled()) throw new Error('Appwrite is not configured');
    try {
      return await appwriteAccount.createEmailPasswordSession(email, pass);
    } catch (err: any) {
      throw new Error(getGeorgianErrorMessage(err));
    }
  },

  async logout() {
    if (!isAppwriteEnabled()) return;
    try {
      await appwriteAccount.deleteSession('current');
    } catch (err) {
      console.warn('Appwrite logout warning:', err);
    }
  },

  async sendPasswordRecovery(email: string) {
    if (!isAppwriteEnabled()) throw new Error('Appwrite is not configured');
    try {
      const redirectUrl = window.location.origin;
      return await appwriteAccount.createRecovery(email, redirectUrl);
    } catch (err: any) {
      throw new Error(getGeorgianErrorMessage(err));
    }
  },

  async deleteAccountData(userId: string) {
    if (!isAppwriteEnabled()) return;
    try {
      await appwriteTables.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PROGRESS,
        rowId: userId,
      }).catch(() => null);

      await appwriteTables.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PROFILES,
        rowId: userId,
      }).catch(() => null);
    } catch (err) {
      console.warn('Failed to delete user cloud rows:', err);
    }
  },
};

// --- PROGRESS SYNC API ---
export const progressApi = {
  async getCloudProgress(userId: string): Promise<{ data: UserProgress; updatedAt: string; deviceId?: string } | null> {
    if (!isAppwriteEnabled()) return null;
    try {
      const row = await appwriteTables.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_PROGRESS,
        rowId: userId,
      });

      if (!row || !row.data) return null;
      const parsed: UserProgress = JSON.parse(row.data);
      return {
        data: parsed,
        updatedAt: row.updatedAt || row.$updatedAt,
        deviceId: row.deviceId,
      };
    } catch (err: any) {
      if (err.code === 404) return null;
      throw err;
    }
  },

  async saveCloudProgress(userId: string, progress: UserProgress, deviceId: string) {
    if (!isAppwriteEnabled()) return null;
    const nowIso = new Date().toISOString();
    const payload = JSON.stringify(progress);

    return await appwriteTables.upsertRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROGRESS,
      rowId: userId,
      data: {
        userId,
        data: payload,
        version: progress.version || 2,
        updatedAt: nowIso,
        deviceId,
      },
      permissions: [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ],
    });
  },

  subscribeToProgress(userId: string, onUpdate: (row: any) => void) {
    if (!isAppwriteEnabled()) return () => {};
    // Appwrite realtime channel for row updates
    const channel = `databases.${DATABASE_ID}.tables.${TABLE_PROGRESS}.rows.${userId}`;
    return client.subscribe(channel, (response) => {
      if (response.payload) {
        onUpdate(response.payload);
      }
    });
  },
};

// --- LEADERBOARD & PROFILES API ---
export const leaderboardApi = {
  // ponytail: An Appwrite Function should compute XP server-side if that ever matters.
  async upsertProfile(profile: CloudUserProfile) {
    if (!isAppwriteEnabled()) return null;
    const monday = getMondayKey();

    // Reset weekly XP if weekStart is from a previous week
    const weeklyXp = profile.weekStart === monday ? profile.weeklyXp : 0;

    return await appwriteTables.upsertRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_PROFILES,
      rowId: profile.userId,
      data: {
        userId: profile.userId,
        displayName: profile.displayName || 'მოსწავლე',
        mascotColor: profile.mascotColor || 'green',
        totalXp: profile.totalXp || 0,
        weeklyXp: weeklyXp,
        weekStart: monday,
        streak: profile.streak || 0,
      },
      permissions: [
        Permission.read(Role.users()),
        Permission.update(Role.user(profile.userId)),
        Permission.delete(Role.user(profile.userId)),
      ],
    });
  },

  async getLeaderboard(limit = 20): Promise<CloudUserProfile[]> {
    if (!isAppwriteEnabled()) return [];
    try {
      const monday = getMondayKey();
      const res = await appwriteTables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_PROFILES,
        queries: [
          Query.equal('weekStart', monday),
          Query.orderDesc('weeklyXp'),
          Query.limit(limit),
        ],
      });

      return (res.rows || []).map((r: any) => ({
        userId: r.userId,
        displayName: r.displayName || 'მოსწავლე',
        mascotColor: r.mascotColor || 'green',
        totalXp: r.totalXp || 0,
        weeklyXp: r.weeklyXp || 0,
        weekStart: r.weekStart || monday,
        streak: r.streak || 0,
      }));
    } catch (err) {
      console.warn('Failed to load leaderboard:', err);
      return [];
    }
  },
};
