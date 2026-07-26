import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animals with their accepted foods and a "wrong" food
const ANIMALS = [
  {
    id: "lapin",
    emoji: "🐰",
    name: "le Lapin",
    bg: "from-rose-100 to-pink-200",
    foods: [
      { emoji: "🥕", name: "Carotte", correct: true },
      { emoji: "🥬", name: "Salade", correct: true },
    ],
    wrongFoods: [
      { emoji: "🍗", name: "Poulet", correct: false },
      { emoji: "🍕", name: "Pizza", correct: false },
    ],
  },
  {
    id: "chat",
    emoji: "🐱",
    name: "le Chat",
    bg: "from-amber-100 to-yellow-200",
    foods: [
      { emoji: "🐟", name: "Poisson", correct: true },
      { emoji: "🥛", name: "Lait", correct: true },
    ],
    wrongFoods: [
      { emoji: "🥕", name: "Carotte", correct: false },
      { emoji: "🍇", name: "Raisins", correct: false },
    ],
  },
  {
    id: "chien",
    emoji: "🐶",
    name: "le Chien",
    bg: "from-orange-100 to-amber-200",
    foods: [
      { emoji: "🦴", name: "Os", correct: true },
      { emoji: "🥩", name: "Viande", correct: true },
    ],
    wrongFoods: [
      { emoji: "🍫", name: "Chocolat", correct: false },
      { emoji: "🧅", name: "Oignon", correct: false },
    ],
  },
  {
    id: "perroquet",
    emoji: "🦜",
    name: "le Perroquet",
    bg: "from-emerald-100 to-teal-200",
    foods: [
      { emoji: "🌽", name: "Maïs", correct: true },
      { emoji: "🍓", name: "Fraise", correct: true },
    ],
    wrongFoods: [
      { emoji: "🍗", name: "Poulet", correct: false },
      { emoji: "🧀", name: "Fromage", correct: false },
    ],
  },
  {
    id: "vache",
    emoji: "🐄",
    name: "la Vache",
    bg: "from-sky-100 to-blue-200",
    foods: [
      { emoji: "🌿", name: "Herbe", correct: true },
      { emoji: "🍀", name: "Trèfle", correct: true },
    ],
    wrongFoods: [
      { emoji: "🍗", name: "Poulet", correct: false },
      { emoji: "🍕", name: "Pizza", correct: false },
    ],
  },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateRound() {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  // Pick 1 correct food
  const correct = animal.foods[Math.floor(Math.random() * animal.foods.length)];
  // Pick 2 wrong foods from all wrong foods, mixed with other animals
  const allWrong = ANIMALS.filter(a => a.id !== animal.id)
    .flatMap(a => a.foods)
    .concat(animal.wrongFoods);
  const wrongs = shuffle(allWrong).slice(0, 3);
  const options = shuffle([correct, ...wrongs]);
  return { animal, correct, options };
}

export default function FeedAnimalGame({ onCorrect, onIncorrect }) {
  const [round, setRound] = useState(() => generateRound());
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [feedbackFood, setFeedbackFood] = useState(null);
  const [dragging, setDragging] = useState(null); // id of food being dragged
  const [dropping, setDropping] = useState(false); // animation on mouth
  const animalRef = useRef(null);

  const nextRound = () => {
    setTimeout(() => {
      setRound(generateRound());
      setFeedback(null);
      setFeedbackFood(null);
    }, 900);
  };

  const handleFoodClick = (food) => {
    if (feedback) return; // ignore clicks during feedback
    if (food.correct) {
      setFeedback('correct');
      setFeedbackFood(food);
      setDropping(true);
      setTimeout(() => setDropping(false), 600);
      onCorrect();
      nextRound();
    } else {
      setFeedback('wrong');
      setFeedbackFood(food);
      onIncorrect();
      setTimeout(() => {
        setFeedback(null);
        setFeedbackFood(null);
      }, 800);
    }
  };

  const { animal, correct, options } = round;

  return (
    <div className="flex flex-col h-full select-none">
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="font-display text-2xl md:text-3xl text-indigo-900 mb-1">
        أطعم الحيوان !        </h3>
        <p className="text-slate-500 text-sm md:text-base">
        انقر على الطعام الذي يتناوله <strong className="text-indigo-600">{animal.name}</strong> !
        </p>
      </div>

      {/* Arena */}
      <div className={`flex-grow flex flex-col items-center justify-around p-4 rounded-3xl bg-gradient-to-b ${animal.bg} border-4 border-white/60 shadow-inner relative overflow-hidden`}>

        {/* Decorative ground */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-emerald-400/40 rounded-b-2xl pointer-events-none" />
        <div className="absolute bottom-10 inset-x-0 h-4 bg-emerald-500/20 pointer-events-none" />

        {/* Animal display */}
        <div className="flex flex-col items-center" ref={animalRef}>
          <motion.div
            className="text-8xl md:text-9xl relative"
            animate={dropping ? { y: [0, -15, 0], rotate: [0, 8, -5, 0] } : { y: [0, -6, 0] }}
            transition={dropping
              ? { duration: 0.5, ease: "easeOut" }
              : { repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            {animal.emoji}

            {/* Correct food flies into mouth */}
            <AnimatePresence>
              {feedback === 'correct' && feedbackFood && (
                <motion.div
                  className="absolute text-4xl"
                  style={{ top: "40%", left: "50%" }}
                  initial={{ scale: 1.5, x: 0, y: -100, opacity: 1 }}
                  animate={{ scale: 0.4, x: -10, y: 20, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeIn" }}
                >
                  {feedbackFood.emoji}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Feedback bubble */}
          <AnimatePresence>
            {feedback === 'correct' && (
              <motion.div
                className="mt-2 bg-emerald-500 text-white font-display font-bold px-4 py-1.5 rounded-full text-sm shadow-md"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                😋 Miam miam ! Bravo !
              </motion.div>
            )}
            {feedback === 'wrong' && (
              <motion.div
                className="mt-2 bg-rose-500 text-white font-display font-bold px-4 py-1.5 rounded-full text-sm shadow-md"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, x: [0, -8, 8, -8, 8, 0] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                😖 Je ne mange pas ça !
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Food options */}
        <div className="grid grid-cols-2 gap-4 md:gap-5 w-full max-w-xs md:max-w-sm mt-2">
          {options.map((food, i) => (
            <motion.button
              key={`${food.emoji}-${i}`}
              onClick={() => handleFoodClick(food)}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-b-4 shadow-md font-display font-semibold text-sm transition-all focus:outline-none ${
                feedback === 'correct' && food.emoji === feedbackFood?.emoji
                  ? 'bg-emerald-400 border-emerald-600 text-white scale-95'
                  : feedback === 'wrong' && food.emoji === feedbackFood?.emoji
                  ? 'bg-rose-400 border-rose-600 text-white animate-shake'
                  : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-indigo-300 hover:scale-105'
              }`}
              whileHover={!feedback ? { scale: 1.06, y: -3 } : {}}
              whileTap={!feedback ? { scale: 0.93 } : {}}
              disabled={!!feedback}
            >
              <span className="text-4xl md:text-5xl">{food.emoji}</span>
              <span className="text-xs text-center leading-tight">{food.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
