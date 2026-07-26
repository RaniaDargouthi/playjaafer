import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Puzzle definitions ────────────────────────────────────────────────────────
// Each puzzle references a high-quality illustration from /public/images/
const PUZZLES = [
  {
    label: '🦁 أسد لطيف',
    grid: 3,
    image: '/images/puzzle-lion.jpg',
    bg: 'from-amber-400 to-orange-500',
  },
  {
    label: '🐱 Petit Chat',
    grid: 3,
    image: '/images/puzzle-cat.jpg',
    bg: 'from-sky-400 to-blue-500',
  },
  {
    label: '🏠 Jolie Maison',
    grid: 3,
    image: '/images/puzzle-house.jpg',
    bg: 'from-pink-400 to-fuchsia-500',
  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Make sure it's not already solved
  while (a.every((v, i) => v.id === i)) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  return a;
}

// Helper to construct background styles for cutting up the single image
const getTileStyle = (pieceId, grid, image) => {
  const col = pieceId % grid;
  const row = Math.floor(pieceId / grid);
  const percentX = col * (100 / (grid - 1));
  const percentY = row * (100 / (grid - 1));
  return {
    backgroundImage: `url(${image})`,
    backgroundSize: `${grid * 100}% ${grid * 100}%`,
    backgroundPosition: `${percentX}% ${percentY}%`,
    backgroundRepeat: 'no-repeat',
  };
};

export default function PuzzleGame({ onCorrect, onIncorrect }) {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [slots, setSlots] = useState([]);   // slots[i] = piece object at index i
  const [selectedSlot, setSelectedSlot] = useState(null); // index of selected slot
  const [wrongSlot, setWrongSlot] = useState(null);
  const [solved, setSolved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [showNext, setShowNext] = useState(false);

  const puzzle = PUZZLES[puzzleIdx];
  const total = puzzle.grid * puzzle.grid;

  // Init / reset
  useEffect(() => {
    const tileObjects = Array.from({ length: total }, (_, i) => ({ id: i }));
    const shuffled = shuffle(tileObjects);
    setSlots(shuffled);
    setSolved(false);
    setMoves(0);
    setShowNext(false);
    setSelectedSlot(null);
    setWrongSlot(null);
  }, [puzzleIdx, total]);

  // Check win
  const checkWin = useCallback((newSlots) => {
    const complete = newSlots.every((p, i) => p !== null && p.id === i);
    if (complete) {
      setSolved(true);
      onCorrect();
      onCorrect();
      onCorrect();
      setTimeout(() => setShowNext(true), 1200);
    }
  }, [onCorrect]);

  const handleSlotClick = (index) => {
    if (solved) return;

    if (selectedSlot === null) {
      // First click: select the slot
      setSelectedSlot(index);
    } else {
      // Second click: swap
      const prevIdx = selectedSlot;
      if (prevIdx === index) {
        // Clicked same slot: deselect
        setSelectedSlot(null);
        return;
      }

      setMoves(m => m + 1);

      // Perform swap
      const newSlots = [...slots];
      const temp = newSlots[prevIdx];
      newSlots[prevIdx] = newSlots[index];
      newSlots[index] = temp;

      setSlots(newSlots);
      setSelectedSlot(null);

      // Play success/fail sound based on correctness
      const piece1MovedCorrectly = newSlots[index].id === index;
      const piece2MovedCorrectly = newSlots[prevIdx].id === prevIdx;
      
      if (piece1MovedCorrectly || piece2MovedCorrectly) {
        onCorrect();
      } else {
        onIncorrect();
        setWrongSlot(index);
        setTimeout(() => setWrongSlot(null), 600);
      }

      checkWin(newSlots);
    }
  };

  const goNext = () => setPuzzleIdx(i => (i + 1) % PUZZLES.length);
  const reset = () => setPuzzleIdx(i => i); // triggers useEffect

  return (
    <div className="flex flex-col h-full select-none items-center">
      {/* Header */}
      <div className="text-center mb-3">
        <h3 className="font-display text-2xl md:text-3xl text-indigo-900 mb-1">
          🧩 Puzzle — {puzzle.label}
        </h3>
        <p className="text-slate-500 text-sm">
        انقر على مربعين لتبديل موضعيهما وإعادة بناء الصورة!        </p>
      </div>

      {/* ── Puzzle Board ── */}
      <div className="flex flex-col items-center max-w-sm w-full">
        <div className="flex items-center gap-4 mb-3">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">الصورة المراد إعادة بنائها</p>
          {/* Mini preview with tooltip */}
          <div 
            className="w-10 h-10 rounded-lg border-2 border-white shadow-md cursor-help relative group"
            style={{
              backgroundImage: `url(${puzzle.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Tooltip showing full image */}
            <div className="absolute hidden group-hover:block bottom-12 left-1/2 -translate-x-1/2 bg-white p-1.5 rounded-2xl shadow-2xl border border-slate-100 z-30 w-48 h-48 pointer-events-none">
              <div 
                className="w-full h-full rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${puzzle.image})` }}
              />
              <div className="text-[10px] text-center text-slate-400 mt-1">Modèle complet</div>
            </div>
          </div>
        </div>

        <div
          className={`grid gap-1.5 p-2 rounded-3xl bg-gradient-to-br ${puzzle.bg} shadow-2xl border-4 border-white`}
          style={{ gridTemplateColumns: `repeat(${puzzle.grid}, 1fr)` }}
        >
          {slots.map((piece, i) => {
            const isCorrect = piece && piece.id === i;
            const isSelected = selectedSlot === i;
            const isWrong = wrongSlot === i;
            return (
              <motion.div
                key={i}
                onClick={() => handleSlotClick(i)}
                className={`relative flex items-center justify-center rounded-2xl text-3xl md:text-4xl font-bold transition-all cursor-pointer overflow-hidden border-2
                  ${isSelected
                    ? 'border-indigo-600 ring-4 ring-indigo-300 scale-105 z-10 shadow-lg'
                    : isCorrect
                    ? 'border-emerald-400/80 shadow-md'
                    : 'border-white/40 shadow-sm hover:border-white'
                  }`}
                style={{ width: 84, height: 84 }}
                animate={isWrong ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: isSelected ? 1.05 : 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {piece && (
                  <div
                    className="w-full h-full"
                    style={getTileStyle(piece.id, puzzle.grid, puzzle.image)}
                  />
                )}
                {isCorrect && (
                  <motion.div
                    className="absolute top-1.5 right-1.5 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md z-10 border border-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mt-4 w-full max-w-[280px]">
          <div className="bg-slate-200 rounded-full h-2.5 overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
              animate={{ width: `${(slots.filter((s, idx) => s && s.id === idx).length / total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-center text-xs text-slate-500 mt-2 font-semibold">
            {slots.filter((s, idx) => s && s.id === idx).length} / {total} en place · {moves} coups
          </p>
        </div>
      </div>

      {/* ── Solved Overlay ── */}
      <AnimatePresence>
        {solved && (
          <motion.div
            className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white p-6 text-center rounded-3xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Floating emojis */}
            {['🧩','🎉','⭐','🏆','✨','🎊'].map((e, i) => (
              <motion.span
                key={i}
                className="absolute text-3xl pointer-events-none"
                style={{ left: `${10 + i * 15}%`, top: '10%' }}
                animate={{ y: [-10, -40, -10], rotate: [0, 20, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 + i * 0.3, ease: 'easeInOut' }}
              >
                {e}
              </motion.span>
            ))}

            <motion.div
              className="text-8xl mb-4"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              🏆
            </motion.div>
            <h3 className="font-display text-4xl font-bold text-amber-300 mb-2">Bravo !</h3>
            <p className="text-emerald-100 text-lg mb-2">
              Puzzle <strong>{puzzle.label}</strong> complété !
            </p>
            <p className="text-emerald-300 text-sm mb-6">En {moves} coups 🎯</p>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="px-5 py-2.5 bg-white text-emerald-700 font-display font-bold rounded-2xl shadow-lg hover:bg-emerald-50 transition flex items-center gap-2 cursor-pointer"
              >
                🔄 Rejouer
              </button>
              {showNext && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={goNext}
                  className="px-5 py-2.5 bg-amber-400 text-amber-900 font-display font-bold rounded-2xl shadow-lg hover:bg-amber-300 transition flex items-center gap-2 cursor-pointer"
                >
                  Suivant ➡️
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
