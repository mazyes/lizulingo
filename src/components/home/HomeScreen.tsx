import React, { useState } from 'react';
import { Unit, Lesson } from '../../types/lesson';
import { units, lessons } from '../../data/lessons';
import { useGame } from '../../context/GameContext';
import { LiziMascot } from '../mascot/LiziMascot';
import {
  Lock,
  Star,
  Crown,
  Play,
  Check,
  Award,
  BookOpen,
  Target,
  Sparkles,
  MapPin,
  RotateCcw,
  AlertTriangle,
  Download,
  User,
  Calendar,
  X,
  Cloud,
  Trophy,
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { AchievementsModal } from '../common/AchievementsModal';
import { PlacementModal } from '../common/PlacementModal';
import { ProfileModal } from '../profile/ProfileModal';
import { AppIcon, FlagDE } from '../common/AppIcon';
import { AuthModal } from '../auth/AuthModal';
import { LeaderboardModal } from '../leaderboard/LeaderboardModal';
import { SegmentedProgressRing } from '../common/SegmentedProgressRing';
import { BossChallengeModal } from './BossChallengeModal';
import { getRoundInfo } from '../../data/expand';

interface Props {
  onStartLesson: (lesson: Lesson, round?: number) => void;
  onStartReview?: () => void;
}

export const HomeScreen: React.FC<Props> = ({ onStartLesson, onStartReview }) => {
  const {
    progress,
    setPlacementCompleted,
    clearRunningLesson,
    isStorageBlocked,
    exportProgress,
    currentUser,
    isAppwriteAvailable,
    login,
    register,
    sendPasswordReset,
  } = useGame();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedBossLesson, setSelectedBossLesson] = useState<{ lesson: Lesson; unit: Unit } | null>(null);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [dismissSundayBanner, setDismissSundayBanner] = useState<boolean>(false);
  const [dismissCloudBanner, setDismissCloudBanner] = useState<boolean>(false);

  // Winding horizontal offset pattern for nodes
  const getHorizontalOffset = (index: number): number => {
    const pattern = [0, 36, 50, 24, -28, -50, -28];
    return pattern[index % pattern.length];
  };

  const handleNodeClick = (lesson: Lesson, unit: Unit, isUnlocked: boolean) => {
    if (!isUnlocked) {
      sound.playWrong();
      return;
    }
    sound.playClick();
    if (lesson.isBoss) {
      setSelectedBossLesson({ lesson, unit });
    } else {
      setSelectedLesson(lesson);
    }
  };

  const getUnitGlowClass = (color: string) => {
    switch (color) {
      case 'green': return 'glow-module-green';
      case 'blue': return 'glow-module-blue';
      case 'purple': return 'glow-module-purple';
      case 'teal': return 'glow-module-teal';
      case 'amber': return 'glow-module-amber';
      case 'rose': return 'glow-module-rose';
      default: return 'glow-module-green';
    }
  };

  const getNodeColor = (unit: Unit, isBoss?: boolean) => {
    if (isBoss) return 'bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 border-b-amber-700 text-amber-950 shadow-amber-500/30';
    switch (unit.color) {
      case 'green':
        return 'bg-gradient-to-b from-emerald-400 to-emerald-500 border-b-emerald-700 text-white shadow-emerald-500/25';
      case 'blue':
        return 'bg-gradient-to-b from-blue-400 to-blue-600 border-b-blue-800 text-white shadow-blue-500/25';
      case 'purple':
        return 'bg-gradient-to-b from-purple-400 to-purple-600 border-b-purple-800 text-white shadow-purple-500/25';
      case 'teal':
        return 'bg-gradient-to-b from-teal-400 to-teal-600 border-b-teal-800 text-white shadow-teal-500/25';
      case 'amber':
        return 'bg-gradient-to-b from-amber-400 to-amber-600 border-b-amber-800 text-white shadow-amber-500/25';
      case 'rose':
        return 'bg-gradient-to-b from-rose-400 to-rose-600 border-b-rose-800 text-white shadow-rose-500/25';
      default:
        return 'bg-gradient-to-b from-emerald-400 to-emerald-500 border-b-emerald-700 text-white';
    }
  };

  const getUnitRingColor = (color: string): string => {
    switch (color) {
      case 'green': return '#10B981';
      case 'blue': return '#3B82F6';
      case 'purple': return '#A855F7';
      case 'teal': return '#14B8A6';
      case 'amber': return '#F59E0B';
      case 'rose': return '#F43F5E';
      default: return '#10B981';
    }
  };

  const isSunday = new Date().getDay() === 0;

  const handleResumeRunning = () => {
    if (!progress.runningLesson) return;
    const match = lessons.find(l => l.id === progress.runningLesson?.lessonId);
    if (match) {
      sound.playClick();
      onStartLesson(match);
    }
  };

  const handleDownloadSundayBackup = () => {
    sound.playClick();
    const dataStr = exportProgress();
    const dateStr = new Date().toISOString().split('T')[0];
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lizulingo-sunday-backup-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setDismissSundayBanner(true);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 page-container flex flex-col gap-6">
      {/* Placement Modal on First Start */}
      <PlacementModal
        isOpen={!progress.placementCompleted}
        onSelectFromZero={() => setPlacementCompleted(['1.1'])}
        onCompletePlacement={(unlocked) => setPlacementCompleted(unlocked)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onStartReview={onStartReview}
      />

      {/* Storage Blocked Warning */}
      {isStorageBlocked && (
        <div className="p-3.5 bg-red-500 text-white rounded-2xl flex items-center gap-3 shadow-md font-bold text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>პროგრესი არ ინახება (ბრაუზერის მეხსიერება დაბლოკილია).</span>
        </div>
      )}

      {/* Sunday Backup Reminder Banner (B1.4) */}
      {isSunday && !dismissSundayBanner && (
        <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>კვირის შეხსენება</span>
            </span>
            <span className="text-xs font-bold">
              შეინახეთ თქვენი პროგრესის სარეზერვო ასლი!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSundayBackup}
              className="px-3 py-2 bg-white text-purple-700 font-black rounded-xl text-xs hover:bg-purple-50 flex items-center gap-1 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>შენახვა</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissSundayBanner(true)}
              className="text-xs text-white/70 hover:text-white p-1"
              title="დახურვა"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Save Online Cloud Sync Card (Section 3: Guest First) */}
      {isAppwriteAvailable && !currentUser && !dismissCloudBanner && (
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-black">
                შეინახე პროგრესი ონლაინ
              </span>
              <span className="text-[11px] font-semibold text-blue-100">
                სინქრონიზაცია მოწყობილობებს შორის
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowAuthModal(true);
              }}
              className="px-3.5 py-2 bg-white text-blue-700 font-black rounded-xl text-xs hover:bg-blue-50 active:scale-95 transition-all shadow-xs"
            >
              შესვლა
            </button>
            <button
              type="button"
              onClick={() => setDismissCloudBanner(true)}
              className="text-xs text-white/70 hover:text-white p-1"
              title="დახურვა"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Active Running Lesson Resume Card (B1.2) */}
      {progress.runningLesson && (
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl flex flex-col gap-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-blue-200 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              დაუსრულებელი გაკვეთილი ({progress.runningLesson.lessonId})
            </span>
            <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
              კითხვა {progress.runningLesson.currentIndex + 1}
            </span>
          </div>
          <h3 className="text-lg font-black tracking-tight">
            გააგრძელე გაკვეთილი?
          </h3>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleResumeRunning}
              className="flex-1 py-3 bg-white text-blue-700 font-black rounded-2xl shadow-md hover:bg-blue-50 active:scale-95 transition-all text-sm"
            >
              კი, გაგრძელება
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                clearRunningLesson();
              }}
              className="px-4 py-3 bg-white/20 text-white font-bold rounded-2xl hover:bg-white/30 active:scale-95 transition-all text-sm"
            >
              თავიდან
            </button>
          </div>
        </div>
      )}

      {/* Top Travel & Stats Bar */}
      <div className="flex items-center justify-between gap-2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs">
        {/* Words Learned Counter */}
        <div className="flex items-center gap-2">
          <div className="w-8.5 h-8.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">ნასწავლი</div>
            <div className="text-sm font-black text-gray-900 dark:text-gray-100">
              {(progress.wordsLearned || []).length}
            </div>
          </div>
        </div>

        {/* Germany Travel Story indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-orange-500/10 border border-amber-500/20 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-black shadow-xs">
          <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>მოგზაურობა</span>
          <FlagDE size={14} />
        </div>

        {/* Leaderboard Trigger (🏆 ლიგა) */}
        {isAppwriteAvailable && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowLeaderboard(true);
            }}
            className="p-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center gap-1 font-black text-xs cursor-pointer"
            title="ლიგა (Leaderboard)"
          >
            <Trophy className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="hidden min-[360px]:inline">ლიგა</span>
          </button>
        )}

        {/* Profile Trigger */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowProfile(true);
          }}
          className="p-2 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-950/60 border border-blue-300/80 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
          title="პროფილი & სტატისტიკა"
        >
          <User className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Achievements trigger */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowAchievements(true);
          }}
          className="p-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
          title="მიღწევები"
        >
          <Award className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Daily Quests Mini-Card */}
      {progress.dailyQuests && progress.dailyQuests.length > 0 && (
        <div className="p-4 rounded-3xl bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-500" />
              დღიური მისიები (3)
            </span>
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              ბონუს XP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {progress.dailyQuests.map((q) => (
              <div
                key={q.id}
                className={`p-3 rounded-2xl border flex flex-col justify-between min-h-[76px] transition-all ${
                  q.completed
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-200 shadow-xs'
                    : 'bg-gray-50/80 dark:bg-gray-750/80 border-gray-200/80 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="text-[11px] font-black line-clamp-2 leading-snug">{q.title}</div>
                <div className="flex items-center justify-between text-[10px] font-black text-gray-400 mt-1">
                  <span>{q.current} / {q.target}</span>
                  <span className="text-amber-500 font-black">+{q.rewardXp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modules Path */}
      {units.map((unit: Unit, uIdx: number) => {
        const completedInUnit = unit.lessons.filter(l => progress.completedLessons[l.id]).length;
        const totalInUnit = unit.lessons.length;
        const unitProgress = Math.round((completedInUnit / totalInUnit) * 100);

        return (
          <section key={unit.id} className="flex flex-col items-center">
            {/* Unit Header Banner with Travel Story and Progress Ring (B1.5 & ReactBits / 21st theme) */}
            <div
              className={`w-full py-4 px-6 rounded-3xl ${unit.bannerBg} text-white shadow-lg mb-8 flex flex-col gap-2 select-none card-lift ${getUnitGlowClass(unit.color)} border border-white/10`}
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

                {/* Circular Progress Ring */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/20"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-white transition-all duration-300"
                      strokeDasharray={`${unitProgress}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black">
                    {completedInUnit}/{totalInUnit}
                  </span>
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
                const totalRounds = lesson.rounds || (lesson.isBoss ? 1 : 3);
                const finishedRounds = progress.lessonRounds?.[lesson.id] !== undefined
                  ? progress.lessonRounds[lesson.id]
                  : (progress.completedLessons[lesson.id] ? totalRounds : 0);
                const isCompleted = finishedRounds >= totalRounds || !!progress.completedLessons[lesson.id];
                const stars = progress.completedLessons[lesson.id]?.stars || 0;
                const isNextActive =
                  isUnlocked &&
                  !isCompleted &&
                  (!unit.lessons[idx - 1] || (progress.lessonRounds?.[unit.lessons[idx - 1].id] || 0) >= (unit.lessons[idx - 1].rounds || 3) || !!progress.completedLessons[unit.lessons[idx - 1].id]);

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

                    {/* Lesson Circle Button */}
                    <button
                      type="button"
                      onClick={() => handleNodeClick(lesson, unit, isUnlocked)}
                      className={`relative rounded-full flex items-center justify-center transition-all select-none touch-target ${
                        lesson.isBoss
                          ? 'w-24 h-24 border-b-6 shadow-2xl border-amber-600 bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 text-amber-950 hover:scale-105 active:scale-95 glow-module-amber animate-pulse-glow'
                          : 'w-20 h-20 border-b-5 shadow-lg active:scale-95 active:translate-y-1 active:border-b-2 hover:scale-105'
                      } ${
                        !isUnlocked
                          ? 'bg-gray-200 dark:bg-gray-750 border-gray-300 dark:border-gray-800 text-gray-400 cursor-not-allowed opacity-75'
                          : isCompleted
                          ? 'bg-gradient-to-b from-amber-300 to-amber-400 border-amber-600 text-amber-950 shadow-amber-500/20'
                          : getNodeColor(unit, lesson.isBoss)
                      }`}
                    >
                      {/* Segmented round progress ring (Bencho / ReactBits) */}
                      {isUnlocked && (
                        <SegmentedProgressRing
                          totalSegments={totalRounds}
                          completedSegments={finishedRounds}
                          isBoss={lesson.isBoss}
                          activeColor={isCompleted ? '#F59E0B' : getUnitRingColor(unit.color)}
                        />
                      )}

                      {/* Ring indicator for current active node */}
                      {isNextActive && (
                        <span
                          className="absolute -inset-2.5 rounded-full border-4 animate-pulse-ring pointer-events-none"
                          style={{ borderColor: getUnitRingColor(unit.color) }}
                        />
                      )}

                      {/* Icon inside circle */}
                      {!isUnlocked ? (
                        <Lock className="w-7 h-7 stroke-[2.5]" />
                      ) : lesson.isBoss ? (
                        <Crown className="w-9 h-9 fill-amber-200 text-white drop-shadow-md" />
                      ) : isCompleted ? (
                        <div className="flex flex-col items-center">
                          <Check className="w-8 h-8 stroke-[3.5] text-amber-900 drop-shadow-xs" />
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
                        <AppIcon name={lesson.icon} size={28} />
                      )}

                      {/* Little badge showing lesson number e.g. "1.1 • 2/3" */}
                      <span className="absolute -bottom-2.5 bg-gray-900/90 dark:bg-black/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-black border border-white/20 text-gray-200 shadow-md flex items-center gap-1 z-20">
                        <span>{lesson.isBoss ? 'BOSS' : lesson.id}</span>
                        {!lesson.isBoss && (
                          <span className={isCompleted ? 'text-amber-400' : 'text-emerald-400'}>
                            {isCompleted ? '✓' : `${finishedRounds}/${totalRounds}`}
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Lesson Details Dialog / Bottom Drawer */}
      {/* Lesson Details & Round Launch Modal */}
      {selectedLesson && (() => {
        const selectedTotalRounds = selectedLesson.rounds || (selectedLesson.isBoss ? 1 : 3);
        const selectedFinishedRounds = progress.lessonRounds?.[selectedLesson.id] !== undefined
          ? progress.lessonRounds[selectedLesson.id]
          : (progress.completedLessons[selectedLesson.id] ? selectedTotalRounds : 0);
        const isSelectedCompleted = selectedFinishedRounds >= selectedTotalRounds || !!progress.completedLessons[selectedLesson.id];
        const selectedCurrentRound = isSelectedCompleted ? 1 : Math.min(selectedFinishedRounds + 1, selectedTotalRounds);
        const roundInfo = getRoundInfo(selectedCurrentRound, selectedTotalRounds);

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border-2 border-lizu-gray dark:border-gray-700 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-lizu-green">
                  {selectedLesson.unitTitle} • {selectedLesson.subtitle}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLesson(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                  title="დახურვა"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    selectedLesson.isBoss ? 'bg-amber-100 dark:bg-amber-950/50' : 'bg-green-100 dark:bg-green-950/50'
                  }`}
                >
                  <AppIcon name={selectedLesson.icon} size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
                    {selectedLesson.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedLesson.description}
                  </p>
                </div>
              </div>

              {/* Round Information Card (Part 2) */}
              {!selectedLesson.isBoss && (
                <div className="p-3.5 bg-purple-950/40 rounded-2xl border border-purple-800/60 flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-lizu-blue text-gray-900 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {isSelectedCompleted ? '✓' : selectedCurrentRound}
                    </div>
                    <div>
                      <div className="text-xs font-black text-purple-200">
                        {isSelectedCompleted
                          ? `დასრულებულია (${selectedTotalRounds}/${selectedTotalRounds})`
                          : `რაუნდი ${selectedCurrentRound} / ${selectedTotalRounds}: ${roundInfo.name}`}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {roundInfo.description}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-400 shrink-0">
                    {isSelectedCompleted ? '+10 XP' : selectedCurrentRound === selectedTotalRounds ? '+30 XP' : '+15 XP'}
                  </span>
                </div>
              )}

              {selectedLesson.storyIntro && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-900 dark:text-amber-200">
                  {selectedLesson.storyIntro}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onStartLesson(selectedLesson, selectedCurrentRound);
                  setSelectedLesson(null);
                }}
                className="btn-3d-green py-4 text-base font-black flex items-center justify-center gap-2 mt-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>
                  {isSelectedCompleted
                    ? 'გამეორება (პრაქტიკა)'
                    : `რაუნდი ${selectedCurrentRound}-ის დაწყება`}
                </span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        progress={progress}
      />

      {/* Auth Modal (Appwrite Cloud Sync) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
        onRegister={register}
        onPasswordReset={sendPasswordReset}
      />

      {/* Leaderboard Modal (League) */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentUserId={currentUser?.$id || null}
        currentUserXp={progress.todayXp}
      />

      {/* Boss Challenge Modal (21st.dev + ReactBits) */}
      <BossChallengeModal
        isOpen={!!selectedBossLesson}
        lesson={selectedBossLesson?.lesson || null}
        unit={selectedBossLesson?.unit || null}
        onClose={() => setSelectedBossLesson(null)}
        onStart={() => {
          if (selectedBossLesson) {
            const boss = selectedBossLesson.lesson;
            setSelectedBossLesson(null);
            onStartLesson(boss, 1);
          }
        }}
        currentHearts={progress.hearts}
      />
    </div>
  );
};
