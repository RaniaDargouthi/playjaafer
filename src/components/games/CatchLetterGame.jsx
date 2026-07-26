import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Available Arabic letters for target and spawning
const LETTERS = ['أ', 'ب', 'ت', 'ج'];

// Letter colors for bubbles
const COLORS = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#A855F7", "#EC4899", "#06B6D4"];

function CatchPopup({ x, y, pts }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-30 font-display font-extrabold text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
      style={{ left: x - 20, top: y - 30, fontSize: 28 }}
      initial={{ y: 0, opacity: 1, scale: 0.7 }}
      animate={{ y: -60, opacity: 0, scale: 1.3 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      +{pts} ⭐
    </motion.div>
  );
}

export default function CatchLetterGame({ onCorrect, onIncorrect }) {
  const [lettersPool, setLettersPool] = useState([]);
  const [targetLetter, setTargetLetter] = useState('ب');
  const [catches, setCatches] = useState(0);
  const [wandPos, setWandPos] = useState({ x: 0, y: 0, visible: false });
  const [catchFeedback, setCatchFeedback] = useState([]);
  const arenaRef = useRef(null);

  // Pick a random target letter on mount
  useEffect(() => {
    const randomTarget = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setTargetLetter(randomTarget);
  }, []);

  // Spawn bubbles at random intervals
  useEffect(() => {
    const spawnBubble = () => {
      if (!arenaRef.current) return;
      const rect = arenaRef.current.getBoundingClientRect();
      const arenaWidth = rect.width;
      const arenaHeight = rect.height;

      // Letters pool contains the target letter with higher frequency to make it fun, plus other letters
      const possibleLetters = [...LETTERS, targetLetter, targetLetter];
      const char = possibleLetters[Math.floor(Math.random() * possibleLetters.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      const startFromLeft = Math.random() > 0.5;
      const startX = startFromLeft ? -70 : arenaWidth + 70;
      const endX = startFromLeft ? arenaWidth + 70 : -70;

      const startY = Math.random() * (arenaHeight - 160) + 60;
      const midY1 = Math.random() * (arenaHeight - 160) + 60;
      const midY2 = Math.random() * (arenaHeight - 160) + 60;
      const endY = Math.random() * (arenaHeight - 160) + 60;

      const speed = 7 + Math.random() * 6; // flight speed

      const newLetter = {
        id: Math.random(),
        char,
        color,
        xPath: [startX, arenaWidth * 0.35, arenaWidth * 0.65, endX],
        yPath: [startY, midY1, midY2, endY],
        duration: speed,
        size: 70 + Math.random() * 20, // bubble size
      };

      setLettersPool(prev => [...prev.slice(-8), newLetter]);
    };

    // Initial spaws
    setTimeout(spawnBubble, 100);
    setTimeout(spawnBubble, 600);
    setTimeout(spawnBubble, 1200);

    const interval = setInterval(spawnBubble, 1800);
    return () => clearInterval(interval);
  }, [targetLetter]);

  const handleBubbleClick = (e, item) => {
    e.stopPropagation();

    if (item.char === targetLetter) {
      onCorrect();
      setLettersPool(prev => prev.filter(b => b.id !== item.id));

      // Show score pop-up
      const rect = arenaRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const feedbackId = Math.random();
      setCatchFeedback(prev => [...prev, { id: feedbackId, x: px, y: py, pts: 10 }]);
      setTimeout(() => setCatchFeedback(prev => prev.filter(f => f.id !== feedbackId)), 700);

      // Track catches to rotate target letter
      setCatches(prev => {
        const next = prev + 1;
        if (next >= 3) {
          // Select new target letter
          const remaining = LETTERS.filter(l => l !== targetLetter);
          const nextTarget = remaining[Math.floor(Math.random() * remaining.length)];
          setTimeout(() => {
            setTargetLetter(nextTarget);
            setCatches(0);
          }, 600);
        }
        return next;
      });
    } else {
      onIncorrect();
      // Apply short shake to the incorrect clicked bubble
      setLettersPool(prev => prev.map(b => b.id === item.id ? { ...b, shake: true } : b));
      setTimeout(() => {
        setLettersPool(prev => prev.map(b => b.id === item.id ? { ...b, shake: false } : b));
      }, 500);
    }
  };

  const handleArenaClick = (e) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    setWandPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });
    setTimeout(() => setWandPos(prev => ({ ...prev, visible: false })), 300);
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Game Header */}
      <div className="text-center mb-3">
        <h3 className="font-display text-2xl md:text-3xl text-indigo-900 mb-1 flex items-center justify-center gap-2">
          🎈 أمسك بالحرف العربي: <span className="bg-indigo-600 text-white font-arabic font-extrabold px-3.5 py-1 rounded-2xl shadow border-b-4 border-indigo-800">{targetLetter}</span>
        </h3>
        <p className="text-slate-500 text-sm font-semibold mt-1">
          انقر على الفقاعة التي تحتوي على الحرف المطلوب! ({catches}/3)
        </p>
      </div>

      {/* Bubble Arena */}
      <div
        ref={arenaRef}
        onClick={handleArenaClick}
        className="relative flex-grow min-h-[350px] md:min-h-[430px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 cursor-pointer"
        style={{
          background: "linear-gradient(to bottom, #A5F3FC 0%, #E0F2FE 40%, #F0FDFA 70%, #CCFBF1 100%)"
        }}
      >
        {/* Decorative sun */}
        <div className="absolute top-4 left-8 pointer-events-none">
          <motion.div
            className="w-14 h-14 rounded-full"
            style={{ background: "radial-gradient(circle, #FDE68A 40%, #FCD34D 80%, transparent 100%)" }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.8, 0.95, 0.8] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />
        </div>

        {/* Fluffy clouds floating */}
        {[
          { top: 20, right: 30, duration: 15, width: 90, height: 28 },
          { top: 60, left: 20, duration: 20, width: 70, height: 24 },
          { top: 120, right: 120, duration: 18, width: 100, height: 32 }
        ].map((c, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none bg-white/75 rounded-full blur-[0.5px] shadow-sm"
            style={{ top: c.top, left: c.left, right: c.right, width: c.width, height: c.height }}
            animate={{ x: i % 2 === 0 ? [0, 20, 0] : [0, -25, 0] }}
            transition={{ repeat: Infinity, duration: c.duration, ease: "easeInOut" }}
          />
        ))}

        {/* Floating Bubble Letters */}
        <AnimatePresence>
          {lettersPool.map((b) => (
            <motion.div
              key={b.id}
              className={`absolute cursor-pointer select-none rounded-full flex items-center justify-center border-2 border-white/60 shadow-lg`}
              style={{
                width: b.size,
                height: b.size,
                background: `radial-gradient(circle at 30% 30%, ${b.color}90, ${b.color}df)`,
                boxShadow: 'inset -5px -5px 12px rgba(0,0,0,0.15), inset 5px 5px 12px rgba(255,255,255,0.45)',
                left: b.xPath[0],
                top: b.yPath[0],
              }}
              initial={{ x: b.xPath[0], y: b.yPath[0], scale: 0, opacity: 0 }}
              animate={{
                x: b.xPath,
                y: b.yPath,
                scale: [0, 1, 1, 1, 1, 0],
                opacity: [0, 1, 1, 1, 1, 0],
                x: b.shake ? [0, -8, 8, -8, 8, 0] : b.xPath,
              }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
              transition={{
                duration: b.shake ? 0.4 : b.duration,
                ease: b.shake ? "easeInOut" : "linear"
              }}
              onClick={(e) => handleBubbleClick(e, b)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Highlight glossy effect inside bubble */}
              <div className="absolute top-1.5 left-2.5 w-4 h-2 bg-white/40 rounded-full rotate-[-15deg] pointer-events-none" />

              <span
                className="text-white font-black font-arabic select-none drop-shadow-md"
                style={{ fontSize: b.size * 0.45, lineHeight: 1 }}
              >
                {b.char}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Wand / Magic Sparkles Tap Animation */}
        <AnimatePresence>
          {wandPos.visible && (
            <motion.div
              key={wandPos.x + '-' + wandPos.y}
              className="absolute pointer-events-none z-20 flex items-center justify-center text-4xl"
              style={{ left: wandPos.x - 20, top: wandPos.y - 20 }}
              initial={{ scale: 0.2, rotate: -30, opacity: 0 }}
              animate={{ scale: [0.2, 1.3, 1], rotate: [0, 15, 0], opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              🪄✨
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score Popups */}
        <AnimatePresence>
          {catchFeedback.map(f => (
            <CatchPopup key={f.id} x={f.x} y={f.y} pts={f.pts} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
