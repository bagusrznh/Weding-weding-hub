import { useState, useEffect, useRef } from 'react';
import { LandingGate } from './components/LandingGate';
import { PasscodeModal } from './components/PasscodeModal';
import { CelebrationView } from './components/CelebrationView';
import { PetalsCanvas } from './components/PetalsCanvas';
import { DEFAULT_WEDDING_DATE } from './utils/dateUtils';
import { Flower2 } from 'lucide-react';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [showPetals, setShowPetals] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [targetWeddingDate, setTargetWeddingDate] = useState(() => {
    try {
      return localStorage.getItem('wedding_target_date') || DEFAULT_WEDDING_DATE;
    } catch {
      return DEFAULT_WEDDING_DATE;
    }
  });

  // Check URL query param ?unlocked=true if user wants direct preview or ?date=YYYY-MM-DD
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setTargetWeddingDate(dateParam);
    }
    if (params.get('unlocked') === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  // Trigger video immediately during user interaction gesture
  const triggerPlayVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    // Attempt play with audio
    video.muted = false;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Direct unmuted play blocked, starting muted:', err);
        video.muted = true;
        video.play().catch((e) => console.error('Fallback play failed:', e));
      });
    }
  };

  const handleUnlockSuccess = () => {
    setIsPasscodeModalOpen(false);
    setIsUnlocked(true);
    triggerPlayVideo();

    // Scroll to video section after short layout repaint
    setTimeout(() => {
      const videoSec = document.getElementById('anniversary-video-section');
      if (videoSec) {
        videoSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleLockAgain = () => {
    setIsUnlocked(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-rose-500/30">
      {/* Floating Petals Canvas */}
      {showPetals && <PetalsCanvas />}

      {/* Ambient Petals Toggle Button in Corner */}
      <button
        type="button"
        onClick={() => setShowPetals(!showPetals)}
        className="fixed bottom-4 right-4 z-40 p-2.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-700/60 text-stone-300 hover:text-rose-300 hover:border-rose-500/40 transition-colors shadow-lg cursor-pointer"
        title={showPetals ? 'Nonaktifkan kelopak bunga jatuh' : 'Aktifkan kelopak bunga jatuh'}
        aria-label="Toggle efek kelopak mawar"
      >
        <Flower2 className={`w-4 h-4 ${showPetals ? 'text-rose-400' : 'text-stone-500'}`} />
      </button>

      {/* Landing Gate View */}
      <div className={!isUnlocked ? 'block' : 'hidden'}>
        <LandingGate onOpenPasscode={() => setIsPasscodeModalOpen(true)} />
      </div>

      {/* Celebration View - Keep mounted for instant video readiness and instant playback */}
      <div className={isUnlocked ? 'block' : 'hidden'}>
        <CelebrationView
          weddingDateStr={targetWeddingDate}
          onLockAgain={handleLockAgain}
          videoRef={videoRef}
          isUnlocked={isUnlocked}
        />
      </div>

      {/* Passcode Modal with Immediate Numeric Keypad */}
      <PasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        onSuccess={handleUnlockSuccess}
        onTriggerPlayVideo={triggerPlayVideo}
        targetWeddingDate={targetWeddingDate}
      />
    </div>
  );
}
