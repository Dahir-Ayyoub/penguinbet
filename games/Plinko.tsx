import React, { useState, useEffect, useRef, useMemo } from 'react';
/* Added missing Layers icon from lucide-react */
import { Zap, Activity, History as HistoryIcon, Play, Pause, Settings2, Info, Layers } from 'lucide-react';

interface PlinkoProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  row: number;
  isFinished: boolean;
  history: { x: number, y: number }[];
}

interface RecentHit {
  id: number;
  multiplier: number;
  color: string;
}

// Stake-inspired professional multiplier curves
const MULTIPLIERS: Record<number, Record<RiskLevel, number[]>> = {
  8: {
    LOW: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    MEDIUM: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    HIGH: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29]
  },
  12: {
    LOW: [10, 5, 2, 1.1, 1, 0.5, 1, 1.1, 2, 5, 10],
    MEDIUM: [33, 11, 4, 2, 0.6, 0.3, 0.6, 2, 4, 11, 33],
    HIGH: [170, 48, 10, 5, 2, 0.2, 0.2, 2, 5, 10, 48, 170]
  },
  16: {
    LOW: [16, 9, 4, 2, 1.1, 1, 0.5, 1, 1.1, 2, 4, 9, 16],
    MEDIUM: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    HIGH: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
  }
};

const Plinko: React.FC<PlinkoProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [rowCount, setRowCount] = useState(16);
  const [risk, setRisk] = useState<RiskLevel>('MEDIUM');
  const [balls, setBalls] = useState<Ball[]>([]);
  const [hitPegs, setHitPegs] = useState<Record<string, number>>({});
  const [recentHits, setRecentHits] = useState<RecentHit[]>([]);
  const [isAuto, setIsAuto] = useState(false);
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [lastBin, setLastBin] = useState<number | null>(null);

  const requestRef = useRef<number>(0);
  const ballCounter = useRef(0);
  /* Fixed autoIntervalRef type to be environment agnostic instead of using NodeJS namespace */
  const autoIntervalRef = useRef<any>(null);

  const currentMultipliers = useMemo(() => {
    // Fallback if the exact rowCount isn't in our map, though we limit selection to these
    return MULTIPLIERS[rowCount]?.[risk] || MULTIPLIERS[16][risk];
  }, [rowCount, risk]);

  const dropBall = () => {
    if (balance < betAmount) {
      setIsAuto(false);
      return;
    }
    onLoss(betAmount);
    
    const newBall: Ball = {
      id: ballCounter.current++,
      x: 50,
      y: 0,
      vx: 0,
      vy: 0.2,
      row: 0,
      isFinished: false,
      history: []
    };
    setBalls(prev => [...prev, newBall]);
  };

  useEffect(() => {
    if (isAuto && activeTab === 'AUTO') {
      autoIntervalRef.current = setInterval(dropBall, 300);
    } else {
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    }
    return () => { if (autoIntervalRef.current) clearInterval(autoIntervalRef.current); };
  }, [isAuto, activeTab, betAmount, balance]);

  const update = (time: number) => {
    setBalls(prev => {
      return prev.map(ball => {
        if (ball.isFinished) return ball;

        let { x, y, vx, vy, row, history } = ball;
        
        vy += 0.045; // Professional gravity
        y += vy;
        x += vx;
        vx *= 0.98;

        history = [{ x, y }, ...history.slice(0, 8)];

        // Collision Logic
        const targetY = (row + 1) * (100 / (rowCount + 3));
        if (y >= targetY && row < rowCount) {
          row++;
          const dir = Math.random() > 0.5 ? 1 : -1;
          const bouncePower = 0.8 + Math.random() * 0.4;
          vx = dir * bouncePower;
          vy = 0.15;
          
          const pegCol = Math.round((x - 50) / 4); 
          setHitPegs(prev => ({ ...prev, [`${row}-${pegCol}`]: Date.now() }));
        }

        // Finish Logic
        if (y >= 92) {
          const binWidth = 100 / currentMultipliers.length;
          const binIndex = Math.floor(x / binWidth);
          const clamped = Math.max(0, Math.min(currentMultipliers.length - 1, binIndex));
          const mult = currentMultipliers[clamped];
          
          onWin(betAmount * mult);
          setLastBin(clamped);
          
          // History update
          const color = mult >= 10 ? '#f97316' : mult >= 2 ? '#3b82f6' : '#64748b';
          setRecentHits(prev => [{ id: Date.now(), multiplier: mult, color }, ...prev].slice(0, 15));
          
          setTimeout(() => setLastBin(null), 800);
          return { ...ball, isFinished: true };
        }

        return { ...ball, x, y, vx, vy, row, history };
      }).filter(b => !b.isFinished);
    });
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [rowCount, risk, currentMultipliers]);

  const getBinColor = (m: number) => {
    if (m >= 100) return 'bg-rose-600 border-rose-400 text-white';
    if (m >= 10) return 'bg-orange-500 border-orange-400 text-white';
    if (m >= 2) return 'bg-indigo-600 border-indigo-400 text-white';
    if (m > 0.9) return 'bg-blue-600 border-blue-400 text-white';
    return 'bg-slate-800 border-slate-700 text-slate-400';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1400px] mx-auto pb-32">
      {/* Sidebar Controls - Stake Inspired */}
      <div className="w-full lg:w-[380px] space-y-4">
        <div className="bg-[#1a1c22] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          {/* Tabs */}
          <div className="flex p-1.5 bg-black/40 gap-1">
            {(['MANUAL', 'AUTO'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setIsAuto(false); }}
                className={`flex-1 py-3 rounded-xl text-[11px] font-black tracking-widest transition-all ${
                  activeTab === tab ? 'bg-[#2f323a] text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-6">
            {/* Bet Input */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>Bet Amount</span>
                <span>${balance.toFixed(2)}</span>
              </div>
              <div className="relative group">
                <input 
                  type="number" value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#0f1115] border-2 border-white/5 rounded-xl px-4 py-4 text-xl font-black text-white focus:outline-none focus:border-blue-500/30 transition-all mono shadow-inner"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button onClick={() => setBetAmount(betAmount / 2)} className="px-3 py-2 bg-[#2f323a] hover:bg-[#3f434d] text-[10px] font-black text-slate-300 rounded-lg">1/2</button>
                  <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-2 bg-[#2f323a] hover:bg-[#3f434d] text-[10px] font-black text-slate-300 rounded-lg">2x</button>
                </div>
              </div>
            </div>

            {/* Risk Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk</label>
              <div className="relative">
                <select 
                  value={risk}
                  onChange={(e) => setRisk(e.target.value as RiskLevel)}
                  className="w-full bg-[#0f1115] border-2 border-white/5 rounded-xl px-4 py-4 text-sm font-black text-white appearance-none focus:outline-none focus:border-blue-500/30"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <Settings2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Rows Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rows</label>
              <div className="relative">
                <select 
                  value={rowCount}
                  onChange={(e) => setRowCount(Number(e.target.value))}
                  className="w-full bg-[#0f1115] border-2 border-white/5 rounded-xl px-4 py-4 text-sm font-black text-white appearance-none focus:outline-none focus:border-blue-500/30"
                >
                  {[8, 12, 16].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <Layers className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Action Button */}
            {activeTab === 'MANUAL' ? (
              <button 
                onClick={dropBall}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-tighter"
              >
                Bet
              </button>
            ) : (
              <button 
                onClick={() => setIsAuto(!isAuto)}
                className={`w-full py-5 flex items-center justify-center gap-3 font-black text-lg rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-tighter ${
                  isAuto ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isAuto ? <><Pause className="w-5 h-5 fill-current" /> Stop Auto</> : <><Play className="w-5 h-5 fill-current" /> Start Auto</>}
              </button>
            )}
          </div>
        </div>

        {/* Board Stats */}
        <div className="bg-[#1a1c22] rounded-2xl p-6 border border-white/5 space-y-4 shadow-xl">
           <div className="flex items-center gap-2 text-blue-400 border-b border-white/5 pb-3">
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Game Information</span>
           </div>
           <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                 <span>Max Potential</span>
                 <span className="text-white mono font-black">{currentMultipliers[0]}x</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500">
                 <span>Provably Fair</span>
                 <span className="text-emerald-500 flex items-center gap-1"><Zap className="w-3 h-3 fill-current" /> Verified</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 bg-[#0f1115] rounded-3xl border border-white/5 p-4 md:p-8 flex items-center justify-center relative min-h-[850px] shadow-[inset_0_0_100px_rgba(0,0,0,1)]">
        
        {/* Recent Hits Trail (Right Side) */}
        <div className="absolute right-6 top-8 bottom-8 w-16 hidden md:flex flex-col gap-2 overflow-hidden pointer-events-none">
           {recentHits.map((hit) => (
             <div 
               key={hit.id} 
               style={{ backgroundColor: hit.color }}
               className="w-full py-2 rounded-lg text-[10px] font-black text-white text-center shadow-lg animate-in slide-in-from-right-10 duration-300"
             >
               {hit.multiplier}x
             </div>
           ))}
        </div>

        <div className="relative w-full max-w-[850px] aspect-[1/1.1] flex flex-col justify-between">
          
          {/* Peg Grid */}
          <div className="flex-1 relative mt-12">
            {Array.from({ length: rowCount }).map((_, r) => (
              <div key={r} className="flex justify-center gap-[4.5%] mb-[3.8%]">
                {Array.from({ length: r + 3 }).map((__, c) => {
                  const pegKey = `${r+1}-${c - Math.floor((r+3)/2)}`;
                  const isHit = hitPegs[pegKey] && (Date.now() - hitPegs[pegKey] < 300);
                  return (
                    <div key={c} className="relative">
                      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-200 ${
                        isHit ? 'bg-white scale-150 shadow-[0_0_15px_rgba(255,255,255,1)]' : 'bg-white/20'
                      }`} />
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Balls */}
            {balls.map(ball => (
              <div 
                key={ball.id} 
                className="absolute w-4 h-4 md:w-5 md:h-5 z-20 pointer-events-none"
                style={{ top: `${ball.y}%`, left: `${ball.x}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="w-full h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] border border-blue-200" />
                {/* Trail */}
                {ball.history.map((h, i) => (
                  <div 
                    key={i}
                    className="absolute w-full h-full bg-white/10 rounded-full"
                    style={{ 
                      top: `${(h.y - ball.y) * 10}px`, 
                      left: `${(h.x - ball.x) * 10}px`, 
                      opacity: 1 - (i / 8),
                      transform: `scale(${1 - (i / 10)})`
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Bins */}
          <div className="flex gap-1 mb-4 h-12 md:h-14 items-end">
            {currentMultipliers.map((m, i) => (
              <div 
                key={i} 
                className={`flex-1 flex flex-col items-center justify-center rounded-lg border-b-2 text-[8px] md:text-[10px] font-black transition-all duration-150 relative overflow-hidden h-full ${
                  getBinColor(m)
                } ${lastBin === i ? 'translate-y-[-8px] scale-105 shadow-2xl brightness-125' : ''}`}
              >
                <span className="relative z-10">{m >= 100 ? m : m + 'x'}</span>
                {lastBin === i && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plinko;