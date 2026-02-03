
import React, { useState, useRef, useEffect } from 'react';
import { Star, Snowflake, Shield, Zap } from 'lucide-react';

interface ShellGameProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

const RunicCup = ({ state, isRevealed, isSelected }: { state: string, isRevealed: boolean, isSelected: boolean }) => (
  <div className={`relative transition-all duration-700 ${isRevealed ? '-translate-y-48 rotate-12' : ''} ${isSelected ? 'scale-110 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]' : ''}`}>
    <div className="w-48 h-64 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-[#0d0d12] to-blue-950 rounded-t-[80px] border-4 border-blue-500/40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Shield className="w-16 h-16 text-blue-500/20 animate-pulse" />
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-2 bg-blue-500/40 rounded-full shadow-[0_0_20px_rgba(59,130,246,1)]" />
    </div>
  </div>
);

const ShellGame: React.FC<ShellGameProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<'IDLE' | 'SHUFFLING' | 'PICKING' | 'REVEALED'>('IDLE');
  const [ballPosition, setBallPosition] = useState(1);
  const [selectedShell, setSelectedShell] = useState<number | null>(null);
  const [offsets, setOffsets] = useState([0, 1, 2]);
  const [shake, setShake] = useState(false);

  const startShuffle = () => {
    if (balance < betAmount) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    setGameState('SHUFFLING');
    setSelectedShell(null);
    onLoss(betAmount);
    
    // Choose actual ball position
    const actualPos = Math.floor(Math.random() * 3);
    setBallPosition(actualPos);

    let count = 0;
    const interval = setInterval(() => {
      setOffsets(prev => {
        const next = [...prev];
        const i1 = Math.floor(Math.random() * 3);
        let i2 = Math.floor(Math.random() * 3);
        while(i1 === i2) i2 = Math.floor(Math.random() * 3);
        [next[i1], next[i2]] = [next[i2], next[i1]];
        return next;
      });
      count++;
      if (count >= 15) {
        clearInterval(interval);
        setGameState('PICKING');
      }
    }, 250);
  };

  const selectShell = (index: number) => {
    if (gameState !== 'PICKING') return;
    setSelectedShell(index);
    setGameState('REVEALED');
    if (index === ballPosition) onWin(betAmount * 2.8);
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-12 w-full max-w-7xl mx-auto pb-32 ${shake ? 'animate-shake' : ''}`}>
      <div className="w-full lg:w-96 space-y-8">
        <div className="frost-glass rounded-[48px] p-10 shadow-2xl border border-white/10 space-y-10 relative overflow-hidden">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] block">Wager Amount</label>
            <input 
              type="number" value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={gameState === 'SHUFFLING' || gameState === 'PICKING'}
              className="w-full bg-black/40 border-2 border-white/5 rounded-[28px] px-8 py-6 text-3xl font-black text-white focus:border-blue-500/40 transition-all mono"
            />
          </div>
          <button 
            onClick={startShuffle} 
            disabled={gameState === 'SHUFFLING' || gameState === 'PICKING'} 
            className="w-full py-8 bg-gradient-to-br from-blue-500 to-indigo-700 text-white font-black text-2xl rounded-[32px] shadow-2xl active:scale-95 disabled:opacity-40"
          >
            {gameState === 'REVEALED' ? 'RETRY SHUFFLE' : 'START SHUFFLE'}
          </button>
        </div>

        <div className="p-10 frost-glass rounded-[40px] border border-blue-500/20 text-center flex flex-col items-center">
            <Zap className="w-10 h-10 text-blue-400 mb-4 animate-pulse" />
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Payout Potential</p>
            <p className="text-6xl font-black text-white italic mono">2.80x</p>
        </div>
      </div>

      <div className="flex-1 bg-[#050507] rounded-[120px] border border-white/5 flex flex-col items-center justify-center min-h-[750px] relative overflow-hidden shadow-[inset_0_0_200px_rgba(0,0,0,1)]">
        <div className="absolute inset-x-0 bottom-40 h-[100px] bg-blue-500/5 blur-[80px]" />
        
        <div className="relative w-full max-w-5xl h-[400px]">
          {[0, 1, 2].map((i) => {
            const isTarget = i === ballPosition;
            const isRevealed = gameState === 'REVEALED';
            const offsetIdx = offsets.indexOf(i);
            const leftPos = offsetIdx * 33.33 + 16.66;

            return (
              <div 
                key={i} 
                onClick={() => selectShell(i)} 
                style={{ left: `${leftPos}%` }} 
                className={`absolute bottom-0 -translate-x-1/2 flex flex-col items-center cursor-pointer transition-all duration-[400ms] ${gameState === 'PICKING' ? 'hover:-translate-y-8' : ''}`}
              >
                <div className="relative z-10">
                  <RunicCup state={gameState} isRevealed={isRevealed} isSelected={selectedShell === i} />
                </div>
                
                <div className={`absolute bottom-4 z-0 transition-all duration-700 ${isTarget && (isRevealed || gameState === 'IDLE') ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                   <div className="w-20 h-20 bg-blue-400 rounded-full shadow-[0_0_50px_rgba(96,165,250,1)] flex items-center justify-center border-4 border-white">
                      <Star className="text-white fill-current w-10 h-10" />
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {gameState === 'PICKING' && (
          <div className="mt-20 animate-bounce">
            <span className="text-white font-black text-5xl uppercase italic tracking-widest text-center block">LOCATE THE CRYSTAL</span>
          </div>
        )}
        
        {gameState === 'REVEALED' && (
          <div className="mt-20 text-center animate-in zoom-in duration-500">
             <h3 className={`text-7xl font-black italic tracking-tighter uppercase ${selectedShell === ballPosition ? 'text-emerald-400' : 'text-red-500'}`}>
                {selectedShell === ballPosition ? 'EYE OF THE ARCTIC' : 'ILLUSION BREACH'}
             </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShellGame;
