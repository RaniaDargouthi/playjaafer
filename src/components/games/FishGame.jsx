import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClick } from '../../utils/audio';

const ARABIC_LETTERS = [
  'أ','ب','ت','ث','ج','ح','خ','د','ذ','ر',
  'ز','س','ش','ص','ض','ط','ظ','ع','غ','ف',
  'ق','ك','ل','م','ن','ه','و','ي'
];

// 4 well-spaced lanes (% from top) — enough room to click comfortably
const LANES = [6, 26, 48, 68];

const FISH_COLORS = [
  { body: '#FF6B6B', tail: '#FF8E8E' }, // Red
  { body: '#4DABF7', tail: '#74C0FC' }, // Blue
  { body: '#51CF66', tail: '#69DB7C' }, // Green
  { body: '#FCC419', tail: '#FFE066' }, // Yellow
];

const getRandomLetter = () =>
  ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];

export default function FishGame({ onCorrect, onIncorrect }) {
  const [targetLetter, setTargetLetter] = useState('');
  const [fishList, setFishList]         = useState([]);
  const [bubbleList, setBubbleList]     = useState([]);
  const [flashKey, setFlashKey]         = useState(0); // triggers re-animation on new round
  const [showNewRound, setShowNewRound] = useState(false);
  const roundRef = useRef(0);

  /* ── Generate a new round ─────────────────────────────────────── */
  const generateRound = () => {
    const target = getRandomLetter();
    setTargetLetter(target);

    // Flash the target badge & show "سؤال جديد!" banner
    setFlashKey(k => k + 1);
    setShowNewRound(true);
    playClick();                         // auditory cue for new question
    setTimeout(() => setShowNewRound(false), 900);

    // Build 4 unique letters (target guaranteed)
    const letters = new Set([target]);
    while (letters.size < 4) letters.add(getRandomLetter());

    // Shuffle so correct fish lands at a random position (lane 1-4)
    const shuffled = Array.from(letters).sort(() => Math.random() - 0.5);
    roundRef.current += 1;
    const roundId = roundRef.current;

    const fishArray = shuffled.map((letter, idx) => ({
      id: `${roundId}-${idx}`,          // unique key → forces remount each round
      letter,
      color: FISH_COLORS[idx % FISH_COLORS.length],
      duration: 9 + Math.random() * 5,  // 9–14 s swim speed
      lane: LANES[idx],                 // fixed lane for this slot
      fromLeft: Math.random() > 0.5,    // random direction each fish
      startDelay: idx * 0.25,           // stagger entrance
    }));

    setFishList(fishArray);
  };

  /* ── Background bubbles ───────────────────────────────────────── */
  useEffect(() => {
    generateRound();
    const interval = setInterval(() => {
      setBubbleList(prev => [
        ...prev.slice(-15),
        { id: Math.random(), x: Math.random() * 90 + 5, size: 10 + Math.random() * 15, delay: Math.random() * 1.5 }
      ]);
    }, 1200);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Click handler ───────────────────────────────────────────── */
  const handleFishClick = (clickedLetter) => {
    if (clickedLetter === targetLetter) {
      onCorrect();
      generateRound();
    } else {
      onIncorrect();
    }
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full select-none" style={{ minHeight: 420 }}>

      {/* ── Target prompt ────────────────────────────────────────── */}
      <div className="text-center mb-3 relative">
        <h3 className="font-display text-xl md:text-2xl text-indigo-900 mb-2">
          ابحث عن السمكة التي تحمل الحرف:
        </h3>

        {/* Badge flashes gold → indigo on every new round */}
        <motion.div
          key={flashKey}
          className="inline-flex items-center justify-center text-white font-arabic text-3xl w-20 h-20 rounded-full shadow-xl border-4 border-white"
          initial={{ scale: 1.6, backgroundColor: '#F59E0B', rotate: -15 }}
          animate={{ scale: 1,   backgroundColor: '#4F46E5', rotate: 0   }}
          transition={{ duration: 0.55, type: 'spring', stiffness: 260, damping: 18 }}
        >
          {targetLetter}
        </motion.div>

        {/* "New question" banner */}
        
      </div>

      {/* ── Water tank ───────────────────────────────────────────── */}
      <div className="relative flex-grow bg-gradient-to-b from-sky-400 to-blue-700 rounded-3xl overflow-hidden shadow-inner border-4 border-white/50" style={{ minHeight: 320 }}>

        {/* Seabed */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-amber-800 to-amber-600/70 rounded-b-2xl pointer-events-none flex justify-around items-end px-4 z-10">
          <div className="w-8  h-12 bg-emerald-600/80 rounded-t-full transform -rotate-12 origin-bottom" />
          <div className="w-10 h-16 bg-teal-600/80   rounded-t-full transform  rotate-6  origin-bottom" />
          <div className="w-6  h-10 bg-emerald-500/80 rounded-t-full transform -rotate-6  origin-bottom" />
          <div className="w-12 h-14 bg-teal-500/80   rounded-t-full transform  rotate-12 origin-bottom" />
        </div>

        {/* Lane guide lines (subtle) */}
        {LANES.map((lane, i) => (
          <div
            key={i}
            className="absolute inset-x-0 border-t border-white/10 pointer-events-none"
            style={{ top: `${lane}%` }}
          />
        ))}

        {/* Rising bubbles */}
        <AnimatePresence>
          {bubbleList.map(b => (
            <motion.div
              key={b.id}
              className="absolute bg-white/25 border border-white/40 rounded-full pointer-events-none"
              style={{ left: `${b.x}%`, width: b.size, height: b.size, bottom: -20 }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -450, opacity: [0, 0.7, 0.7, 0], x: [0, 12, -12, 0] }}
              transition={{ duration: 6, ease: 'easeOut', delay: b.delay }}
              exit={{ opacity: 0 }}
            />
          ))}
        </AnimatePresence>

        {/* ── Fish (one per lane) ─────────────────────────────────── */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence>
            {fishList.map(fish => (
              <FishItem
                key={fish.id}
                fish={fish}
                onClick={() => handleFishClick(fish.letter)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── FishItem sub-component ─────────────────────────────────────── */
function FishItem({ fish, onClick }) {
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ top: `${fish.lane}%` }}
      initial={{
        left: fish.fromLeft ? '-20%' : '110%',
        opacity: 0,
      }}
      animate={{
        left: fish.fromLeft ? '110%' : '-20%',
        opacity: 1,
      }}
      transition={{
        left: {
          duration: fish.duration,
          repeat: Infinity,
          ease: 'linear',
          delay: fish.startDelay,
        },
        opacity: { duration: 0.4, delay: fish.startDelay },
      }}
      onClick={onClick}
      whileHover={{ scale: 1.18, filter: 'brightness(1.15)' }}
      whileTap={{ scale: 0.88 }}
    >
      <div className="relative filter drop-shadow-lg">
        <svg
          width="115"
          height="78"
          viewBox="0 0 110 75"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: fish.fromLeft ? 'scaleX(1)' : 'scaleX(-1)' }}
        >
          {/* Back fin */}
          <path d="M30 35 C30 15, 60 5, 70 30 Z" fill={fish.color.tail} />
          {/* Tail */}
          <path d="M25 38 C5 15, 0 20, 5 38 C0 55, 5 60, 25 38 Z" fill={fish.color.tail} />
          {/* Body */}
          <path d="M20 38 C40 10, 95 10, 100 38 C95 65, 40 65, 20 38 Z" fill={fish.color.body} />
          {/* Eye */}
          <circle cx="80" cy="30" r="7"   fill="white" />
          <circle cx="82" cy="30" r="3"   fill="#1e293b" />
          <circle cx="83" cy="29" r="1.5" fill="white" />
          {/* Smile */}
          <path d="M80 45 Q85 50 90 45" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Side fin */}
          <path d="M45 45 C40 60, 55 60, 50 45 Z" fill={fish.color.tail} />
          {/* Scales */}
          <path d="M40 30 Q45 35 40 40" stroke="white" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M50 25 Q55 30 50 35" stroke="white" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M50 40 Q55 45 50 50" stroke="white" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>

        {/* Letter overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center font-arabic text-2xl font-bold text-slate-800 pointer-events-none select-none"
          style={{ paddingLeft: fish.fromLeft ? '15px' : '0px', paddingRight: fish.fromLeft ? '0px' : '15px', paddingBottom: '5px' }}
        >
          {fish.letter}
        </div>
      </div>
    </motion.div>
  );
}
