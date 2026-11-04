import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Sparkles,
  Calendar,
  Clock,
  Send,
  Lock,
  Share2,
  Check,
  Quote,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateTimeElapsed } from '../utils/dateUtils';
import { LoveReply } from '../types';

interface CelebrationViewProps {
  weddingDateStr: string;
  onLockAgain: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isUnlocked: boolean;
}

export function CelebrationView({
  weddingDateStr,
  onLockAgain,
  videoRef,
  isUnlocked,
}: CelebrationViewProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [needsUserAudioClick, setNeedsUserAudioClick] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState(calculateTimeElapsed(weddingDateStr));
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Interactive Love Replies saved in localStorage
  const [replies, setReplies] = useState<LoveReply[]>(() => {
    try {
      const saved = localStorage.getItem('anniversary_replies');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: '1',
        sender: 'Bagus',
        message: 'Happy wedding anniversary cintaku, terima kasih sudah selalu ada, menemani setiap langkah dan membuat hidup ini selalu penuh warna dan senyuman.',
        createdAt: 'Hari Bahagia Kita',
      },
      {
        id: '2',
        sender: 'Nana (Adlina Zhafarina)',
        message: 'Aku sayang kamu banget-banget! Terima kasih atas segala cinta, kesabaran, dan perjuanganmu untuk keluarga kecil kita. Sampai menua bersama! ❤️',
        createdAt: 'Hari Bahagia Kita',
      },
    ];
  });

  const [newSender, setNewSender] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Ticking time elapsed
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(calculateTimeElapsed(weddingDateStr));
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingDateStr]);

  // Video Autoplay and unmute listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isUnlocked) return;

    // Reset video to start and play immediately
    video.currentTime = 0;

    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsMuted(video.muted);
          if (video.muted) {
            setNeedsUserAudioClick(true);
          }
        })
        .catch(() => {
          // If browser policy blocked unmuted play, immediately play muted
          video.muted = true;
          setIsMuted(true);
          setNeedsUserAudioClick(true);
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch((e) => console.log('Video play fallback error:', e));
        });
    }

    // Attach global user interaction listener to unmute if muted
    const handleFirstTouch = () => {
      if (video.muted) {
        video.muted = false;
        setIsMuted(false);
        setNeedsUserAudioClick(false);
      }
    };

    window.addEventListener('touchstart', handleFirstTouch, { once: true });
    window.addEventListener('click', handleFirstTouch, { once: true });

    return () => {
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };
  }, [isUnlocked, videoRef]);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) {
      setNeedsUserAudioClick(false);
    }
  };

  const handleEnableAudio = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setIsMuted(false);
    setNeedsUserAudioClick(false);
    video.play();
  };

  const handleReplayVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const handleAddFloatingHeart = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setFloatingHearts((prev) => [...prev, { id, x, y }]);

    // Trigger mini burst
    confetti({
      particleCount: 15,
      spread: 40,
      origin: {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      },
      colors: ['#f43f5e', '#fda4af', '#f59e0b'],
    });

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const reply: LoveReply = {
      id: Date.now().toString(),
      sender: newSender.trim() || 'Kekasih Hati',
      message: newMessage.trim(),
      createdAt: 'Baru saja',
    };

    const updated = [reply, ...replies];
    setReplies(updated);
    try {
      localStorage.setItem('anniversary_replies', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setNewSender('');
    setNewMessage('');

    // Trigger sweet confetti
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24'],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-[#120d0e] to-stone-950 text-stone-100 pb-20 selection:bg-rose-500/30">
      {/* Top Floating Bar */}
      <div className="sticky top-0 z-30 bg-stone-950/80 backdrop-blur-md border-b border-amber-500/20 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="font-cursive-romance text-2xl text-rose-300">
              Bagus & Adlina
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs text-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Salin tautan untuk dikirim ke pasangan"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Bagikan</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onLockAgain}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs text-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Kunci kembali halaman"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Kunci Ulang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-8 sm:pt-12 space-y-12 sm:space-y-16">
        
        {/* Section 1: Grand Anniversary Hero Greeting */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-medium tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>04 November 2023 · Hari Sakral Mengikat Janji</span>
          </div>

          <h1 className="font-cursive-romance text-5xl sm:text-7xl text-rose-300 drop-shadow-md">
            Happy Wedding Anniversary
          </h1>

          <p className="font-serif-luxury text-xl sm:text-2xl text-amber-200/95 italic max-w-2xl mx-auto leading-relaxed">
            &ldquo;Aku tercipta oleh-Nya untuk selalu mencintai kamu. Beri aku kesempatan tuk bahagiakan dirimu sampai aku tutup usia.&rdquo;
          </p>

          <p className="text-sm text-stone-400 max-w-xl mx-auto">
            Selamat hari ulang tahun pernikahan untuk kita berdua. Semoga cinta kita senantiasa diberkahi, dipenuhi ketenangan, kebahagiaan, dan kasih sayang hingga ke surga-Nya.
          </p>
        </section>

        {/* Section 2: Automated Video Player (Primary Request) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 animate-bounce" />
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
                Video Kenangan Manis Kita
              </h2>
            </div>
            <span className="text-xs text-amber-300 font-mono">
              ★ Dimainkan Otomatis
            </span>
          </div>

          {/* Video Container in Luxury Gold & Glass Frame */}
          <div id="anniversary-video-section" className="relative group rounded-3xl overflow-hidden bg-stone-900 border-2 border-amber-500/40 shadow-2xl shadow-rose-950/50">
            {/* Aspect Ratio Container for Vertical / Reel Video */}
            <div
              className="relative aspect-[9/16] sm:aspect-[16/9] max-h-[720px] w-full bg-black flex items-center justify-center cursor-pointer"
              onClick={handleAddFloatingHeart}
            >
              <video
                ref={videoRef}
                playsInline
                autoPlay
                loop
                preload="auto"
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src="/assets/aistudio/VID-20261104-WA0013_d0b4f387.mp4" type="video/mp4" />
              </video>

              {/* Unmute Prompt Banner if audio was blocked by browser policy */}
              {needsUserAudioClick && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnableAudio();
                    }}
                    className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-medium shadow-xl shadow-rose-900/60 border border-rose-300/40 flex items-center gap-2 animate-bounce cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Ketuk Di Sini untuk Mengaktifkan Suara Romantis 🎵</span>
                  </button>
                </div>
              )}

              {/* Floating Hearts from Tapping */}
              {floatingHearts.map((heart) => (
                <div
                  key={heart.id}
                  style={{ left: heart.x, top: heart.y }}
                  className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-[floatUp_1.5s_ease-out_forwards]"
                >
                  <Heart className="w-8 h-8 text-rose-500 fill-rose-500 drop-shadow-lg" />
                </div>
              ))}

              {/* Center Play/Pause Overlay indicator when paused */}
              {!isPlaying && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePlay();
                  }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center"
                >
                  <div className="w-20 h-20 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl shadow-rose-950/80 hover:scale-105 transition-transform">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                </div>
              )}

              {/* Subtitle / Lyric Highlight Banner */}
              <div className="absolute bottom-16 sm:bottom-16 left-4 right-4 pointer-events-none text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-amber-200 text-xs sm:text-sm font-serif-luxury italic border border-white/10 shadow-lg">
                  &ldquo;Genggam erat tangan ini, jangan sampai kau lepaskan... Sampai aku tutup usia...&rdquo;
                </span>
              </div>

              {/* Bottom Custom Playback Bar */}
              <div
                className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    aria-label={isPlaying ? 'Jeda video' : 'Putar video'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 text-rose-400" /> : <Play className="w-5 h-5 text-rose-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    aria-label={isMuted ? 'Nyalakan suara' : 'Bisukan suara'}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 text-amber-400" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleReplayVideo}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    aria-label="Putar ulang video"
                  >
                    <RotateCcw className="w-4 h-4 text-stone-300" />
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={handleAddFloatingHeart}
                    className="px-3 py-1.5 rounded-full bg-rose-600/70 hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Kirim Cinta</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFullscreen}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    aria-label="Layar penuh"
                  >
                    <Maximize2 className="w-4 h-4 text-stone-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-stone-400">
            Ketuk pada video kapan saja untuk melepaskan balon hati cinta ❤️
          </p>
        </section>

        {/* Section 3: Live Love Journey Counter */}
        <section className="bg-stone-900/80 border border-amber-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Waktu Berharga Bersama</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white">
              Perjalanan Cinta Kita Sejak Hari Akad Nikah
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Setiap detik bersamamu adalah anugerah terindah yang selalu kusyukuri.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-center">
              <span className="block text-3xl sm:text-4xl font-bold font-mono text-rose-400 tabular-nums">
                {timeElapsed.years}
              </span>
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider mt-1 block">
                Tahun
              </span>
            </div>

            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-center">
              <span className="block text-3xl sm:text-4xl font-bold font-mono text-amber-300 tabular-nums">
                {timeElapsed.months}
              </span>
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider mt-1 block">
                Bulan
              </span>
            </div>

            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-center">
              <span className="block text-3xl sm:text-4xl font-bold font-mono text-rose-400 tabular-nums">
                {timeElapsed.days}
              </span>
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider mt-1 block">
                Hari
              </span>
            </div>

            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-center">
              <span className="block text-3xl sm:text-4xl font-bold font-mono text-amber-300 tabular-nums">
                {timeElapsed.hours.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider mt-1 block">
                Jam
              </span>
            </div>

            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-center">
              <span className="block text-3xl sm:text-4xl font-bold font-mono text-rose-400 tabular-nums">
                {timeElapsed.minutes.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider mt-1 block">
                Menit
              </span>
            </div>

            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-center">
              <span className="block text-3xl sm:text-4xl font-bold font-mono text-amber-300 tabular-nums">
                {timeElapsed.seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider mt-1 block">
                Detik
              </span>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-stone-400">
            Total perjalanan suci ini: <strong className="text-amber-200">{timeElapsed.totalDays} hari</strong> penuh tawa, doa, dan rasa syukur.
          </div>
        </section>

        {/* Section 4: Surat Kenangan & Pesan Cinta (Love Letter) */}
        <section className="bg-gradient-to-br from-stone-900/90 via-stone-900 to-[#1c1417] border border-rose-500/20 rounded-3xl p-6 sm:p-10 relative shadow-2xl">
          <Quote className="w-12 h-12 text-rose-500/20 absolute top-6 right-6 pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="border-b border-rose-500/20 pb-4">
              <p className="font-cursive-romance text-3xl text-rose-300">
                Surat Cinta untuk Pasangan Jiwaku
              </p>
              <h3 className="font-serif-luxury text-2xl text-amber-200 font-semibold mt-1">
                Adlina Zhafarina & Bagus
              </h3>
            </div>

            <div className="space-y-4 font-serif-luxury text-stone-200 text-base sm:text-lg leading-relaxed">
              <p>
                Masih teringat jelas di meja akad itu, di hadapan para saksi dan wali nikah, saat dua tangan bersalaman dan janji suci terucap dengan nama Allah. Sejak detik itu, kita bukan lagi dua insan yang berjalan sendiri-sendiri, melainkan satu jiwa yang berlayar bersama.
              </p>
              <p>
                Terima kasih atas segala pengertian, kopi hangat yang dinikmati bersama di Bogor, canda tawa sederhana di sela kesibukan kita, dan pelukan hangat saat lelah melanda.
              </p>
              <p className="italic text-rose-200 bg-rose-950/30 p-4 rounded-2xl border border-rose-800/30">
                &ldquo;Walau keriput di pipimu terlihat nanti, takkan kuyahkan cintaku yang begitu... Kan kujaga hatimu sampai aku tua.&rdquo;
              </p>
              <p>
                Selamat Hari Ulang Tahun Pernikahan kita, cinta sejatiku. Semoga langkah kita selalu dipenuhi berkah, dijauhkan dari marabahaya, dan selalu saling menguatkan dalam suka maupun duka.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-rose-500/20 text-xs text-stone-400 font-sans">
              <span>Dengan segenap cinta tulus,</span>
              <span className="font-cursive-romance text-2xl text-rose-400">
                Forever & Always Yours
              </span>
            </div>
          </div>
        </section>

        {/* Section 5: Sacred Vows / Janji Pernikahan */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
              5 Janji Suci yang Selalu Kujaga
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Ikrar cinta yang kita pegang teguh hingga rambut memutih.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                num: '01',
                title: 'Selalu Menjadi Rumah Terbaikmu',
                desc: 'Tempatmu pulang dengan tenang, melepaskan penat, dan menemukan kedamaian tanpa syarat.',
              },
              {
                num: '02',
                title: 'Mendengarkan dengan Penuh Rasa',
                desc: 'Mendengarkan setiap cerita, keluh kesah, serta impianmu dengan hati yang lapang.',
              },
              {
                num: '03',
                title: 'Saling Menjaga dalam Doa',
                desc: 'Menyebut namamu di setiap sujud, memohon kesehatan, keberkahan rizki, dan surga bersama.',
              },
              {
                num: '04',
                title: 'Menghargai & Berjuang Bersama',
                desc: 'Tidak membiarkanmu merasa sendirian saat badai datang menerpa biduk rumah tangga kita.',
              },
            ].map((vow) => (
              <div
                key={vow.num}
                className="bg-stone-900/60 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-amber-400/80 font-bold">
                    JANJI {vow.num}
                  </span>
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
                <h4 className="text-base font-semibold text-white">
                  {vow.title}
                </h4>
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                  {vow.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Photo Memories (Featuring Uploaded Table Photo) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
              Album Kenangan Momen Sakral
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Detik-detik tak terlupakan di awal ikrar pernikahan kita.
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-stone-900 border border-amber-500/30 shadow-2xl">
            <div className="aspect-[16/9] w-full overflow-hidden">
              <img
                src="/assets/aistudio/DSC00632_246eafc7.jpg"
                alt="Meja Saksi Nikah CPP dan Wali Nikah"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 bg-stone-950/90 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Meja Saksi Nikah & Wali Nikah
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Tempat di mana janji sehidup semati ditandatangani dan disaksikan dengan penuh haru.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>04 November 2023</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Love Reply Wall (Bisa Tulis Balasan Ucapan Cinta) */}
        <section className="bg-stone-900/70 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Kotak Pesan & Balasan Cinta</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Tulis pesan balasan atau doa untuk perayaan ulang tahun pernikahan kita ini.
              </p>
            </div>
            <span className="text-xs text-stone-400">
              Tersimpan di perangkat kita
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleAddReply} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <input
                  type="text"
                  placeholder="Nama pengirim (cth: Nana / Bagus)"
                  value={newSender}
                  onChange={(e) => setNewSender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs sm:text-sm text-stone-200 placeholder:text-stone-500 outline-none focus:border-rose-400"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Tulis ucapan atau pesan cintamu di sini..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs sm:text-sm text-stone-200 placeholder:text-stone-500 outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-rose-950/60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Ucapan Cinta</span>
            </button>
          </form>

          {/* List of Replies */}
          <div className="space-y-3 pt-2">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className="p-4 bg-stone-950/60 border border-stone-800 rounded-2xl space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-300">
                    {reply.sender}
                  </span>
                  <span className="text-stone-500 text-[11px]">
                    {reply.createdAt}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-serif-luxury italic">
                  &ldquo;{reply.message}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Romantic Footer */}
      <footer className="mt-16 text-center space-y-2 text-stone-500 text-xs">
        <p className="font-cursive-romance text-2xl text-rose-400/80">
          Happy Wedding Anniversary · Bagus & Nana
        </p>
        <p>Bersama selamanya hingga jannah · 04 November 2023</p>
      </footer>
    </div>
  );
}
