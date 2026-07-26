import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FishGame({ onCorrect, onIncorrect }) {
  const [targetLetter, setTargetLetter] = useState('');
  const [fishList, setFishList] = useState([]);
  const [bubbleList, setBubbleList] = useState([]);

  // Generate random uppercase letters
  const getRandomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));

  const generateRound = () => {
    const target = getRandomLetter();
    setTargetLetter(target);

    // Create 5 fish with unique letters
    const letters = new Set([target]);
    while (letters.size < 5) {
      letters.add(getRandomLetter());
    }

    const fishArray = Array.from(letters).map((letter, index) => {
      // Random starting positions and swimming directions
      const isLeft = Math.random() > 0.5;
      return {
        id: index,
        letter,
        color: FISH_COLORS[index % FISH_COLORS.length],
        // Speed
        duration: 8 + Math.random() * 6,
        // Start position
        y: 15 + index * 15 + Math.random() * 8, // Distributed vertically
        isLeft,
      };
    });

    // Shuffle fish
    setFishList(fishArray.sort(() => Math.random() - 0.5));
  };

  // Generate continuous rising background bubbles
  useEffect(() => {
    generateRound();
    const interval = setInterval(() => {
      setBubbleList(prev => [
        ...prev.slice(-15), // Keep max 15 bubbles
        {
          id: Math.random(),
          x: Math.random() * 90 + 5,
          size: 10 + Math.random() * 15,
          delay: Math.random() * 2,
        }
      ]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleFishClick = (clickedLetter) => {
    if (clickedLetter === targetLetter) {
      onCorrect();
      generateRound();
    } else {
      onIncorrect();
    }
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Target prompt */}
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl md:text-3xl text-indigo-900 mb-1">
        ابحث عن السمكة التي تحمل الحرف:        </h3>
        <div className="inline-flex items-center justify-center bg-indigo-600 text-white font-display text-5xl w-20 h-20 rounded-full shadow-lg border-4 border-indigo-200 animate-bounce">
          {targetLetter}
        </div>
      </div>

      {/* Water tank arena */}
      <div className="relative flex-grow min-h-[300px] md:min-h-[380px] bg-gradient-to-b from-sky-400 to-blue-600 rounded-3xl overflow-hidden shadow-inner border-4 border-white/50">
        {/* Coral decorations at the bottom */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-amber-800 to-amber-600/70 rounded-b-2xl pointer-events-none flex justify-around items-end px-4 z-10">
          <div className="w-8 h-12 bg-emerald-600/80 rounded-t-full transform -rotate-12 origin-bottom"></div>
          <div className="w-10 h-16 bg-teal-600/80 rounded-t-full transform rotate-6 origin-bottom"></div>
          <div className="w-6 h-10 bg-emerald-500/80 rounded-t-full transform -rotate-6 origin-bottom"></div>
          <div className="w-12 h-14 bg-teal-500/80 rounded-t-full transform rotate-12 origin-bottom"></div>
        </div>

        {/* Rising Bubbles */}
        <AnimatePresence>
          {bubbleList.map(bubble => (
            <motion.div
              key={bubble.id}
              className="absolute bg-white/25 border border-white/40 rounded-full pointer-events-none"
              style={{
                left: `${bubble.x}%`,
                width: bubble.size,
                height: bubble.size,
                bottom: -20,
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: -450,
                opacity: [0, 0.7, 0.7, 0],
                x: [0, 15, -15, 0],
              }}
              transition={{
                duration: 6,
                ease: "easeOut",
                delay: bubble.delay,
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </AnimatePresence>

        {/* Swimming Fish */}
        <div className="absolute inset-0 overflow-hidden">
          {fishList.map((fish) => {
            const direction = fish.isLeft ? -1 : 1;
            return (
              <motion.div
                key={`${fish.id}-${fish.letter}`}
                className="absolute cursor-pointer p-2 origin-center"
                style={{ top: `${fish.y}%` }}
                initial={{ x: fish.isLeft ? "105%" : "-25%" }}
                animate={{
                  x: fish.isLeft ? "-25%" : "105%",
                }}
                transition={{
                  duration: fish.duration,
                  repeat: Infinity,
                  ease: "linear",
                }}
                onClick={() => handleFishClick(fish.letter)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* SVG Fish representation */}
                <div className="relative group filter drop-shadow-md">
                  <svg
                    width="95"
                    height="65"
                    viewBox="0 0 100 70"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-transform duration-300"
                    style={{ transform: fish.isLeft ? "scaleX(-1)" : "scaleX(1)" }}
                  >
                    {/* Tail fin */}
                    <path
                      d="M15 35 C5 20, 0 15, 5 35 C0 55, 5 50, 15 35 Z"
                      fill={fish.color.tail}
                    />
                    {/* Body */}
                    <path
                      d="M15 35 C35 15, 80 15, 85 35 C80 55, 35 55, 15 35 Z"
                      fill={fish.color.body}
                    />
                    {/* Eye */}
                    <circle cx="75" cy="30" r="5" fill="white" />
                    <circle cx="76" cy="30" r="2.5" fill="black" />
                    {/* Fin */}
                    <path
                      d="M45 42 C40 50, 42 53, 47 48 Z"
                      fill={fish.color.tail}
                    />
                  </svg>
                  {/* Letter on the fish */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center font-display text-2xl font-bold text-slate-800 pointer-events-none select-none`}
                    style={{
                      // Shift text to match body center
                      paddingLeft: fish.isLeft ? "0px" : "15px",
                      paddingRight: fish.isLeft ? "15px" : "0px",
                    }}
                  >
                    {fish.letter}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const FISH_COLORS = [
  { body: "#FF6B6B", tail: "#FF8E8E" }, // Red
  { body: "#4DABF7", tail: "#74C0FC" }, // Blue
  { body: "#FFD43B", tail: "#FFE066" }, // Yellow
  { body: "#51CF66", tail: "#69DB7C" }, // Green
  { body: "#FCC419", tail: "#FFD43B" }, // Orange
  { body: "#BE4BDB", tail: "#D0BFFF" }, // Purple
];
