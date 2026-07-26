import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSuccess, playFailure } from '../../utils/audio';

/* ─────────────────────────────────────────────
   Animal definitions
───────────────────────────────────────────── */
const ANIMALS = [
  { id: 'turtle', label: 'السلحفاة', emoji: '🐢', color: '#16a34a', light: '#dcfce7' },
  { id: 'cow',    label: 'البقرة',   emoji: '🐄', color: '#d97706', light: '#fef3c7' },
  { id: 'bird',   label: 'الطائر',   emoji: '🐦', color: '#2563eb', light: '#dbeafe' },
  { id: 'rabbit', label: 'الأرنب',   emoji: '🐰', color: '#be185d', light: '#fce7f3' },
  { id: 'cat',    label: 'القطة',    emoji: '🐱', color: '#7c3aed', light: '#ede9fe' },
  { id: 'lion',   label: 'الأسد',    emoji: '🦁', color: '#ea580c', light: '#ffedd5' },
];

/* ────────────────────────────────────────────
   HALF CARD SIZE — tweak this one constant
   to resize both halves at once
─────────────────────────────────────────────*/
const SIZE = 120; // px — width of each half card (height = SIZE too)
const EMOJI_SIZE = 100; // px font-size
// How far to nudge the emoji so only its half is visible.
// Roughly: full emoji ≈ EMOJI_SIZE * 0.6 wide, so half ≈ EMOJI_SIZE * 0.3
const NUDGE = Math.round(EMOJI_SIZE * 0.28);

/* ─────────────────────────────────────────────
   Half-animal renderer — shared by both sides
   side = 'left' | 'right'
───────────────────────────────────────────── */
function AnimalHalf({ animal, side, isSelected, isConnected, isWrong, isCorrectFlash, canInteract, onClick, refCb }) {
  const isLeft = side === 'left';

  const borderColor = isSelected
    ? animal.color
    : isConnected
    ? '#22c55e'
    : isWrong
    ? '#ef4444'
    : animal.color + '55';

  const shadow = isSelected
    ? `0 0 0 3px ${animal.color}, 0 6px 20px ${animal.color}44`
    : isConnected
    ? `0 0 0 3px #22c55e, 0 4px 12px #22c55e44`
    : isWrong
    ? `0 0 0 3px #ef4444`
    : canInteract
    ? `0 0 0 2px ${animal.color}77, 0 4px 12px ${animal.color}33`
    : `0 2px 8px ${animal.color}22`;

  return (
    <motion.button
      ref={refCb}
      onClick={onClick}
      disabled={isConnected}
      whileHover={canInteract && !isConnected ? { scale: 1.07, y: -2 } : {}}
      whileTap={canInteract && !isConnected ? { scale: 0.93 } : {}}
      animate={
        isWrong
          ? { x: [-10, 10, -10, 10, 0] }
          : isCorrectFlash
          ? { scale: [1, 1.18, 1] }
          : {}
      }
      transition={{ duration: 0.3 }}
      className="relative focus:outline-none flex items-center"
      style={{ cursor: isConnected ? 'default' : canInteract ? 'pointer' : 'default' }}
    >
      {/* ── Connector dot — placed between the column and the half-card ── */}
      {!isLeft && (
        <div style={{
          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
          marginRight: 6,
          background: isConnected ? '#22c55e' : canInteract ? animal.color : '#cbd5e1',
          border: `2.5px solid ${isConnected ? '#16a34a' : canInteract ? animal.color + 'bb' : '#94a3b8'}`,
          boxShadow: canInteract && !isConnected ? `0 0 8px ${animal.color}88` : 'none',
          transition: 'all 0.2s',
        }} />
      )}

      {/* ── The half-animal card ── */}
      <div
        style={{
          position: 'relative',
          width: SIZE,
          height: SIZE,
          background: isConnected ? animal.light : '#ffffff',
          border: `3px solid ${borderColor}`,
          borderRadius: isLeft ? '18px 0 0 18px' : '0 18px 18px 0',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: shadow,
          transition: 'box-shadow 0.2s, background 0.2s',
          opacity: isConnected ? 0.75 : 1,
        }}
      >
        {/* White background base for emoji clarity */}
        <div style={{
          position: 'absolute', inset: 0,
          background: isConnected ? animal.light : '#fafafa',
        }} />

        {/* The emoji — shifted so only its left or right half is visible */}
        <span
          style={{
            fontSize: EMOJI_SIZE,
            lineHeight: 1,
            userSelect: 'none',
            display: 'block',
            position: 'relative',
            zIndex: 2,
            // Shift LEFT: emoji moved right so only left portion is inside the card
            // Shift RIGHT: emoji moved left so only right portion is inside the card
            transform: isLeft ? `translateX(${NUDGE}px)` : `translateX(-${NUDGE}px)`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
          }}
        >
          {animal.emoji}
        </span>

        {/* Colored tint overlay matching the animal — very subtle */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `${animal.color}0d`,  /* 5% tint */
          pointerEvents: 'none',
          zIndex: 3,
        }} />

        {/* Dashed cut line on the open side */}
        <div style={{
          position: 'absolute',
          [isLeft ? 'right' : 'left']: -1,
          top: 0, bottom: 0, width: 3,
          background: `repeating-linear-gradient(
            to bottom,
            ${animal.color}88 0px, ${animal.color}88 7px,
            transparent 7px, transparent 13px
          )`,
          zIndex: 4,
        }} />

        {/* Correct ✓ badge */}
        {isConnected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: 6, [isLeft ? 'right' : 'left']: 6,
              background: '#22c55e',
              borderRadius: '50%', width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13, fontWeight: 900,
              boxShadow: '0 2px 8px rgba(34,197,94,0.5)',
              zIndex: 5,
            }}
          >✓</motion.div>
        )}

        {/* Wrong ✗ flash */}
        {isWrong && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute', inset: 0,
              background: '#ef444422',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, zIndex: 5,
            }}
          >✗</motion.div>
        )}
      </div>

      {/* ── Connector dot — on right side of left-half card ── */}
      {isLeft && (
        <div style={{
          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
          marginLeft: 6,
          background: isSelected ? animal.color : isConnected ? '#22c55e' : '#cbd5e1',
          border: `2.5px solid ${isSelected ? animal.color + 'cc' : isConnected ? '#16a34a' : '#94a3b8'}`,
          boxShadow: isSelected ? `0 0 10px ${animal.color}` : 'none',
          transition: 'all 0.2s',
        }} />
      )}

      {/* Animal label below */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          bottom: -22,
          left: 0, right: 0,
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 800,
          color: animal.color,
          whiteSpace: 'nowrap',
          letterSpacing: '-0.2px',
        }}
      >
        {animal.label}
      </div>

      {/* Selected pulsing ring */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: `3px solid ${animal.color}`,
            borderRadius: isLeft ? '18px 0 0 18px' : '0 18px 18px 0',
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
      )}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound() {
  const selected = shuffle(ANIMALS).slice(0, 3);
  return {
    leftItems:  selected,
    rightItems: shuffle([...selected]),
    selected,
  };
}

/* ─────────────────────────────────────────────
   Main Game
───────────────────────────────────────────── */
export default function MatchAnimalGame({ onCorrect, onIncorrect }) {
  const [round, setRound]               = useState(() => buildRound());
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [connections, setConnections]   = useState([]);
  const [wrongPair, setWrongPair]       = useState(null);
  const [correctFlash, setCorrectFlash] = useState(null);
  const [roundDone, setRoundDone]       = useState(false);
  const [totalMatched, setTotalMatched] = useState(0);
  const [lines, setLines]               = useState([]);

  const containerRef = useRef(null);
  const leftRefs     = useRef({});
  const rightRefs    = useRef({});

  /* ── SVG connection lines ── */
  const computeLines = useCallback(() => {
    if (!containerRef.current) return;
    const box = containerRef.current.getBoundingClientRect();
    const newLines = connections.map(({ leftId, rightId }) => {
      const lEl = leftRefs.current[leftId];
      const rEl = rightRefs.current[rightId];
      if (!lEl || !rEl) return null;
      const lBox = lEl.getBoundingClientRect();
      const rBox = rEl.getBoundingClientRect();
      const animal = ANIMALS.find(a => a.id === leftId);
      return {
        key: `${leftId}-${rightId}`,
        x1: lBox.right - box.left - 4,
        y1: lBox.top + lBox.height / 2 - box.top,
        x2: rBox.left - box.left + 4,
        y2: rBox.top + rBox.height / 2 - box.top,
        color: animal?.color || '#6366f1',
      };
    });
    setLines(newLines.filter(Boolean));
  }, [connections]);

  useEffect(() => {
    computeLines();
    window.addEventListener('resize', computeLines);
    return () => window.removeEventListener('resize', computeLines);
  }, [computeLines]);

  const isLeftConn  = id => connections.some(c => c.leftId  === id);
  const isRightConn = id => connections.some(c => c.rightId === id);

  const handleLeftClick = id => {
    if (isLeftConn(id)) return;
    setSelectedLeft(prev => (prev === id ? null : id));
  };

  const handleRightClick = id => {
    if (!selectedLeft || isRightConn(id)) return;
    const correct = selectedLeft === id;
    if (correct) {
      playSuccess();
      setCorrectFlash(id);
      setTimeout(() => setCorrectFlash(null), 700);
      const newConn = [...connections, { leftId: selectedLeft, rightId: id }];
      setConnections(newConn);
      onCorrect();
      setTotalMatched(p => p + 1);
      if (newConn.length === round.selected.length) {
        setTimeout(() => setRoundDone(true), 700);
      }
    } else {
      playFailure();
      setWrongPair({ leftId: selectedLeft, rightId: id });
      onIncorrect();
      setTimeout(() => setWrongPair(null), 700);
    }
    setSelectedLeft(null);
  };

  const nextRound = () => {
    setRound(buildRound());
    setConnections([]);
    setSelectedLeft(null);
    setWrongPair(null);
    setCorrectFlash(null);
    setRoundDone(false);
  };

  return (
    <div className="flex flex-col items-center gap-5 select-none" style={{ minHeight: 420 }}>

      {/* Title */}
      <div className="text-center" dir="rtl">
        <h2 className="text-2xl font-black text-purple-700 mb-0.5">أَرْبِطُ بِمَا يُنَاسِبُ</h2>
        <p className="text-xs text-slate-400">اربط نصفي كل حيوان مع بعضهما 🐾</p>
      </div>

      {/* Score */}
      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 px-4 py-1 rounded-full text-yellow-800 text-sm font-bold">
        ✅ مطابقات: {totalMatched}
      </div>

      {/* Instruction banner */}
      <motion.div
        key={selectedLeft ? 'sel' : 'none'}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs px-4 py-1.5 rounded-full font-semibold border"
        style={selectedLeft
          ? { background: '#ede9fe', borderColor: '#7c3aed', color: '#5b21b6' }
          : { background: '#f1f5f9', borderColor: '#cbd5e1', color: '#64748b' }
        }
        dir="rtl"
      >
        {selectedLeft
          ? `✨ الآن اختر النصف الأيمن للـ "${ANIMALS.find(a => a.id === selectedLeft)?.label}"!`
          : '👉 اضغط على النصف الأيسر أولاً'}
      </motion.div>

      {/* Board */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ minHeight: 340 }}
      >
        {/* SVG lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5, overflow: 'visible' }}
        >
          {lines.map(l => (
            <g key={l.key}>
              <line
                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke={l.color} strokeWidth={3.5}
                strokeLinecap="round" opacity={0.7}
              />
              <circle cx={l.x1} cy={l.y1} r={5} fill={l.color} opacity={0.8} />
              <circle cx={l.x2} cy={l.y2} r={5} fill={l.color} opacity={0.8} />
            </g>
          ))}
        </svg>

        <div className="flex justify-between items-center" style={{ padding: '0 4px', gap: 0 }}>

          {/* LEFT column */}
          <div className="flex flex-col gap-12 items-end" style={{ paddingBottom: 28 }}>
            {round.leftItems.map(animal => (
              <AnimalHalf
                key={animal.id}
                animal={animal}
                side="left"
                isSelected={selectedLeft === animal.id}
                isConnected={isLeftConn(animal.id)}
                isWrong={wrongPair?.leftId === animal.id}
                isCorrectFlash={false}
                canInteract={!isLeftConn(animal.id)}
                onClick={() => handleLeftClick(animal.id)}
                refCb={el => (leftRefs.current[animal.id] = el)}
              />
            ))}
          </div>

          {/* Center gap line */}
          <div style={{ flex: 1, borderTop: '2px dashed #e2e8f0', margin: '0 8px' }} />

          {/* RIGHT column */}
          <div className="flex flex-col gap-12 items-start" style={{ paddingBottom: 28 }}>
            {round.rightItems.map(animal => (
              <AnimalHalf
                key={animal.id}
                animal={animal}
                side="right"
                isSelected={false}
                isConnected={isRightConn(animal.id)}
                isWrong={wrongPair?.rightId === animal.id}
                isCorrectFlash={correctFlash === animal.id}
                canInteract={!!selectedLeft && !isRightConn(animal.id)}
                onClick={() => handleRightClick(animal.id)}
                refCb={el => (rightRefs.current[animal.id] = el)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Round complete */}
      <AnimatePresence>
        {roundDone && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl z-20"
            style={{ background: 'rgba(250,204,21,0.93)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.span
              className="text-7xl mb-3"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.6, repeat: 2 }}
            >🎉</motion.span>
            <h3 className="text-2xl font-black text-yellow-900 mb-1" dir="rtl">أحسنت! ممتاز!</h3>
            <p className="text-yellow-800 mb-5 text-sm" dir="rtl">ربطت كل الحيوانات بشكل صحيح 🐾</p>
            <button
              onClick={nextRound}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg transition active:scale-95"
              dir="rtl"
            >
              جولة جديدة 🔄
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
