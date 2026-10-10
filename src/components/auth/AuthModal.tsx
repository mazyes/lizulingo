import React, { useState } from 'react';
import { X, Cloud, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { LiziMascot } from '../mascot/LiziMascot';
import { sound } from '../../utils/sound';
import { useGame } from '../../context/GameContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (email: string, pass: string) => Promise<void>;
  onRegister?: (email: string, pass: string, name: string, mascotColor: string) => Promise<void>;
  onPasswordReset?: (email: string) => Promise<void>;
}

type AuthMode = 'login' | 'register' | 'recovery';

const MASCOT_COLORS = [
  { id: 'green', name: 'მწვანე', bg: 'bg-[#58CC02]' },
  { id: 'blue', name: 'ლურჯი', bg: 'bg-[#1CB0F6]' },
  { id: 'orange', name: 'ნარინჯისფერი', bg: 'bg-[#FF9600]' },
  { id: 'purple', name: 'იისფერი', bg: 'bg-[#CE82FF]' },
];

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onPasswordReset,
}) => {
  const game = useGame();
  const doLogin = onLogin || game.login;
  const doRegister = onRegister || game.register;
  const doPasswordReset = onPasswordReset || game.sendPasswordReset;

  const [mode, setMode] = useState<AuthMode>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mascotColor, setMascotColor] = useState('green');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateDisplayName = (name: string): string | null => {
    const trimmed = name.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      return 'სახელი უნდა შედგებოდეს 3-დან 20 სიმბოლომდე.';
    }
    if (trimmed.includes('@') || trimmed.includes('.com') || trimmed.includes('.ge')) {
      return 'სახელი არ უნდა შეიცავდეს ელფოსტის მისამართს.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (mode === 'recovery') {
      if (!email.trim()) {
        setError('გთხოვთ შეიყვანოთ ელფოსტა.');
        return;
      }
      setLoading(true);
      try {
        await doPasswordReset(email.trim());
        setSuccessNotice('პაროლის აღდგენის ბმული გამოგზავნილია თქვენს ელფოსტაზე.');
      } catch (err: any) {
        setError(err.message || 'შეცდომა პაროლის აღდგენისას.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'register') {
      const nameErr = validateDisplayName(displayName);
      if (nameErr) {
        setError(nameErr);
        return;
      }
      if (password.length < 8) {
        setError('პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო.');
        return;
      }
      setLoading(true);
      try {
        await doRegister(email.trim(), password, displayName.trim(), mascotColor);
        sound.playComplete();
        onClose();
      } catch (err: any) {
        setError(err.message || 'რეგისტრაცია ვერ მოხერხდა.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login mode
    setLoading(true);
    try {
      await doLogin(email.trim(), password);
      sound.playComplete();
      onClose();
    } catch (err: any) {
      setError(err.message || 'შესვლა ვერ მოხერხდა.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full border-2 border-lizu-gray dark:border-gray-700 shadow-2xl p-6 sm:p-7 flex flex-col gap-4 animate-pop max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-lizu-blue">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
                {mode === 'login' ? 'შესვლა' : mode === 'register' ? 'რეგისტრაცია' : 'პაროლის აღდგენა'}
              </h3>
              <p className="text-xs text-gray-400 font-bold">LIZULINGO Cloud Sync</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title="დახურვა"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Mascot + Motivation */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl border border-blue-200 dark:border-blue-900">
          <LiziMascot mood="happy" size={56} />
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-snug">
            {mode === 'register'
              ? 'შეინახეთ თქვენი პროგრესი ღრუბელში და ისწავლეთ ნებისმიერი მოწყობილობიდან!'
              : mode === 'login'
              ? 'შედით ანგარიშში თქვენი პროგრესის სინქრონიზაციისთვის.'
              : 'შეიყვანეთ ელფოსტა და მიიღებთ პაროლის შეცვლის ბმულს.'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        {mode !== 'recovery' && (
          <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-2xl text-xs font-black">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-gray-800 text-lizu-blue shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              რეგისტრაცია
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-gray-800 text-lizu-blue shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              შესვლა
            </button>
          </div>
        )}

        {/* Error / Success Banners */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-2xl text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-3 bg-green-50 dark:bg-green-950/60 border border-green-200 dark:border-green-800 rounded-2xl text-xs font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'register' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  სახელი (ლიგისთვის)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="მაგ: ანა, ნიკა..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-gray-100 focus:border-lizu-blue outline-none transition-all"
                  />
                </div>
              </div>

              {/* Mascot Color Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  თილისმის ფერი
                </label>
                <div className="flex gap-2">
                  {MASCOT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setMascotColor(c.id)}
                      className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 border-2 transition-all ${
                        mascotColor === c.id
                          ? 'border-gray-900 dark:border-white shadow-xs scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${c.bg}`} />
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              ელფოსტა
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-gray-100 focus:border-lizu-blue outline-none transition-all"
              />
            </div>
          </div>

          {mode !== 'recovery' && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  პაროლი
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('recovery');
                      setError(null);
                    }}
                    className="text-[11px] font-bold text-lizu-blue hover:underline"
                  >
                    დაგავიწყდათ?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="მინიმუმ 8 სიმბოლო"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-gray-100 focus:border-lizu-blue outline-none transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`btn-3d-green py-3.5 text-base font-black w-full mt-2 flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span>დამუშავება...</span>
            ) : (
              <>
                <span>
                  {mode === 'register'
                    ? 'რეგისტრაცია & სინქრონიზაცია'
                    : mode === 'login'
                    ? 'შესვლა'
                    : 'აღდგენის ბმულის გაგზავნა'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {mode === 'recovery' && (
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-center py-1"
          >
            ← შესვლის გვერდზე დაბრუნება
          </button>
        )}
      </div>
    </div>
  );
};
