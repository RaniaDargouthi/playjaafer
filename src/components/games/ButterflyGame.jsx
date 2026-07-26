import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// BUTTERFLY COLORS via inline filter styles (not Tailwind classes, which can't be dynamic)
const BUTTERFLY_SPECIES = [
  { emoji: "🦋", color: "#3B82F6", pts: 10, speed: 12, label: "Bleue" },
  { emoji: "🦋", color: "#F59E0B", pts: 15, speed: 10, label: "Dorée" },
  { emoji: "🦋", color: "#10B981", pts: 15, speed: 9, label: "Verte" },
  { emoji: "🦋", color: "#A855F7", pts: 20, speed: 8, label: "Violette" },
  { emoji: "🦋", color: "#EF4444", pts: 25, speed: 7, label: "Rouge" },
];

// Star pop-up feedback on catch
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

export default function ButterflyGame({ onCorrect, onIncorrect }) {
  const [butterflies, setButterflies] = useState([]);
  const [netPos, setNetPos] = useState({ x: 0, y: 0, visible: false });
  const [catchFeedback, setCatchFeedback] = useState([]);
  const arenaRef = useRef(null);

  // Spawn butterfly at random intervals
  useEffect(() => {
    const spawnButterfly = () => {
      if (!arenaRef.current) return;
      const rect = arenaRef.current.getBoundingClientRect();
      const arenaWidth = rect.width;
      const arenaHeight = rect.height;

      const species = BUTTERFLY_SPECIES[Math.floor(Math.random() * BUTTERFLY_SPECIES.length)];
      const startFromLeft = Math.random() > 0.5;
      const startX = startFromLeft ? -70 : arenaWidth + 70;
      const endX = startFromLeft ? arenaWidth + 70 : -70;

      const startY = Math.random() * (arenaHeight - 150) + 60;
      const midY1 = Math.random() * (arenaHeight - 150) + 60;
      const midY2 = Math.random() * (arenaHeight - 150) + 60;
      const endY = Math.random() * (arenaHeight - 150) + 60;

      const newButterfly = {
        id: Math.random(),
        species,
        xPath: [startX, arenaWidth * 0.3, arenaWidth * 0.7, endX],
        yPath: [startY, midY1, midY2, endY],
        duration: species.speed + Math.random() * 4,
        // Butterflies are now MUCH LARGER for easy clicking
        size: 72 + Math.random() * 24,
      };

      setButterflies(prev => [...prev.slice(-6), newButterfly]);
    };

    // Initial spawns
    setTimeout(spawnButterfly, 100);
    setTimeout(spawnButterfly, 600);
    setTimeout(spawnButterfly, 1200);

    const interval = setInterval(spawnButterfly, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCatch = (e, id, pts, x, y) => {
    e.stopPropagation();
    onCorrect();
    setButterflies(prev => prev.filter(b => b.id !== id));

    // Show +pts popup at click position
    const rect = arenaRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const feedbackId = Math.random();
    setCatchFeedback(prev => [...prev, { id: feedbackId, x: px, y: py, pts }]);
    setTimeout(() => setCatchFeedback(prev => prev.filter(f => f.id !== feedbackId)), 700);
  };

  // Show net animation anywhere on click
  const handleArenaClick = (e) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    setNetPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });
    setTimeout(() => setNetPos(prev => ({ ...prev, visible: false })), 250);
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Title */}
      <div className="text-center mb-3">
        <h3 className="font-display text-2xl md:text-3xl text-indigo-900 mb-1">
          🦋 أمسك بالفراشة ذات اللون الأخضر !
        </h3>
        <p className="text-slate-500 text-sm">
        انقر على الفراشة لتصطادها بشبكتك! 🕸️        </p>
      </div>

      {/* Meadow Arena */}
      <div
        ref={arenaRef}
        onClick={handleArenaClick}
        className="relative flex-grow min-h-[340px] md:min-h-[420px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/70 cursor-pointer"
        style={{
          background: "linear-gradient(to bottom, #93C5FD 0%, #BAE6FD 30%, #A7F3D0 60%, #6EE7B7 80%, #34D399 100%)"
        }}
      >
        {/* Sky top: gradient already handles it */}

        {/* Bright animated sun */}
        <div className="absolute top-3 right-8 pointer-events-none">
          <motion.div
            className="w-16 h-16 rounded-full"
            style={{ background: "radial-gradient(circle, #FDE68A 40%, #FCD34D 70%, transparent 100%)" }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <div
              key={deg}
              className="absolute top-1/2 left-1/2 w-1 h-5 bg-amber-300/60 rounded-full origin-bottom"
              style={{ transform: `translate(-50%, -100%) rotate(${deg}deg) translateY(-38px)` }}
            />
          ))}
        </div>

        {/* Fluffy Clouds */}
        <motion.div
          className="absolute top-8 left-4 pointer-events-none"
          animate={{ x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        >
          <div className="w-20 h-7 bg-white/80 rounded-full blur-[1px]" />
          <div className="w-14 h-5 bg-white/70 rounded-full blur-[1px] -mt-3 ml-3" />
        </motion.div>
        <motion.div
          className="absolute top-14 right-20 pointer-events-none"
          animate={{ x: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        >
          <div className="w-28 h-8 bg-white/70 rounded-full blur-[1px]" />
          <div className="w-18 h-5 bg-white/60 rounded-full blur-[1px] -mt-4 ml-4" />
        </motion.div>
        <motion.div
          className="absolute top-5 left-1/2 pointer-events-none"
          animate={{ x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        >
          <div className="w-16 h-6 bg-white/65 rounded-full blur-[1px]" />
        </motion.div>

        {/* Distant hills */}
        <div
          className="absolute bottom-16 inset-x-0 h-24 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 60% at 20% 100%, #6EE7B7 0%, transparent 80%), radial-gradient(ellipse 50% 50% at 70% 100%, #34D399 0%, transparent 70%)"
          }}
        />

        {/* Rich Grass / Flower Meadow at bottom */}
        <div
          className="absolute bottom-0 inset-x-0 h-20 rounded-b-2xl pointer-events-none z-10 flex justify-around items-end pb-2 px-3"
          style={{ background: "linear-gradient(to top, #059669, #10B981, rgba(16,185,129,0.5))" }}
        >
          {["🌸", "🌼", "🌺", "🌻", "🌸", "🌼", "🌺", "🌻", "🌸", "🌼"].map((f, i) => (
            <motion.span
              key={i}
              className="text-xl md:text-2xl"
              animate={{ y: [0, -3, 0], rotate: [0, i % 2 === 0 ? 5 : -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 + i * 0.3, ease: "easeInOut" }}
            >
              {f}
            </motion.span>
          ))}
        </div>

        {/* Trees on sides */}
        <div className="absolute bottom-14 left-2 text-4xl pointer-events-none select-none">🌳</div>
        <div className="absolute bottom-14 right-2 text-4xl pointer-events-none select-none">🌳</div>

        {/* ===== BUTTERFLIES ===== */}
        <AnimatePresence>
          {butterflies.map((b) => (
            <motion.div
              key={b.id}
              className="absolute cursor-pointer select-none"
              style={{ width: b.size, height: b.size }}
              initial={{ x: b.xPath[0], y: b.yPath[0], scale: 0, opacity: 0 }}
              animate={{
                x: b.xPath,
                y: b.yPath,
                scale: [0, 1, 1, 0.9, 1, 0],
                opacity: [0, 1, 1, 1, 1, 0],
              }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: b.duration, ease: "easeInOut" }}
              onClick={(e) => handleCatch(e, b.id, b.species.pts, 0, 0)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.8 }}
            >
              {/* Wing flap animation */}
              <motion.div
                className="w-full h-full flex items-center justify-center"
                animate={{ rotateY: [0, 70, 0, -70, 0] }}
                transition={{ repeat: Infinity, duration: 0.65, ease: "easeInOut" }}
                style={{ fontSize: b.size, lineHeight: 1, filter: `hue-rotate(${b.species.color === '#F59E0B' ? '45deg' : b.species.color === '#10B981' ? '120deg' : b.species.color === '#A855F7' ? '240deg' : b.species.color === '#EF4444' ? '330deg' : '0deg'}) saturate(1.4)` }}
              >
                {b.species.emoji}
              </motion.div>

              {/* Invisible enlarged hit area for easy single-click catching */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ margin: "-16px" }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Net tap animation on every click */}
        <AnimatePresence>
          {netPos.visible && (
            <motion.div
              key={netPos.x + '-' + netPos.y}
              className="absolute pointer-events-none z-20"
              style={{ left: netPos.x - 32, top: netPos.y - 32, fontSize: 64 }}
              initial={{ scale: 0.3, rotate: -40, opacity: 0 }}
              animate={{ scale: [0.3, 1.2, 1], rotate: [0, 20, 0], opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              🕸️
            </motion.div>
          )}
        </AnimatePresence>

        {/* Catch score popups */}
        <AnimatePresence>
          {catchFeedback.map(f => (
            <CatchPopup key={f.id} x={f.x} y={f.y} pts={f.pts} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
