import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const EMOJIS = ['🐶', '🐱', '🦁', '🐼', '🐷', '🐸'];

export default function MemoryGame({ onCorrect, onIncorrect, onComplete }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const initGame = () => {
    // Duplicate emojis to make pairs
    const pairEmojis = [...EMOJIS, ...EMOJIS];
    // Shuffle
    const shuffled = pairEmojis
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setDisabled(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (matched.length === EMOJIS.length && EMOJIS.length > 0) {
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  }, [matched]);

  const handleCardClick = (id) => {
    if (disabled || flipped.includes(id) || matched.includes(cards[id].emoji)) {
      return;
    }

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      const [firstId, secondId] = newFlipped;
      
      if (cards[firstId].emoji === cards[secondId].emoji) {
        // Match found!
        setMatched(prev => [...prev, cards[firstId].emoji]);
        setFlipped([]);
        setDisabled(false);
        onCorrect();
      } else {
        // No match
        onIncorrect();
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Game info */}
      <div className="text-center mb-4">
        <h3 className="font-display text-2xl md:text-3xl text-indigo-900 mb-1">
        لعبة الذاكرة        </h3>
        <p className="text-slate-500 text-sm md:text-base">
        اعثر على جميع أزواج الحيوانات المتطابقة!        </p>
      </div>

      {/* Grid */}
      <div className="flex-grow flex items-center justify-center">
        <div className="grid grid-cols-4 gap-3 md:gap-4 p-4 bg-white/40 rounded-3xl border-4 border-white/60 w-full max-w-[400px]">
          {cards.map((card, index) => {
            const isCardFlipped = flipped.includes(index) || matched.includes(card.emoji);
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(index)}
                className="aspect-square cursor-pointer relative perspective"
              >
                <motion.div
                  className="w-full h-full relative duration-500 preserve-3d"
                  animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Card Front (Face Down) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-md backface-hidden border-2 border-indigo-200">
                    ⭐
                  </div>

                  {/* Card Back (Emoji Face) */}
                  <div className="absolute inset-0 bg-white rounded-xl flex items-center justify-center text-4xl shadow-md backface-hidden rotate-y-180 border-2 border-indigo-100">
                    {card.emoji}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 3D Transform utilities injected just in case */}
      <style>{`
        .perspective {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
