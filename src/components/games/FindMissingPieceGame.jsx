import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSuccess, playFailure } from '../../utils/audio';

// Each puzzle: an animal with a missing piece, and 6 circular piece options
// We simulate the "face" puzzle concept from the image (mouse with missing face piece)
// Each round picks one animal and offers 6 circle options (1 correct + 5 wrong)

const PUZZLES = [
  {
    id: 'mouse',
    animal: '🐭',
    label: 'الفأرة',
    missingPart: '👁️',   // the correct piece emoji
    bgColor: '#f5e642',
    bodyColor: '#8B7355',
    hint: 'أبحث عن القطعة الناقصة',
    correctPieceLabel: 'العين الصحيحة',
    wrongPieces: ['💧', '🌟', '🔴', '💜', '🟤'],
  },
  {
    id: 'lion',
    animal: '🦁',
    label: 'الأسد',
    missingPart: '👃',
    bgColor: '#fef3c7',
    bodyColor: '#d97706',
    hint: 'أبحث عن القطعة الناقصة',
    correctPieceLabel: 'الأنف الصحيح',
    wrongPieces: ['💧', '🌟', '🔴', '💜', '🟢'],
  },
  {
    id: 'elephant',
    animal: '🐘',
    label: 'الفيل',
    missingPart: '👂',
    bgColor: '#e0f2fe',
    bodyColor: '#64748b',
    hint: 'أبحث عن القطعة الناقصة',
    correctPieceLabel: 'الأذن الصحيحة',
    wrongPieces: ['💧', '🌟', '🔴', '💜', '🟡'],
  },
  {
    id: 'cat',
    animal: '🐱',
    label: 'القطة',
    missingPart: '🐾',
    bgColor: '#fdf4ff',
    bodyColor: '#db2777',
    hint: 'أبحث عن القطعة الناقصة',
    correctPieceLabel: 'المخلب الصحيح',
    wrongPieces: ['💧', '🌟', '🔴', '💚', '🟤'],
  },
];

// Vibrant colors for the circular piece options
const PIECE_COLORS = [
  '#8B7355', '#a67c5e', '#7a6248', '#9b8264', '#c4a97d', '#6d5a42',
  '#b87333', '#c9956b', '#8b6914', '#a08050',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPuzzleRound(puzzle) {
  // Build 6 pieces: 1 correct + 5 wrong, shuffled
  const correctIdx = Math.floor(Math.random() * 6);
  const pieces = puzzle.wrongPieces.map((w, i) => ({
    id: `wrong-${i}`,
    emoji: w,
    isCorrect: false,
    color: PIECE_COLORS[(i + 1) % PIECE_COLORS.length],
  }));
  // Insert the correct piece at a random position
  pieces.splice(correctIdx, 0, {
    id: 'correct',
    emoji: puzzle.missingPart,
    isCorrect: true,
    color: PIECE_COLORS[0],
  });
  return pieces.slice(0, 6); // ensure exactly 6
}

export default function FindMissingPieceGame({ onCorrect, onIncorrect }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [pieces, setPieces] = useState(() => buildPuzzleRound(PUZZLES[0]));
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [wrongFlash, setWrongFlash] = useState(null);
  const [correctFlash, setCorrectFlash] = useState(null);
  const [solved, setSolved] = useState(false);
  const [totalSolved, setTotalSolved] = useState(0);
  const [showStarburst, setShowStarburst] = useState(false);

  const puzzle = PUZZLES[puzzleIndex];

  const handlePieceClick = useCallback((piece) => {
    if (solved) return;

    setSelectedPiece(piece.id);

    if (piece.isCorrect) {
      playSuccess();
      setCorrectFlash(piece.id);
      setShowStarburst(true);
      setTimeout(() => {
        setSolved(true);
        setShowStarburst(false);
      }, 800);
      onCorrect();
      setTotalSolved(p => p + 1);
    } else {
      playFailure();
      setWrongFlash(piece.id);
      onIncorrect();
      setTimeout(() => {
        setWrongFlash(null);
        setSelectedPiece(null);
      }, 600);
    }
  }, [solved, onCorrect, onIncorrect]);

  const nextPuzzle = () => {
    const nextIdx = (puzzleIndex + 1) % PUZZLES.length;
    setPuzzleIndex(nextIdx);
    setPieces(buildPuzzleRound(PUZZLES[nextIdx]));
    setSelectedPiece(null);
    setWrongFlash(null);
    setCorrectFlash(null);
    setSolved(false);
  };

  return (
    <div
      className="flex flex-col items-center gap-4 select-none rounded-2xl p-4"
      style={{ background: `linear-gradient(135deg, ${puzzle.bgColor}cc, #fffde7)` }}
    >
      {/* Title */}
      <div
        className="bg-white/80 border-2 border-green-400 px-5 py-2 rounded-2xl shadow-sm"
        dir="rtl"
      >
        <h2 className="text-xl font-black text-green-700">
          أبحث عن القطعة الناقصة :
        </h2>
      </div>

      {/* Score badge */}
      <div className="flex items-center gap-2 bg-white/70 border border-yellow-300 px-4 py-1 rounded-full text-yellow-800 text-sm font-bold">
        🏆 محلولة: {totalSolved}
      </div>

      {/* Main layout: animal on left, pieces on right */}
      <div className="flex items-center justify-center gap-6 w-full">

        {/* Animal with missing piece */}
        <div className="relative flex flex-col items-center">
          {/* Decorative star background */}
          <div className="relative">
            {/* Starburst decorations */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute text-yellow-200 opacity-60 text-2xl pointer-events-none"
                style={{
                  top: `${Math.sin(i * 60 * Math.PI / 180) * 70 + 50}%`,
                  left: `${Math.cos(i * 60 * Math.PI / 180) * 70 + 50}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${14 + (i % 3) * 4}px`,
                }}
              >
                ✦
              </div>
            ))}

            {/* Animal body card */}
            <div className="relative w-36 h-44 flex items-center justify-center">
              <span className="text-8xl drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
                {puzzle.animal}
              </span>

              {/* Missing piece hole - circle with ? or filled emoji */}
              <motion.div
                className="absolute flex items-center justify-center rounded-full border-4 border-dashed shadow-inner"
                style={{
                  width: 52,
                  height: 52,
                  bottom: 16,
                  right: -10,
                  background: solved ? puzzle.bodyColor + '22' : 'rgba(255,255,255,0.85)',
                  borderColor: solved ? '#22c55e' : puzzle.bodyColor,
                }}
                animate={solved ? { scale: [1, 1.25, 1], borderColor: ['#22c55e', '#86efac', '#22c55e'] } : {}}
                transition={{ duration: 0.5 }}
              >
                {solved ? (
                  <motion.span
                    className="text-2xl"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {puzzle.missingPart}
                  </motion.span>
                ) : (
                  <motion.span
                    className="text-2xl font-black"
                    style={{ color: puzzle.bodyColor }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    ؟
                  </motion.span>
                )}
              </motion.div>
            </div>
          </div>

          <p className="text-sm font-bold text-slate-600 mt-1" dir="rtl">{puzzle.label}</p>
        </div>

        {/* Pieces grid: 2 columns × 3 rows */}
        <div className="grid grid-cols-2 gap-3">
          {pieces.map((piece, idx) => {
            const isWrong = wrongFlash === piece.id;
            const isCorrectSelected = correctFlash === piece.id;
            const isSelected = selectedPiece === piece.id;

            return (
              <motion.button
                key={piece.id}
                onClick={() => handlePieceClick(piece)}
                whileHover={!solved ? { scale: 1.08 } : {}}
                whileTap={!solved ? { scale: 0.92 } : {}}
                animate={
                  isWrong ? { x: [-5, 5, -5, 5, 0], scale: [1, 0.95, 1] } :
                  isCorrectSelected ? { scale: [1, 1.3, 1.1] } : {}
                }
                disabled={solved && !piece.isCorrect}
                className={`
                  relative w-16 h-16 rounded-full flex items-center justify-center text-2xl
                  border-4 shadow-lg transition-all duration-200
                  ${isWrong ? 'border-red-500 bg-red-100' :
                    isCorrectSelected ? 'border-green-400 bg-green-100' :
                    solved && !piece.isCorrect ? 'border-slate-200 bg-slate-100 opacity-40 cursor-default' :
                    'border-white hover:border-purple-400 cursor-pointer'}
                `}
                style={{
                  background: isWrong
                    ? '#fee2e2'
                    : isCorrectSelected
                    ? '#dcfce7'
                    : solved && !piece.isCorrect
                    ? '#f1f5f9'
                    : `radial-gradient(circle at 35% 35%, ${piece.color}bb, ${piece.color}88)`,
                  boxShadow: isCorrectSelected
                    ? '0 0 20px rgba(34,197,94,0.6)'
                    : isWrong
                    ? '0 0 12px rgba(239,68,68,0.5)'
                    : `0 4px 12px ${piece.color}55`,
                }}
              >
                <span className="text-xl drop-shadow">{piece.emoji}</span>

                {/* Wrong X marker */}
                {isWrong && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center text-red-600 text-3xl font-black pointer-events-none"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    ✗
                  </motion.div>
                )}

                {/* Correct checkmark */}
                {isCorrectSelected && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center text-green-600 text-3xl font-black pointer-events-none"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Starburst success effect */}
      <AnimatePresence>
        {showStarburst && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-400 text-3xl"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: Math.cos(i * 30 * Math.PI / 180) * 120,
                  y: Math.sin(i * 30 * Math.PI / 180) * 120,
                  opacity: 0,
                  scale: 1.5,
                }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                ⭐
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solved overlay */}
      <AnimatePresence>
        {solved && (
          <motion.div
            className="w-full flex flex-col items-center gap-3 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center" dir="rtl">
              <p className="text-green-700 font-black text-lg">🎉 ممتاز! وجدت القطعة الصحيحة!</p>
              <p className="text-slate-500 text-sm">القطعة الناقصة: {puzzle.correctPieceLabel}</p>
            </div>
            <button
              onClick={nextPuzzle}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
              dir="rtl"
            >
              <span>لغز جديد 🔄</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
