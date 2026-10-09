import React, { useState } from 'react';
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
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);

  // If inside an active lesson session
  if (activeLesson) {
    return (
      <LessonScreen
        lesson={activeLesson}
        isPracticeMistakes={isPracticeMode}
        onExit={() => {
          setActiveLesson(null);
          setIsPracticeMode(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7] dark:bg-[#131F24] text-gray-800 dark:text-gray-100 transition-colors">
      <TopBar />

      <main className="flex-1 w-full max-w-2xl mx-auto">
        {activeTab === 'path' && (
          <HomeScreen
            onStartLesson={lesson => {
              setIsPracticeMode(false);
              setActiveLesson(lesson);
            }}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakesScreen
            onStartPractice={practiceLesson => {
              setIsPracticeMode(true);
              setActiveLesson(practiceLesson);
            }}
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
