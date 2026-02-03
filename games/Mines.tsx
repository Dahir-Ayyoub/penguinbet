
import React, { useState, useCallback } from 'react';
import { Bomb, Trophy, Zap, Snowflake } from 'lucide-react';

interface MinesProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

const GRID_SIZE = 25;

const IceBlock = ({ state, isMine, isRevealed, onClick }: { 
  state: 'IDLE' | 'PLAYING' | 'ENDED', 
  isMine: boolean, 
  isRevealed: boolean, 
  onClick: () => void 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={state !== 'PLAYING' || isRevealed}
      className={`relative aspect-square rounded-2xl transition-all duration-300 transform border-2 group overflow-hidden
        ${isRevealed 
          ? (isMine ? 'bg-red-600 border-red-400 scale-95 rotate-3' : 'bg-emerald-500/20 border-emerald-500/50 scale-90') 
          : 'bg-white/5 border-white/10 hover:border-blue-400 hover:-translate-y-1 shadow-xl'
        }
        ${state === 'ENDED' && isMine && !isRevealed ? 'bg-red-900/40 border-red-500/40' : ''}
      `}
    >
      {isRevealed && !isMine && (
        <div className="flex items-center justify-center animate-in zoom-in-50 duration-300">
          <div className="w-8 h-8 bg-blue-400 rounded-full blur-md absolute opacity-50" />
          <Snowflake className="text-blue-300 w-8 h-8 relative z-10 animate-pulse" />
        </div>
      )}
      
      {/* THE BOMB REVEAL LOGIC */}
      {(isRevealed && isMine) || (state === 'ENDED' && isMine) ? (
        <div className={`flex items-center justify-center ${isRevealed ? 'animate-bounce' : 'opacity-40'}`}>
          <div className="w-12 h-12 bg-red-500 rounded-full blur-xl absolute opacity-40" />
          <Bomb className={`w-10 h-10 ${isRevealed ? 'text-white' : 'text-red-500'}`} />
        </div>
      ) : null}

      {!isRevealed && state === 'PLAYING' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:from-white/20" />
      )}
    </button>
  );
};

const Mines: React.FC<MinesProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'ENDED'>('IDLE');
  const [mines, setMines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [shake, setShake] = useState(false);

  const calculateMultiplier = (revealedCount: number) => {
    let mult = 1;
    for (let i = 0; i < revealedCount; i++) {
      mult *= (GRID_SIZE - i) / (GRID_SIZE - i - mineCount);
    }
    return parseFloat((mult * 0.98).toFixed(2)); // 2% House Edge
  };

  const startGame = () => {
    if (balance < betAmount) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    // Set seed for mines
    const newMines: number[] = [];
    while (newMines.length < mineCount) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      if (!newMines.includes(r)) newMines.push(r);
    }

    onLoss(betAmount);
    setMines(newMines);
    setRevealed([]);
    setGameState('PLAYING');
  };

  const handleReveal = (idx: number) => {
    if (gameState !== 'PLAYING' || revealed.includes(idx)) return;

    if (mines.includes(idx)) {
      setRevealed(prev => [...prev, idx]);
      setGameState('ENDED');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } else {
      setRevealed(prev => [...prev, idx]);
    }
  };

  const cashOut = () => {
    if (gameState !== 'PLAYING' || revealed.length === 0) return;
    const mult = calculateMultiplier(revealed.length);
    onWin(betAmount * mult);
    setGameState('ENDED');
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-12 w-full max-w-7xl mx-auto pb-32 transition-transform ${shake ? 'animate-shake' : ''}`}>
      <div className="w-full lg:w-96 space-y-8">
        <div className="frost-glass rounded-[48px] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] block ml-1">Wager Amount</label>
            <div className="relative">
              <input 
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                disabled={gameState === 'PLAYING'}
                className="w-full bg-black/40 border-2 border-white/5 rounded-[28px] px-8 py-6 text-3xl font-black text-white focus:border-blue-500/40 transition-all mono"
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 font-black">$</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] block ml-1">Risk Factor (Mines)</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setMineCount(n)}
                  disabled={gameState === 'PLAYING'}
                  className={`py-4 rounded-2xl font-black transition-all ${mineCount === n ? 'bg-blue-600 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {gameState !== 'PLAYING' ? (
            <button 
              onClick={startGame}
              className={`w-full py-8 text-white font-black text-2xl rounded-[32px] shadow-2xl transition-all active:scale-95 bg-gradient-to-br from-blue-500 to-indigo-700`}
            >
              INITIALIZE MINES
            </button>
          ) : (
            <button 
              onClick={cashOut}
              className="w-full py-8 bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-2xl rounded-[32px] shadow-2xl active:scale-95 flex flex-col items-center"
            >
              <span className="text-[10px] uppercase tracking-widest opacity-60">Collect Profits</span>
              <span className="mono">${(betAmount * calculateMultiplier(revealed.length)).toFixed(2)}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 frost-glass rounded-[80px] p-8 md:p-16 flex flex-col items-center justify-center relative shadow-[inset_0_0_150px_rgba(0,0,0,1)] border border-white/5">
        <div className="grid grid-cols-5 gap-4 w-full max-w-[600px] aspect-square">
          {Array.from({ length: GRID_SIZE }).map((_, i) => (
            <IceBlock 
              key={i}
              state={gameState}
              isMine={mines.includes(i)}
              isRevealed={revealed.includes(i)}
              onClick={() => handleReveal(i)}
            />
          ))}
        </div>

        {gameState === 'ENDED' && (
          <div className="mt-12 text-center animate-in slide-in-from-bottom-5 duration-700">
            <h2 className={`text-6xl font-black italic tracking-tighter uppercase ${revealed.some(r => mines.includes(r)) ? 'text-red-500' : 'text-emerald-400'}`}>
              {revealed.some(r => mines.includes(r)) ? 'SYSTEM BREACHED' : 'EXTRACTION COMPLETE'}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mines;
