
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Dice5, Zap, RefreshCw, Target, Activity, Info, Snowflake, Sparkles } from 'lucide-react';

interface DiceProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

interface DiceHistory {
  id: number;
  value: number;
  won: boolean;
}

const ArcticCube = ({ isRolling, result, won }: { isRolling: boolean, result: number | null, won: boolean | null }) => {
  return (
    <div className="relative w-48 h-48 perspective-1000 flex items-center justify-center mb-8">
      {/* Splash/Particle Effect on Landing */}
      {!isRolling && result !== null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-full h-full rounded-full animate-ping opacity-20 ${won ? 'bg-emerald-400' : 'bg-red-500'}`} />
          <Sparkles className={`w-24 h-24 animate-out fade-out zoom-out-150 duration-1000 ${won ? 'text-emerald-400' : 'text-red-400'}`} />
        </div>
      )}

      {/* 3D Cube Container */}
      <div className={`relative w-32 h-32 transition-transform duration-[800ms] preserve-3d ${isRolling ? 'animate-dice-roll' : 'rotate-x-12 rotate-y-12'}`}>
        {/* Front */}
        <div className={`absolute inset-0 frost-glass border-2 flex items-center justify-center text-4xl font-black rounded-2xl transform translate-z-16 ${won === true ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-emerald-400' : won === false ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)] text-red-400' : 'border-white/20 text-white/40'}`}>
          {result !== null ? Math.floor(result) : <Snowflake className="w-12 h-12 animate-spin-slow opacity-20" />}
        </div>
        {/* Back */}
        <div className="absolute inset-0 frost-glass border-2 border-white/10 rounded-2xl transform -translate-z-16 rotate-y-180 bg-white/5" />
        {/* Right */}
        <div className="absolute inset-0 frost-glass border-2 border-white/10 rounded-2xl transform rotate-y-90 translate-z-16 bg-white/5" />
        {/* Left */}
        <div className="absolute inset-0 frost-glass border-2 border-white/10 rounded-2xl transform -rotate-y-90 translate-z-16 bg-white/5" />
        {/* Top */}
        <div className="absolute inset-0 frost-glass border-2 border-white/10 rounded-2xl transform rotate-x-90 translate-z-16 bg-white/5" />
        {/* Bottom */}
        <div className="absolute inset-0 frost-glass border-2 border-white/10 rounded-2xl transform -rotate-x-90 translate-z-16 bg-white/5" />
      </div>

      {/* Shadow */}
      <div className={`absolute -bottom-4 w-24 h-4 bg-black/40 blur-xl rounded-full transition-transform duration-500 ${isRolling ? 'scale-150 opacity-20' : 'scale-100 opacity-60'}`} />
    </div>
  );
};

const Dice: React.FC<DiceProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [target, setTarget] = useState(50.50);
  const [isOver, setIsOver] = useState(true);
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<DiceHistory[]>([]);
  const [shake, setShake] = useState(false);

  // Casino Math: 1% House Edge
  const winChance = useMemo(() => {
    return isOver ? 100 - target : target;
  }, [target, isOver]);

  const multiplier = useMemo(() => {
    if (winChance <= 0) return "0.00";
    return (99 / winChance).toFixed(4);
  }, [winChance]);

  const won = useMemo(() => {
    if (result === null) return null;
    return isOver ? result > target : result < target;
  }, [result, isOver, target]);

  const handleRoll = () => {
    if (balance < betAmount) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (isRolling) return;
    
    setIsRolling(true);
    onLoss(betAmount);
    setResult(null);

    // Simulated "High Speed Roll"
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 10001) / 100;
      const roundWon = isOver ? roll > target : roll < target;
      
      setResult(roll);
      setIsRolling(false);
      
      if (roundWon) {
        onWin(betAmount * parseFloat(multiplier));
      }
      
      setHistory(prev => [{ id: Date.now(), value: roll, won: roundWon }, ...prev].slice(0, 10));
    }, 800);
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-6 w-full max-w-[1400px] mx-auto pb-32 transition-transform ${shake ? 'animate-shake' : ''}`}>
      
      {/* Sidebar Controls - Stake Inspired */}
      <div className="w-full lg:w-[380px] space-y-4">
        <div className="bg-[#1a1c22] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          <div className="p-6 space-y-6">
            
            {/* Bet Input */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                <span>Bet Amount</span>
                <span>${balance.toLocaleString()}</span>
              </div>
              <div className="relative group">
                <input 
                  type="number" value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#0f1115] border-2 border-white/5 rounded-xl px-4 py-4 text-xl font-black text-white focus:outline-none focus:border-red-500/30 transition-all mono shadow-inner"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button onClick={() => setBetAmount(Math.max(0, betAmount / 2))} className="px-3 py-2 bg-[#2f323a] hover:bg-[#3f434d] text-[10px] font-black text-slate-300 rounded-lg transition-colors">1/2</button>
                  <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-2 bg-[#2f323a] hover:bg-[#3f434d] text-[10px] font-black text-slate-300 rounded-lg transition-colors">2x</button>
                </div>
              </div>
            </div>

            {/* Profit Info Display */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0f1115] p-4 rounded-xl border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Multiplier</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white mono">{multiplier}x</span>
                  <Zap className="w-3 h-3 text-red-500" />
                </div>
              </div>
              <div className="bg-[#0f1115] p-4 rounded-xl border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Win Chance</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white mono">{winChance.toFixed(2)}%</span>
                  <Target className="w-3 h-3 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={handleRoll}
              disabled={isRolling}
              className={`w-full py-5 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white font-black text-lg rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-tighter ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRolling ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Dice5 className="w-5 h-5" />}
              Bet
            </button>
          </div>
        </div>

        {/* Board Stats */}
        <div className="bg-[#1a1c22] rounded-2xl p-6 border border-white/5 space-y-4 shadow-xl">
           <div className="flex items-center gap-2 text-red-400 border-b border-white/5 pb-3">
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Snow Dice Rules</span>
           </div>
           <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
             Select your target using the slider. Choose <span className="text-white font-bold">Roll Over</span> or <span className="text-white font-bold">Roll Under</span> to set your win condition. The multiplier adjusts based on the probability of your roll.
           </p>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="flex-1 bg-[#0f1115] rounded-3xl border border-white/5 p-4 md:p-8 flex flex-col items-center justify-center relative min-h-[750px] shadow-[inset_0_0_100px_rgba(0,0,0,1)] overflow-hidden">
        
        {/* History Trail (Top Strip) */}
        <div className="absolute top-8 left-8 right-8 flex gap-2 overflow-hidden pointer-events-none">
           {history.map((h) => (
             <div 
               key={h.id} 
               className={`px-4 py-2 rounded-lg text-[10px] font-black text-white text-center shadow-lg animate-in slide-in-from-top-10 duration-300 border ${h.won ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-400'}`}
             >
               {h.value.toFixed(2)}
             </div>
           ))}
        </div>

        {/* Animated Dice Component */}
        <ArcticCube isRolling={isRolling} result={result} won={won} />

        {/* Central Result Display */}
        <div className="relative mb-12 flex flex-col items-center">
            {isRolling ? (
                <div className="relative">
                    <div className="text-[12rem] md:text-[15rem] font-black tracking-tighter mono leading-none text-white/5 animate-pulse">
                        ??.??
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center animate-in zoom-in-75 duration-500">
                    <div className={`text-[12rem] md:text-[15rem] font-black tracking-tighter mono leading-none drop-shadow-2xl transition-all ${result !== null ? (won ? 'text-emerald-400 drop-shadow-[0_0_50px_rgba(52,211,153,0.3)]' : 'text-red-500 drop-shadow-[0_0_50px_rgba(239,68,68,0.3)]') : 'text-white/10'}`}>
                        {result !== null ? result.toFixed(2) : '00.00'}
                    </div>
                </div>
            )}
        </div>

        {/* Custom Slider System */}
        <div className="w-full max-w-3xl space-y-12 relative z-20">
            {/* Toggle Tabs */}
            <div className="flex bg-[#1a1c22] rounded-2xl p-1.5 border border-white/5 max-w-sm mx-auto shadow-2xl">
                <button 
                  onClick={() => setIsOver(false)} 
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all tracking-widest ${!isOver ? 'bg-[#2f323a] text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  ROLL UNDER
                </button>
                <button 
                  onClick={() => setIsOver(true)} 
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all tracking-widest ${isOver ? 'bg-[#2f323a] text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  ROLL OVER
                </button>
            </div>
            
            {/* The Professional Slider */}
            <div className="relative group px-4">
                {/* Background Track */}
                <div className="h-4 bg-[#0d0d12] rounded-full border border-white/5 overflow-hidden relative shadow-inner">
                    {/* Win/Loss Zones */}
                    <div 
                      className={`absolute h-full transition-all duration-300 ${isOver ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-red-500'}`} 
                      style={{ 
                        left: isOver ? `${target}%` : '0', 
                        width: isOver ? `${100 - target}%` : `${target}%` 
                      }} 
                    />
                    <div 
                      className={`absolute h-full transition-all duration-300 ${isOver ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`} 
                      style={{ 
                        left: isOver ? '0' : `${target}%`, 
                        width: isOver ? `${target}%` : `${100 - target}%` 
                      }} 
                    />
                </div>

                {/* Invisible Slider Input */}
                <input 
                    type="range" min="2" max="98" step="0.01" value={target}
                    onChange={(e) => setTarget(parseFloat(e.target.value))}
                    className="absolute top-0 left-4 right-4 h-4 opacity-0 cursor-pointer z-30"
                />

                {/* Draggable Handle */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-16 h-12 bg-white rounded-xl border-4 border-[#1a1c22] shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-grab active:cursor-grabbing transition-all hover:scale-110 z-40"
                  style={{ left: `calc(${target}% - 0px)`, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-[#0d0d12] leading-none">{target.toFixed(2)}</span>
                        <div className="flex gap-0.5 mt-0.5">
                            <div className="w-0.5 h-1.5 bg-slate-200 rounded-full" />
                            <div className="w-0.5 h-1.5 bg-slate-200 rounded-full" />
                            <div className="w-0.5 h-1.5 bg-slate-200 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Range Markers */}
                <div className="flex justify-between mt-6 px-1">
                    {[0, 25, 50, 75, 100].map(m => (
                        <span key={m} className="text-[10px] font-black text-slate-700 mono">{m}</span>
                    ))}
                </div>
            </div>
        </div>

        {/* Ambient Decor */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/5">
            <Activity className="w-8 h-8" />
            <span className="text-3xl font-black uppercase tracking-[0.5em] italic">Arctic Engine v2.0</span>
            <Activity className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default Dice;
