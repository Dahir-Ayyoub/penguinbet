
import React, { useState, useRef, useEffect } from 'react';
import { CircleDashed, Zap, Trophy, History, Hash } from 'lucide-react';

interface RouletteProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

const COLORS = {
  RED: 'bg-red-600',
  BLACK: 'bg-zinc-800',
  GREEN: 'bg-emerald-500'
};

const ITEMS = [
  { id: 0, color: 'GREEN', value: 0 },
  { id: 1, color: 'RED', value: 1 },
  { id: 2, color: 'BLACK', value: 2 },
  { id: 3, color: 'RED', value: 3 },
  { id: 4, color: 'BLACK', value: 4 },
  { id: 5, color: 'RED', value: 5 },
  { id: 6, color: 'BLACK', value: 6 },
  { id: 7, color: 'RED', value: 7 },
  { id: 8, color: 'BLACK', value: 8 },
  { id: 9, color: 'RED', value: 9 },
  { id: 10, color: 'BLACK', value: 10 },
  { id: 11, color: 'RED', value: 11 },
  { id: 12, color: 'BLACK', value: 12 },
  { id: 13, color: 'RED', value: 13 },
  { id: 14, color: 'BLACK', value: 14 },
];

const Roulette: React.FC<RouletteProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState<{ type: 'COLOR' | 'NUMBER', value: string | number } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof ITEMS[0] | null>(null);
  const [history, setHistory] = useState<typeof ITEMS[0][]>([]);
  const [shake, setShake] = useState(false);

  const spin = () => {
    if (!selectedBet) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (balance < betAmount) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (isSpinning) return;
    
    setIsSpinning(true);
    onLoss(betAmount);
    setResult(null);

    const extraSpins = 8 + Math.random() * 5;
    const winnerIdx = Math.floor(Math.random() * ITEMS.length);
    const sectorAngle = 360 / ITEMS.length;
    const targetRotation = (extraSpins * 360) + (winnerIdx * sectorAngle);
    
    setRotation(prev => prev + targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const finalRotation = (rotation + targetRotation) % 360;
      const index = Math.floor(((360 - (finalRotation % 360)) % 360) / sectorAngle);
      const winner = ITEMS[index];
      
      setResult(winner);
      setHistory(prev => [winner, ...prev].slice(0, 10));

      let won = false;
      let multiplier = 0;

      if (selectedBet.type === 'COLOR') {
        if (winner.color === selectedBet.value) {
          won = true;
          multiplier = selectedBet.value === 'GREEN' ? 14 : 2;
        }
      } else {
        if (winner.value === selectedBet.value) {
          won = true;
          multiplier = 14;
        }
      }

      if (won) {
        onWin(betAmount * multiplier);
      }
    }, 5000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 w-full max-w-7xl mx-auto pb-32 items-center">
      <div className="w-full lg:w-[450px] space-y-6">
        <div className={`frost-glass rounded-[48px] p-8 shadow-2xl space-y-8 border border-white/10 relative overflow-hidden transition-transform ${shake ? 'animate-bounce' : ''}`}>
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] block">Wager Credits</label>
              <span className="text-[10px] font-black text-cyan-400 mono">${balance.toLocaleString()}</span>
            </div>
            <input 
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={isSpinning}
              className="w-full bg-[#0a0a12] border-2 border-white/5 rounded-[28px] px-8 py-5 text-2xl font-black text-white focus:outline-none focus:border-cyan-500/50 transition-all mono shadow-inner"
            />
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Color Zones</label>
              <div className="grid grid-cols-3 gap-2">
                {['RED', 'GREEN', 'BLACK'].map((c) => (
                  <button 
                    key={c}
                    onClick={() => setSelectedBet({ type: 'COLOR', value: c })}
                    disabled={isSpinning}
                    className={`py-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedBet?.type === 'COLOR' && selectedBet.value === c ? 'border-cyan-400 bg-white/10 scale-105 shadow-2xl' : 'border-white/5 bg-black/40 opacity-40 hover:opacity-100'}`}
                  >
                    <div className={`w-5 h-5 rounded-full ${COLORS[c as keyof typeof COLORS]} border-2 border-white/20`} />
                    <span className="text-[9px] font-black tracking-widest text-white uppercase">{c === 'GREEN' ? '14X' : '2X'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                <Hash className="w-3 h-3 text-slate-500" />
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Number Grid (14x)</label>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedBet({ type: 'NUMBER', value: item.value })}
                    disabled={isSpinning}
                    className={`py-3 rounded-xl border-2 font-black text-xs transition-all ${
                      selectedBet?.type === 'NUMBER' && selectedBet.value === item.value 
                        ? 'border-cyan-400 bg-white/10 scale-110 z-10' 
                        : 'border-white/5 bg-black/40 hover:bg-white/5'
                    } ${item.color === 'RED' ? 'text-red-400' : item.color === 'BLACK' ? 'text-slate-400' : 'text-emerald-400'}`}
                  >
                    {item.value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={spin}
            disabled={isSpinning || !selectedBet}
            className={`w-full py-7 text-white font-black text-xl rounded-[32px] shadow-2xl transition-all relative overflow-hidden flex items-center justify-center gap-4 active:scale-95 ${!selectedBet ? 'bg-zinc-800 opacity-40 cursor-not-allowed' : 'bg-gradient-to-br from-cyan-500 to-blue-700 shadow-cyan-600/30'}`}
          >
            <span className="italic tracking-tighter uppercase">{isSpinning ? 'SPINNING...' : (selectedBet ? `Place Bet` : 'Select Zone')}</span>
            <Zap className={`w-6 h-6 ${isSpinning ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        <div className="frost-glass rounded-[40px] p-6 border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
           <div className="flex items-center gap-3 text-cyan-400 mb-4">
              <History className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Grid Memory</span>
           </div>
           <div className="flex flex-wrap gap-2">
              {history.map((item, i) => (
                <div 
                  key={i} 
                  className={`w-10 h-10 rounded-xl ${COLORS[item.color as keyof typeof COLORS]} shadow-lg animate-in fade-in zoom-in duration-500 border border-white/10 flex items-center justify-center`}
                >
                  <span className="text-[10px] font-black text-white mono">{item.value}</span>
                </div>
              ))}
              {history.length === 0 && <span className="text-[10px] text-slate-700 italic">No history yet...</span>}
           </div>
        </div>
      </div>

      <div className="flex-1 bg-[#050507] rounded-[100px] border border-white/5 flex flex-col items-center justify-center min-h-[850px] relative overflow-hidden shadow-[inset_0_0_200px_rgba(0,0,0,1)]">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
        
        {/* Vortex Pointer */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40">
            <div className="w-8 h-12 bg-white relative shadow-[0_0_30px_rgba(255,255,255,0.8)]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />
        </div>

        <div className="relative group p-10">
           {/* Glow Layer */}
           <div className={`absolute -inset-10 rounded-full transition-all duration-1000 ${isSpinning ? 'bg-cyan-500/10 blur-[100px]' : 'bg-transparent'}`} />
           
           <div 
             style={{ 
               transform: `rotate(${rotation}deg)`,
               transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0, 0.05, 1)' : 'none'
             }}
             className="relative w-[500px] h-[500px] md:w-[650px] md:h-[650px] rounded-full border-[20px] border-[#0d0d12] shadow-[0_60px_120px_rgba(0,0,0,0.9)] overflow-hidden"
           >
             <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
               {ITEMS.map((item, i) => {
                 const angle = 360 / ITEMS.length;
                 const startAngle = i * angle;
                 const endAngle = (i + 1) * angle;
                 const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                 const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                 const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                 const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                 const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                 
                 return (
                   <g key={i}>
                     <path d={pathData} fill={item.color === 'RED' ? '#dc2626' : item.color === 'BLACK' ? '#09090b' : '#10b981'} stroke="#000" strokeWidth="0.2" />
                     <text
                        x="78" y="50"
                        fill="#fff"
                        className="text-[4px] font-black italic tracking-tighter opacity-80"
                        style={{ transformOrigin: '50px 50px', transform: `rotate(${startAngle + angle / 2}deg)` }}
                        textAnchor="middle" dominantBaseline="middle"
                     >
                        {item.value}
                     </text>
                   </g>
                 );
               })}
             </svg>
             <div className="absolute inset-0 rounded-full shadow-[inset_0_0_120px_rgba(0,0,0,1)] pointer-events-none" />
           </div>

           {/* Center Hub */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-[#0d0d12] rounded-full border-[12px] border-[#16161d] shadow-3xl flex items-center justify-center z-50">
              <div className="absolute inset-4 rounded-full border-2 border-white/5 border-dashed animate-spin-slow opacity-20" />
              {result && !isSpinning ? (
                  <div className="flex flex-col items-center animate-in zoom-in-75 duration-700">
                      <span className="text-6xl font-black text-white italic mono leading-none">{result.value}</span>
                      <div className={`mt-2 w-8 h-8 rounded-full ${COLORS[result.color as keyof typeof COLORS]} border-2 border-white/20`} />
                  </div>
              ) : (
                  <CircleDashed className={`w-24 h-24 text-cyan-500/20 ${isSpinning ? 'animate-spin' : ''}`} />
              )}
           </div>
        </div>

        {result && !isSpinning && (
            <div className="mt-16 text-center animate-in slide-in-from-bottom-10 duration-1000">
                <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none drop-shadow-2xl">
                    {(() => {
                      if (selectedBet?.type === 'COLOR' && result.color === selectedBet.value) return 'Crystal Victory!';
                      if (selectedBet?.type === 'NUMBER' && result.value === selectedBet.value) return 'Perfect Strike!';
                      return 'Grid Failure';
                    })()}
                </h2>
                {(() => {
                  let won = false;
                  let mult = 0;
                  if (selectedBet?.type === 'COLOR' && result.color === selectedBet.value) {
                    won = true;
                    mult = selectedBet.value === 'GREEN' ? 14 : 2;
                  } else if (selectedBet?.type === 'NUMBER' && result.value === selectedBet.value) {
                    won = true;
                    mult = 14;
                  }

                  if (won) {
                    return (
                      <p className="text-cyan-400 font-black text-5xl mt-6 mono drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                          +${(betAmount * mult).toFixed(2)}
                      </p>
                    );
                  }
                  return null;
                })()}
            </div>
        )}
      </div>
    </div>
  );
};

export default Roulette;
