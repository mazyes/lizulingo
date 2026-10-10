import React from 'react';
import { X, Award, CheckCircle2, Lock } from 'lucide-react';
import { UserProgress } from '../../types/lesson';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
}

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (p: UserProgress) => boolean;
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_lesson',
    title: 'პირველი ნაბიჯი',
    description: 'დაასრულეთ თქვენი პირველი გაკვეთილი',
    icon: '🚀',
    check: p => Object.keys(p.completedLessons).length >= 1,
  },
  {
    id: 'streak_7',
    title: 'ცეცხლოვანი კვირა',
    description: 'მიაღწიეთ 7-დღიან სასწავლო სტრიქს',
    icon: '🔥',
    check: p => p.streak >= 7,
  },
  {
    id: 'words_100',
    title: '100 ახალი სიტყვა',
    description: 'ისწავლეთ 100 სიტყვა ბარათების მეშვეობით',
    icon: '📚',
    check: p => (p.wordsLearned || []).length >= 100,
  },
  {
    id: 'module_finished',
    title: 'მოდულის ოსტატი',
    description: 'ჩააბარეთ მინიმუმ 1 მოდულის ბოს-ტესტი',
    icon: '👑',
    check: p => Object.keys(p.completedLessons).some(k => k.includes('-boss')),
  },
  {
    id: 'perfect_lesson',
    title: 'უნაკლო გაკვეთილი',
    description: 'დაასრულეთ გაკვეთილი 0 შეცდომით (3 ვარსკვლავი)',
    icon: '🎯',
    check: p => Object.values(p.completedLessons).some(l => l.stars === 3),
  },
];

export const AchievementsModal: React.FC<Props> = ({ isOpen, onClose, progress }) => {
  if (!isOpen) return null;

  const unlockedCount = ACHIEVEMENTS.filter(a => a.check(progress)).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full border-2 border-lizu-gray dark:border-gray-700 shadow-2xl flex flex-col gap-4 animate-pop max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
                მიღწევები
              </h3>
              <p className="text-xs font-bold text-gray-400">
                შესრულებულია {unlockedCount} / {ACHIEVEMENTS.length}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Achievement List */}
        <div className="flex flex-col gap-3 py-2">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = ach.check(progress);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 transition-all ${
                  isUnlocked
                    ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/30'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 opacity-70'
                }`}
              >
                <div className="text-3xl filter drop-shadow-xs">{ach.icon}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">
                    {ach.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {ach.description}
                  </p>
                </div>
                <div>
                  {isUnlocked ? (
                    <div className="w-7 h-7 rounded-full bg-lizu-green flex items-center justify-center text-white">
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-3d-green w-full py-3.5 text-base font-black"
        >
          დახურვა
        </button>
      </div>
    </div>
  );
};
