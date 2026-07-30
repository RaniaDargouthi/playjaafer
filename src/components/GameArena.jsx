import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Star, Trophy, Clock } from 'lucide-react';
import { playClick, playSuccess, playFailure, playVictory } from '../utils/audio';

import FishGame from './games/FishGame';
import CountGame from './games/CountGame';
import MemoryGame from './games/MemoryGame';
import WordBuilderGame from './games/WordBuilderGame';
import ButterflyGame from './games/ButterflyGame';
import FeedAnimalGame from './games/FeedAnimalGame';
import ArabicWordGame from './games/ArabicWordGame';
import PuzzleGame from './games/PuzzleGame';
import CatchLetterGame from './games/CatchLetterGame';
import MatchAnimalGame from './games/MatchAnimalGame';
import FindMissingPieceGame from './games/FindMissingPieceGame';
import ArabicAlphabetGame from './games/ArabicAlphabetGame';

// Custom Confetti Component using Framer Motion
function ConfettiEffect() {
  const particles = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100, // percentage width
    y: -20 - Math.random() * 50,
    size: 6 + Math.random() * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotate: Math.random() * 360,
    duration: 2.5 + Math.random() * 2,
    delay: Math.random() * 0.5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: `${p.y}vh`, rotate: p.rotate, opacity: 1 }}
          animate={{
            y: "110vh",
            rotate: p.rotate + 360 * 2,
            x: [null, `${p.x + (Math.random() * 20 - 10)}%`],
          }}
          transition={{
            duration: p.duration,
            ease: "easeOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

const CONFETTI_COLORS = [
  "#FF6B6B", "#4DABF7", "#FFD43B", "#51CF66", "#BE4BDB", "#FF922B", "#20C997", "#FCC419"
];

export default function GameArena({ gameId, gameTitle, gameColor, onClose, onAddGlobalStars }) {
  const initialTime = gameId === 2 ? 240 : 45; // 240s for ArabicAlphabetGame, 45s for others
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [gameState, setGameState] = useState('playing'); // playing, paused, won, lost
  const [isMuted, setIsMuted] = useState(false);

  const timerRef = useRef(null);

  // Start timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameState('lost');
            playFailure();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft]);

  // Handle answers
  const handleCorrect = () => {
    if (gameState !== 'playing') return;
    playSuccess();
    setScore(prev => {
      const newScore = prev + 10;
      // Increment stars every 30 points
      if (newScore > 0 && newScore % 30 === 0) {
        setStars(s => s + 1);
      }
      // For ArabicAlphabetGame (gameId 2), no win screen — game continues until time runs out
      if (newScore >= 60 && gameId !== 2) {
        handleWin();
      }
      return newScore;
    });
  };

  const handleIncorrect = () => {
    if (gameState !== 'playing') return;
    playFailure();
    // Deduct 2 seconds as penalty
    setTimeLeft(prev => Math.max(0, prev - 2));
    setScore(prev => Math.max(0, prev - 5));
  };

  const handleMemoryComplete = () => {
    handleWin();
  };

  const handleWin = () => {
    setGameState('won');
    playVictory();
    // Award 3 stars for winning
    const finalStars = Math.max(1, stars + 2);
    setStars(finalStars);
    onAddGlobalStars(finalStars);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetGame = () => {
    playClick();
    setScore(0);
    setStars(0);
    setTimeLeft(initialTime);
    setGameState('playing');
  };

  const togglePause = () => {
    playClick();
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  // Render the appropriate game based on gameId
  const renderGameContent = () => {
    switch (gameId) {
      case 1: // Attraper les papillons
        return <ButterflyGame onCorrect={handleCorrect} onIncorrect={handleIncorrect} />;
      case 2: // لوحة الحروف العربية
           return <ArabicAlphabetGame onCorrect={handleCorrect} onIncorrect={handleIncorrect} />;
      case 3: // Trouver le poisson
        return <FishGame onCorrect={handleCorrect} onIncorrect={handleIncorrect} />;
      case 4: // صيد الحروف العربية
        return <CatchLetterGame onCorrect={handleCorrect} onIncorrect={handleIncorrect} />;
      case 5: // Jeu de mots arabes
        return <ArabicWordGame onCorrect={handleCorrect} onIncorrect={handleIncorrect} />;
      case 6: // Mémoire
        return (
          <MemoryGame
            onCorrect={handleCorrect}
            onIncorrect={handleIncorrect}
            onComplete={handleMemoryComplete}
          />
        );
     
      
      case 7: // أربط بما يناسب
        return <MatchAnimalGame onCorrect={handleCorrect} onIncorrect={handleIncorrect} />;
      
    
        case 8: // Construire un mot
        return <WordBuilderGame onCorrect={handleCorrect} onIncorrect={handleIncorrect} />;
     
        case 9: // Compter les objets
        return <CountGame onCorrect={handleCorrect} onIncorrect={handleIncorrect} />;
      case 10: // Puzzle
        return <PuzzleGame onCorrect={handleCorrect} onIncorrect={handleIncorrect} />;
      
        case 11: // أبحث عن القطعة الناقصة
        return <FindMissingPieceGame onCorrect={handleCorrect} onIncorrect={handleIncorrect} />;
        case 12: // Nourrir le bon animal
        return < FeedAnimalGame onCorrect={handleCorrect} onIncorrect={handleIncorrect} />;
     
     
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
          هذه اللعبة قيد التطوير حاليًا. تابعونا قريبًا!
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Confetti overlay on win */}
        {gameState === 'won' && <ConfettiEffect />}

        {/* Game Area Header */}
        <div className={`p-4 text-white flex items-center justify-between ${gameColor}`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { playClick(); onClose(); }}
              className="p-1.5 bg-white/20 hover:bg-white/30 active:scale-95 rounded-full transition"
            >
              <X size={20} />
            </button>
            <span className="font-display text-xl font-bold tracking-wide">{gameTitle}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Score */}
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <Trophy size={16} />
              <span>{score}</span>
            </div>

            {/* Stars */}
            <div className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
              <Star size={16} fill="currentColor" />
              <span>{stars}</span>
            </div>

            {/* Timer */}
            <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm ${
              timeLeft <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/20'
            }`}>
              <Clock size={16} />
              <span>{timeLeft}s</span>
            </div>

            {/* Pause Button */}
            <button
              onClick={togglePause}
              className="p-1.5 bg-white/20 hover:bg-white/30 active:scale-95 rounded-full transition"
            >
              {gameState === 'playing' ? <Pause size={18} /> : <Play size={18} />}
            </button>
          </div>
        </div>

        {/* Inner container for the actual game screen */}
        <div className="p-6 overflow-y-auto flex-grow bg-slate-50 relative min-h-[400px]">
          {/* PAUSE OVERLAY */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white">
              <motion.h4
                className="font-display text-4xl font-bold mb-6"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                الجزء متوقف مؤقتًا          
    </motion.h4>
              <div className="flex gap-4">
                <button
                  onClick={togglePause}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-display font-semibold rounded-2xl shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2 active:translate-y-0.5 transition"
                >
                  <Play size={18} /> تابع
                </button>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-display font-semibold rounded-2xl shadow-lg hover:shadow-amber-500/30 flex items-center gap-2 active:translate-y-0.5 transition"
                >
                  <RotateCcw size={18} /> ابدأ من جديد
                </button>
              </div>
            </div>
          )}

          {/* GAME OVER (LOST) OVERLAY */}
          {gameState === 'lost' && (
            <div className="absolute inset-0 bg-rose-900/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white p-6 text-center">
              <motion.div
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <span className="text-7xl mb-4 block">⏰</span>
              </motion.div>
              <h4 className="font-display text-3xl font-bold mb-2">انتهى الوقت !</h4>
              <p className="text-rose-200 mb-6 max-w-sm">
                                       </p>
              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-white text-rose-700 font-display font-bold rounded-2xl shadow-lg flex items-center gap-2 active:translate-y-0.5 transition hover:bg-rose-50"
                >
                  <RotateCcw size={18} /> حاول ثانية
                </button>
                <button
                  onClick={() => { playClick(); onClose(); }}
                  className="px-6 py-3 bg-rose-800 text-white font-display font-bold rounded-2xl hover:bg-rose-900 flex items-center gap-2 active:translate-y-0.5 transition border border-rose-700"
                >
                  مغادرة
                </button>
              </div>
            </div>
          )}

          {/* GAME WON OVERLAY — hidden for ArabicAlphabetGame (gameId 2) */}
          {gameState === 'won' && gameId !== 2 && (
            <div className="absolute inset-0 bg-emerald-900/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white p-6 text-center">
              <motion.div
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 10 }}
              >
                <span className="text-8xl mb-4 block">🏆</span>
              </motion.div>
              <h4 className="font-display text-4xl font-bold mb-2 text-amber-300">تهانينا !</h4>
              <p className="text-emerald-100 mb-6 text-lg">
                Tu as gagné avec un score de <strong className="text-white text-xl">{score} points</strong> et récupéré <strong className="text-amber-300 text-xl font-display">{stars} ⭐</strong> !
              </p>

              {/* Star displays */}
              <div className="flex gap-4 mb-8 justify-center">
                {Array.from({ length: Math.min(3, stars) }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.15 + 0.3, type: "spring" }}
                    className="text-amber-400"
                  >
                    <Star size={44} fill="currentColor" />
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-white text-emerald-700 font-display font-bold rounded-2xl shadow-lg flex items-center gap-2 active:translate-y-0.5 transition hover:bg-emerald-50"
                >
                  <RotateCcw size={18} /> إعادة اللعب
                </button>
                <button
                  onClick={() => { playClick(); onClose(); }}
                  className="px-6 py-3 bg-emerald-800 text-white font-display font-bold rounded-2xl hover:bg-emerald-900 flex items-center gap-2 active:translate-y-0.5 transition border border-emerald-700"
                >
                  مغادرة
                </button>
              </div>
            </div>
          )}

          {/* Active game screen */}
          {renderGameContent()}
        </div>
      </motion.div>
    </div>
  );
}
