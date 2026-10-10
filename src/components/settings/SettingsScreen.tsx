import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { LiziMascot } from '../mascot/LiziMascot';
import {
  Volume2,
  VolumeX,
  Keyboard,
  Moon,
  RotateCcw,
  Award,
  Flame,
  Download,
  Upload,
  QrCode,
  Copy,
  Check,
  Sliders,
} from 'lucide-react';
import { sound } from '../../utils/sound';

export const SettingsScreen: React.FC = () => {
  const {
    progress,
    toggleTypingMode,
    toggleDarkMode,
    resetProgress,
    setSoundVolume,
    setSoundEffectsEnabled,
    setGermanVoiceEnabled,
    setSpeechSpeed,
    exportProgress,
    importProgress,
    generateTransferCode,
    importTransferCode,
  } = useGame();

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [transferCode, setTransferCode] = useState<string>('');
  const [pasteCode, setPasteCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Import file modal state
  const [pendingImportData, setPendingImportData] = useState<string | null>(null);

  const completedCount = Object.keys(progress.completedLessons || {}).length;

  const handleExportDownload = () => {
    sound.playClick();
    const dataStr = exportProgress();
    const dateStr = new Date().toISOString().split('T')[0];
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lizulingo-progress-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setPendingImportData(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const executeImport = (mode: 'merge' | 'replace') => {
    if (!pendingImportData) return;
    const result = importProgress(pendingImportData, mode);
    if (result.success) {
      sound.playComplete();
      setImportNotice(mode === 'merge' ? 'პროგრესი წარმატებით გაერთიანდა!' : 'პროგრესი წარმატებით ჩანაცვლდა!');
      setPendingImportData(null);
    } else {
      sound.playWrong();
      setImportNotice(result.error || 'შეცდომა იმპორტისას');
    }
  };

  const handleOpenTransfer = () => {
    sound.playClick();
    const code = generateTransferCode();
    setTransferCode(code);
    setShowTransferModal(true);
  };

  const handleCopyTransferCode = () => {
    sound.playClick();
    if (transferCode && navigator.clipboard) {
      navigator.clipboard.writeText(transferCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handlePasteCodeImport = (mode: 'merge' | 'replace') => {
    if (!pasteCode.trim()) return;
    const result = importTransferCode(pasteCode, mode);
    if (result.success) {
      sound.playComplete();
      setImportNotice('კოდით გადატანა წარმატებით დასრულდა!');
      setShowTransferModal(false);
      setPasteCode('');
    } else {
      sound.playWrong();
      setImportNotice(result.error || 'კოდი არასწორია');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-28 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-black uppercase tracking-wider text-lizu-purple">
          კონფიგურაცია
        </span>
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
          პარამეტრები & პროგრესის შენახვა
        </h2>
      </div>

      {/* Notification banner */}
      {importNotice && (
        <div className="p-3.5 bg-green-50 dark:bg-green-950/60 border-2 border-lizu-green text-lizu-green-dark dark:text-lizu-green rounded-2xl font-bold text-sm flex items-center justify-between">
          <span>{importNotice}</span>
          <button type="button" onClick={() => setImportNotice(null)} className="text-xs font-black">
            ✕
          </button>
        </div>
      )}

      {/* Profile / Stats Card */}
      <div className="p-5 bg-white dark:bg-gray-800 rounded-3xl border-2 border-lizu-gray dark:border-gray-700 shadow-sm flex items-center gap-4">
        <LiziMascot mood="happy" size={80} />
        <div className="flex flex-col gap-1 flex-1">
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
            A1 გერმანულის მოსწავლე
          </h3>
          <div className="flex flex-wrap gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 pt-1">
            <span className="flex items-center gap-1 text-lizu-yellow-dark dark:text-lizu-yellow">
              <Award className="w-3.5 h-3.5" /> {progress.xp} XP
            </span>
            <span className="flex items-center gap-1 text-lizu-orange">
              <Flame className="w-3.5 h-3.5 fill-current" /> {progress.streak} დღე
            </span>
            <span className="flex items-center gap-1 text-lizu-green">
              ✅ {completedCount} გაკვეთილი
            </span>
          </div>
        </div>
      </div>

      {/* Audio & Sound Settings */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-gray-400">
          ხმა და აუდიო
        </span>

        {/* Volume slider */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 flex flex-col gap-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-lizu-blue" />
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                ძირითადი ხმის სიმძლავრე
              </span>
            </div>
            <span className="text-xs font-black text-lizu-blue">
              {Math.round((progress.soundVolume ?? 0.8) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={progress.soundVolume ?? 0.8}
            onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
            className="w-full accent-lizu-blue cursor-pointer h-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>

        {/* Sound Effects Toggle */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-lizu-blue flex items-center justify-center">
              {progress.soundEffectsEnabled !== false ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                ხმოვანი ეფექტები (SFX)
              </h4>
              <p className="text-xs text-gray-500">
                ღილაკების, სწორი და შეცდომის ხმები
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setSoundEffectsEnabled(progress.soundEffectsEnabled === false);
            }}
            className={`w-13 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              progress.soundEffectsEnabled !== false ? 'bg-lizu-green' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                progress.soundEffectsEnabled !== false ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* German Speech Audio Toggle */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/60 text-lizu-green flex items-center justify-center">
              <span className="font-black text-sm">🇩🇪</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                გერმანული გამოთქმა
              </h4>
              <p className="text-xs text-gray-500">
                სიტყვების და წინადადებების აუდიო
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setGermanVoiceEnabled(progress.germanVoiceEnabled === false);
            }}
            className={`w-13 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              progress.germanVoiceEnabled !== false ? 'bg-lizu-green' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                progress.germanVoiceEnabled !== false ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Speech Speed Toggle (1.0x vs 0.75x) */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 flex items-center justify-between shadow-xs">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
              გამოთქმის სიჩქარე
            </h4>
            <p className="text-xs text-gray-500">
              ნელი 🐢 (0.75x) ან სტანდარტული (1.0x)
            </p>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSpeechSpeed(1.0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                (progress.speechSpeed ?? 1.0) === 1.0
                  ? 'bg-white dark:bg-gray-800 text-lizu-blue shadow-xs'
                  : 'text-gray-400'
              }`}
            >
              1.0x
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSpeechSpeed(0.75);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                (progress.speechSpeed ?? 1.0) === 0.75
                  ? 'bg-white dark:bg-gray-800 text-lizu-blue shadow-xs'
                  : 'text-gray-400'
              }`}
            >
              0.75x 🐢
            </button>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-gray-400">
          ინტერფეისი & რეჟიმები
        </span>

        {/* Typing Mode */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-lizu-yellow flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                აკრეფის რეჟიმი (Typing Mode)
              </h4>
              <p className="text-xs text-gray-500">
                სიტყვების კლავიატურით აკრეფა ბარათების ნაცვლად
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              toggleTypingMode();
            }}
            className={`w-13 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              progress.typingModeEnabled ? 'bg-lizu-green' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                progress.typingModeEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Dark Mode */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-lizu-purple flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                მუქი თემა (Dark Mode)
              </h4>
              <p className="text-xs text-gray-500">
                ღამის რეჟიმის ჩართვა/გამორთვა
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              toggleDarkMode();
            }}
            className={`w-13 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              progress.darkMode ? 'bg-lizu-purple' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                progress.darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Progress Save & Migration Section (B1.4) */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-lizu-blue">
          პროგრესის შენახვა & გადატანა
        </span>

        {/* Download File */}
        <button
          type="button"
          onClick={handleExportDownload}
          className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 hover:border-lizu-blue flex items-center justify-between shadow-xs group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-lizu-blue flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                ჩამოტვირთე ფაილი (.json)
              </h4>
              <p className="text-xs text-gray-500">
                შეინახე შენი სრული პროგრესი კომპიუტერში
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-lizu-blue">ჩამოტვირთვა →</span>
        </button>

        {/* Upload File */}
        <label className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 hover:border-lizu-green flex items-center justify-between shadow-xs group cursor-pointer transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/60 text-lizu-green flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                ატვირთე ფაილი (.json)
              </h4>
              <p className="text-xs text-gray-500">
                აღადგინე ადრე შენახული სარეზერვო ასლი
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-lizu-green">ატვირთვა →</span>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Transfer by Code / QR */}
        <button
          type="button"
          onClick={handleOpenTransfer}
          className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-lizu-gray dark:border-gray-700 hover:border-purple-500 flex items-center justify-between shadow-xs group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                კოდით გადატანა / QR
              </h4>
              <p className="text-xs text-gray-500">
                სწრაფი გადატანა ტელეფონზე ან სხვა ბრაუზერში
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-purple-600">გახსნა →</span>
        </button>
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="flex flex-col gap-3 pt-2">
        <span className="text-xs font-black uppercase tracking-wider text-lizu-red">
          მონაცემების მართვა
        </span>
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-red-200 dark:border-red-950/70 text-lizu-red hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-between font-bold text-sm transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            <span>პროგრესის განულება (Reset)</span>
          </div>
          <span className="text-xs text-red-400">ყველა შედეგის წაშლა</span>
        </button>
      </div>

      {/* App Info footer */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-600 pt-4">
        <p className="font-bold">LIZULINGO v2.0.0 (Modul 1–6)</p>
        <p>Direct Method German A1 for Georgian Speakers</p>
      </div>

      {/* Import Decision Modal */}
      {pendingImportData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full border-2 border-lizu-gray dark:border-gray-700 shadow-xl flex flex-col gap-4 text-center">
            <Upload className="w-10 h-10 text-lizu-green mx-auto" />
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
              ფაილის იმპორტი
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              როგორ გსურთ ფაილის იმპორტი?
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => executeImport('merge')}
                className="btn-3d-green py-3 text-sm font-black w-full"
              >
                გაერთიანება (Merge) ✨
              </button>
              <button
                type="button"
                onClick={() => executeImport('replace')}
                className="btn-3d-yellow py-3 text-sm font-black w-full"
              >
                ჩანაცვლება (Replace) 🔄
              </button>
              <button
                type="button"
                onClick={() => setPendingImportData(null)}
                className="btn-3d-white py-3 text-sm font-black w-full"
              >
                გაუქმება
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer by Code / QR Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full border-2 border-lizu-gray dark:border-gray-700 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                კოდით გადატანა
              </h3>
              <button type="button" onClick={() => setShowTransferModal(false)}>
                ✕
              </button>
            </div>

            {/* Generated Code Section */}
            <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600">
              <span className="text-xs font-bold text-gray-500">
                თქვენი მოწყობილობის გადატანის კოდი:
              </span>
              <div className="p-2 bg-white dark:bg-gray-800 rounded-xl text-xs font-mono break-all max-h-24 overflow-y-auto border border-gray-200 dark:border-gray-700">
                {transferCode}
              </div>
              <button
                type="button"
                onClick={handleCopyTransferCode}
                className="btn-3d-blue py-2.5 text-xs font-black flex items-center justify-center gap-1.5"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'კოპირებულია!' : 'კოდის კოპირება'}</span>
              </button>
            </div>

            {/* Paste Code Section */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs font-bold text-gray-500">
                სხვა მოწყობილობის კოდის ჩასმა:
              </span>
              <textarea
                value={pasteCode}
                onChange={(e) => setPasteCode(e.target.value)}
                placeholder="ჩასვით კოდი აქ..."
                rows={2}
                className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-xs font-mono border border-gray-200 dark:border-gray-600 outline-none focus:border-lizu-blue"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!pasteCode.trim()}
                  onClick={() => handlePasteCodeImport('merge')}
                  className="btn-3d-green flex-1 py-2.5 text-xs font-black disabled:opacity-50"
                >
                  გაერთიანება
                </button>
                <button
                  type="button"
                  disabled={!pasteCode.trim()}
                  onClick={() => handlePasteCodeImport('replace')}
                  className="btn-3d-yellow flex-1 py-2.5 text-xs font-black disabled:opacity-50"
                >
                  ჩანაცვლება
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full border-2 border-lizu-gray dark:border-gray-700 shadow-xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-lizu-red flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
              წავშალოთ მთელი პროგრესი?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              თქვენი ყველა XP, სტრიქი, გავლილი გაკვეთილი და მიღწევა განულდება და დაიწყებთ თავიდან.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playWrong();
                  resetProgress();
                  setShowResetConfirm(false);
                }}
                className="btn-3d-red py-3 text-sm font-black w-full"
              >
                დიახ, განულება
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="btn-3d-white py-3 text-sm font-black w-full"
              >
                გაუქმება
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
