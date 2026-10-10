import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Flame, Heart, Volume2, VolumeX, Zap, Cloud, CloudOff } from 'lucide-react';
import { sound } from '../../utils/sound';
import { StreakModal } from '../common/StreakModal';

export const TopBar: React.FC = () => {
  const {
    progress,
    toggleSound,
    heartRecoveryRemainingMinutes,
    currentUser,
    syncStatus,
    isAppwriteAvailable,
  } = useGame();


  const [isStreakOpen, setIsStreakOpen] = useState(false);

  // Daily goal: 30 XP
  const DAILY_GOAL_XP = 30;
  const goalProgress = Math.min(100, Math.round((progress.todayXp / DAILY_GOAL_XP) * 100));

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#131F24]/95 backdrop-blur-md border-b-2 border-lizu-gray dark:border-gray-800 transition-colors pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand / Logo */}
          <div className="flex items-center gap-1.5 select-none shrink-0">
            <span className="text-lg min-[360px]:text-xl sm:text-2xl font-black tracking-tight text-lizu-green whitespace-nowrap">
              LIZU<span className="text-lizu-blue">LINGO</span>
            </span>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Interactive Streak Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsStreakOpen(true);
              }}
              className="flex items-center gap-1 font-black text-lizu-orange text-xs sm:text-base select-none px-2 py-1 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 active:scale-95 transition-all cursor-pointer border border-orange-500/20"
              title={`${progress.streak} დღიანი სტრიქი`}
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 fill-lizu-orange text-lizu-orange animate-bounce-subtle" />
              <span className="whitespace-nowrap tabular-nums font-black">{progress.streak}</span>
            </button>

            {/* Daily XP Ring / Goal */}
            <div
              className="flex items-center gap-1.5 font-black text-amber-400 text-xs sm:text-base select-none px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20"
              title={`დღიური მიზანი: ${progress.todayXp}/${DAILY_GOAL_XP} XP`}
            >
              <div className="relative w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-700"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-400 transition-all duration-300"
                    strokeDasharray={`${goalProgress}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute flex items-center justify-center">
                  <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                </span>
              </div>
              <span className="whitespace-nowrap tabular-nums">{progress.xp}</span>
            </div>

            {/* Hearts with Live Countdown Animation */}
            <div
              className="flex items-center gap-1.5 font-black text-rose-500 text-xs sm:text-base select-none px-2 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 relative"
              title={
                progress.hearts < progress.maxHearts
                  ? `გულები: ${progress.hearts}/${progress.maxHearts} (აღდგება ${heartRecoveryRemainingMinutes} წუთში)`
                  : 'გულები სავსეა (5/5)'
              }
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 fill-rose-500 text-rose-500 ${progress.hearts < progress.maxHearts ? 'animate-pulse' : ''}`} />
              <span className="whitespace-nowrap tabular-nums">{progress.hearts}</span>
              {progress.hearts < progress.maxHearts && heartRecoveryRemainingMinutes > 0 && (
                <span className="text-[9px] font-bold text-rose-300/80 absolute -bottom-3 right-0 whitespace-nowrap">
                  {heartRecoveryRemainingMinutes}წთ
                </span>
              )}
            </div>

            {/* Cloud Sync Status Indicator */}
            {isAppwriteAvailable && currentUser && (
              <div
                className="flex items-center shrink-0 p-1 select-none"
                title={
                  syncStatus === 'synced'
                    ? 'ღრუბელთან სინქრონიზებულია'
                    : syncStatus === 'syncing'
                    ? 'სინქრონიზაცია...'
                    : 'ოფლაინ რეჟიმი (შენახულია ლოკალურად)'
                }
              >
                {syncStatus === 'synced' ? (
                  <Cloud className="w-4 h-4 text-emerald-500" />
                ) : syncStatus === 'syncing' ? (
                  <Cloud className="w-4 h-4 text-lizu-blue animate-pulse" />
                ) : (
                  <CloudOff className="w-4 h-4 text-amber-500" />
                )}
              </div>
            )}

            {/* Quick Toggles: Sound & Dark Mode - only on wide screens (>= 400px) */}
            <div className="hidden min-[400px]:flex items-center gap-1 pl-1 border-l border-gray-200 dark:border-gray-700 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  toggleSound();
                }}
                className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={progress.soundEnabled ? 'ხმის გამორთვა' : 'ხმის ჩართვა'}
              >
                {progress.soundEnabled ? (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                ) : (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-lizu-red" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <StreakModal
        isOpen={isStreakOpen}
        onClose={() => setIsStreakOpen(false)}
      />
    </>
  );
};
