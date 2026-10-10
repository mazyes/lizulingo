import React, { useState } from 'react';
import { TeachCard } from '../../types/lesson';
import { LiziMascot } from '../mascot/LiziMascot';
import { Volume2, Snail, ChevronRight, ChevronLeft, Sparkles, BookOpen, Lightbulb } from 'lucide-react';
import { tts } from '../../utils/tts';
import { AppIcon } from '../common/AppIcon';

interface Props {
  cards: TeachCard[];
  onComplete: () => void;
  onWordSeen?: (germanWord: string) => void;
}

export const TeachCardView: React.FC<Props> = ({ cards, onComplete, onWordSeen }) => {
  const [index, setIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const safeIndex = Math.min(Math.max(0, index), Math.max(0, cards.length - 1));
  const card = cards[safeIndex];

  React.useEffect(() => {
    if (card && card.type === 'word' && onWordSeen) {
      onWordSeen(card.german);
    }
  }, [card, onWordSeen]);

  const handleAudio = (slow: boolean = false) => {
    if (!card) return;
    const textToSpeak = card.type === 'word' ? card.german : (card.examples[0]?.german || card.title);
    setIsPlayingAudio(true);
    tts.speak(textToSpeak, { slow, onEnd: () => setIsPlayingAudio(false) });
  };

  const handleNext = () => {
    setIndex(prev => {
      if (prev + 1 < cards.length) {
        return prev + 1;
      }
      onComplete();
      return prev;
    });
  };

  const handlePrev = () => {
    setIndex(prev => Math.max(0, prev - 1));
  };

  if (!card || cards.length === 0) return null;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-between min-h-[460px] p-2">
      {/* Top Phase Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-xs">
            <BookOpen className="w-3.5 h-3.5" />
            ფაზა 1: ისწავლე
          </span>
        </div>
        <div className="text-xs font-black text-gray-500 dark:text-gray-400">
          ბარათი {safeIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5 mb-6">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === safeIndex
                ? 'w-6 bg-emerald-500 shadow-xs'
                : i < safeIndex
                ? 'w-2 bg-emerald-400/60 dark:bg-emerald-600/60'
                : 'w-2 bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Card Content Area */}
      <div className="w-full flex-1 flex flex-col justify-center items-center">
        {card.type === 'word' ? (
          <div className="w-full bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border-2 border-lizu-gray dark:border-gray-700 shadow-xl flex flex-col items-center text-center animate-pop">
            {/* Visual Icon / SVG */}
            <div className="w-24 h-24 mb-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shadow-inner border border-amber-200/50 dark:border-amber-700/50">
              <AppIcon name={card.image || 'de'} size={56} />
            </div>

            {/* Article + Word */}
            <div className="flex items-center gap-2.5 mb-2 flex-wrap justify-center">
              {card.article && (
                <span
                  className={`px-3 py-1 rounded-xl font-black text-base text-white shadow-xs ${
                    card.article === 'der'
                      ? 'bg-[#1CB0F6]' // Masculine blue
                      : card.article === 'die'
                      ? 'bg-[#FF4B4B]' // Feminine red
                      : 'bg-[#58CC02]' // Neuter green
                  }`}
                >
                  {card.article}
                </span>
              )}
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                {card.german}
              </h2>
            </div>

            {/* Plural info */}
            {card.plural && card.plural !== '—' && (
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3">
                მრავლობითი: <span className="text-gray-700 dark:text-gray-300">{card.plural}</span>
              </p>
            )}

            {/* Georgian Translation */}
            <div className="text-xl sm:text-2xl font-black text-lizu-green-dark dark:text-lizu-green mb-6">
              {card.georgian}
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => handleAudio(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border-2 border-lizu-blue text-lizu-blue font-black text-sm active:scale-95 transition-all shadow-xs ${
                  isPlayingAudio ? 'ring-2 ring-lizu-blue' : ''
                }`}
                title="მოსმენა"
              >
                <Volume2 className="w-5 h-5 stroke-[2.5]" />
                <span>მოსმენა</span>
              </button>
              <button
                type="button"
                onClick={() => handleAudio(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 text-amber-700 dark:text-amber-300 font-black text-sm active:scale-95 transition-all shadow-xs"
                title="ნელა მოსმენა"
              >
                <Snail className="w-5 h-5 stroke-[2.5]" />
                <span>ნელა</span>
              </button>
            </div>

            {/* Example sentence */}
            {card.exampleSentence && (
              <div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-600/60 text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-1">
                  მაგალითი:
                </div>
                <div className="font-extrabold text-base text-gray-900 dark:text-gray-100">
                  {card.exampleSentence}
                </div>
                {card.exampleTranslation && (
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 mt-1">
                    {card.exampleTranslation}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Rule Card */
          <div className="w-full bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-7 border-2 border-lizu-gray dark:border-gray-700 shadow-xl flex flex-col animate-pop">
            {/* Lizi Speech Bubble */}
            <div className="flex items-start gap-4 mb-5">
              <LiziMascot mood="explaining" size={64} />
              <div className="flex-1 bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl p-3.5 shadow-xs relative">
                <span className="text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>ლიზი გასწავლის წესს</span>
                </span>
                <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                  {card.liziBubble || card.title}
                </p>
              </div>
            </div>

            {/* Title & Georgian Rule */}
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">
              {card.title}
            </h3>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line leading-relaxed">
              {card.ruleGeorgian}
            </p>

            {/* Mini Grammar Table if available */}
            {card.table && (
              <div className="overflow-x-auto mb-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs text-center">
                  <thead className="bg-gray-100 dark:bg-gray-700 font-black text-gray-700 dark:text-gray-200">
                    <tr>
                      {card.table.headers.map((h, i) => (
                        <th key={i} className="py-2 px-3 border-b border-gray-200 dark:border-gray-600">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {card.table.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={rIdx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="py-2 px-3 font-bold border-b border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Rule Examples */}
            {card.examples && card.examples.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  მაგალითები:
                </span>
                {card.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-sm font-black text-gray-900 dark:text-gray-100">
                        {ex.german}
                      </div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {ex.georgian}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => tts.speak(ex.german)}
                      className="p-1.5 rounded-lg text-lizu-blue hover:bg-blue-100 dark:hover:bg-blue-900/40"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="w-full flex items-center justify-between gap-3 mt-6">
        <button
          type="button"
          onClick={handlePrev}
          disabled={safeIndex === 0}
          className={`px-4 py-3.5 rounded-2xl border-2 font-bold text-sm flex items-center gap-1.5 transition-all ${
            safeIndex === 0
              ? 'opacity-30 cursor-not-allowed border-gray-200 text-gray-400'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 active:scale-95'
          }`}
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
          <span>უკან</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="btn-3d-green flex-1 py-3.5 text-base font-black flex items-center justify-center gap-2"
        >
          {safeIndex + 1 < cards.length ? (
            <>
              <span>გავიგე, შემდეგი</span>
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </>
          ) : (
            <>
              <span>ივარჯიშე!</span>
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
