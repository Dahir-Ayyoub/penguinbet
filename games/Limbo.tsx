
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpCircle, Zap, Target, History, RefreshCcw, Info } from 'lucide-react';

interface LimboProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

const Limbo: React.FC<LimboProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [targetMultiplier, setTargetMultiplier] = useState(2.00);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [winChance, setWinChance] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // 1% House edge calculation
    const chance = 99 / targetMultiplier;
    setWinChance(Math.min(99, Math.max(0.01, chance)));
  }, [targetMultiplier]);

  const play = () => {
    if (balance < betAmount) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    onLoss(betAmount);
    setResult(null);

    // Simulated "limbo" animation
    const duration = 800;
    const finalResult = 0.99 / (1 - Math.random());
    const roundedResult = Math.floor(finalResult * 100) / 100;

    setTimeout(() => {
      setResult(roundedResult);
      setIsSpinning(false);
      
      if (roundedResult >= targetMultiplier) {
        onWin(betAmount * targetMultiplier);
      }
      setHistory(prev => [roundedResult, ...prev].slice(0, 10));
    }, duration);
  };

  const won = result !== null && result >= targetMultiplier;

  return (
    <div className={`flex flex-col lg:flex-row gap-8 w-full max-w-[1400px] mx-auto pb-32 transition-transform ${shake ? 'animate-shake' : ''}`}>
      
      {/* Sidebar Controls */}
      <div className="w-full lg:w-[380px] space-y-4">
        <div className="bg-[#1a1c22] rounded-2xl overflow-hidden border border-white/5 shadow-2xl p-6 space-y-6">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stake Station</span>
            <ArrowUpCircle className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bet Amount</label>
            <div className="relative group">
              <input 
                type="number" value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                disabled={isSpinning}
                className="w-full bg-[#0f1115] border-2 border-white/5 rounded-xl px-4 py-4 text-xl font-black text-white focus:outline-none focus:border-indigo-500/30 transition-all mono shadow-inner"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setBetAmount(betAmount / 2)} className="px-3 py-2 bg-[#2f323a] text-[10px] font-black rounded-lg hover:bg-white/5">1/2</button>
                <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-2 bg-[#2f323a] text-[10px] font-black rounded-lg hover:bg-white/5">2x</button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Multiplier</label>
            <div className="relative group">
              <input 
                type="number" step="0.01" value={targetMultiplier}
                onChange={(e) => setTargetMultiplier(Math.max(1.01, Number(e.target.value)))}
                disabled={isSpinning}
                className="w-full bg-[#0f1115] border-2 border-white/5 rounded-xl px-4 py-4 text-xl font-black text-white focus:outline-none focus:border-indigo-500/30 transition-all mono shadow-inner"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-black">x</span>
            </div>
          </div>

          <div className="bg-[#0f1115] p-4 rounded-xl border border-white/5 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase">Win Chance</span>
              <span className="text-sm font-black text-white mono">{winChance.toFixed(2)}%</span>
            </div>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>

          <button 
            onClick={play}
            disabled={isSpinning}
            className={`w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-xl shadow-lg active:scale-95 transition-all uppercase italic tracking-tighter flex items-center justify-center gap-3 ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSpinning ? <RefreshCcw className="w-6 h-6 animate-spin" /> : 'Launch'}
          </button>
        </div>

        <div className="bg-[#1a1c22] rounded-2xl p-6 border border-white/5 space-y-4 shadow-xl">
           <div className="flex items-center gap-2 text-indigo-400 border-b border-white/5 pb-3">
              <History className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Recent Launches</span>
           </div>
           <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <div key={i} className={`px-3 py-1.5 rounded-lg text-[10px] font-black border ${h >= targetMultiplier ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {h.toFixed(2)}x
                </div>
              ))}
              {history.length === 0 && <span className="text-[10px] text-slate-700 italic">No data yet...</span>}
           </div>
        </div>
      </div>

      {/* Main Arena */}
      <div className="flex-1 bg-[#0f1115] rounded-[40px] border border-white/5 p-4 md:p-8 flex flex-col items-center justify-center relative min-h-[750px] shadow-[inset_0_0_150px_rgba(0,0,0,1)] overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        
        <div className="relative flex flex-col items-center">
          {/* Result Display */}
          <div className="relative mb-8">
            <div className={`text-[12rem] md:text-[18rem] font-black tracking-tighter mono leading-none transition-all duration-300 drop-shadow-2xl ${
              isSpinning ? 'blur-md scale-95 opacity-40' : 
              result !== null ? (won ? 'text-emerald-400' : 'text-red-500') : 'text-white/10'
            }`}>
              {result !== null ? result.toFixed(2) : '0.00'}<span className="text-4xl md:text-8xl opacity-30 font-normal">x</span>
            </div>
            
            {isSpinning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-8 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 mt-12 bg-[#1a1c22] border border-white/5 px-10 py-6 rounded-[32px] shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">
             <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target</span>
                <span className="text-3xl font-black text-white mono">{targetMultiplier.toFixed(2)}x</span>
             </div>
             <div className="w-px h-12 bg-white/5" />
             <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</span>
                <span className={`text-xl font-black uppercase tracking-widest ${result === null ? 'text-slate-600' : won ? 'text-emerald-400' : 'text-red-500'}`}>
                  {result === null ? 'Standby' : won ? 'WINNER' : 'BUSTED'}
                </span>
             </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/5 pointer-events-none">
            <ArrowUpCircle className="w-8 h-8" />
            <span className="text-3xl font-black uppercase tracking-[0.5em] italic">Vortex Limbo v1.0</span>
            <ArrowUpCircle className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default Limbo;
