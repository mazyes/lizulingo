import React from 'react';
import { Flame, X, Sparkles, Check } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const StreakModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { progress } = useGame();

  if (!isOpen) return null;

  const daysOfWeek = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'];
  // Current day index (0 = Monday in Georgia)
  const currentDayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1A262C] w-full max-w-sm rounded-3xl p-6 border-2 border-orange-200 dark:border-orange-900/50 shadow-2xl flex flex-col items-center text-center gap-5 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* 21st.dev inspired Animated Streak Flame Badge */}
        <div className="relative mt-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-bounce-subtle">
            <Flame className="w-14 h-14 text-white fill-white drop-shadow-md" />
          </div>
          <span className="absolute -top-1 -right-1 bg-lizu-yellow text-amber-950 p-1.5 rounded-full shadow-md animate-pulse">
            <Sparkles className="w-4 h-4 fill-amber-950" />
          </span>
        </div>

        {/* Streak Counter */}
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            {progress.streak} <span className="text-xl font-bold text-lizu-orange">დღიანი სტრიქი!</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold px-2">
            ყოველდღე 1 გაკვეთილი მაინც გაიარეთ ცეცხლის შესანარჩუნებლად!
          </p>
        </div>

        {/* Week Days Tracker */}
        <div className="w-full bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-700/60 flex justify-between items-center">
          {daysOfWeek.map((day, idx) => {
            const isCompletedOrCurrent = idx <= currentDayIdx;
            const isToday = idx === currentDayIdx;

            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {day}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isToday
                      ? 'bg-lizu-orange text-white shadow-md shadow-orange-500/40 ring-2 ring-orange-300'
                      : isCompletedOrCurrent
                      ? 'bg-lizu-green text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}
                >
                  {isCompletedOrCurrent ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    '·'
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="btn-3d-yellow py-3.5 text-sm font-black w-full"
        >
          გასაგებია, გავაგრძელოთ!
        </button>
      </div>
    </div>
  );
};
