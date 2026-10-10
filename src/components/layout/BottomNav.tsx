import React from 'react';
import { Map, RotateCcw, BookOpen, Settings } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/sound';

export type TabType = 'path' | 'mistakes' | 'dictionary' | 'settings';

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const { progress } = useGame();
  const mistakeCount = progress.mistakes.length;

  const handleSelect = (tab: TabType) => {
    sound.playClick();
    onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#131F24]/95 backdrop-blur-md border-t-2 border-lizu-gray dark:border-gray-800 transition-colors pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {/* Tab 1: Path */}
        <button
          type="button"
          onClick={() => handleSelect('path')}
          className={`flex flex-col items-center gap-1 font-bold text-xs transition-colors ${
            activeTab === 'path'
              ? 'text-lizu-green'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'path' ? 'bg-lizu-green/15 scale-110' : ''
            }`}
          >
            <Map className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span>სწავლა</span>
        </button>

        {/* Tab 2: Mistakes Review */}
        <button
          type="button"
          onClick={() => handleSelect('mistakes')}
          className={`flex flex-col items-center gap-1 font-bold text-xs transition-colors relative ${
            activeTab === 'mistakes'
              ? 'text-lizu-orange'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all relative ${
              activeTab === 'mistakes' ? 'bg-lizu-orange/15 scale-110' : ''
            }`}
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            {mistakeCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-lizu-red text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                {mistakeCount > 9 ? '9+' : mistakeCount}
              </span>
            )}
          </div>
          <span>შეცდომები</span>
        </button>

        {/* Tab 3: Wörterbuch (Dictionary) */}
        <button
          type="button"
          onClick={() => handleSelect('dictionary')}
          className={`flex flex-col items-center gap-1 font-bold text-xs transition-colors ${
            activeTab === 'dictionary'
              ? 'text-lizu-blue'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'dictionary' ? 'bg-lizu-blue/15 scale-110' : ''
            }`}
          >
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span>ლექსიკონი</span>
        </button>

        {/* Tab 4: Settings */}
        <button
          type="button"
          onClick={() => handleSelect('settings')}
          className={`flex flex-col items-center gap-1 font-bold text-xs transition-colors ${
            activeTab === 'settings'
              ? 'text-lizu-purple'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === 'settings' ? 'bg-lizu-purple/15 scale-110' : ''
            }`}
          >
            <Settings className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span>პარამეტრები</span>
        </button>
      </div>
    </nav>
  );
};
