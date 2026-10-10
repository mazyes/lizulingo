import React, { useState } from 'react';
import { dictionaryEntries } from '../../data/lessons';
import { DictionaryEntry } from '../../types/lesson';
import { Search, Volume2, BookOpen } from 'lucide-react';
import { tts } from '../../utils/tts';
import { sound } from '../../utils/sound';

export const DictionaryScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('ყველა');

  const modulesList = [
    { id: 'ყველა', label: 'ყველა' },
    { id: 'modul-1', label: 'მოდული 1 (Berlin)' },
    { id: 'modul-2', label: 'მოდული 2 (Heide)' },
    { id: 'modul-3', label: 'მოდული 3 (Hamburg)' },
    { id: 'modul-4', label: 'მოდული 4 (Ostsee)' },
    { id: 'modul-5', label: 'მოდული 5 (Düsseldorf)' },
    { id: 'modul-6', label: 'მოდული 6 (München)' },
  ];

  const filteredEntries = dictionaryEntries.filter((item: DictionaryEntry) => {
    const matchesSearch =
      item.german.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.georgian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.plural && item.plural.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesModule =
      selectedModule === 'ყველა' || item.module === selectedModule;

    return matchesSearch && matchesModule;
  });

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-28 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-black uppercase tracking-wider text-lizu-blue">
          ლექსიკონი • WÖRTERBUCH
        </span>
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-lizu-blue" />
          <span>გერმანული სიტყვარი</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          მოდული 1–6-ის ყველა საკვანძო სიტყვა არტიკლებით, მრავლობითითა და გახმოვანებით.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="მოძებნეთ სიტყვა (გერმანულად ან ქართულად)..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-lizu-gray dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-lizu-blue shadow-xs transition-colors"
        />
      </div>

      {/* Module Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {modulesList.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              sound.playClick();
              setSelectedModule(m.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedModule === m.id
                ? 'bg-lizu-blue border-lizu-blue text-white shadow-xs'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Words List */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
          სულ: {filteredEntries.length} სიტყვა
        </span>

        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm font-semibold">
            სიტყვა ვერ მოიძებნა.
          </div>
        ) : (
          filteredEntries.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 flex items-center justify-between shadow-xs hover:border-lizu-blue transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                  {item.article && (
                    <span
                      className={`text-xs font-black uppercase px-1.5 py-0.5 rounded-md ${
                        item.article === 'der'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                          : item.article === 'die'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                      }`}
                    >
                      {item.article}
                    </span>
                  )}
                  <span className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
                    {item.german}
                  </span>
                </div>

                {item.plural && item.plural !== '—' && (
                  <span className="text-xs font-semibold text-gray-400">
                    Plural: {item.plural}
                  </span>
                )}

                <span className="text-sm font-bold text-lizu-green-dark dark:text-lizu-green">
                  {item.georgian}
                </span>
              </div>

              {/* Speaker TTS Button */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  const fullText = item.article ? `${item.article} ${item.german}` : item.german;
                  tts.speak(fullText);
                }}
                className="w-10 h-10 rounded-xl bg-lizu-blue/10 text-lizu-blue hover:bg-lizu-blue/20 flex items-center justify-center transition-colors flex-shrink-0"
                title="მოსმენა"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
