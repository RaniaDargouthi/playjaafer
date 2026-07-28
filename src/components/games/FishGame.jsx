import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FishGame({ onCorrect, onIncorrect }) {
  const [targetLetter, setTargetLetter] = useState('');
  const [fishList, setFishList] = useState([]);
  const [bubbleList, setBubbleList] = useState([]);

  // Generate random Arabic letters
  const ARABIC_LETTERS = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];
  const getRandomLetter = () => ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];

  const generateRound = () => {
    const target = getRandomLetter();
    setTargetLetter(target);

    // Create 5 fish with unique letters
    const letters = new Set([target]);
    while (letters.size < 5) {
      letters.add(getRandomLetter());
    }

    const fishArray = Array.from(letters).map((letter, index) => {
      // Swimming from left to right only
      const isLeft = false;
      return {
        id: index,
        letter,
        color: FISH_COLORS[index % FISH_COLORS.length],
        // Speed
        duration: 8 + Math.random() * 6,
        // Start position
        y: 5 + index * 10 + Math.random() * 5, // Distributed vertically
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
        <div className="inline-flex items-center justify-center bg-indigo-600 text-white font-arabic text-5xl w-20 h-20 rounded-full shadow-lg border-4 border-indigo-200 animate-bounce">
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
                initial={{ left: fish.isLeft ? "115%" : "-25%" }}
                animate={{
                  left: fish.isLeft ? "-25%" : "115%",
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
                    width="110"
                    height="75"
                    viewBox="0 0 110 75"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-transform duration-300 drop-shadow-xl"
                    style={{ transform: fish.isLeft ? "scaleX(-1)" : "scaleX(1)" }}
                  >
                    {/* Back Fin */}
                    <path
                      d="M30 35 C30 15, 60 5, 70 30 Z"
                      fill={fish.color.tail}
                    />
                    {/* Tail fin */}
                    <path
                      d="M25 38 C5 15, 0 20, 5 38 C0 55, 5 60, 25 38 Z"
                      fill={fish.color.tail}
                    />
                    {/* Body */}
                    <path
                      d="M20 38 C40 10, 95 10, 100 38 C95 65, 40 65, 20 38 Z"
                      fill={fish.color.body}
                    />
                    {/* Eye */}
                    <circle cx="80" cy="30" r="7" fill="white" />
                    <circle cx="82" cy="30" r="3" fill="#1e293b" />
                    {/* Catchlight */}
                    <circle cx="83" cy="29" r="1.5" fill="white" />
                    {/* Smile */}
                    <path
                      d="M80 45 Q85 50 90 45"
                      stroke="#1e293b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Side Fin */}
                    <path
                      d="M45 45 C40 60, 55 60, 50 45 Z"
                      fill={fish.color.tail}
                    />
                    {/* Scales */}
                    <path d="M40 30 Q45 35 40 40" stroke="white" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M50 25 Q55 30 50 35" stroke="white" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M50 40 Q55 45 50 50" stroke="white" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </svg>
                  {/* Letter on the fish */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center font-arabic text-2xl font-bold text-slate-800 pointer-events-none select-none`}
                    style={{
                      // Shift text to match new body center
                      paddingLeft: fish.isLeft ? "0px" : "15px",
                      paddingRight: fish.isLeft ? "15px" : "0px",
                      paddingBottom: "5px",
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
