import React, { useEffect } from 'react';
import { Lesson, Unit } from '../../types/lesson';
import { X, Crown, Heart, Zap, Award, Flame, ShieldAlert } from 'lucide-react';
import { sound } from '../../utils/sound';

interface Props {
  isOpen: boolean;
  lesson: Lesson | null;
  unit: Unit | null;
  onClose: () => void;
  onStart: () => void;
  currentHearts: number;
}

export const BossChallengeModal: React.FC<Props> = ({
  isOpen,
  lesson,
  unit,
  onClose,
  onStart,
  currentHearts,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lesson) return null;

  const hasEnoughHearts = currentHearts >= 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#18262C] border-2 border-amber-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 relative"
      >
        {/* Glowing Top Banner */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-b from-amber-500/25 via-amber-950/20 to-transparent flex flex-col items-center text-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="დახურვა"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Boss Crown Badge with pulsing glow */}
          <div className="relative">
            <div className="absolute -inset-3 bg-amber-500/30 rounded-full blur-lg animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-xl border-2 border-yellow-200/50">
              <Crown className="w-10 h-10 fill-amber-950 text-amber-950 stroke-[2.5]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>მოდულის შემაჯამებელი ბოსი</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {lesson.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-sm font-medium">
            {lesson.description || `${unit?.city || 'გერმანია'} — შეაჯამე მთელი მოდულის მასალა და გახსენი საგანძური!`}
          </p>
        </div>

        {/* Challenge Specs Grid */}
        <div className="px-6 py-2 grid grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <Award className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">ჯილდო</span>
            <span className="text-sm font-black text-amber-300">+50 XP</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <Zap className="w-5 h-5 text-lizu-blue mb-1" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">კითხვები</span>
            <span className="text-sm font-black text-blue-300">15 კითხვა</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <Heart className="w-5 h-5 fill-lizu-red text-lizu-red mb-1" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">გულები</span>
            <span className="text-sm font-black text-rose-300">მაქს. 3 შეცდომა</span>
          </div>
        </div>

        {/* Warning / Tip Banner */}
        <div className="mx-6 my-3 p-3 rounded-2xl bg-amber-950/40 border border-amber-700/40 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-[11px] text-amber-200/90 font-medium">
            ბოსის წარმატებით ჩაბარება ხსნის შემდეგ მოდულს და ოქროს საგანძურის სკივრს.
          </span>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onStart();
            }}
            disabled={!hasEnoughHearts}
            className={`py-4 text-base font-black w-full flex items-center justify-center gap-2 ${
              hasEnoughHearts
                ? 'btn-3d-yellow'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed rounded-2xl font-bold'
            }`}
          >
            <Crown className="w-5 h-5" />
            <span>გამოწვევის დაწყება</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
          >
            მოგვიანებით
          </button>
        </div>
      </div>
    </div>
  );
};
