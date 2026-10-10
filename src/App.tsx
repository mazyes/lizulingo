import React, { useLayoutEffect, useRef, useState } from 'react';
import { GameProvider } from './context/GameContext';
import { TopBar } from './components/layout/TopBar';
import { BottomNav, TabType } from './components/layout/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { MistakesScreen } from './components/mistakes/MistakesScreen';
import { DictionaryScreen } from './components/dictionary/DictionaryScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { LessonScreen } from './components/lesson/LessonScreen';
import { Lesson } from './types/lesson';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('path');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeRound, setActiveRound] = useState<number>(1);
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);

  // Remember where the path was scrolled when a lesson starts; restore it on return
  // (the home screen unmounts during a lesson, so the browser would jump to the top).
  const savedScrollY = useRef(0);
  const startLesson = (lesson: Lesson, practice: boolean, round: number = 1) => {
    savedScrollY.current = window.scrollY;
    setIsPracticeMode(practice);
    setActiveRound(round);
    setActiveLesson(lesson);
  };
  useLayoutEffect(() => {
    window.scrollTo(0, activeLesson ? 0 : savedScrollY.current);
  }, [activeLesson]);

  // If inside an active lesson session
  if (activeLesson) {
    return (
      <LessonScreen
        lesson={activeLesson}
        round={activeRound}
        isPracticeMistakes={isPracticeMode}
        onExit={() => {
          setActiveLesson(null);
          setIsPracticeMode(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#131F24] text-gray-100 transition-colors">
      <TopBar />

      <main className="flex-1 w-full max-w-2xl mx-auto">
        {activeTab === 'path' && (
          <HomeScreen
            onStartLesson={lesson => startLesson(lesson, false)}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakesScreen
            onStartPractice={practiceLesson => startLesson(practiceLesson, true)}
          />
        )}

        {activeTab === 'dictionary' && <DictionaryScreen />}

        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export function App() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}

export default App;
