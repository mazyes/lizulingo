import React, { useState, useEffect } from 'react';
import { X, Trophy, Flame, Zap, Award, Crown, User, RotateCcw } from 'lucide-react';
import { leaderboardApi, CloudUserProfile, getMondayKey } from '../../lib/appwrite';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string | null;
  currentUserXp: number;
}

export const LeaderboardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUserId,
  currentUserXp,
}) => {
  const [users, setUsers] = useState<CloudUserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const list = await leaderboardApi.getLeaderboard(20);
      setUsers(list);
    } catch (err) {
      console.warn('Leaderboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentRank = users.findIndex(u => u.userId === currentUserId) + 1;
  const monday = getMondayKey();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full border-2 border-amber-300 dark:border-amber-700 shadow-2xl p-6 sm:p-7 flex flex-col gap-4 animate-pop max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Trophy className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <span>ლიგა</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold uppercase">
                  Top 20
                </span>
              </h3>
              <p className="text-xs text-gray-400 font-bold">
                კვირის ქულები ({monday}-დან)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title="დახურვა"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Current user rank summary */}
        {currentUserId && (
          <div className="p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-white shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
                #{currentRank > 0 ? currentRank : '—'}
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-amber-100 font-extrabold block">
                  თქვენი პოზიცია
                </span>
                <span className="text-sm font-black">
                  {localStorage.getItem('lizulingo_display_name') || 'თქვენ'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-100 block">სულ</span>
              <span className="text-base font-black tabular-nums">{currentUserXp} XP</span>
            </div>
          </div>
        )}

        {/* List of Leaderboard Users */}
        <div className="flex flex-col gap-2 py-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <RotateCcw className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-xs font-bold">ლიდერბორდის ჩატვირთვა...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-xs font-bold bg-gray-50 dark:bg-gray-750 rounded-2xl p-4">
              ამ კვირაში ჯერ არ არის მონაცემები. გაიარეთ გაკვეთილი და გახდით პირველი!
            </div>
          ) : (
            users.map((u, idx) => {
              const rank = idx + 1;
              const isMe = u.userId === currentUserId;

              return (
                <div
                  key={u.userId}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                    isMe
                      ? 'border-lizu-green bg-green-50/70 dark:bg-green-950/40 shadow-xs'
                      : rank === 1
                      ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className="w-7 text-center">
                      {rank === 1 ? (
                        <Crown className="w-5 h-5 text-amber-500 fill-amber-400 mx-auto" />
                      ) : rank === 2 ? (
                        <Award className="w-5 h-5 text-slate-400 mx-auto" />
                      ) : rank === 3 ? (
                        <Award className="w-5 h-5 text-amber-700 mx-auto" />
                      ) : (
                        <span className="text-xs font-black text-gray-400">#{rank}</span>
                      )}
                    </div>

                    {/* Avatar circle */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-white shadow-xs ${
                        u.mascotColor === 'blue'
                          ? 'bg-[#1CB0F6]'
                          : u.mascotColor === 'orange'
                          ? 'bg-[#FF9600]'
                          : u.mascotColor === 'purple'
                          ? 'bg-[#CE82FF]'
                          : 'bg-[#58CC02]'
                      }`}
                    >
                      <User className="w-4 h-4 text-white" />
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <span>{u.displayName}</span>
                        {isMe && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-lizu-green text-white font-extrabold">
                            შენ
                          </span>
                        )}
                      </h4>
                      {u.streak > 0 && (
                        <span className="text-[10px] text-lizu-orange font-extrabold flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-lizu-orange" />
                          <span>{u.streak} დღე</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 font-black text-amber-700 dark:text-amber-400 text-sm tabular-nums">
                    <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{u.weeklyXp} XP</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-3d-green w-full py-3.5 text-base font-black mt-1"
        >
          დახურვა
        </button>
      </div>
    </div>
  );
};
