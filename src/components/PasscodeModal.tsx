import React, { useState, useEffect, useRef } from 'react';
import { Heart, Lock, Calendar, Sparkles, HelpCircle, X, ArrowRight, Delete } from 'lucide-react';
import confetti from 'canvas-confetti';
import { verifyWeddingDate } from '../utils/dateUtils';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetWeddingDate: string;
  onTriggerPlayVideo?: () => void;
}

export function PasscodeModal({
  isOpen,
  onClose,
  onSuccess,
  targetWeddingDate,
  onTriggerPlayVideo,
}: PasscodeModalProps) {
  const [digits, setDigits] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus input when opened to immediately show the numeric keyboard on mobile
  useEffect(() => {
    if (isOpen) {
      setDigits('');
      setErrorMessage('');
      setShowHint(false);
      // Short delay ensures modal transition has started
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerSuccessConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#fef08a', '#fda4af'],
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#e11d48', '#f59e0b', '#ffffff'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#e11d48', '#f59e0b', '#ffffff'],
      });
    }, 250);
  };

  const handleVerify = (valToTest: string) => {
    setErrorMessage('');
    const isValid = verifyWeddingDate(valToTest, targetWeddingDate);

    if (isValid) {
      // Trigger video play synchronously within this user interaction event
      if (onTriggerPlayVideo) {
        onTriggerPlayVideo();
      }
      triggerSuccessConfetti();
      onSuccess();
    } else {
      setIsShaking(true);
      setErrorMessage('Tanggal ini belum tepat sayang... Coba ingat hari akad nikah kita ya! 💕');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numbers
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    setDigits(raw);
    setErrorMessage('');

    // If all 8 digits entered (e.g. 04112023), immediately verify
    if (raw.length === 8) {
      handleVerify(raw);
    }
  };

  const handleQuickKey = (num: string) => {
    if (digits.length < 8) {
      const next = digits + num;
      setDigits(next);
      setErrorMessage('');
      if (next.length === 8) {
        handleVerify(next);
      }
    }
  };

  const handleBackspace = () => {
    setDigits((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleFillTargetDate = () => {
    setDigits('04112023');
    handleVerify('04112023');
  };

  // Render 8 distinct boxes for DD-MM-YYYY
  const renderDigitBox = (index: number, placeholderChar: string) => {
    const char = digits[index] || '';
    const isActive = digits.length === index;

    return (
      <div
        key={index}
        className={`w-8 h-11 sm:w-9 sm:h-12 flex items-center justify-center rounded-lg border text-lg sm:text-xl font-mono font-bold transition-all ${
          char
            ? 'bg-rose-950/60 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/20'
            : isActive
            ? 'bg-stone-900 border-rose-500 text-stone-500 ring-2 ring-rose-500/30 animate-pulse'
            : 'bg-stone-950/80 border-stone-700/80 text-stone-600'
        }`}
      >
        {char || <span className="opacity-30 text-xs font-sans">{placeholderChar}</span>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div
        className={`relative w-full max-w-md bg-stone-900/95 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/50 text-stone-100 ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-rose-950 to-amber-900 border border-amber-500/40 text-amber-300 shadow-inner mb-3">
            <Lock className="w-6 h-6 text-rose-300" />
          </div>
          <p className="font-cursive-romance text-2xl sm:text-3xl text-rose-300 tracking-wide">
            Kunci Kenangan Sakral
          </p>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white mt-1">
            Masukkan Tanggal Pernikahan
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
            Ketik 8 angka tanggal akad nikah kita untuk membuka video & pesan cinta ini.
          </p>
        </div>

        {/* Real hidden/overlay input that forces numeric keyboard on mobile devices */}
        <div className="relative mb-4">
          <input
            ref={inputRef}
            id="numeric-wedding-passcode"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={8}
            value={digits}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-text"
            aria-label="Masukkan tanggal pernikahan"
          />

          {/* Visual 8-Box DD-MM-YYYY display */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="cursor-text py-2 flex items-center justify-center gap-1 sm:gap-1.5"
          >
            {/* DD */}
            <div className="flex items-center gap-1">
              {renderDigitBox(0, 'T')}
              {renderDigitBox(1, 'G')}
            </div>

            <span className="text-amber-500/80 font-bold px-0.5">-</span>

            {/* MM */}
            <div className="flex items-center gap-1">
              {renderDigitBox(2, 'B')}
              {renderDigitBox(3, 'L')}
            </div>

            <span className="text-amber-500/80 font-bold px-0.5">-</span>

            {/* YYYY */}
            <div className="flex items-center gap-1">
              {renderDigitBox(4, 'T')}
              {renderDigitBox(5, 'H')}
              {renderDigitBox(6, 'N')}
              {renderDigitBox(7, '2')}
            </div>
          </div>

          <p className="text-[11px] text-center text-stone-400 mt-2">
            Format: <span className="text-amber-300 font-mono">04-11-2023</span> (Hari - Bulan - Tahun)
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-3 p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-rose-200 text-xs text-center flex items-center justify-center gap-1.5 animate-fadeIn">
            <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 fill-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* On-Screen Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-1 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleQuickKey(digit)}
              className="py-2.5 bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-stone-100 font-mono text-lg font-medium rounded-xl border border-stone-700/60 transition-all cursor-pointer shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleFillTargetDate}
            title="Isi Tanggal Akad 04-11"
            className="py-2.5 bg-rose-950/60 hover:bg-rose-900/70 active:scale-95 text-rose-300 text-xs font-semibold rounded-xl border border-rose-800/50 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>04-11</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickKey('0')}
            className="py-2.5 bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-stone-100 font-mono text-lg font-medium rounded-xl border border-stone-700/60 transition-all cursor-pointer shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Hapus angka"
            className="py-2.5 bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-stone-300 text-xs font-medium rounded-xl border border-stone-700/60 transition-all flex items-center justify-center cursor-pointer shadow-sm"
          >
            <Delete className="w-4 h-4 text-stone-400" />
          </button>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => handleVerify(digits)}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 group transition-all cursor-pointer"
        >
          <span>Buka Undangan & Putar Video</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Footer controls & Hint */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
          <button
            type="button"
            onClick={handleFillTargetDate}
            className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Isi Otomatis (04-11-2023)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? 'Tutup Bantuan' : 'Butuh Petunjuk?'}</span>
          </button>
        </div>

        {/* Hint Box */}
        {showHint && (
          <div className="mt-3 p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200/90 text-xs text-left animate-fadeIn">
            <p className="font-semibold text-amber-300 mb-0.5">Petunjuk Cinta:</p>
            <p>
              Tanggal hari sakral pernikahan kita adalah{' '}
              <strong className="underline text-amber-100">04 November 2023</strong> (Ketik{' '}
              <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300 font-mono">04112023</code>).
            </p>
            <button
              type="button"
              onClick={handleFillTargetDate}
              className="mt-2 text-xs font-semibold text-rose-300 hover:text-rose-200 underline block cursor-pointer"
            >
              Langsung masukkan & buka sekarang →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
