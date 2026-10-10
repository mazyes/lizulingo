import React, { useState, useEffect } from 'react';
import { SpeakQuestion } from '../../types/lesson';
import { Mic, MicOff, Volume2, Snail, CheckCircle2 } from 'lucide-react';
import { tts } from '../../utils/tts';
import { normalizeGerman } from '../../utils/normalize';

interface Props {
  question: SpeakQuestion;
  onCorrect: () => void;
  onSkip: () => void;
  disabled?: boolean;
}

export const SpeakQuestionView: React.FC<Props> = ({
  question,
  onCorrect,
  onSkip,
  disabled = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const handleStartListening = () => {
    if (disabled || !isSupported) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new SpeechRec();
      recognition.lang = 'de-DE';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);

        // Normalize and compare
        const normSpoken = normalizeGerman(text);
        const normTarget = normalizeGerman(question.targetSentence);
        if (normSpoken === normTarget || normSpoken.includes(normTarget)) {
          onCorrect();
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleAudio = (slow: boolean = false) => {
    tts.speak(question.targetSentence, { slow });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto text-center">
      <div className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
        <Mic className="w-4 h-4 text-lizu-blue" />
        <span>{question.georgianHint || 'გაიმეორეთ გერმანულად ხმამაღლა'}</span>
      </div>

      {/* Target sentence display */}
      <div className="w-full p-6 rounded-3xl bg-white dark:bg-gray-800 border-2 border-lizu-gray dark:border-gray-700 shadow-sm flex flex-col items-center gap-3">
        <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
          {question.targetSentence}
        </h3>
        <p className="text-sm font-semibold text-lizu-green-dark dark:text-lizu-green">
          {question.georgianTranslation}
        </p>

        {/* Audio buttons */}
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => handleAudio(false)}
            className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-lizu-blue hover:bg-blue-100 border border-blue-200"
            title="მოსმენა"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleAudio(true)}
            className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 hover:bg-amber-100 border border-amber-200"
            title="ნელა მოსმენა"
          >
            <Snail className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Spoken result */}
      {transcript && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 text-sm font-bold text-blue-900 dark:text-blue-200">
          <CheckCircle2 className="w-4 h-4 text-lizu-blue" />
          <span>ნათქვამი: {transcript}</span>
        </div>
      )}

      {/* Mic trigger button */}
      <div className="py-2">
        {isSupported ? (
          <button
            type="button"
            disabled={disabled}
            onClick={handleStartListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-xl active:scale-95 transition-all ${
              isListening
                ? 'bg-red-500 border-red-300 text-white animate-pulse'
                : 'bg-lizu-blue border-blue-200 text-white hover:bg-lizu-blue-dark'
            }`}
          >
            <Mic className="w-10 h-10" />
          </button>
        ) : (
          <div className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
            <MicOff className="w-4 h-4 text-gray-400" />
            <span>ხმის ამოცნობა ამ ბრაუზერში მიუწვდომელია</span>
          </div>
        )}
      </div>

      {/* Skip button ("ახლა არ შემიძლია") */}
      <button
        type="button"
        disabled={disabled}
        onClick={onSkip}
        className="text-xs font-black uppercase tracking-wider text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-2 px-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        ახლა არ შემიძლია (გამოტოვება)
      </button>
    </div>
  );
};
