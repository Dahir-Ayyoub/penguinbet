
import React, { useState, useRef } from 'react';
import { Disc, Zap, Trophy, RefreshCcw, Star, ChevronDown } from 'lucide-react';

interface WheelProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

const SECTORS = [
  { mult: 0, color: '#0f172a', label: 'MISS', textColor: '#475569' },
  { mult: 2, color: '#2563eb', label: '2x', textColor: '#ffffff' },
  { mult: 0, color: '#0f172a', label: 'MISS', textColor: '#475569' },
  { mult: 5, color: '#7c3aed', label: '5x', textColor: '#ffffff' },
  { mult: 0, color: '#0f172a', label: 'MISS', textColor: '#475569' },
  { mult: 1.5, color: '#3b82f6', label: '1.5x', textColor: '#ffffff' },
  { mult: 0, color: '#0f172a', label: 'MISS', textColor: '#475569' },
  { mult: 10, color: '#db2777', label: '10x', textColor: '#ffffff' },
  { mult: 0, color: '#0f172a', label: 'MISS', textColor: '#475569' },
  { mult: 2, color: '#2563eb', label: '2x', textColor: '#ffffff' },
  { mult: 0, color: '#0f172a', label: 'MISS', textColor: '#475569' },
  { mult: 50, color: '#eab308', label: 'JACKPOT', textColor: '#000000' },
  { mult: 0, color: '#0f172a', label: 'MISS', textColor: '#475569' },
  { mult: 1.5, color: '#3b82f6', label: '1.5x', textColor: '#ffffff' },
];

const Wheel: React.FC<WheelProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = () => {
    if (balance < betAmount || isSpinning) return;
    setIsSpinning(true);
    onLoss(betAmount);
    setResult(null);

    const extraSpins = 8 + Math.random() * 5;
    const sectorIndex = Math.floor(Math.random() * SECTORS.length);
    const sectorAngle = 360 / SECTORS.length;
    // We aim for the top (270 degrees in standard math or just offset)
    // To make sectorIndex land on top:
    const targetRotation = (extraSpins * 360) + (sectorIndex * sectorAngle);
    
    setRotation(prev => prev + targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      // Because we rotate the wheel clockwise, the sector at the TOP (0 degrees) is:
      // (360 - (finalRotation % 360)) / sectorAngle
      const finalRotation = (rotation + targetRotation) % 360;
      const actualSectorIndex = Math.floor(((360 - finalRotation) % 360) / sectorAngle);
      const finalSector = SECTORS[actualSectorIndex];
      
      setResult(finalSector.mult);
      if (finalSector.mult > 0) onWin(betAmount * finalSector.mult);
    }, 5000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 w-full max-w-7xl mx-auto items-center pb-32">
      <div className="w-full lg:w-96 space-y-8">
        <div className="frost-glass rounded-[48px] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/10 space-y-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="space-y-4 relative z-10">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] block ml-1">Wager Credits</label>
            <input 
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={isSpinning}
              className="w-full bg-black/60 border-2 border-white/5 rounded-[28px] px-8 py-6 text-3xl font-black text-white focus:outline-none focus:border-yellow-500/50 transition-all mono"
            />
          </div>

          <button 
            onClick={spinWheel}
            disabled={isSpinning}
            className="w-full py-7 bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-700 text-white font-black text-2xl rounded-[32px] shadow-[0_20px_40px_rgba(234,179,8,0.3)] active:scale-95 transition-all flex items-center justify-center gap-4 relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10 italic tracking-tighter">
              {isSpinning ? 'SPINNING...' : 'IGNITE THE WHEEL'}
            </span>
            <RefreshCcw className={`w-8 h-8 relative z-10 ${isSpinning ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="frost-glass rounded-[40px] p-8 border border-white/5 bg-gradient-to-tr from-white/[0.04] to-transparent">
           <div className="flex items-center gap-3 text-yellow-400 mb-6 px-2">
              <Star className="w-6 h-6 fill-current animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em]">Jackpot Odds</span>
           </div>
           <div className="grid grid-cols-2 gap-3">
              {[1.5, 2, 5, 10, 50].map(m => (
                <div key={m} className={`p-5 rounded-[24px] border border-white/5 text-center transition-all hover:scale-105 ${m === 50 ? 'bg-yellow-500/20 border-yellow-500/40 shadow-[0_0_25px_rgba(234,179,8,0.2)]' : 'bg-black/40'}`}>
                   <span className={`font-black text-2xl mono ${m === 50 ? 'text-yellow-400' : 'text-slate-300'}`}>{m}x</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="flex-1 bg-[#050507] rounded-[100px] border border-white/5 p-16 flex flex-col items-center justify-center min-h-[850px] relative shadow-[inset_0_0_250px_rgba(0,0,0,1)] overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent_70%)] pointer-events-none" />
         
         {/* Pointer / Needle */}
         <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
            <div className="w-12 h-16 bg-white shadow-[0_0_40px_rgba(255,255,255,0.6)] relative" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}>
               <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-300" />
            </div>
            <div className="w-4 h-4 bg-yellow-500 rounded-full blur-md animate-ping absolute -top-2" />
         </div>

         <div className="relative group">
           {/* Wheel Outer Glow */}
           <div className={`absolute -inset-10 rounded-full transition-all duration-1000 ${isSpinning ? 'bg-yellow-500/10 blur-[80px]' : 'bg-transparent'}`} />
           
           <div 
             ref={wheelRef}
             style={{ 
               transform: `rotate(${rotation}deg)`,
               transition: isSpinning ? 'transform 5s cubic-bezier(0.15, 0, 0.1, 1)' : 'none'
             }}
             className={`relative w-[340px] h-[340px] md:w-[640px] md:h-[640px] rounded-full border-[16px] border-[#0d0d12] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden transition-all`}
           >
             <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
               {SECTORS.map((s, i) => {
                 const angle = 360 / SECTORS.length;
                 const startAngle = i * angle;
                 const endAngle = (i + 1) * angle;
                 
                 const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                 const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                 const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                 const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                 
                 const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                 
                 return (
                   <g key={i}>
                     <path 
                       d={pathData} 
                       fill={s.color} 
                       stroke="#000" 
                       strokeWidth="0.2"
                       className="transition-colors duration-500"
                     />
                     <text
                        x="78"
                        y="50"
                        fill={s.textColor}
                        className="text-[4px] font-black tracking-tighter"
                        style={{ 
                          transformOrigin: '50px 50px',
                          transform: `rotate(${startAngle + angle / 2}deg)` 
                        }}
                        textAnchor="middle"
                        dominantBaseline="middle"
                     >
                        {s.label}
                     </text>
                   </g>
                 );
               })}
             </svg>

             {/* Inner Ring shadow */}
             <div className="absolute inset-0 rounded-full shadow-[inset_0_0_100px_rgba(0,0,0,0.6)] pointer-events-none" />
           </div>

           {/* Center Hub */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-56 md:h-56 bg-[#0d0d12] rounded-full border-[12px] border-[#16161d] shadow-[0_0_60px_rgba(0,0,0,1)] flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-full" />
              <Disc className={`w-24 h-24 md:w-32 md:h-32 text-yellow-500/80 ${isSpinning ? 'animate-spin-slow' : 'animate-pulse'}`} />
              <div className="absolute inset-0 rounded-full border-4 border-white/5" />
           </div>
         </div>

         {result !== null && !isSpinning && (
           <div className="mt-20 text-center animate-in zoom-in-75 duration-700">
             {result > 0 ? (
               <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mb-10 shadow-[0_0_80px_rgba(234,179,8,0.5)] animate-bounce">
                    <Trophy className="text-white w-16 h-16 drop-shadow-lg" />
                  </div>
                  <h2 className="text-8xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">MEGA PAYOUT!</h2>
                  <p className="text-yellow-400 font-black text-7xl mt-8 mono drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]">+${(betAmount * result).toFixed(2)}</p>
               </div>
             ) : (
               <div className="flex flex-col items-center opacity-40 group">
                  <div className="p-6 bg-white/5 rounded-full border border-white/10 mb-6 group-hover:scale-110 transition-transform">
                     <Star className="w-12 h-12 text-slate-600" />
                  </div>
                  <h2 className="text-5xl font-black text-slate-500 uppercase tracking-tighter">FROZEN STREAK</h2>
                  <p className="text-slate-600 font-bold uppercase tracking-[0.6em] text-xs mt-4">The Arctic claims your wager</p>
               </div>
             )}
           </div>
         )}
      </div>
    </div>
  );
};

export default Wheel;
