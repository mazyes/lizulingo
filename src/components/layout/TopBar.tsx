import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Flame, Heart, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { sound } from '../../utils/sound';
import { StreakModal } from '../common/StreakModal';

export const TopBar: React.FC = () => {
  const {
    progress,
    toggleSound,
    toggleDarkMode,
    heartRecoveryRemainingMinutes,
  } = useGame();

  const [isStreakOpen, setIsStreakOpen] = useState(false);

  // Daily goal: 30 XP
  const DAILY_GOAL_XP = 30;
  const goalProgress = Math.min(100, Math.round((progress.todayXp / DAILY_GOAL_XP) * 100));

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#131F24]/95 backdrop-blur-md border-b-2 border-lizu-gray dark:border-gray-800 transition-colors">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2 select-none">
            <span className="text-2xl font-black tracking-tight text-lizu-green">
              LIZU<span className="text-lizu-blue">LINGO</span>
            </span>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Interactive Streak Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsStreakOpen(true);
              }}
              className="flex items-center gap-1.5 font-black text-lizu-orange text-sm sm:text-base select-none px-2 py-1 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors cursor-pointer"
              title={`${progress.streak} დღიანი სტრიქი`}
            >
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-lizu-orange animate-bounce-subtle" />
              <span>{progress.streak}</span>
            </button>

          {/* Daily XP Ring / Goal */}
          <div
            className="flex items-center gap-1.5 font-black text-lizu-yellow-dark dark:text-lizu-yellow text-sm sm:text-base select-none"
            title={`დღიური მიზანი: ${progress.todayXp}/${DAILY_GOAL_XP} XP`}
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200 dark:text-gray-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-lizu-yellow transition-all duration-300"
                  strokeDasharray={`${goalProgress}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[8px] font-black text-amber-800 dark:text-amber-200">
                ⚡
              </span>
            </div>
            <span>{progress.xp}</span>
          </div>

          {/* Hearts */}
          <div
            className="flex items-center gap-1.5 font-black text-lizu-red text-sm sm:text-base select-none relative"
            title={
              progress.hearts < progress.maxHearts
                ? `გულები: ${progress.hearts}/${progress.maxHearts} (აღდგება ${heartRecoveryRemainingMinutes} წუთში)`
                : 'გულები სავსეა (5/5)'
            }
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-lizu-red text-lizu-red" />
            <span>{progress.hearts}</span>
            {progress.hearts < progress.maxHearts && heartRecoveryRemainingMinutes > 0 && (
              <span className="text-[10px] font-bold text-gray-400 absolute -bottom-3.5 right-0 whitespace-nowrap">
                {heartRecoveryRemainingMinutes}წთ
              </span>
            )}
          </div>

          {/* Quick Toggles: Sound & Dark Mode */}
          <div className="flex items-center gap-1 pl-1 border-l border-gray-200 dark:border-gray-700">
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
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5 text-lizu-red" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                toggleDarkMode();
              }}
              className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={progress.darkMode ? 'ღია რეჟიმი' : 'მუქი რეჟიმი'}
            >
              {progress.darkMode ? (
                <Sun className="w-5 h-5 text-lizu-yellow" />
              ) : (
                <Moon className="w-5 h-5" />
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
