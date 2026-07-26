import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Sparkles, Volume2, VolumeX, Flame, Heart, BookOpen, GraduationCap, ChevronRight, Lock } from 'lucide-react';
import GameArena from './components/GameArena';
import { playClick } from './utils/audio';

const GAME_CARDS = [
  {
    id: 1,
    number: "1",
    title: "Attraper les papillons",
    desc: "Attrape les papillons qui volent pour gagner des points.",
    emoji: "🦋",
    bg: "from-teal-400 to-emerald-500",
    border: "border-emerald-200",
    text: "text-emerald-700",
    playable: true,
    preview: (
      <div className="flex justify-around items-center h-20 bg-emerald-50/50 rounded-xl relative overflow-hidden">
        <span className="text-3xl animate-bounce duration-1000">🦋</span>
        <span className="text-xl opacity-60 absolute top-2 right-4">Score: 15</span>
        <div className="absolute bottom-2 left-4 w-8 h-8 rounded-full border border-emerald-400 border-dashed flex items-center justify-center text-xs text-emerald-600 bg-white">🕸️</div>
      </div>
    )
  },
  {
    id: 2,
    number: "2",
    title: "Placer la guitare",
    desc: "Fais glisser la guitare et place-la dans la bonne pièce.",
    emoji: "🎸",
    bg: "from-orange-400 to-amber-500",
    border: "border-amber-200",
    text: "text-amber-700",
    playable: false,
    preview: (
      <div className="grid grid-cols-2 gap-1 h-20 bg-amber-50/50 p-1.5 rounded-xl text-[10px] text-amber-800">
        <div className="border border-amber-300 border-dashed rounded flex items-center justify-center bg-white">Cuisine</div>
        <div className="border border-amber-300 border-dashed rounded flex items-center justify-center bg-amber-100/50">🎸 Chambre</div>
      </div>
    )
  },
  {
    id: 3,
    number: "3",
    title: "Trouver le poisson",
    desc: "Clique sur le poisson qui contient la lettre demandée.",
    emoji: "🐠",
    bg: "from-sky-400 to-blue-500",
    border: "border-sky-200",
    text: "text-sky-700",
    playable: true,
    preview: (
      <div className="flex justify-around items-center h-20 bg-sky-50/70 rounded-xl relative overflow-hidden">
        <div className="bg-sky-200/60 px-2 py-0.5 rounded text-[10px] text-sky-800 font-bold absolute top-1">Lettre : B</div>
        <span className="text-xl">🐠<sub className="font-bold text-xs text-sky-950">A</sub></span>
        <span className="text-2xl animate-pulse">🐟<sub className="font-bold text-xs text-sky-950">B</sub></span>
        <span className="text-xl">🐡<sub className="font-bold text-xs text-sky-950">C</sub></span>
      </div>
    )
  },
    {
    id: 22,
    number: "22",
    title: "Attraper les lettres",
    desc: "Clique sur les lettres qui tombent pour gagner des points.",
    emoji: "🔤",
    bg: "from-fuchsia-400 to-pink-600",
    border: "border-pink-200",
    text: "text-pink-700",
    playable: true,
    preview: (
      <div className="flex justify-around items-center h-20 bg-pink-50/50 rounded-xl">
        <span className="text-3xl">🔤</span>
        <span className="text-sm opacity-60">Lettre : أ</span>
      </div>
    )
  },
  {
    id: 23,
    number: "23",
    title: "أَرْبِطُ بِمَا يُنَاسِبُ",
    desc: "اربط كل حيوان بصورته المناسبة عن طريق الخطوط.",
    emoji: "🐢",
    bg: "from-violet-500 to-purple-700",
    border: "border-violet-200",
    text: "text-violet-700",
    playable: true,
    preview: (
      <div className="flex justify-between items-center h-20 bg-violet-50/60 rounded-xl px-3 relative">
        <div className="flex flex-col gap-1.5 items-start">
          <span className="text-xl">🐢</span>
          <span className="text-xl">🐄</span>
          <span className="text-xl">🐦</span>
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex:1}}>
          <line x1="48" y1="20" x2="90" y2="55" stroke="#7c3aed" strokeWidth="2" strokeDasharray="4 2"/>
          <line x1="48" y1="42" x2="90" y2="28" stroke="#d97706" strokeWidth="2" strokeDasharray="4 2"/>
        </svg>
        <div className="flex flex-col gap-1.5 items-end">
          <span className="text-xl">🐦</span>
          <span className="text-xl">🐢</span>
          <span className="text-xl">🐄</span>
        </div>
      </div>
    )
  },
  {
    id: 24,
    number: "24",
    title: "أبحث عن القطعة الناقصة",
    desc: "اختر القطعة الصحيحة لإكمال صورة الحيوان.",
    emoji: "🧩",
    bg: "from-yellow-400 to-amber-500",
    border: "border-yellow-200",
    text: "text-yellow-700",
    playable: true,
    preview: (
      <div className="flex justify-around items-center h-20 bg-yellow-50/70 rounded-xl px-2 gap-2">
        <div className="relative">
          <span className="text-4xl">🐭</span>
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white border-2 border-dashed border-yellow-500 flex items-center justify-center text-[9px] font-black text-yellow-600">?</div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {['🟤','⚫','🟡','🔴'].map((c,i) => (
            <div key={i} className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-[9px]">{c}</div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 4,
    number: "4",
    title: "Attraper l'oiseau",
    desc: "Attrape uniquement l'oiseau demandé.",
    emoji: "🐦",
    bg: "from-teal-400 to-emerald-500",
    border: "border-emerald-200",
    text: "text-emerald-700",
    playable: false,
    preview: (
      <div className="flex justify-around items-center h-20 bg-emerald-50/50 rounded-xl relative">
        <span className="text-2xl">🐦</span>
        <span className="text-xl opacity-40">🐤</span>
        <span className="text-2xl">🐧</span>
      </div>
    )
  },
  {
    id: 5,
    number: "5",
    title: "Ramasser les fleurs",
    desc: "Ramasse toutes les fleurs qui contiennent la lettre A.",
    emoji: "🌸",
    bg: "from-teal-400 to-emerald-500",
    border: "border-emerald-200",
    text: "text-emerald-700",
    playable: false,
    preview: (
      <div className="flex justify-center gap-1 items-end h-20 bg-emerald-50/50 p-1.5 rounded-xl">
        <div className="bg-white border rounded px-1 text-center text-xs">🌸<br/>A</div>
        <div className="bg-white border rounded px-1 text-center text-xs opacity-50">🌸<br/>B</div>
        <div className="bg-white border rounded px-1 text-center text-xs">🌸<br/>A</div>
      </div>
    )
  },
  {
    id: 6,
    number: "6",
    title: "Nourrir le bon animal",
    desc: "Clique sur la nourriture que mange l'animal affiché !",
    emoji: "🥕",
    bg: "from-orange-400 to-amber-500",
    border: "border-amber-200",
    text: "text-amber-700",
    playable: true,
    preview: (
      <div className="flex flex-col items-center justify-center h-20 bg-amber-50/50 rounded-xl gap-1">
        <span className="text-3xl">🐰</span>
        <div className="flex gap-1.5 text-xl">
          <span>🥕</span><span>🍗</span><span>🍕</span><span>🥬</span>
        </div>
      </div>
    )
  },
  {
    id: 7,
    number: "7",
    title: "Trier les couleurs",
    desc: "Glisse chaque objet vers la boite de la bonne couleur.",
    emoji: "🎨",
    bg: "from-sky-400 to-blue-500",
    border: "border-sky-200",
    text: "text-sky-700",
    playable: false,
    preview: (
      <div className="flex justify-around items-center h-20 bg-sky-50/50 rounded-xl">
        <div className="w-6 h-8 bg-red-500 rounded flex items-center justify-center text-[10px] text-white">🔴</div>
        <div className="w-6 h-8 bg-blue-500 rounded flex items-center justify-center text-[10px] text-white">🔵</div>
        <span className="text-xl">🍎</span>
      </div>
    )
  },
  {
    id: 8,
    number: "8",
    title: "Associer les formes",
    desc: "Glisse chaque forme vers sa silhouette.",
    emoji: "🔺",
    bg: "from-indigo-400 to-purple-500",
    border: "border-purple-200",
    text: "text-purple-700",
    playable: false,
    preview: (
      <div className="flex justify-around items-center h-20 bg-purple-50/50 rounded-xl">
        <span className="text-2xl text-blue-500">🔴</span>
        <span className="text-2xl text-slate-300">⚫</span>
        <span className="text-2xl text-red-500">🔺</span>
      </div>
    )
  },
  {
    id: 9,
    number: "9",
    title: "Compter les objets",
    desc: "Compte les objets et choisis la bonne réponse.",
    emoji: "🔢",
    bg: "from-teal-400 to-emerald-500",
    border: "border-emerald-200",
    text: "text-emerald-700",
    playable: true,
    preview: (
      <div className="flex flex-col items-center justify-center h-20 bg-emerald-50/70 rounded-xl">
        <div className="flex gap-1 mb-1">
          <span className="text-xl">🍎</span>
          <span className="text-xl">🍎</span>
        </div>
        <div className="flex gap-1 text-[10px] font-bold">
          <span className="bg-white border px-1.5 py-0.5 rounded">1</span>
          <span className="bg-emerald-200 border border-emerald-300 px-1.5 py-0.5 rounded">2</span>
          <span className="bg-white border px-1.5 py-0.5 rounded">3</span>
        </div>
      </div>
    )
  },
  {
    id: 10,
    number: "10",
    title: "Puzzle",
    desc: "Remets les morceaux à leur place pour compléter l'image.",
    emoji: "🧩",
    bg: "from-orange-400 to-amber-500",
    border: "border-amber-200",
    text: "text-amber-700",
    playable: true,
    preview: (
      <div className="relative w-[66px] h-[66px] mx-auto rounded-lg overflow-hidden border border-amber-300 shadow-sm">
        <div 
          className="w-full h-full bg-cover bg-center" 
          style={{ backgroundImage: "url('/images/puzzle-lion.jpg')" }}
        />
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/40" />
          ))}
        </div>
      </div>
    )
  },
  {
    id: 11,
    number: "11",
    title: "Mémoire (Memory)",
    desc: "Retourne les cartes et trouve toutes les paires.",
    emoji: "🃏",
    bg: "from-indigo-400 to-purple-500",
    border: "border-purple-200",
    text: "text-purple-700",
    playable: true,
    preview: (
      <div className="grid grid-cols-3 gap-1 p-2 bg-purple-50/70 rounded-xl max-w-[100px] mx-auto">
        <div className="bg-purple-600 text-white rounded text-[10px] text-center">⭐</div>
        <div className="bg-white rounded text-[10px] text-center">🦁</div>
        <div className="bg-purple-600 text-white rounded text-[10px] text-center">⭐</div>
        <div className="bg-white rounded text-[10px] text-center">🦁</div>
        <div className="bg-purple-600 text-white rounded text-[10px] text-center">⭐</div>
        <div className="bg-purple-600 text-white rounded text-[10px] text-center">⭐</div>
      </div>
    )
  },
  {
    id: 12,
    number: "12",
    title: "Relier l'image au mot",
    desc: "Relie chaque image au mot correspondant.",
    emoji: "🔗",
    bg: "from-indigo-400 to-purple-500",
    border: "border-purple-200",
    text: "text-purple-700",
    playable: false,
    preview: (
      <div className="flex justify-between items-center h-20 bg-purple-50/50 p-2 rounded-xl text-[10px]">
        <div className="flex flex-col gap-1 items-start">
          <span>🍎</span>
          <span>🚗</span>
        </div>
        <div className="h-8 border-r border-dashed border-purple-400"></div>
        <div className="flex flex-col gap-1 items-end font-semibold">
          <span>Auto</span>
          <span>Pomme</span>
        </div>
      </div>
    )
  },
  {
    id: 13,
    number: "13",
    title: "Éclater les bulles",
    desc: "Éclate uniquement les bulles qui contiennent la lettre A.",
    emoji: "🫧",
    bg: "from-sky-400 to-blue-500",
    border: "border-sky-200",
    text: "text-sky-700",
    playable: false,
    preview: (
      <div className="flex justify-around items-center h-20 bg-sky-50/50 rounded-xl relative overflow-hidden">
        <div className="w-6 h-6 rounded-full border border-sky-400 flex items-center justify-center text-[10px] bg-white/40">A</div>
        <div className="w-8 h-8 rounded-full border border-sky-400 flex items-center justify-center text-[10px] bg-white/40 animate-pulse">B</div>
        <div className="w-5 h-5 rounded-full border border-sky-400 flex items-center justify-center text-[10px] bg-white/40">A</div>
      </div>
    )
  },
  {
    id: 14,
    number: "14",
    title: "Labyrinthe",
    desc: "Aide le personnage à trouver le chemin jusqu'à la sortie.",
    emoji: "🌀",
    bg: "from-orange-400 to-amber-500",
    border: "border-amber-200",
    text: "text-amber-700",
    playable: false,
    preview: (
      <div className="flex items-center justify-center h-20 bg-amber-50/50 rounded-xl relative">
        <span className="absolute left-2 text-sm">🐰</span>
        <div className="w-12 h-8 border-2 border-amber-300 rounded border-dashed flex items-center justify-center text-[8px]">🐾</div>
        <span className="absolute right-2 text-sm">🥕</span>
      </div>
    )
  },
  {
    id: 15,
    number: "15",
    title: "Course des lettres",
    desc: "Récupère les lettres dans l'ordre et évite les obstacles.",
    emoji: "🏃",
    bg: "from-sky-400 to-blue-500",
    border: "border-sky-200",
    text: "text-sky-700",
    playable: false,
    preview: (
      <div className="flex justify-between items-center h-20 bg-sky-50/50 p-2 rounded-xl relative overflow-hidden">
        <span className="text-xl">🏃</span>
        <span className="bg-sky-400 text-white rounded-full px-1 text-[8px] font-bold">A</span>
        <span className="text-red-500 text-xs">⚙️</span>
      </div>
    )
  },
  {
    id: 16,
    number: "16",
    title: "Ranger la chambre",
    desc: "Remets chaque objet à sa place.",
    emoji: "🧸",
    bg: "from-indigo-400 to-purple-500",
    border: "border-purple-200",
    text: "text-purple-700",
    playable: false,
    preview: (
      <div className="flex justify-around items-end h-20 bg-purple-50/50 p-2 rounded-xl relative">
        <span className="text-lg">🛏️</span>
        <span className="text-lg animate-bounce">🧸</span>
        <span className="text-lg">🚪</span>
      </div>
    )
  },
  {
    id: 17,
    number: "17",
    title: "Attraper les chiffres",
    desc: "Attrape uniquement le chiffre demandé.",
    emoji: "🎈",
    bg: "from-teal-400 to-emerald-500",
    border: "border-emerald-200",
    text: "text-emerald-700",
    playable: false,
    preview: (
      <div className="flex justify-around items-center h-20 bg-emerald-50/50 rounded-xl">
        <span className="text-lg">🎈<sub className="font-bold text-[8px]">2</sub></span>
        <span className="text-xl">🎈<sub className="font-bold text-[8px]">8</sub></span>
        <span className="text-lg">🎈<sub className="font-bold text-[8px]">5</sub></span>
      </div>
    )
  },
  {
    id: 18,
    number: "18",
    title: "Écouter et choisir",
    desc: "Écoute le mot et choisis l'image correspondante.",
    emoji: "🔊",
    bg: "from-orange-400 to-amber-500",
    border: "border-amber-200",
    text: "text-amber-700",
    playable: false,
    preview: (
      <div className="flex flex-col items-center justify-center h-20 bg-amber-50/50 rounded-xl p-1">
        <div className="bg-amber-400 text-white rounded px-2 text-[9px] mb-1 flex items-center gap-0.5">🔊 Banane</div>
        <div className="flex gap-1 text-xs">
          <span>🍌</span>
          <span>🍎</span>
          <span>🍓</span>
        </div>
      </div>
    )
  },
  {
    id: 19,
    number: "19",
    title: "Construire un mot",
    desc: "Remets les lettres dans le bon ordre pour former le mot.",
    emoji: "🐱",
    bg: "from-sky-400 to-blue-500",
    border: "border-sky-200",
    text: "text-sky-700",
    playable: true,
    preview: (
      <div className="flex flex-col items-center justify-center h-20 bg-sky-50/70 rounded-xl">
        <span className="text-2xl mb-1">🐱</span>
        <div className="flex gap-0.5 text-[8px] font-bold">
          <span className="bg-slate-200 px-1 py-0.5 rounded">C</span>
          <span className="bg-slate-200 px-1 py-0.5 rounded">H</span>
          <span className="bg-slate-200 px-1 py-0.5 rounded">A</span>
          <span className="bg-slate-200 px-1 py-0.5 rounded">T</span>
        </div>
      </div>
    )
  },
  {
    id: 20,
    number: "20",
    title: "Jeu des saisons",
    desc: "Glisse chaque image vers la bonne saison.",
    emoji: "🍂",
    bg: "from-indigo-400 to-purple-500",
    border: "border-purple-200",
    text: "text-purple-700",
    playable: false,
    preview: (
      <div className="flex justify-around items-center h-20 bg-purple-50/50 p-1 rounded-xl text-[9px] text-purple-900">
        <div className="flex flex-col items-center">☀️<span className="scale-75">Été</span></div>
        <div className="flex flex-col items-center">⛄<span className="scale-75">Hiver</span></div>
        <div className="flex flex-col items-center">🍁<span className="scale-75">Automne</span></div>
      </div>
    )
  },
  {
    id: 21,
    number: "21",
    title: "كلمات عربية",
    desc: "اكتب حروف الكلمة في المربعات لتكوين الكلمة الصحيحة!",
    emoji: "🔤",
    bg: "from-violet-500 to-fuchsia-600",
    border: "border-fuchsia-200",
    text: "text-fuchsia-700",
    playable: true,
    preview: (
      <div className="flex flex-col items-center justify-center h-20 bg-fuchsia-50/70 rounded-xl gap-1.5" dir="rtl">
        <span className="text-2xl">🦁</span>
        <div className="flex gap-1 justify-center" dir="rtl">
          {['أ', 'س', 'د'].map((l, i) => (
            <span key={i} className="w-5 h-6 rounded border border-violet-300 bg-white flex items-center justify-center text-[10px] font-bold text-violet-750">
              {l}
            </span>
          ))}
        </div>
        <p className="text-[9px] text-fuchsia-700">اكتب الكلمات</p>
      </div>
    )
  },
  {
    id: 25,
    number: "25",
    title: "لوحة الحروف العربية",
    desc: "اضغط على الحرف لسماعه ورؤية صورته ثم اختبر نفسك!",
    emoji: "⌨️",
    bg: "from-cyan-400 to-blue-600",
    border: "border-cyan-200",
    text: "text-cyan-700",
    playable: true,
    preview: (
      <div className="flex flex-col items-center justify-center h-20 bg-cyan-50/70 rounded-xl gap-1" dir="rtl">
        <div className="flex gap-0.5 justify-center">
          {['أ', 'ب', 'ت', 'ث'].map((l, i) => (
            <span key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center text-[8px] font-bold shadow-sm">
              {l}
            </span>
          ))}
        </div>
        <div className="flex gap-0.5 justify-center">
          {['ج', 'ح', 'خ', 'د'].map((l, i) => (
            <span key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-[8px] font-bold shadow-sm">
              {l}
            </span>
          ))}
        </div>
        <p className="text-[8px] text-cyan-700 font-bold">🐰 أرنب ← أ</p>
      </div>
    )
  }
];

export default function App() {
  const [totalStars, setTotalStars] = useState(() => {
    const saved = localStorage.getItem('playjaafer_stars');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [activeGame, setActiveGame] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    localStorage.setItem('playjaafer_stars', totalStars.toString());
  }, [totalStars]);

  const handleAddStars = (count) => {
    setTotalStars(prev => prev + count);
  };

  const handlePlayGame = (game) => {
    playClick();
    setActiveGame(game);
  };

  const resetAllProgress = () => {
    if (confirm("Veux-tu vraiment réinitialiser toutes tes étoiles à zéro ?")) {
      playClick();
      setTotalStars(0);
    }
  };

  return (
    <div className="min-h-screen pb-16 flex flex-col font-sans">
      {/* Upper Navigation Bar */}
      <header className="glass sticky top-0 z-40 border-b border-purple-100 shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl hover:rotate-12 transition-transform duration-300 pointer-events-none select-none">🎮</span>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent m-0 py-0 tracking-tight">
                jeux Quizz
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide m-0">Apprendre en s'amusant !</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Stars Counter */}
            <motion.div 
              className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-4 py-1.5 rounded-2xl shadow-md border-b-4 border-amber-600 flex items-center gap-1.5 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star size={20} fill="currentColor" className="animate-spin-slow" />
              <span className="text-lg font-display">{totalStars}</span>
            </motion.div>

            {/* Mute button */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 rounded-xl transition shadow-sm border border-slate-200"
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="max-w-6xl w-full mx-auto px-4 mt-6 flex-grow flex flex-col">
        {/* Banner Welcome Message / Mascot */}
        <motion.div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-3xl text-white shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <span className="text-6xl animate-float block select-none">🧙‍♂️</span>
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-1">
                Bonjour petit aventurier !
              </h2>
              <p className="text-indigo-50 text-sm md:text-base max-w-xl font-medium">
                Choisis un des jeux ci-dessous pour t'entraîner, battre le chronomètre et gagner plein d'étoiles scintillantes ! 🌟
              </p>
            </div>
          </div>
          <button
            onClick={resetAllProgress}
            className="text-xs bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-full px-4 py-2 hover:shadow transition"
          >
            Réinitialiser
          </button>
        </motion.div>

        {/* Section Title */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-slate-800 tracking-wide">
              21 Idées de Jeux Éducatifs
            </h2>
            <p className="text-slate-500 text-sm font-medium">Cliques sur un jeu disponible pour commencer l'aventure !</p>
          </div>
          <div className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Sparkles size={14} />
            <span>5 Nouveaux Jeux</span>
          </div>
        </div>

        {/* 20 Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {GAME_CARDS.map((game, index) => (
            <motion.div
              key={game.id}
              className={`bg-white border rounded-3xl p-5 shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${
                game.playable ? 'cursor-pointer hover:-translate-y-1.5' : 'opacity-75 cursor-default'
              } ${game.playable ? `hover:border-purple-300 border-slate-100` : `border-slate-100`}`}
              onClick={() => game.playable && handlePlayGame(game)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, type: "spring", stiffness: 100 }}
            >
              {/* Number Badge */}
              <div className={`absolute top-0 left-0 w-8 h-8 rounded-br-2xl flex items-center justify-center font-display text-white font-bold text-sm bg-gradient-to-br ${game.bg}`}>
                {game.number}
              </div>

              {/* Locked overlay */}
              {!game.playable && (
                <div className="absolute top-2 right-2 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 border border-slate-200">
                  <Lock size={8} /> Bientôt
                </div>
              )}

              {/* Playable badge */}
              {game.playable && (
                <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 border border-emerald-200 animate-pulse">
                  ✨ Jouer
                </div>
              )}

              {/* Title & Emoji */}
              <div className="mt-4 mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl select-none" role="img" aria-label={game.title}>{game.emoji}</span>
                  <h3 className="font-display font-bold text-slate-800 text-base leading-tight group-hover:text-indigo-600 transition-colors">
                    {game.title}
                  </h3>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed min-h-[36px]">
                  {game.desc}
                </p>
              </div>

              {/* Preview Graphic Container */}
              <div className="my-3 pointer-events-none">
                {game.preview}
              </div>

              {/* Button status */}
              <div className="mt-3">
                {game.playable ? (
                  <button className={`w-full py-2 bg-gradient-to-r ${game.bg} text-white font-display text-xs font-bold rounded-xl shadow-md border-b-4 border-black/10 active:translate-y-0.5 active:border-b-0 transition-all text-center flex items-center justify-center gap-1 group-hover:scale-[1.02]`}>
                    <span>Jouer Maintenant</span>
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button disabled className="w-full py-2 bg-slate-100 text-slate-400 font-display text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1 border border-slate-200 opacity-60">
                    <span>Prochainement</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Common features lists footer */}
      <footer className="max-w-6xl mx-auto w-full px-4 mt-16 border-t border-slate-200 pt-8 text-center md:text-left text-slate-400">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-medium">
          <div>
            <h4 className="text-slate-600 font-display text-sm font-bold mb-2.5">Fonctionnalités Communes</h4>
            <ul className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
              <li className="flex items-center gap-1 justify-center md:justify-start">✅ Score et système d'étoiles</li>
              <li className="flex items-center gap-1 justify-center md:justify-start">✅ Niveaux progressifs</li>
              <li className="flex items-center gap-1 justify-center md:justify-start">✅ Sons (réussite / échec)</li>
              <li className="flex items-center gap-1 justify-center md:justify-start">✅ Chronomètre (temps limité)</li>
              <li className="flex items-center gap-1 justify-center md:justify-start">✅ Interface colorée et responsive</li>
              <li className="flex items-center gap-1 justify-center md:justify-start">✅ Adapté aux enfants</li>
            </ul>
          </div>
          <div className="flex flex-col justify-center items-center md:items-end">
            <h4 className="text-slate-600 font-display text-sm font-bold mb-2 text-center md:text-right">Technologies utilisées</h4>
            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold">React 19</span>
              <span className="bg-sky-50 border border-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Tailwind CSS v4</span>
              <span className="bg-purple-50 border border-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Framer Motion</span>
              <span className="bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Web Audio API</span>
            </div>
            <p className="mt-3 text-[10px] text-slate-400">Idéal pour créer des expériences éducatives interactives et amusantes ! 🚀</p>
          </div>
        </div>
      </footer>

      {/* Game arena overlays */}
      <AnimatePresence>
        {activeGame && (
          <GameArena
            gameId={activeGame.id}
            gameTitle={activeGame.title}
            gameColor={`bg-gradient-to-r ${activeGame.bg}`}
            onClose={() => setActiveGame(null)}
            onAddGlobalStars={handleAddStars}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
