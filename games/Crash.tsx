
import React, { useState, useEffect, useRef } from 'react';
import { Play, Snowflake, AlertCircle, Mountain, Zap, Wind, History, Target, TrendingUp } from 'lucide-react';

interface CrashProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

const Crash: React.FC<CrashProps> = ({ balance, onWin, onLoss }) => {
  // Game States
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState<number | ''>('');
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<'IDLE' | 'STARTING' | 'PLAYING' | 'CRASHED'>('IDLE');
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [shake, setShake] = useState(false);

  // Refs for Physics & Logic
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);
  const isLockedRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Growth Formula: Multiplier = e^(0.06 * t)
  const GROWTH_RATE = 0.065;

  const startRound = () => {
    if (isLockedRef.current || gameState === 'PLAYING' || gameState === 'STARTING') return;
    
    if (balance < betAmount) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    isLockedRef.current = true;
    onLoss(betAmount);
    setGameState('STARTING');
    setHasCashedOut(false);
    setMultiplier(1.0);

    // Industry Standard Crash Algorithm
    const r = Math.random();
    crashPointRef.current = Math.max(1.0, 0.99 / (1 - r));

    // Brief "Loading/Starting" phase to simulate 1xbet round prep
    setTimeout(() => {
      startTimeRef.current = performance.now();
      setGameState('PLAYING');
      isLockedRef.current = false;
      requestRef.current = requestAnimationFrame(update);
    }, 800);
  };

  const update = (time: number) => {
    if (gameState !== 'PLAYING' && isLockedRef.current) return;
    
    const elapsed = (time - startTimeRef.current) / 1000;
    const currentMult = Math.pow(Math.E, GROWTH_RATE * elapsed);
    
    // Update Multiplier
    setMultiplier(currentMult);

    // Auto-Cashout Logic
    if (!hasCashedOut && autoCashout && currentMult >= autoCashout) {
      cashOut(currentMult);
    }

    // Crash Check
    if (currentMult >= crashPointRef.current) {
      triggerCrash(currentMult);
      return;
    }

    drawGraph(elapsed, currentMult);
    requestRef.current = requestAnimationFrame(update);
  };

  const triggerCrash = (finalMult: number) => {
    setGameState('CRASHED');
    setHistory(prev => [finalMult, ...prev].slice(0, 8));
    cancelAnimationFrame(requestRef.current);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const cashOut = (specificMult?: number) => {
    if (gameState === 'PLAYING' && !hasCashedOut) {
      const winMult = specificMult || multiplier;
      onWin(betAmount * winMult);
      setHasCashedOut(true);
    }
  };

  const drawGraph = (time: number, mult: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw Grid (Moves as we accelerate)
    const gridSize = 100;
    const scrollX = (time * 150) % gridSize;
    const scrollY = (mult * 50) % gridSize;

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
    ctx.lineWidth = 1;

    for (let x = -scrollX; x < w; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = scrollY; y < h; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Draw Path
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
    
    const padding = 100;
    const startX = padding;
    const startY = h - padding;
    
    ctx.moveTo(startX, startY);
    
    const points = 60;
    for (let i = 0; i <= points; i++) {
      const t = (i / points) * time;
      const m = Math.pow(Math.E, GROWTH_RATE * t);
      const px = startX + (t / (time + 2)) * (w - padding * 2);
      const py = startY - ((m - 1) / (mult + 0.5)) * (h - padding * 2);
      ctx.lineTo(px, py);
      
      // Draw end-point (The Penguin Sled)
      if (i === points) {
        ctx.stroke();
        // Sled Circle
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fill();
        // Thruster Glow
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 40);
        grad.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, 40, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto pb-32 transition-transform ${shake ? 'animate-shake' : ''}`}>
      {/* 1xbet-Style Sidebar Controls */}
      <div className="w-full lg:w-96 space-y-4">
        <div className="frost-glass rounded-[32px] p-6 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Control Panel</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>

          {/* Bet Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Stake Amount</span>
              <span>Balance: ${balance.toFixed(2)}</span>
            </div>
            <div className="relative group">
              <input 
                type="number" value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                disabled={gameState !== 'IDLE' && gameState !== 'CRASHED'}
                className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-2xl font-black text-white focus:border-blue-500/40 transition-all mono shadow-inner"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500/20 font-black">$</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[10, 50, 100, 500].map(val => (
                <button 
                  key={val} 
                  onClick={() => setBetAmount(val)} 
                  disabled={gameState !== 'IDLE' && gameState !== 'CRASHED'}
                  className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black transition-colors"
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Cashout Input */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Auto-Collect At</span>
              <Target className="w-3 h-3 text-orange-500" />
            </div>
            <div className="relative">
              <input 
                type="number" 
                placeholder="None"
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value === '' ? '' : Math.max(1.01, Number(e.target.value)))}
                disabled={gameState !== 'IDLE' && gameState !== 'CRASHED'}
                className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-xl font-black text-white focus:border-orange-500/40 transition-all mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500/20 font-black">x</span>
            </div>
          </div>

          {/* Main Action Button */}
          {gameState === 'IDLE' || gameState === 'CRASHED' ? (
            <button 
              onClick={startRound} 
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xl rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase italic tracking-tighter"
            >
              Place Bet
            </button>
          ) : gameState === 'STARTING' ? (
            <div className="w-full py-6 bg-white/5 border border-white/10 text-slate-400 font-black text-xl rounded-2xl text-center animate-pulse uppercase">
              Readying Sled...
            </div>
          ) : (
            <button 
              onClick={() => cashOut()} 
              disabled={hasCashedOut}
              className={`w-full py-6 font-black text-xl rounded-2xl shadow-2xl transition-all flex flex-col items-center justify-center ${hasCashedOut ? 'bg-zinc-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white active:scale-95'}`}
            >
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">Take Winnings</span>
              <span className="italic">
                {hasCashedOut ? 'Collected' : `$${(betAmount * multiplier).toFixed(2)}`}
              </span>
            </button>
          )}
        </div>

        {/* 1xbet-Style History List */}
        <div className="frost-glass rounded-[24px] p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <History className="w-4 h-4" />
            Previous Rounds
          </div>
          <div className="grid grid-cols-4 gap-2">
            {history.map((h, i) => (
              <div 
                key={i} 
                className={`py-2 rounded-lg text-[11px] font-black text-center mono border ${h >= 2 ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
              >
                {h.toFixed(2)}x
              </div>
            ))}
            {history.length === 0 && <span className="text-[10px] text-slate-700 col-span-4 italic text-center py-2">No data recorded...</span>}
          </div>
        </div>
      </div>

      {/* Main Graph Arena */}
      <div className="flex-1 bg-[#050507] rounded-[60px] border border-white/5 flex flex-col items-center justify-center min-h-[750px] relative overflow-hidden shadow-[inset_0_0_200px_rgba(0,0,0,1)]">
        <canvas 
          ref={canvasRef} 
          width={1200} 
          height={800} 
          className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" 
        />

        {/* Central Multiplier Display */}
        <div className="relative z-40 text-center select-none pointer-events-none">
          <div className={`text-[12rem] md:text-[18rem] font-black tracking-tighter mono transition-all duration-150 ${gameState === 'CRASHED' ? 'text-red-500 scale-125 blur-sm' : hasCashedOut ? 'text-emerald-400' : 'text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]'}`}>
            {multiplier.toFixed(2)}<span className="text-4xl md:text-8xl opacity-30 ml-4 font-normal">x</span>
          </div>
          
          {gameState === 'STARTING' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
               <div className="w-24 h-24 border-8 border-white/10 border-t-blue-500 rounded-full animate-spin" />
               <p className="mt-8 text-blue-500 font-black uppercase tracking-[0.5em] animate-pulse">Launching</p>
            </div>
          )}
        </div>

        {/* Win/Loss Status Overlay */}
        {hasCashedOut && gameState === 'PLAYING' && (
           <div className="absolute top-20 right-20 bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-xl px-8 py-4 rounded-[32px] animate-in slide-in-from-right-10 duration-500 shadow-2xl">
              <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Profit Secured</p>
              <p className="text-4xl font-black text-white mono">+${(betAmount * (multiplier - 1)).toFixed(2)}</p>
           </div>
        )}

        {/* Crash Notification */}
        {gameState === 'CRASHED' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/20 backdrop-blur-2xl animate-in zoom-in-110 duration-300">
             <div className="p-10 bg-red-600 rounded-full mb-8 shadow-[0_0_100px_rgba(220,38,38,0.5)] animate-bounce">
               <AlertCircle className="w-24 h-24 text-white" />
             </div>
             <h2 className="text-9xl font-black text-white italic uppercase tracking-tighter drop-shadow-2xl">FLEW AWAY!</h2>
             <p className="text-red-400 text-3xl font-black mt-4 uppercase tracking-[0.6em] mono">Crashed @ {multiplier.toFixed(2)}x</p>
             <button 
               onClick={() => setGameState('IDLE')} 
               className="mt-12 px-16 py-6 bg-white text-black rounded-full font-black text-2xl transition-all hover:scale-110 active:scale-95 shadow-2xl"
             >
               Play Again
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Crash;
