import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ITEMS = [
  { emoji: "🍎", name: "pommes" },
  { emoji: "🍓", name: "fraises" },
  { emoji: "🎈", name: "ballons" },
  { emoji: "⭐", name: "étoiles" },
  { emoji: "🐱", name: "chatons" },
  { emoji: "🐞", name: "coccinelles" },
];

export default function CountGame({ onCorrect, onIncorrect }) {
  const [item, setItem] = useState(ITEMS[0]);
  const [count, setCount] = useState(0);
  const [options, setOptions] = useState([]);

  const generateRound = () => {
    // Pick random item type
    const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    setItem(randomItem);

    // Pick a number between 2 and 8
    const targetCount = 2 + Math.floor(Math.random() * 7);
    setCount(targetCount);

    // Generate 4 unique options including the correct one
    const opts = new Set([targetCount]);
    while (opts.size < 4) {
      // Pick random options between 1 and 10
      opts.add(1 + Math.floor(Math.random() * 9));
    }

    // Convert to sorted/shuffled array
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    generateRound();
  }, []);

  const handleOptionClick = (value) => {
    if (value === count) {
      onCorrect();
      generateRound();
    } else {
      onIncorrect();
    }
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl md:text-3xl text-indigo-900 mb-1">
          Combien y a-t-il de {item.name} ?
        </h3>
        <p className="text-slate-500 font-sans text-sm md:text-base">
          Compte bien les objets ci-dessous et clique sur le bon chiffre !
        </p>
      </div>

      {/* Grid of items */}
      <div className="flex-grow flex items-center justify-center p-6 bg-white/60 rounded-3xl border-4 border-dashed border-purple-200 mb-6 min-h-[220px]">
        <div className="grid grid-cols-4 gap-4 md:gap-6 justify-center items-center">
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={i}
              className="text-5xl md:text-6xl flex items-center justify-center select-none"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 15,
                delay: i * 0.05,
              }}
              whileHover={{ scale: 1.15, rotate: 10 }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt) => (
          <motion.button
            key={opt}
            onClick={() => handleOptionClick(opt)}
            className="py-4 font-display text-3xl font-bold bg-white text-purple-600 border-b-4 border-purple-300 rounded-2xl shadow-md hover:bg-purple-50 active:translate-y-1 active:border-b-0 hover:border-purple-400 transition-all focus:outline-none"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
