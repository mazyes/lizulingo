import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { LiziMascot } from '../mascot/LiziMascot';
import { Volume2, Keyboard, Moon, RotateCcw, Award, Flame } from 'lucide-react';
import { sound } from '../../utils/sound';

export const SettingsScreen: React.FC = () => {
  const {
    progress,
    toggleSound,
    toggleTypingMode,
    toggleDarkMode,
    resetProgress,
  } = useGame();

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const completedCount = Object.keys(progress.completedLessons).length;

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-28 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-black uppercase tracking-wider text-lizu-purple">
          კონფიგურაცია
        </span>
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
          პარამეტრები
        </h2>
      </div>

      {/* Profile / Stats Card */}
      <div className="p-5 bg-white dark:bg-gray-800 rounded-3xl border-2 border-lizu-gray dark:border-gray-700 shadow-sm flex items-center gap-4">
        <LiziMascot mood="happy" size={85} />
        <div className="flex flex-col gap-1 flex-1">
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
            მომხმარებელი: A1 მოსწავლე
          </h3>
          <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-500 dark:text-gray-400 pt-1">
            <span className="flex items-center gap-1 text-lizu-yellow-dark dark:text-lizu-yellow">
              <Award className="w-3.5 h-3.5" /> {progress.xp} XP
            </span>
            <span className="flex items-center gap-1 text-lizu-orange">
              <Flame className="w-3.5 h-3.5 fill-current" /> {progress.streak} დღე
            </span>
            <span className="flex items-center gap-1 text-lizu-green">
              ✅ {completedCount} გაკვეთილი
            </span>
          </div>
        </div>
      </div>

      {/* Settings Options Group */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-gray-400">
          ძირითადი პარამეტრები
        </span>

        {/* Sound toggle */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-lizu-blue flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                ხმოვანი ეფექტები
              </h4>
              <p className="text-xs text-gray-500">
                სწორი, შეცდომისა და დასრულების ხმები
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              toggleSound();
            }}
            className={`w-13 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              progress.soundEnabled ? 'bg-lizu-green' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                progress.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Typing Mode toggle */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-lizu-yellow flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                აკრეფის რეჟიმი (Typing Mode)
              </h4>
              <p className="text-xs text-gray-500">
                სიტყვების კლავიატურით აკრეფა ბარათების ნაცვლად
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              toggleTypingMode();
            }}
            className={`w-13 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              progress.typingModeEnabled ? 'bg-lizu-green' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                progress.typingModeEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Dark Mode toggle */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-lizu-purple flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                მუქი თემა (Dark Mode)
              </h4>
              <p className="text-xs text-gray-500">
                ღამის რეჟიმის ჩართვა/გამორთვა
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              toggleDarkMode();
            }}
            className={`w-13 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              progress.darkMode ? 'bg-lizu-purple' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                progress.darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="flex flex-col gap-3 pt-3">
        <span className="text-xs font-black uppercase tracking-wider text-lizu-red">
          მონაცემების მართვა
        </span>
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-red-200 dark:border-red-950/70 text-lizu-red hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-between font-bold text-sm transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            <span>პროგრესის განულება (Reset)</span>
          </div>
          <span className="text-xs text-red-400">ყველა შედეგის წაშლა</span>
        </button>
      </div>

      {/* App Info footer */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-600 pt-6">
        <p className="font-bold">LIZULINGO v1.0.0</p>
        <p>დამყარებულია "deutsch Buch 1" Direct Method (Modul 2 & 3) მასალებზე</p>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full border-2 border-lizu-gray dark:border-gray-700 shadow-xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-lizu-red flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
              წავშალოთ მთელი პროგრესი?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              თქვენი ყველა XP, სტრიქი, გავლილი გაკვეთილი და მიღწევა განულდება და დაიწყებთ თავიდან.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playWrong();
                  resetProgress();
                  setShowResetConfirm(false);
                }}
                className="btn-3d-red py-3 text-sm font-black w-full"
              >
                დიახ, განულება
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="btn-3d-white py-3 text-sm font-black w-full"
              >
                გაუქმება
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
