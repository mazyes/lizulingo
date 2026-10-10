import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/sound';
import { Sparkles, Award } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClaim: (bonusXp: number) => void;
  moduleTitle: string;
}

export const TreasureChestModal: React.FC<Props> = ({ isOpen, onClaim, moduleTitle }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [bonusXp] = useState(() => Math.floor(Math.random() * 21) + 30); // 30-50 XP

  if (!isOpen) return null;

  const handleOpenChest = () => {
    if (isOpened) return;
    setIsOpened(true);
    sound.playComplete();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#FFD700', '#FF8C00', '#F58CBA', '#B8A1FF'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full border-2 border-amber-300 dark:border-amber-600 shadow-2xl flex flex-col items-center text-center animate-pop">
        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          ბოსის გამარჯვების სკივრი!
        </span>

        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">
          {moduleTitle}
        </h2>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-6">
          თქვენ წარმატებით დაამარცხეთ მოდულის ბოს-ტესტი!
        </p>

        {/* Chest illustration */}
        <div
          onClick={handleOpenChest}
          className={`cursor-pointer transition-all duration-300 transform select-none ${
            isOpened ? 'scale-110' : 'hover:scale-105 active:scale-95 animate-bounce'
          }`}
        >
          <div className="text-7xl sm:text-8xl filter drop-shadow-lg">
            {isOpened ? '💎' : '🎁'}
          </div>
        </div>

        {isOpened ? (
          <div className="mt-6 flex flex-col items-center gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-2xl font-black text-amber-600 dark:text-amber-400">
              <Award className="w-7 h-7" />
              <span>+{bonusXp} ბონუს XP!</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              საგანძური გახსნილია! მომდევნო მოდული განბლოკილია.
            </p>
            <button
              type="button"
              onClick={() => onClaim(bonusXp)}
              className="btn-3d-green w-full py-3.5 text-base font-black mt-2"
            >
              ჯილდოს მიღება
            </button>
          </div>
        ) : (
          <div className="mt-6 w-full">
            <button
              type="button"
              onClick={handleOpenChest}
              className="btn-3d-yellow w-full py-3.5 text-base font-black"
            >
              გახსენი სკივრი ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
