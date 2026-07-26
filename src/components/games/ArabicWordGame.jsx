import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Arabic word puzzles: each puzzle has an emoji, name, question, letters pool, and single targetWord
const PUZZLES = [
  {
    emoji: '🦁',
    name: 'أَسَد',
    question: ' اجمع حروف الكلمة',
    letters: ['أ', 'س', 'د', 'ي', 'م'],
    targetWord: 'أسد',
  },
  {
    emoji: '🦊',
    name: 'ثَعْلَب',
    question: ' اجمع حروف الكلمة',
    letters: ['ث', 'ع', 'ل', 'ب', 'ر'],
    targetWord: 'ثعلب',
  },
  {
    emoji: '🐘',
    name: 'فِيل',
    question: ' اجمع حروف الكلمة',
    letters: ['ف', 'ي', 'ل', 'ق', 'ر'],
    targetWord: 'فيل',
  },
  {
    emoji: '🦎',
    name: 'سِحْلِيَّة',
    question: ' اجمع حروف الكلمة',
    letters: ['س', 'ح', 'ل', 'ي', 'ة'],
    targetWord: 'سحلية',
  },
  {
    emoji: '🐬',
    name: 'دُولْفِين',
    question: ' اجمع حروف الكلمة',
    letters: ['د', 'و', 'ل', 'ف', 'ي', 'ن'],
    targetWord: 'دولفين',
  },
];

// Generate positions on a circle
function getCirclePositions(count, radius = 90) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  });
}

// Helper to normalize Arabic characters for lenient comparison (e.g. ignoring hamza details or tehmarduta/heh differences)
function normalizeArabic(str) {
  if (!str) return '';
  return str
    .replace(/[أإآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();
}

export default function ArabicWordGame({ onCorrect, onIncorrect }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [currentPath, setCurrentPath] = useState([]); // indices of selected letters
  const [isDragging, setIsDragging] = useState(false);
  const [shakeLetter, setShakeLetter] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [showCorrectWord, setShowCorrectWord] = useState(null);

  const puzzle = PUZZLES[puzzleIndex];
  const positions = getCirclePositions(puzzle.letters.length);
  const nodeRefs = useRef([]);

  // Reset state when puzzle changes
  useEffect(() => {
    setCurrentPath([]);
    setIsDragging(false);
    setCelebrate(false);
    setShowCorrectWord(null);
  }, [puzzleIndex]);

  const getCurrentWord = () =>
    currentPath.map((i) => puzzle.letters[i]).join('');

  const submitWord = useCallback(() => {
    const word = getCurrentWord();
    if (word.length < 2) {
      setCurrentPath([]);
      return;
    }

    const normWord = normalizeArabic(word);
    const normTarget = normalizeArabic(puzzle.targetWord);

    if (normWord === normTarget) {
      // Correct target word!
      setCelebrate(true);
      setShowCorrectWord(puzzle.targetWord);
      onCorrect();
      onCorrect();
      onCorrect();
      setTimeout(() => {
        setPuzzleIndex((p) => (p + 1) % PUZZLES.length);
      }, 2200);
    } else {
      // Wrong word
      onIncorrect();
      const lastIdx = currentPath[currentPath.length - 1];
      setShakeLetter(lastIdx);
      setTimeout(() => setShakeLetter(null), 500);
    }
    setCurrentPath([]);
  }, [currentPath, puzzle.targetWord, onCorrect, onIncorrect]);

  const handleNodeMouseDown = (idx) => {
    setIsDragging(true);
    setCurrentPath([idx]);
  };

  const handleNodeMouseEnter = (idx) => {
    if (!isDragging) return;
    if (currentPath.includes(idx)) return;
    setCurrentPath((prev) => [...prev, idx]);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      submitWord();
    }
  };

  // Touch handlers
  const handleTouchStart = (idx, e) => {
    e.preventDefault();
    setIsDragging(true);
    setCurrentPath([idx]);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    nodeRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        if (!currentPath.includes(idx)) {
          setCurrentPath((prev) => [...prev, idx]);
        }
      }
    });
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (isDragging) {
      setIsDragging(false);
      submitWord();
    }
  };

  // Build SVG lines for current path
  const SVG_SIZE = 220;
  const CENTER = SVG_SIZE / 2;

  const getNodeCenter = (idx) => ({
    x: CENTER + positions[idx].x,
    y: CENTER + positions[idx].y,
  });

  const pathLines = currentPath.slice(1).map((idx, i) => {
    const from = getNodeCenter(currentPath[i]);
    const to = getNodeCenter(idx);
    return { from, to, key: `${currentPath[i]}-${idx}` };
  });

  return (
    <div
      className="flex flex-col items-center select-none h-full"
      dir="rtl"
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header question */}
      <div className="w-full text-center mb-3">
        <p className="text-lg font-bold text-slate-700 font-arabic">
          {puzzle.question}
        </p>
      </div>

      {/* Animal image + name */}
      <div className="relative w-full flex flex-col items-center mb-3">
        {/* Animal image area */}
        <motion.div
          key={puzzleIndex}
          className="text-8xl mb-2 select-none"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {puzzle.emoji}
        </motion.div>
        <p className="text-sm text-slate-400 font-bold">{puzzle.name}</p>
      </div>

      {/* Case displaying the word being formed */}
      <div className="mb-4 min-h-[44px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {showCorrectWord ? (
            <motion.div
              key="correct"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-emerald-100 border-2 border-emerald-400 text-emerald-700 font-bold text-xl px-6 py-1.5 rounded-2xl"
            >
              🎉 {showCorrectWord}
            </motion.div>
          ) : currentPath.length > 0 ? (
            <motion.div
              key="current"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-amber-100 border-2 border-amber-400 text-amber-800 font-bold text-xl px-6 py-1.5 rounded-2xl tracking-widest"
              dir="rtl"
            >
              {getCurrentWord()}
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              className="text-slate-400 text-sm"
            >
             اجمع الأحرف لتشكيل كلمة
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Letter Circle */}
      <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
        {/* SVG lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={SVG_SIZE}
          height={SVG_SIZE}
        >
          {/* Connection lines */}
          {pathLines.map((line) => (
            <line
              key={line.key}
              x1={line.from.x}
              y1={line.from.y}
              x2={line.to.x}
              y2={line.to.y}
              stroke="#6366f1"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.7"
            />
          ))}
          {/* Center decorative circle */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r="42"
            fill="white"
            stroke="#e2e8f0"
            strokeWidth="2"
          />
          {/* Guide circle */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r="90"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Letter nodes */}
        {puzzle.letters.map((letter, idx) => {
          const pos = positions[idx];
          const isSelected = currentPath.includes(idx);
          const isFirst = currentPath[0] === idx;

          return (
            <motion.div
              key={`${puzzleIndex}-${idx}`}
              ref={(el) => (nodeRefs.current[idx] = el)}
              className={`absolute flex items-center justify-center rounded-full font-bold text-xl cursor-pointer select-none transition-colors
                ${isFirst
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300'
                  : isSelected
                  ? 'bg-indigo-400 text-white shadow-md'
                  : 'bg-white text-slate-800 shadow-md border-2 border-slate-200 hover:border-indigo-300'
                }`}
              style={{
                width: 48,
                height: 48,
                left: CENTER + pos.x - 24,
                top: CENTER + pos.y - 24,
                fontFamily: 'serif',
                zIndex: 10,
              }}
              animate={
                shakeLetter === idx
                  ? { x: [-6, 6, -6, 6, 0] }
                  : isSelected
                  ? { scale: 1.15 }
                  : { scale: 1 }
              }
              transition={{ duration: shakeLetter === idx ? 0.4 : 0.15 }}
              onMouseDown={() => handleNodeMouseDown(idx)}
              onMouseEnter={() => handleNodeMouseEnter(idx)}
              onTouchStart={(e) => handleTouchStart(idx, e)}
            >
              {letter}
            </motion.div>
          );
        })}

        {/* Celebration overlay */}
        <AnimatePresence>
          {celebrate && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl px-6 py-4 text-center border-4 border-emerald-400">
                <div className="text-4xl mb-1">🎊</div>
                <p className="font-bold text-emerald-600 text-lg">أحسنت!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip button */}
      <button
        onClick={() => setPuzzleIndex((p) => (p + 1) % PUZZLES.length)}
        className="mt-6 text-xs text-slate-400 hover:text-indigo-500 underline transition cursor-pointer"
      >
        التالي ←
      </button>
    </div>
  );
}
