import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const WORDS = [
  { word: "CHAT", emoji: "🐱", hints: "Un petit animal de compagnie" },
  { word: "LION", emoji: "🦁", hints: "Le roi de la savane" },
  { word: "POMME", emoji: "🍎", hints: "Un fruit rouge ou vert" },
  { word: "BANANE", emoji: "🍌", hints: "Le fruit préféré des singes" },
  { word: "LAPIN", emoji: "🐰", hints: "Il adore les carottes !" },
  { word: "SOLEIL", emoji: "☀️", hints: "Il brille dans le ciel" },
];

export default function WordBuilderGame({ onCorrect, onIncorrect }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedLetters, setTypedLetters] = useState([]);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  
  const currentWordData = WORDS[currentWordIndex];
  const currentWord = currentWordData.word;

  const initRound = (index) => {
    setTypedLetters([]);
    // Split word letters and add 1-2 random letters to make it more interesting if it's too short, or just shuffle
    const letters = currentWordData.word.split('');
    
    // Create objects with unique IDs to allow duplicate letters in the word
    const letterObjects = letters.map((char, i) => ({
      id: `${char}-${i}`,
      char,
      used: false,
    }));

    // Shuffle letters
    setShuffledLetters(letterObjects.sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    initRound(currentWordIndex);
  }, [currentWordIndex]);

  const handleLetterClick = (letterObj) => {
    if (letterObj.used) return;

    // Check if clicked letter is correct for the next slot
    const nextExpectedIndex = typedLetters.length;
    const expectedChar = currentWord[nextExpectedIndex];

    if (letterObj.char === expectedChar) {
      // Mark as used
      setShuffledLetters(prev =>
        prev.map(item => (item.id === letterObj.id ? { ...item, used: true } : item))
      );
      
      const newTyped = [...typedLetters, letterObj.char];
      setTypedLetters(newTyped);
      onCorrect(); // Triggers playClick or micro-success

      // Check if word is complete
      if (newTyped.length === currentWord.length) {
        // Go to next word after delay
        setTimeout(() => {
          if (currentWordIndex < WORDS.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
          } else {
            // Loop back
            setCurrentWordIndex(0);
          }
        }, 1000);
      }
    } else {
      // Trigger incorrect animation (shake or buzz)
      onIncorrect();
    }
  };

  const handleBackspace = () => {
    if (typedLetters.length === 0) return;
    
    // Find the last added character that we can remove
    const lastChar = typedLetters[typedLetters.length - 1];
    
    // Find that character in shuffledLetters that is currently 'used' and set it back to unused
    let restored = false;
    setShuffledLetters(prev =>
      prev.map(item => {
        if (!restored && item.char === lastChar && item.used) {
          restored = true;
          return { ...item, used: false };
        }
        return item;
      })
    );

    setTypedLetters(prev => prev.slice(0, -1));
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="font-display text-2xl md:text-3xl text-indigo-900 mb-1">
          Construis le mot !
        </h3>
        <p className="text-slate-500 text-sm md:text-base">
          Remets les lettres dans le bon ordre pour former le mot.
        </p>
      </div>

      {/* Main Game Card */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-white/60 rounded-3xl border-4 border-dashed border-purple-200 mb-4">
        {/* Emoji Display */}
        <motion.div
          className="text-8xl md:text-9xl mb-4 animate-float select-none"
          key={currentWord}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
        >
          {currentWordData.emoji}
        </motion.div>

        {/* Word hint */}
        <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full mb-6 max-w-[280px] text-center font-medium">
          💡 {currentWordData.hints}
        </div>

        {/* Answer Slots */}
        <div className="flex gap-2 justify-center mb-4 flex-wrap">
          {currentWord.split('').map((_, index) => {
            const hasLetter = typedLetters[index] !== undefined;
            return (
              <motion.div
                key={index}
                className={`w-12 h-14 md:w-14 md:h-16 rounded-xl border-b-4 flex items-center justify-center font-display text-2xl font-bold transition-all ${
                  hasLetter
                    ? "bg-purple-600 text-white border-purple-800"
                    : "bg-white text-slate-300 border-slate-300"
                }`}
                animate={{ scale: hasLetter ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.2 }}
              >
                {typedLetters[index] || ""}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Letters Pool */}
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-4">
        {shuffledLetters.map((letterObj) => (
          <motion.button
            key={letterObj.id}
            onClick={() => handleLetterClick(letterObj)}
            disabled={letterObj.used}
            className={`w-12 h-12 md:w-14 md:h-14 font-display text-xl md:text-2xl font-bold rounded-xl shadow transition-all border-b-4 ${
              letterObj.used
                ? "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-50 translate-y-1 border-b-0 shadow-none"
                : "bg-white text-slate-700 border-slate-300 hover:bg-indigo-50 hover:border-indigo-400"
            }`}
            whileHover={!letterObj.used ? { scale: 1.08 } : {}}
            whileTap={!letterObj.used ? { scale: 0.95 } : {}}
          >
            {letterObj.char}
          </motion.button>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleBackspace}
          disabled={typedLetters.length === 0}
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md border-b-4 border-rose-700 active:translate-y-1 active:border-b-0 transition-all font-display text-sm md:text-base disabled:opacity-50 disabled:pointer-events-none"
        >
          Effacer la lettre ⌫
        </button>
      </div>
    </div>
  );
}
