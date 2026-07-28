import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// All 28 Arabic letters with their associated word and emoji
const ARABIC_ALPHABET = [
  { letter: 'أ', ttsLetter: 'أَلِف', word: 'أَرْنَب', meaning: 'Lapin', emoji: '🐰' },
  { letter: 'ب', ttsLetter: 'بَاء', word: 'بَقَرَة', meaning: 'Vache', emoji: '🐄' },
  { letter: 'ت', ttsLetter: 'تَاء', word: 'تُفَّاحَة', meaning: 'Pomme', emoji: '🍎' },
  { letter: 'ث', ttsLetter: 'ثَاء', word: 'ثَعْلَب', meaning: 'Renard', emoji: '🦊' },
  { letter: 'ج', ttsLetter: 'جِيم', word: 'جَمَل', meaning: 'Chameau', emoji: '🐫' },
  { letter: 'ح', ttsLetter: 'حَاء', word: 'حِصَان', meaning: 'Cheval', emoji: '🐴' },
  { letter: 'خ', ttsLetter: 'خَاء', word: 'خَرُوف', meaning: 'Mouton', emoji: '🐑' },
  { letter: 'د', ttsLetter: 'دَال', word: 'دُبّ', meaning: 'Ours', emoji: '🐻' },
  { letter: 'ذ', ttsLetter: 'ذَال', word: 'ذُرَة', meaning: 'Maïs', emoji: '🌽' },
  { letter: 'ر', ttsLetter: 'رَاء', word: 'رُمَّان', meaning: 'Grenade', emoji: '🍎' },
  { letter: 'ز', ttsLetter: 'زَاي', word: 'زَرَافَة', meaning: 'Girafe', emoji: '🦒' },
  { letter: 'س', ttsLetter: 'سِين', word: 'سَمَكَة', meaning: 'Poisson', emoji: '🐟' },
  { letter: 'ش', ttsLetter: 'شِين', word: 'شَمْس', meaning: 'Soleil', emoji: '☀️' },
  { letter: 'ص', ttsLetter: 'صَاد', word: 'صَقْر', meaning: 'Faucon', emoji: '🦅' },
  { letter: 'ض', ttsLetter: 'ضَاد', word: 'ضِفْدَع', meaning: 'Grenouille', emoji: '🐸' },
  { letter: 'ط', ttsLetter: 'طَاء', word: 'طَائِر', meaning: 'Oiseau', emoji: '🐦' },
  { letter: 'ظ', ttsLetter: 'ظَاء', word: 'ظَرْف', meaning: 'Enveloppe', emoji: '✉️' },
  { letter: 'ع', ttsLetter: 'عَيْن', word: 'عِنَب', meaning: 'Raisin', emoji: '🍇' },
  { letter: 'غ', ttsLetter: 'غَيْن', word: 'غَزَال', meaning: 'Gazelle', emoji: '🦌' },
  { letter: 'ف', ttsLetter: 'فَاء', word: 'فِيل', meaning: 'Éléphant', emoji: '🐘' },
  { letter: 'ق', ttsLetter: 'قَاف', word: 'قِطَّة', meaning: 'Chat', emoji: '🐱' },
  { letter: 'ك', ttsLetter: 'كَاف', word: 'كَلْب', meaning: 'Chien', emoji: '🐕' },
  { letter: 'ل', ttsLetter: 'لاَم', word: 'لَيْمُون', meaning: 'Citron', emoji: '🍋' },
  { letter: 'م', ttsLetter: 'مِيم', word: 'مَوْزَة', meaning: 'Banane', emoji: '🍌' },
  { letter: 'ن', ttsLetter: 'نُون', word: 'نَحْلَة', meaning: 'Abeille', emoji: '🐝' },
  { letter: 'ه', ttsLetter: 'هَاء', word: 'هِرَّة', meaning: 'Chatte', emoji: '🐈' },
  { letter: 'و', ttsLetter: 'وَاو', word: 'وَرْدَة', meaning: 'Rose', emoji: '🌹' },
  { letter: 'ي', ttsLetter: 'يَاء', word: 'يَدّ', meaning: 'Main', emoji: '✋' },
];

// Keyboard layout rows (matching the image)
const KEYBOARD_ROWS = [
  ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ'],
  ['د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص'],
  ['ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق'],
  ['ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'],
];

// Beautiful color palette for keyboard keys
const KEY_COLORS = [
  '#22C55E', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EC4899', '#06B6D4', '#EF4444', '#10B981',
  '#6366F1', '#F97316', '#14B8A6', '#A855F7',
  '#E11D48', '#0EA5E9', '#84CC16', '#D946EF',
  '#F43F5E', '#2DD4BF', '#818CF8', '#FB923C',
  '#34D399', '#C084FC', '#FB7185', '#38BDF8',
  '#A3E635', '#E879F9', '#FCD34D', '#67E8F9',
];

// Use SpeechSynthesis for Arabic letter pronunciation
// Keep a global reference to prevent garbage collection during playback
let currentUtterance = null;

function speakArabic(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'ar-SA';
    currentUtterance.rate = 0.75;
    currentUtterance.pitch = 1.1;
    currentUtterance.volume = 1;

    // Try to find a native Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) {
      currentUtterance.voice = arabicVoice;
    }

    window.speechSynthesis.speak(currentUtterance);
  }
}

export default function ArabicAlphabetGame({ onCorrect, onIncorrect }) {
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [learnedLetters, setLearnedLetters] = useState([]);
  const [showCard, setShowCard] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  // Get letter data by letter character
  const getLetterData = useCallback((letter) => {
    return ARABIC_ALPHABET.find(l => l.letter === letter);
  }, []);

  // Handle letter click from keyboard
  const handleLetterClick = (letter) => {
    const letterData = getLetterData(letter);
    if (!letterData) return;

    setSelectedLetter(letterData);
    setShowCard(true);

    // Speak the letter name and the word with a slight pause
    speakArabic(`${letterData.ttsLetter} ... ${letterData.word}`);

    // Add sparkles effect
    const newSparkles = Array.from({ length: 8 }).map((_, i) => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: i * 0.05,
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 1500);

    // Mark letter as learned
    if (!learnedLetters.includes(letter)) {
      setLearnedLetters(prev => [...prev, letter]);
      onCorrect();
    }

    // Auto-dismiss card after 15 seconds
    setTimeout(() => {
      setShowCard(false);
    }, 15000);
  };

  return (
    <div className="flex flex-col h-full select-none" dir="rtl">
      {/* Game Title */}
      <div className="text-center mb-3">
        <h3 className="font-display text-xl md:text-2xl text-indigo-900 mb-1 flex items-center justify-center gap-2">
          {/* ⌨️ لوحة الحروف العربية */}
          اختر الحرف الذي تحبّ أن تتعلَّمه:
        </h3>
        {/* <p className="text-slate-500 text-xs font-semibold">
          اضغط على الحرف لتتعلمه! ({learnedLetters.length}/{ARABIC_ALPHABET.length})
        </p> */}
        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto mt-2 h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(learnedLetters.length / ARABIC_ALPHABET.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Letter Card Display (shown when a letter is selected) */}
      <AnimatePresence>
        {showCard && selectedLetter && (
          <motion.div
            className="flex flex-col items-center justify-center p-4 mb-3 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg relative overflow-hidden w-full max-w-sm mx-auto"
            initial={{ scale: 0.7, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowCard(false)}
              className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {/* Sparkles */}
            {sparkles.map(s => (
              <motion.div
                key={s.id}
                className="absolute text-lg pointer-events-none"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 0.8, delay: s.delay }}
              >
                ✨
              </motion.div>
            ))}

            {/* Letter in yellow badge */}
            <motion.div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg border-4 border-white mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-3xl font-black text-white font-arabic drop-shadow-md">
                {selectedLetter.letter}
              </span>
            </motion.div>

            {/* Emoji */}
            <motion.span
              className="text-5xl mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
            >
              {selectedLetter.emoji}
            </motion.span>

            {/* Word */}
            <motion.p
              className="text-2xl font-bold text-slate-800 font-arabic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {selectedLetter.word}
            </motion.p>

            {/* French meaning */}
            <p className="text-xs text-slate-500 mt-0.5">{selectedLetter.meaning}</p>

            {/* Replay sound button */}
            <motion.button
              className="mt-2 px-3 py-1 bg-indigo-500 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-md hover:bg-indigo-600 transition"
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                speakArabic(`${selectedLetter.ttsLetter} ... ${selectedLetter.word}`);
              }}
            >
              🔊 اسمع مرة أخرى
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arabic Keyboard */}
      {!showCard && (
        <div className="flex-grow flex flex-col items-center justify-center gap-2 p-2 bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-inner">
        {/* <p className="text-sm font-bold text-indigo-700 mb-1">اختر الحرف الذي تحبّ أن تتعلَّمه:</p> */}
        
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1.5 md:gap-2 flex-wrap justify-center">
            {row.map((letter, colIndex) => {
              const colorIndex = rowIndex * 7 + colIndex;
              const isLearned = learnedLetters.includes(letter);
              const isSelected = selectedLetter?.letter === letter && showCard;

              return (
                <motion.button
                  key={letter}
                  className={`relative w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white font-bold font-arabic text-lg md:text-xl shadow-md transition-all ${
                    isSelected ? 'ring-4 ring-amber-400 ring-offset-2' : ''
                  }`}
                  style={{
                    background: isLearned
                      ? `linear-gradient(135deg, ${KEY_COLORS[colorIndex % KEY_COLORS.length]}, ${KEY_COLORS[(colorIndex + 5) % KEY_COLORS.length]})`
                      : `linear-gradient(135deg, ${KEY_COLORS[colorIndex % KEY_COLORS.length]}aa, ${KEY_COLORS[(colorIndex + 5) % KEY_COLORS.length]}aa)`,
                    borderBottom: '3px solid rgba(0,0,0,0.15)',
                  }}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.9, y: 1 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    delay: (rowIndex * 7 + colIndex) * 0.02,
                    stiffness: 300,
                  }}
                  onClick={() => handleLetterClick(letter)}
                >
                  {letter}
                  {/* Learned checkmark */}
                  {isLearned && (
                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center border border-white">
                      <span className="text-[7px] text-white font-bold">✓</span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
