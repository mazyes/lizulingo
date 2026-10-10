import React, { useState } from 'react';
import { Unit, Lesson } from '../../types/lesson';
import { units } from '../../data/lessons';
import { useGame } from '../../context/GameContext';
import { LiziMascot } from '../mascot/LiziMascot';
import { Lock, Star, Crown, Play, Check, Award, BookOpen, Target, Sparkles, MapPin } from 'lucide-react';
import { sound } from '../../utils/sound';
import { AchievementsModal } from '../common/AchievementsModal';
import { PlacementModal } from '../common/PlacementModal';

interface Props {
  onStartLesson: (lesson: Lesson) => void;
}

export const HomeScreen: React.FC<Props> = ({ onStartLesson }) => {
  const { progress, setPlacementCompleted } = useGame();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);

  // Winding horizontal offset pattern for nodes
  const getHorizontalOffset = (index: number): number => {
    const pattern = [0, 36, 50, 24, -28, -50, -28];
    return pattern[index % pattern.length];
  };

  const handleNodeClick = (lesson: Lesson, isUnlocked: boolean) => {
    if (!isUnlocked) {
      sound.playWrong();
      return;
    }
    sound.playClick();
    setSelectedLesson(lesson);
  };

  // Unit node color helper
  const getNodeColor = (unit: Unit, isBoss?: boolean) => {
    if (isBoss) return 'bg-lizu-purple border-lizu-purple-dark text-white shadow-purple-500/25';
    switch (unit.color) {
      case 'green':
        return 'bg-lizu-green border-lizu-green-dark text-white shadow-green-500/25';
      case 'blue':
        return 'bg-lizu-blue border-lizu-blue-dark text-white shadow-blue-500/25';
      case 'purple':
        return 'bg-purple-600 border-purple-800 text-white shadow-purple-500/25';
      case 'teal':
        return 'bg-teal-600 border-teal-800 text-white shadow-teal-500/25';
      case 'amber':
        return 'bg-amber-600 border-amber-800 text-white shadow-amber-500/25';
      case 'rose':
        return 'bg-rose-600 border-rose-800 text-white shadow-rose-500/25';
      default:
        return 'bg-lizu-green border-lizu-green-dark text-white';
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-28 flex flex-col gap-8">
      {/* Placement Modal on First Start */}
      <PlacementModal
        isOpen={!progress.placementCompleted}
        onSelectFromZero={() => setPlacementCompleted(['1.1'])}
        onCompletePlacement={(unlocked) => setPlacementCompleted(unlocked)}
      />

      {/* Top Travel & Stats Bar */}
      <div className="flex items-center justify-between gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-3xl border-2 border-lizu-gray dark:border-gray-700 shadow-sm">
        {/* Words Learned Counter */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-950/60 flex items-center justify-center text-lizu-green-dark dark:text-lizu-green">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400">ნასწავლი სიტყვა</div>
            <div className="text-base font-black text-gray-900 dark:text-gray-100">
              {(progress.wordsLearned || []).length}
            </div>
          </div>
        </div>

        {/* Germany Travel Story indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-black">
          <MapPin className="w-3.5 h-3.5" />
          <span>ლიზის მოგზაურობა 🇩🇪</span>
        </div>

        {/* Achievements trigger */}
        <button
          type="button"
          onClick={() => setShowAchievements(true)}
          className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-600 hover:scale-105 active:scale-95 transition-all shadow-xs"
          title="მიღწევები"
        >
          <Award className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Daily Quests Mini-Card */}
      {progress.dailyQuests && progress.dailyQuests.length > 0 && (
        <div className="p-4 rounded-3xl bg-white dark:bg-gray-800 border-2 border-lizu-gray dark:border-gray-700 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-lizu-blue" />
              დღიური მისიები (3)
            </span>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              ბონუს XP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {progress.dailyQuests.map((q) => (
              <div
                key={q.id}
                className={`p-2.5 rounded-2xl border flex flex-col justify-between ${
                  q.completed
                    ? 'bg-green-50 dark:bg-green-950/40 border-green-300 text-green-900 dark:text-green-200'
                    : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="text-[11px] font-extrabold truncate">{q.title}</div>
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mt-1">
                  <span>{q.current} / {q.target}</span>
                  <span className="text-amber-600 font-black">+{q.rewardXp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modules Path */}
      {units.map((unit: Unit, uIdx: number) => (
        <section key={unit.id} className="flex flex-col items-center">
          {/* Unit Header Banner with Travel Story */}
          <div
            className={`w-full py-4 px-6 rounded-3xl ${unit.bannerBg} text-white shadow-md mb-8 flex flex-col gap-2 select-none`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider opacity-85">
                  სადგური {uIdx + 1} • {unit.city}
                </span>
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  {unit.title}
                </h2>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xl">
                {uIdx + 1}
              </div>
            </div>
            <p className="text-xs font-semibold text-white/90">
              {unit.subtitle}
            </p>
          </div>

          {/* Vertical Winding Path of Lesson Nodes */}
          <div className="flex flex-col items-center gap-7 w-full relative">
            {unit.lessons.map((lesson, idx) => {
              const isUnlocked = progress.unlockedLessons.includes(lesson.id);
              const isCompleted = !!progress.completedLessons[lesson.id];
              const stars = progress.completedLessons[lesson.id]?.stars || 0;
              const isNextActive =
                isUnlocked &&
                !isCompleted &&
                (!unit.lessons[idx - 1] || progress.completedLessons[unit.lessons[idx - 1].id]);

              const xOffset = getHorizontalOffset(idx);

              return (
                <div
                  key={lesson.id}
                  className="relative flex items-center justify-center"
                  style={{ transform: `translateX(${xOffset}px)` }}
                >
                  {/* Mascot positioned next to the next active lesson */}
                  {isNextActive && (
                    <div className="absolute -left-28 -top-6 hidden sm:block animate-bounce-subtle pointer-events-none z-10">
                      <LiziMascot mood="happy" size={90} bubbleText="დავიწყოთ აქ!" />
                    </div>
                  )}

                  {/* Lesson Circle Node Button */}
                  <button
                    type="button"
                    onClick={() => handleNodeClick(lesson, isUnlocked)}
                    className={`relative rounded-full flex flex-col items-center justify-center transition-all duration-150 select-none ${
                      lesson.isBoss
                        ? 'w-24 h-24 border-b-6 shadow-xl'
                        : 'w-20 h-20 border-b-5 shadow-lg'
                    } ${
                      !isUnlocked
                        ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-800 text-gray-400 cursor-not-allowed opacity-75'
                        : isCompleted
                        ? 'bg-lizu-yellow border-lizu-yellow-dark text-amber-950 hover:scale-105 active:scale-95 active:translate-y-1 active:border-b-2'
                        : getNodeColor(unit, lesson.isBoss)
                    }`}
                  >
                    {/* Ring indicator for current active node */}
                    {isNextActive && (
                      <span className="absolute -inset-2 rounded-full border-4 border-lizu-green dark:border-lizu-blue animate-ping opacity-30" />
                    )}

                    {/* Icon inside circle */}
                    {!isUnlocked ? (
                      <Lock className="w-7 h-7 stroke-[2.5]" />
                    ) : lesson.isBoss ? (
                      <Crown className="w-9 h-9 fill-amber-200 text-white" />
                    ) : isCompleted ? (
                      <div className="flex flex-col items-center">
                        <Check className="w-8 h-8 stroke-[3.5] text-amber-900" />
                        <div className="flex gap-0.5 -mt-1">
                          {[1, 2, 3].map(s => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= stars
                                  ? 'fill-amber-900 text-amber-900'
                                  : 'text-amber-800/40'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-2xl">{lesson.icon}</span>
                    )}

                    {/* Little badge showing lesson number e.g. "1.1" */}
                    <span className="absolute -bottom-2 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full text-[10px] font-black border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 shadow-xs">
                      {lesson.isBoss ? 'BOSS' : lesson.id}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Lesson Details Dialog / Bottom Drawer */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border-2 border-lizu-gray dark:border-gray-700 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-lizu-green">
                {selectedLesson.unitTitle} • {selectedLesson.subtitle}
              </span>
              <button
                type="button"
                onClick={() => setSelectedLesson(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold text-sm"
              >
                დახურვა
              </button>
            </div>

            {selectedLesson.storyIntro && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-800 dark:text-blue-200 font-bold leading-relaxed">
                {selectedLesson.storyIntro}
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-gray-700 flex items-center justify-center text-3xl flex-shrink-0">
                {selectedLesson.icon}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
                  {selectedLesson.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {selectedLesson.description}
                </p>
              </div>
            </div>

            {selectedLesson.isBoss && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl text-xs text-purple-700 dark:text-purple-300 font-bold flex items-center gap-2">
                <Crown className="w-5 h-5 flex-shrink-0" />
                <span>შემაჯამებელი ბოს-ტესტი: 20 შეკითხვა, მხოლოდ 3 გული!</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                const target = selectedLesson;
                setSelectedLesson(null);
                onStartLesson(target);
              }}
              className="btn-3d-green py-4 text-base font-black w-full flex items-center justify-center gap-2 mt-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>დაწყება (+15 XP)</span>
            </button>
          </div>
        </div>
      )}

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        progress={progress}
      />
    </div>
  );
};
