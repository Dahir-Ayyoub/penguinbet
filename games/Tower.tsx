
import React, { useState } from 'react';
import { ShieldCheck, Bomb, Trophy, ChevronUp, Mountain } from 'lucide-react';

interface TowerProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

const ROWS = 9;
const COLS = 3;

const Tower: React.FC<TowerProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'ENDED'>('IDLE');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [minePositions, setMinePositions] = useState<number[][]>([]);
  const [shake, setShake] = useState(false);

  const multipliers = [1.44, 2.16, 3.25, 4.87, 7.31, 10.96, 16.44, 24.66, 37.00];

  const startGame = () => {
    if (balance < betAmount) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (gameState === 'PLAYING') return;

    const newMines: number[][] = [];
    for(let i=0; i<ROWS; i++) {
      newMines.push([Math.floor(Math.random() * COLS)]);
    }
    
    onLoss(betAmount);
    setMinePositions(newMines);
    setHistory([]);
    setCurrentLevel(0);
    setGameState('PLAYING');
  };

  const pickTile = (index: number) => {
    if (gameState !== 'PLAYING') return;
    const isMine = minePositions[currentLevel].includes(index);
    setHistory(prev => [...prev, index]);

    if (isMine) {
      setGameState('ENDED');
    } else {
      const nextLevel = currentLevel + 1;
      if (nextLevel === ROWS) {
        onWin(betAmount * multipliers[ROWS - 1]);
        setGameState('ENDED');
      } else {
        setCurrentLevel(nextLevel);
      }
    }
  };

  const cashOut = () => {
    if (gameState === 'PLAYING' && currentLevel > 0) {
      onWin(betAmount * multipliers[currentLevel - 1]);
      setGameState('ENDED');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 w-full max-w-7xl mx-auto pb-32">
      <div className="w-full lg:w-96 space-y-8">
        <div className={`frost-glass rounded-[48px] p-10 border border-white/10 shadow-2xl space-y-10 relative transition-transform ${shake ? 'animate-bounce' : ''}`}>
          <div className="space-y-4 relative z-10">
             <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] block ml-1">Ascension Stake</label>
             <input 
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={gameState === 'PLAYING'}
              className="w-full bg-black/60 border-2 border-white/5 rounded-[28px] px-8 py-6 text-3xl font-black text-white focus:outline-none focus:border-purple-500/50 transition-all mono"
            />
          </div>

          {gameState !== 'PLAYING' ? (
            <button onClick={startGame} className="w-full py-7 bg-gradient-to-br from-purple-500 to-purple-800 text-white font-black text-2xl rounded-[32px] shadow-2xl active:scale-95 transition-all italic tracking-tighter">
              SCALE PEAK
            </button>
          ) : (
            <button onClick={cashOut} disabled={currentLevel === 0} className="w-full py-7 bg-gradient-to-br from-emerald-500 to-emerald-800 text-white font-black text-2xl rounded-[32px] shadow-2xl active:scale-95 disabled:opacity-50 transition-all flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Secure Peak Credits</span>
              <span className="mono text-3xl">${ (currentLevel > 0 ? betAmount * multipliers[currentLevel-1] : 0).toFixed(2) }</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-[#050507] rounded-[100px] border border-white/5 p-12 flex flex-col items-center justify-center min-h-[900px] relative overflow-hidden shadow-[inset_0_0_200px_rgba(0,0,0,1)]">
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Mountain className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-auto text-white" />
         </div>
         
         <div className="flex flex-col gap-4 w-full max-w-md relative z-10">
           {Array.from({ length: ROWS }).map((_, rIdx) => {
             const row = ROWS - 1 - rIdx;
             const isCurrent = row === currentLevel && gameState === 'PLAYING';
             const isLocked = row > currentLevel && gameState === 'PLAYING';
             const isPast = row < currentLevel || (gameState === 'ENDED' && row <= currentLevel);
             const userChoice = history[row];

             return (
               <div key={row} className={`grid grid-cols-3 gap-6 p-3 rounded-[32px] transition-all duration-700 ${isCurrent ? 'bg-purple-500/10 ring-2 ring-purple-500/40 scale-105' : ''} ${isLocked ? 'opacity-10' : ''}`}>
                 {[0, 1, 2].map(cIdx => {
                   const isMine = minePositions[row]?.includes(cIdx);
                   const isChoice = userChoice === cIdx;
                   const showContent = isPast || (gameState === 'ENDED' && isMine);

                   return (
                     <button
                       key={cIdx}
                       onClick={() => isCurrent && pickTile(cIdx)}
                       disabled={!isCurrent}
                       className={`h-24 rounded-[28px] border-2 flex items-center justify-center transition-all ${
                        isCurrent ? 'bg-zinc-900 border-white/10 hover:border-purple-500 hover:bg-purple-500/20 shadow-2xl' :
                        isChoice && isMine ? 'bg-red-500/20 border-red-500' :
                        isChoice && !isMine ? 'bg-emerald-500/10 border-emerald-500/50 shadow-2xl' :
                        'bg-zinc-950/40 border-white/5'
                       }`}
                     >
                        {showContent ? (
                          isMine ? <Bomb className="text-red-500 w-10 h-10" /> : <ShieldCheck className="text-emerald-500 w-10 h-10" />
                        ) : (
                          isCurrent ? <ChevronUp className="w-8 h-8 text-purple-500/40 animate-bounce" /> : null
                        )}
                     </button>
                   );
                 })}
               </div>
             );
           })}
         </div>
      </div>
    </div>
  );
};

export default Tower;
