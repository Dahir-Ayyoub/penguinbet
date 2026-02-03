
import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  TrendingUp, 
  Bomb, 
  Wallet, 
  History, 
  X,
  Plus,
  Layers,
  Disc,
  Zap,
  Snowflake,
  Trophy,
  Activity,
  Dice5,
  CircleDashed,
  Puzzle,
  ChevronDown,
  Search,
  Cpu,
  ArrowUpCircle,
  Hash,
  MoveUp
} from 'lucide-react';
import { GameType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  balance: number;
  setBalance: (val: number) => void;
  currentGame: GameType;
  setCurrentGame: (game: GameType) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  balance, 
  setBalance, 
  currentGame, 
  setCurrentGame 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBalance, setNewBalance] = useState(balance.toString());

  const allNavItems = useMemo(() => [
    { id: 'PLINKO' as GameType, name: 'Plinko', icon: LayoutGrid, color: 'text-pink-500', bg: 'bg-pink-500/10', category: 'Originals' },
    { id: 'CRASH' as GameType, name: 'Penguin Slide', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', category: 'Originals' },
    { id: 'SLOTS' as GameType, name: 'Icy Slots', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-400/10', category: 'Originals' },
    { id: 'LIMBO' as GameType, name: 'Arctic Limbo', icon: ArrowUpCircle, color: 'text-indigo-400', bg: 'bg-indigo-400/10', category: 'Originals' },
    { id: 'KENO' as GameType, name: 'Snow Keno', icon: Hash, color: 'text-teal-400', bg: 'bg-teal-400/10', category: 'Originals' },
    { id: 'MINES' as GameType, name: 'Ice Mines', icon: Bomb, color: 'text-orange-500', bg: 'bg-orange-500/10', category: 'Originals' },
    { id: 'DICE' as GameType, name: 'Snow Dice', icon: Dice5, color: 'text-red-500', bg: 'bg-red-500/10', category: 'Originals' },
    { id: 'ROULETTE' as GameType, name: 'Icy Roulette', icon: CircleDashed, color: 'text-cyan-500', bg: 'bg-cyan-500/10', category: 'Originals' },
    { id: 'WHEEL' as GameType, name: 'Arctic Wheel', icon: Disc, color: 'text-yellow-500', bg: 'bg-yellow-500/10', category: 'Originals' },
    
    { id: 'CROSSING' as GameType, name: 'Arctic Cross', icon: MoveUp, color: 'text-sky-400', bg: 'bg-sky-400/10', category: 'Skill' },
    { id: 'SHELLS' as GameType, name: 'Ball Guess', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10', category: 'Skill' },
    { id: 'TOWER' as GameType, name: 'Ice Tower', icon: Layers, color: 'text-purple-500', bg: 'bg-purple-500/10', category: 'Skill' },
    { id: 'PINGPONG' as GameType, name: 'Frost Volley', icon: Activity, color: 'text-teal-400', bg: 'bg-teal-400/10', category: 'Skill' },
    
    { id: 'SUDOKU' as GameType, name: 'Arctic Sudoku', icon: Puzzle, color: 'text-cyan-400', bg: 'bg-cyan-400/10', category: 'Strategy' },
    { id: 'CHESS' as GameType, name: 'Chess Duel', icon: Trophy, color: 'text-indigo-400', bg: 'bg-indigo-400/10', category: 'Strategy' },
  ], []);

  const categories = ['Originals', 'Skill', 'Strategy'];

  const handleUpdateBalance = () => {
    const val = parseFloat(newBalance);
    if (!isNaN(val)) {
      setBalance(val);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#050507] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-20 md:w-72 flex flex-col border-r border-white/5 bg-[#0d0d12] z-30">
        {/* Logo */}
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 relative overflow-hidden group flex-shrink-0">
             <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
             <Snowflake className="text-white w-7 h-7 animate-spin-slow" />
          </div>
          <div className="hidden md:block">
            <h2 className="font-black text-2xl tracking-tighter bg-gradient-to-r from-white via-blue-200 to-indigo-500 bg-clip-text text-transparent">
              PENGUINBET
            </h2>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Arctic Gaming</p>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 px-4 space-y-6 py-4 overflow-y-auto custom-scrollbar">
          {categories.map((cat) => (
            <div key={cat} className="space-y-1">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 mb-2 hidden md:block">
                {cat}
              </div>
              {allNavItems.filter(item => item.category === cat).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentGame(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${
                    currentGame === item.id 
                    ? 'bg-white/[0.03] text-white shadow-[0_0_20px_rgba(0,0,0,0.4)] border border-white/10' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 ${currentGame === item.id ? item.bg : 'bg-transparent'}`}>
                    <item.icon className={`w-5 h-5 ${currentGame === item.id ? item.color : 'group-hover:text-slate-400'}`} />
                  </div>
                  <span className="hidden md:block font-bold text-sm tracking-wide">{item.name}</span>
                  {currentGame === item.id && (
                    <div className="absolute left-0 w-1.5 h-6 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
          <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all group">
            <History className="w-5 h-5 group-hover:rotate-[-10deg] transition-transform" />
            <span className="hidden md:block font-bold text-sm tracking-wide">Public History</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-24 border-b border-white/5 bg-[#070709]/60 backdrop-blur-3xl z-20 flex items-center justify-between px-6 md:px-12">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 uppercase">
              <span className="opacity-40 font-normal">#</span>
              {allNavItems.find(i => i.id === currentGame)?.name}
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block">
               Arctic Server #042 | Online
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-4 bg-[#111116] hover:bg-[#1a1a24] border border-white/5 rounded-2xl px-5 py-3 cursor-pointer transition-all active:scale-95 group shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] duration-1000" />
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-600 uppercase leading-none tracking-tighter">Icy Credits</span>
                <span className="font-black text-xl text-white leading-tight mono">
                  ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-12 overflow-y-auto scroll-smooth">
          <div className="w-full max-w-[1400px] mx-auto min-h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Wallet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-all" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#0d0d12] border border-white/10 w-full max-w-lg rounded-[40px] p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-800" />
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all hover:rotate-90"
            >
              <X className="w-7 h-7" />
            </button>
            
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Snowfall Credits</h2>
              <p className="text-slate-500 font-medium">Add more funds to keep the penguin sliding.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-black text-blue-500 uppercase tracking-widest">Amount</label>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Unlimited Virtual Cash</span>
                </div>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-600">$</span>
                  <input 
                    type="number" 
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 rounded-3xl pl-12 pr-8 py-7 text-4xl font-black text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-zinc-800"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[500, 2500, 10000, 50000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setNewBalance((parseFloat(newBalance || "0") + amt).toString())}
                    className="py-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-black hover:bg-white/10 transition-all hover:-translate-y-1 text-slate-300"
                  >
                    +${amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleUpdateBalance}
                className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white text-lg font-black rounded-3xl shadow-2xl shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              >
                Set Credits
                <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
