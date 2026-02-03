
import React, { useState, useCallback, useMemo } from 'react';
import { Hash, Zap, Trophy, History, RefreshCcw, Info, Star, Snowflake } from 'lucide-react';

interface KenoProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

const TOTAL_NUMBERS = 40;
const DRAW_COUNT = 10;
const MAX_SELECTIONS = 10;

// Classic Keno Paytable (Simplified 10-pick version)
const PAYTABLES: Record<number, Record<number, number>> = {
  1: { 1: 3.8 },
  2: { 1: 1.1, 2: 5.2 },
  3: { 2: 2.8, 3: 13.8 },
  4: { 2: 1.5, 3: 5.5, 4: 25.8 },
  5: { 3: 2.8, 4: 12.5, 5: 60 },
  6: { 3: 1.5, 4: 4.5, 5: 25, 6: 150 },
  7: { 4: 3.5, 5: 12, 6: 80, 7: 400 },
  8: { 4: 2, 5: 6, 6: 40, 7: 200, 8: 1000 },
  9: { 5: 4.5, 6: 20, 7: 100, 8: 500, 9: 2500 },
  10: { 5: 2.5, 6: 10, 7: 50, 8: 250, 9: 1500, 10: 10000 },
};

const Keno: React.FC<KenoProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [shake, setShake] = useState(false);

  const toggleNumber = (num: number) => {
    if (isDrawing) return;
    setSelectedNumbers(prev => {
      if (prev.includes(num)) return prev.filter(n => n !== num);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, num].sort((a, b) => a - b);
    });
    setDrawnNumbers([]);
    setLastWin(0);
  };

  const clearSelection = () => {
    if (isDrawing) return;
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setLastWin(0);
  };

  const autoPick = () => {
    if (isDrawing) return;
    const nums: number[] = [];
    while (nums.length < MAX_SELECTIONS) {
      const r = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
      if (!nums.includes(r)) nums.push(r);
    }
    setSelectedNumbers(nums.sort((a, b) => a - b));
    setDrawnNumbers([]);
    setLastWin(0);
  };

  const play = async () => {
    if (balance < betAmount) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (selectedNumbers.length === 0 || isDrawing) return;

    setIsDrawing(true);
    onLoss(betAmount);
    setDrawnNumbers([]);
    setLastWin(0);

    // Generate 10 winning numbers
    const winners: number[] = [];
    while (winners.length < DRAW_COUNT) {
      const r = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
      if (!winners.includes(r)) winners.push(r);
    }

    // Visual drawing sequence
    for (let i = 0; i < winners.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setDrawnNumbers(prev => [...prev, winners[i]]);
    }

    const hits = selectedNumbers.filter(n => winners.includes(n)).length;
    const table = PAYTABLES[selectedNumbers.length];
    const multiplier = table[hits] || 0;

    if (multiplier > 0) {
      const winAmt = betAmount * multiplier;
      setLastWin(winAmt);
      onWin(winAmt);
    }
    
    setIsDrawing(false);
  };

  const hits = selectedNumbers.filter(n => drawnNumbers.includes(n)).length;
  const currentTable = PAYTABLES[selectedNumbers.length] || {};

  return (
    <div className={`flex flex-col lg:flex-row gap-8 w-full max-w-[1400px] mx-auto pb-32 transition-transform ${shake ? 'animate-shake' : ''}`}>
      
      {/* Sidebar Controls */}
      <div className="w-full lg:w-[380px] space-y-4">
        <div className="bg-[#1a1c22] rounded-2xl overflow-hidden border border-white/5 shadow-2xl p-6 space-y-6">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Keno Terminal</span>
            <Hash className="w-4 h-4 text-teal-400" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bet Amount</label>
            <div className="relative group">
              <input 
                type="number" value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                disabled={isDrawing}
                className="w-full bg-[#0f1115] border-2 border-white/5 rounded-xl px-4 py-4 text-xl font-black text-white focus:outline-none focus:border-teal-500/30 transition-all mono shadow-inner"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setBetAmount(betAmount / 2)} className="px-3 py-2 bg-[#2f323a] text-[10px] font-black rounded-lg hover:bg-white/5 transition-colors">1/2</button>
                <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-2 bg-[#2f323a] text-[10px] font-black rounded-lg hover:bg-white/5 transition-colors">2x</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={autoPick} disabled={isDrawing} className="py-3 bg-[#0f1115] border border-white/5 text-[10px] font-black text-slate-400 hover:text-white rounded-xl transition-all">Auto Pick</button>
            <button onClick={clearSelection} disabled={isDrawing} className="py-3 bg-[#0f1115] border border-white/5 text-[10px] font-black text-slate-400 hover:text-white rounded-xl transition-all">Clear</button>
          </div>

          <button 
            onClick={play}
            disabled={isDrawing || selectedNumbers.length === 0}
            className={`w-full py-6 bg-teal-600 hover:bg-teal-500 text-white font-black text-xl rounded-xl shadow-lg active:scale-95 transition-all uppercase italic tracking-tighter flex items-center justify-center gap-3 ${isDrawing || selectedNumbers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDrawing ? <RefreshCcw className="w-6 h-6 animate-spin" /> : 'Run Draw'}
          </button>
        </div>

        {/* Dynamic Paytable */}
        <div className="bg-[#1a1c22] rounded-2xl p-6 border border-white/5 space-y-4 shadow-xl">
           <div className="flex items-center gap-2 text-teal-400 border-b border-white/5 pb-3">
              <Star className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Potential Rewards</span>
           </div>
           <div className="space-y-1.5 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
              {Object.entries(currentTable).reverse().map(([hit, mult]) => (
                <div key={hit} className={`flex justify-between items-center p-2 rounded-lg transition-colors ${hits.toString() === hit && drawnNumbers.length === DRAW_COUNT ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'}`}>
                    <span className="text-[10px] font-black">{hit} Hits</span>
                    <span className="text-[10px] font-black mono">{mult}x</span>
                </div>
              ))}
              {selectedNumbers.length === 0 && <span className="text-[10px] text-slate-700 italic block text-center py-4">Select numbers to see payouts...</span>}
           </div>
        </div>
      </div>

      {/* Main Arena Grid */}
      <div className="flex-1 bg-[#0f1115] rounded-[40px] border border-white/5 p-4 md:p-8 flex flex-col items-center justify-center relative min-h-[850px] shadow-[inset_0_0_150px_rgba(0,0,0,1)] overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none" />
        
        <div className="grid grid-cols-5 md:grid-cols-8 gap-3 w-full max-w-4xl relative z-10">
          {Array.from({ length: TOTAL_NUMBERS }).map((_, i) => {
            const num = i + 1;
            const isSelected = selectedNumbers.includes(num);
            const isDrawn = drawnNumbers.includes(num);
            const isHit = isSelected && isDrawn;

            return (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                disabled={isDrawing}
                className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all duration-300 transform group relative overflow-hidden ${
                  isHit 
                    ? 'bg-emerald-500/40 border-emerald-400 scale-105 shadow-[0_0_25px_rgba(52,211,153,0.3)] z-10' 
                    : isDrawn 
                      ? 'bg-zinc-800 border-white/5 scale-95 opacity-40' 
                      : isSelected 
                        ? 'bg-teal-500/20 border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)]' 
                        : 'bg-white/5 border-white/5 hover:border-teal-500/50 hover:bg-white/[0.08]'
                }`}
              >
                <span className={`text-xl md:text-2xl font-black mono ${isHit ? 'text-white' : isSelected ? 'text-teal-400' : 'text-slate-600'}`}>
                  {num}
                </span>
                {isHit && (
                  <Snowflake className="absolute top-1 right-1 w-3 h-3 text-emerald-300 opacity-40 animate-spin-slow" />
                )}
              </button>
            );
          })}
        </div>

        {/* Status Overlay */}
        {drawnNumbers.length === DRAW_COUNT && !isDrawing && (
           <div className="mt-12 text-center animate-in zoom-in-75 duration-700">
              <h2 className={`text-6xl md:text-7xl font-black text-white italic tracking-tighter uppercase drop-shadow-2xl ${lastWin > 0 ? 'text-emerald-400' : 'opacity-40 text-slate-500'}`}>
                {lastWin > 0 ? `YOU HIT ${hits} NUMBERS!` : 'ARCTIC MISS'}
              </h2>
              {lastWin > 0 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                    <Zap className="w-8 h-8 text-emerald-400 fill-current" />
                    <p className="text-5xl md:text-7xl font-black text-white mono">
                        +${lastWin.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <Zap className="w-8 h-8 text-emerald-400 fill-current" />
                </div>
              )}
           </div>
        )}

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/5 pointer-events-none">
            <Hash className="w-8 h-8" />
            <span className="text-3xl font-black uppercase tracking-[0.5em] italic">Frozen Lotto Engine</span>
            <Hash className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default Keno;
