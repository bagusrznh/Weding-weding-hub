import { Lock, CalendarHeart } from 'lucide-react';

interface LandingGateProps {
  onOpenPasscode: () => void;
}

export function LandingGate({ onOpenPasscode }: LandingGateProps) {
  const weddingPhotoUrl = '/assets/aistudio/DSC00632_246eafc7.jpg';

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-between px-4 py-8 sm:py-12 bg-gradient-to-b from-stone-950 via-[#141010] to-stone-950 text-stone-100 selection:bg-rose-500/30">
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 text-center max-w-xl mx-auto space-y-2">
        <h1 className="font-cursive-romance text-4xl sm:text-5xl text-rose-300 tracking-wide mt-2">
          Happy Wedding Anniversary
        </h1>
        <p className="font-serif-luxury text-stone-300 text-lg sm:text-xl italic tracking-wide">
          Sebuah Kenangan Indah Perjalanan Cinta Kita
        </p>
      </header>

      {/* Main Showcase: The Uploaded Image in Luxury Wedding Frame */}
      <main className="relative z-10 w-full max-w-2xl my-6 flex flex-col items-center">
        <div className="relative group w-full">
          {/* Outer Gold & Rose Glowing Border */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/40 via-rose-500/40 to-amber-500/40 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-1000" />

          {/* Picture Card */}
          <div className="relative overflow-hidden rounded-2xl bg-stone-900 border border-amber-500/30 shadow-2xl">
            {/* The Uploaded Wedding Photo */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-stone-950">
              <img
                src={weddingPhotoUrl}
                alt="Meja Saksi Pernikahan dan Wali Nikah - Hari Bahagia Kita"
                className="w-full h-full object-cover object-center transform group-hover:scale-102 transition duration-700 ease-out"
                loading="eager"
              />
              {/* Subtle elegant gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20 pointer-events-none" />
            </div>

            {/* Photo Caption & Context */}
            <div className="p-4 sm:p-5 bg-gradient-to-b from-stone-900 to-stone-950 text-center border-t border-amber-500/20">
              <p className="font-serif-luxury text-amber-200/90 text-sm sm:text-base italic">
                &ldquo;Meja tempat kita mengucap ikrar suci, disaksikan para saksi dan wali nikah tercinta.&rdquo;
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Langkah awal perjalanan dua hati menuju surga bersama.
              </p>
            </div>
          </div>
        </div>

        {/* The Action Button to Open */}
        <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={onOpenPasscode}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-medium text-base sm:text-lg shadow-xl shadow-rose-950/60 hover:shadow-rose-900/80 active:scale-98 transition-all flex items-center justify-center gap-3 border border-amber-300/30 cursor-pointer animate-glow"
          >
            <CalendarHeart className="w-5 h-5 text-amber-200" />
            <span className="font-medium tracking-wide">Buka Undangan & Kenangan</span>
            <Lock className="w-4 h-4 text-rose-200/90" />
          </button>
          
          <p className="text-xs text-stone-400 text-center flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-400/80 inline" />
            <span>Dilindungi kata sandi tanggal pernikahan (Anniversary)</span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-stone-500 font-serif-luxury italic">
        Forever & Always · Together Since Our Sacred Day
      </footer>
    </div>
  );
}
