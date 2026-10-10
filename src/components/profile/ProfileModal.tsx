import React from 'react';
import { useGame } from '../../context/GameContext';
import { LiziMascot } from '../mascot/LiziMascot';
import { X, Award, Flame, BookOpen, Clock, Target, CheckCircle2, RotateCcw, User, Calendar } from 'lucide-react';
import { sound } from '../../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartReview?: () => void;
}

export const ProfileModal: React.FC<Props> = ({ isOpen, onClose, onStartReview }) => {
  const { progress } = useGame();

  if (!isOpen) return null;

  const completedLessonCount = Object.keys(progress.completedLessons || {}).length;
  const wordsLearnedCount = (progress.wordsLearned || []).length;
  const totalAnswers = progress.totalAnswersCount || 0;
  const correctAnswers = progress.correctAnswersCount || 0;
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 100;
  const totalMinutes = Math.round((progress.totalLearningSeconds || 0) / 60);

  // Calculate current month days for streak calendar
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = now.toLocaleString('ka-GE', { month: 'long' });

  const xpHistory = progress.dailyXpHistory || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-lizu-gray dark:border-gray-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-lizu-blue" />
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
              მოსწავლის პროფილი & სტატისტიკა
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-5 flex flex-col gap-6">
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-750 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
            <LiziMascot mood="happy" size={75} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-extrabold text-lizu-green uppercase tracking-wider">
                დონე: A1 დამწყები
              </span>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
                LIZULINGO მოსწავლე
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                აქტიურია: {progress.lastActiveDate}
              </p>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 flex flex-col items-center text-center">
              <Award className="w-5 h-5 text-lizu-yellow mb-1" />
              <span className="text-[11px] font-bold text-gray-400 uppercase">სულ XP</span>
              <span className="text-lg font-black text-amber-700 dark:text-amber-300">
                {progress.xp}
              </span>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800 flex flex-col items-center text-center">
              <Flame className="w-5 h-5 fill-lizu-orange text-lizu-orange mb-1" />
              <span className="text-[11px] font-bold text-gray-400 uppercase">სტრიქი</span>
              <span className="text-lg font-black text-red-600 dark:text-red-400">
                {progress.streak} დღე
              </span>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950/40 rounded-2xl border border-green-200 dark:border-green-800 flex flex-col items-center text-center">
              <CheckCircle2 className="w-5 h-5 text-lizu-green mb-1" />
              <span className="text-[11px] font-bold text-gray-400 uppercase">გაკვეთილები</span>
              <span className="text-lg font-black text-lizu-green-dark dark:text-lizu-green">
                {completedLessonCount}/42
              </span>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 flex flex-col items-center text-center">
              <BookOpen className="w-5 h-5 text-lizu-blue mb-1" />
              <span className="text-[11px] font-bold text-gray-400 uppercase">სიტყვები</span>
              <span className="text-lg font-black text-lizu-blue">
                {wordsLearnedCount}
              </span>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 flex flex-col items-center text-center">
              <Target className="w-5 h-5 text-lizu-purple mb-1" />
              <span className="text-[11px] font-bold text-gray-400 uppercase">სიზუსტე</span>
              <span className="text-lg font-black text-lizu-purple">
                {accuracy}%
              </span>
            </div>

            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 flex flex-col items-center text-center">
              <Clock className="w-5 h-5 text-teal-600 mb-1" />
              <span className="text-[11px] font-bold text-gray-400 uppercase">დრო</span>
              <span className="text-lg font-black text-teal-700 dark:text-teal-300">
                {totalMinutes} წთ
              </span>
            </div>
          </div>

          {/* Month Streak Calendar */}
          <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{monthName} — აქტივობის კალენდარი</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>= სწავლის დღე</span>
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 pt-1 text-center">
              {['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'].map(d => (
                <div key={d} className="text-[10px] font-bold text-gray-400 pb-1">
                  {d}
                </div>
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const dayNum = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const hadPractice = (xpHistory[dateKey] || 0) > 0;
                const isToday = dayNum === now.getDate();

                return (
                  <div
                    key={dayNum}
                    className={`h-8 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all ${
                      hadPractice
                        ? 'bg-amber-500 text-white shadow-xs font-black'
                        : isToday
                        ? 'border-2 border-lizu-blue text-lizu-blue bg-blue-50 dark:bg-blue-950/50'
                        : 'text-gray-400 bg-white dark:bg-gray-700/50'
                    }`}
                    title={hadPractice ? `${dateKey}: ${xpHistory[dateKey]} XP` : dateKey}
                  >
                    <span>{dayNum}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smart Review (Spaced Repetition) CTA */}
          {onStartReview && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
                onStartReview();
              }}
              className="btn-3d-blue py-3.5 text-sm font-black flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>გამეორება (Smart Review)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
