
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Cpu, Zap, Trophy, History, RefreshCcw, Star, Snowflake, ShieldCheck, Diamond, Rocket } from 'lucide-react';

interface SlotsProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

type SymbolType = 'WILD' | 'DIAMOND' | 'SEVEN' | 'SNOWFLAKE' | 'SHIELD' | 'STAR' | 'GLYPH';

interface SlotSymbol {
  type: SymbolType;
  icon: React.ElementType;
  color: string;
  payout: Record<number, number>;
}

const SYMBOLS: SlotSymbol[] = [
  { type: 'WILD', icon: Snowflake, color: 'text-amber-400', payout: { 3: 10, 4: 50, 5: 250 } },
  { type: 'DIAMOND', icon: Diamond, color: 'text-blue-400', payout: { 3: 5, 4: 20, 5: 100 } },
  { type: 'SEVEN', icon: Rocket, color: 'text-red-500', payout: { 3: 3, 4: 10, 5: 50 } },
  { type: 'SNOWFLAKE', icon: Snowflake, color: 'text-cyan-300', payout: { 3: 1, 4: 5, 5: 20 } },
  { type: 'SHIELD', icon: ShieldCheck, color: 'text-emerald-400', payout: { 3: 0.5, 4: 2, 5: 10 } },
  { type: 'STAR', icon: Star, color: 'text-yellow-400', payout: { 3: 0.2, 4: 1, 5: 5 } },
  { type: 'GLYPH', icon: Zap, color: 'text-slate-500', payout: { 3: 0.1, 4: 0.5, 5: 2 } },
];

const REELS_COUNT = 5;
const ROWS_COUNT = 3;
const SYMBOL_HEIGHT = 160; // Base height for calculations, will scale with responsive classes

const PAYLINES = [
  [0,0,0,0,0], [1,1,1,1,1], [2,2,2,2,2], 
  [0,1,2,1,0], [2,1,0,1,2], [0,0,1,0,0], 
  [2,2,1,2,2], [1,0,0,0,1], [1,2,2,2,1], 
  [0,1,0,1,0], [2,1,2,1,2], [1,0,1,0,1], 
  [1,2,1,2,1], [0,2,0,2,0], [2,0,2,0,2],
  [0,0,2,2,0], [2,2,0,0,2], [1,1,0,1,1],
  [1,1,2,1,1], [0,2,2,2,0]
];

// Helper to get random symbol
const getRandomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].type;

const Reel = ({ 
  targetSymbols, 
  isSpinning, 
  reelIndex, 
  turboMode,
  winningRows 
}: { 
  targetSymbols: SymbolType[], 
  isSpinning: boolean, 
  reelIndex: number,
  turboMode: boolean,
  winningRows: number[]
}) => {
  const [offset, setOffset] = useState(0);
  const [internalSymbols, setInternalSymbols] = useState<SymbolType[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate a long strip for animation
  useEffect(() => {
    const initial = Array(15).fill(null).map(getRandomSymbol);
    setInternalSymbols(initial);
  }, []);

  useEffect(() => {
    if (isSpinning) {
      // Create a long strip: Current -> Random Buffer -> Target
      const bufferSize = turboMode ? 20 : 40 + (reelIndex * 15);
      const buffer = Array(bufferSize).fill(null).map(getRandomSymbol);
      const newStrip = [...internalSymbols.slice(0, 3), ...buffer, ...targetSymbols];
      
      setInternalSymbols(newStrip);
      
      // Calculate travel distance
      // We want to land on the targetSymbols which are at the very end of newStrip
      // The viewport shows 3 symbols. So we stop when the first target symbol is at the top.
      const travelItems = newStrip.length - 3;
      
      // Start animation
      const duration = turboMode ? 600 + (reelIndex * 100) : 2000 + (reelIndex * 400);
      
      // Small delay to ensure state update for symbols
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = `transform ${duration}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)`;
          containerRef.current.style.transform = `translateY(-${travelItems * 100}%)`;
        }
      });

      const timer = setTimeout(() => {
        // Reset position instantly to look like we are just at the new symbols
        if (containerRef.current) {
          containerRef.current.style.transition = 'none';
          containerRef.current.style.transform = `translateY(0)`;
          setInternalSymbols(targetSymbols);
        }
      }, duration + 50);

      return () => clearTimeout(timer);
    }
  }, [isSpinning, targetSymbols, reelIndex, turboMode]);

  return (
    <div className="relative h-[480px] md:h-[600px] bg-white/[0.02] rounded-2xl overflow-hidden border-x border-white/5">
      <div 
        ref={containerRef}
        className="absolute w-full flex flex-col"
        style={{ transform: `translateY(0)` }}
      >
        {internalSymbols.map((symType, i) => {
          const symbolDef = SYMBOLS.find(s => s.type === symType)!;
          // Winning indices are only relevant for the first 3 symbols (the current view)
          const isWinning = !isSpinning && i < 3 && winningRows.includes(i);

          return (
            <div 
              key={`${i}-${symType}`}
              className={`h-[160px] md:h-[200px] flex flex-col items-center justify-center transition-all duration-300 border-b border-white/5 relative
                ${isWinning ? 'bg-blue-400/10 z-10' : ''}
                ${isSpinning ? 'blur-[2px]' : ''}
              `}
            >
               {isWinning && (
                <div className="absolute inset-0 border-2 border-blue-400 shadow-[inset_0_0_20px_rgba(96,165,250,0.3)] animate-pulse" />
               )}
               <symbolDef.icon className={`w-12 h-12 md:w-20 md:h-20 ${symbolDef.color} ${isWinning ? 'animate-bounce' : ''}`} />
               <span className={`text-[10px] font-black uppercase tracking-widest mt-4 ${isWinning ? 'text-blue-400' : 'text-slate-700'}`}>
                  {symType}
               </span>
            </div>
          );
        })}
      </div>
      {/* Glossy Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/40 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" />
    </div>
  );
};

const Slots: React.FC<SlotsProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetReels, setTargetReels] = useState<SymbolType[][]>(
    Array(REELS_COUNT).fill(null).map(() => 
      Array(ROWS_COUNT).fill(null).map(getRandomSymbol)
    )
  );
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [lastWin, setLastWin] = useState(0);
  const [shake, setShake] = useState(false);
  const [turboMode, setTurboMode] = useState(false);

  const spin = useCallback(() => {
    if (balance < betAmount) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    onLoss(betAmount);
    setWinningLines([]);
    setLastWin(0);

    // Weighted symbol selection
    const generateOutcome = () => {
       const r = Math.random();
       if (r < 0.02) return 'WILD';
       if (r < 0.08) return 'DIAMOND';
       if (r < 0.15) return 'SEVEN';
       if (r < 0.3) return 'SNOWFLAKE';
       if (r < 0.5) return 'SHIELD';
       if (r < 0.7) return 'STAR';
       return 'GLYPH';
    };

    const newReels = Array(REELS_COUNT).fill(null).map(() => 
      Array(ROWS_COUNT).fill(null).map(generateOutcome)
    );

    setTargetReels(newReels);

    // The animation is handled by individual Reel components.
    // We just wait for the longest reel to finish (Reel 5).
    const longestDuration = turboMode ? 1100 : 4000;
    
    setTimeout(() => {
      setIsSpinning(false);
      calculateWins(newReels);
    }, longestDuration);
  }, [balance, betAmount, isSpinning, onLoss, turboMode]);

  const calculateWins = (currentReels: SymbolType[][]) => {
    let totalMultiplier = 0;
    const linesWon: number[] = [];

    PAYLINES.forEach((line, lineIdx) => {
      const firstSymbol = currentReels[0][line[0]];
      let count = 1;

      for (let i = 1; i < REELS_COUNT; i++) {
        const symbol = currentReels[i][line[i]];
        if (symbol === firstSymbol || symbol === 'WILD' || firstSymbol === 'WILD') {
          count++;
        } else {
          break;
        }
      }

      if (count >= 3) {
        let scoringSymbol = firstSymbol;
        if (scoringSymbol === 'WILD') {
            for (let i = 0; i < count; i++) {
                if (currentReels[i][line[i]] !== 'WILD') {
                    scoringSymbol = currentReels[i][line[i]];
                    break;
                }
            }
        }

        const symbolDef = SYMBOLS.find(s => s.type === scoringSymbol) || SYMBOLS[SYMBOLS.length-1];
        const mult = symbolDef.payout[count] || 0;
        
        if (mult > 0) {
            totalMultiplier += mult;
            linesWon.push(lineIdx);
        }
      }
    });

    if (totalMultiplier > 0) {
      const winAmount = betAmount * totalMultiplier;
      setLastWin(winAmount);
      setWinningLines(linesWon);
      onWin(winAmount);
    }
  };

  const getWinningRowsForReel = (reelIdx: number) => {
    const rows: number[] = [];
    winningLines.forEach(lineIdx => {
      rows.push(PAYLINES[lineIdx][reelIdx]);
    });
    return Array.from(new Set(rows));
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-8 w-full max-w-[1400px] mx-auto pb-32 transition-transform ${shake ? 'animate-shake' : ''}`}>
      
      {/* Sidebar Controls */}
      <div className="w-full lg:w-[380px] space-y-4">
        <div className="bg-[#1a1c22] rounded-2xl overflow-hidden border border-white/5 shadow-2xl p-6 space-y-6">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bankroll Station</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bet Amount</label>
            <div className="relative group">
              <input 
                type="number" value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                disabled={isSpinning}
                className="w-full bg-[#0f1115] border-2 border-white/5 rounded-xl px-4 py-4 text-xl font-black text-white focus:outline-none focus:border-blue-500/30 transition-all mono shadow-inner"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setBetAmount(betAmount / 2)} className="px-3 py-2 bg-[#2f323a] text-[10px] font-black rounded-lg transition-colors hover:bg-white/5">1/2</button>
                <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-2 bg-[#2f323a] text-[10px] font-black rounded-lg transition-colors hover:bg-white/5">2x</button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engine Mode</label>
            <button 
              onClick={() => setTurboMode(!turboMode)}
              className={`w-full py-4 flex items-center justify-center gap-3 rounded-xl font-black text-[10px] tracking-widest transition-all border ${
                turboMode 
                ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                : 'bg-[#0f1115] border-white/5 text-slate-500'
              }`}
            >
              <Zap className={`w-4 h-4 ${turboMode ? 'fill-current' : ''}`} />
              {turboMode ? 'TURBO: ACTIVATED' : 'TURBO: NORMAL'}
            </button>
          </div>

          <button 
            onClick={spin}
            disabled={isSpinning}
            className={`w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-xl shadow-lg active:scale-95 transition-all uppercase italic tracking-tighter flex items-center justify-center gap-3 ${isSpinning ? 'opacity-50' : ''}`}
          >
            {isSpinning ? <RefreshCcw className="w-6 h-6 animate-spin" /> : 'Fracture Reels'}
          </button>
        </div>

        <div className="bg-[#1a1c22] rounded-2xl p-6 border border-white/5 space-y-4 shadow-xl">
           <div className="flex items-center gap-2 text-blue-400 border-b border-white/5 pb-3">
              <Trophy className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Paytable Highlights</span>
           </div>
           <div className="space-y-3">
              {SYMBOLS.slice(0, 4).map(s => (
                <div key={s.type} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <s.icon className={`w-3 h-3 ${s.color}`} />
                        <span className="text-[10px] font-bold text-slate-400">{s.type}</span>
                    </div>
                    <span className="text-[10px] font-black text-white">5x: {s.payout[5]}x</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Main Reels Arena */}
      <div className="flex-1 bg-[#0f1115] rounded-[40px] border border-white/5 p-4 md:p-8 flex flex-col items-center justify-center relative min-h-[850px] shadow-[inset_0_0_100px_rgba(0,0,0,1)] overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none z-40" />
        
        {/* The Machine Case */}
        <div className="relative w-full max-w-5xl bg-[#0d0d12] border-[12px] border-[#1a1c22] rounded-[32px] shadow-3xl overflow-hidden p-2 grid grid-cols-5 gap-2">
            {targetReels.map((reelOutcome, rIdx) => (
                <Reel 
                  key={rIdx}
                  reelIndex={rIdx}
                  targetSymbols={reelOutcome}
                  isSpinning={isSpinning}
                  turboMode={turboMode}
                  winningRows={getWinningRowsForReel(rIdx)}
                />
            ))}

            {/* Payline Visualizers (Overlay SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible">
                {winningLines.map((lineIdx) => {
                    const line = PAYLINES[lineIdx];
                    let path = `M `;
                    line.forEach((row, col) => {
                        const x = (col * 20) + 10;
                        const y = (row * 33.3) + 16.6;
                        path += `${x}% ${y}% ${col < 4 ? 'L ' : ''}`;
                    });
                    return (
                        <path 
                            key={lineIdx}
                            d={path}
                            stroke="#60a5fa"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray="10, 10"
                            className="animate-dash"
                            style={{ opacity: 0.8 }}
                        />
                    );
                })}
            </svg>
        </div>

        {/* Win Result Display */}
        {lastWin > 0 && !isSpinning && (
            <div className="mt-12 text-center animate-in zoom-in-75 duration-700">
                <h2 className={`text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase drop-shadow-2xl ${lastWin > betAmount * 10 ? 'animate-bounce text-blue-400' : ''}`}>
                    {lastWin > betAmount * 50 ? 'GALACTIC WIN!' : lastWin > betAmount * 10 ? 'MEGA PAYOUT' : 'ARCTIC HIT'}
                </h2>
                <div className="flex items-center justify-center gap-4 mt-4">
                    <Zap className="w-8 h-8 text-blue-400 fill-current" />
                    <p className="text-5xl md:text-7xl font-black text-cyan-400 mono">
                        +${lastWin.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <Zap className="w-8 h-8 text-blue-400 fill-current" />
                </div>
            </div>
        )}

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/5 pointer-events-none z-40">
            <RefreshCcw className="w-8 h-8" />
            <span className="text-3xl font-black uppercase tracking-[0.5em] italic">Vortex Reels v5.0</span>
            <RefreshCcw className="w-8 h-8" />
        </div>

        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none z-40" />
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-dash {
          animation: dash 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Slots;
