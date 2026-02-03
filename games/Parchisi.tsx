
import React, { useState, useEffect } from 'react';
import { Dices, Trophy, Zap, Star, Compass, User } from 'lucide-react';

interface ParchisiProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

const Parchisi: React.FC<ParchisiProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [isRolling, setIsRolling] = useState(false);
  const [dice, setDice] = useState([1, 1]);
  const [positions, setPositions] = useState({ player: 0, ai: 0 });
  const [turn, setTurn] = useState<'PLAYER' | 'AI'>('PLAYER');

  const WIN_SCORE = 50;

  const startMatch = () => {
    if (balance < betAmount) return;
    onLoss(betAmount);
    setPositions({ player: 0, ai: 0 });
    setGameState('PLAYING');
    setTurn('PLAYER');
  };

  const handleRoll = () => {
    if (isRolling || turn !== 'PLAYER' || gameState !== 'PLAYING') return;
    setIsRolling(true);
    
    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDice([d1, d2]);
      setIsRolling(false);
      
      const move = d1 + d2;
      const nextPos = positions.player + move;
      
      if (nextPos >= WIN_SCORE) {
        setGameState('WON');
        onWin(betAmount * 6);
      } else {
        setPositions(prev => ({ ...prev, player: nextPos }));
        setTurn('AI');
      }
    }, 800);
  };

  useEffect(() => {
    if (turn === 'AI' && gameState === 'PLAYING') {
      const timer = setTimeout(() => {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDice([d1, d2]);
        const nextPos = positions.ai + d1 + d2;
        
        if (nextPos >= WIN_SCORE) setGameState('LOST');
        else {
          setPositions(prev => ({ ...prev, ai: nextPos }));
          setTurn('PLAYER');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, gameState]);

  return (
    <div className="flex flex-col lg:flex-row gap-12 w-full max-w-6xl mx-auto">
      <div className="w-full lg:w-96 space-y-8">
        <div className="frost-glass rounded-[40px] p-8 shadow-2xl space-y-8">
          <div className="space-y-4">
             <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Table Wager</label>
             <input 
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={gameState === 'PLAYING'}
              className="w-full bg-zinc-950 border border-white/5 rounded-3xl px-6 py-5 text-2xl font-black text-white focus:outline-none focus:ring-4 focus:ring-red-500/20"
            />
          </div>

          <div className="flex gap-4 justify-center">
            {dice.map((d, i) => (
              <div key={i} className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl font-black text-red-600 shadow-2xl transition-all ${isRolling ? 'animate-bounce' : ''}`}>
                {d}
              </div>
            ))}
          </div>

          <button 
            onClick={gameState === 'PLAYING' ? handleRoll : startMatch}
            disabled={isRolling || (turn === 'AI' && gameState === 'PLAYING')}
            className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-3xl shadow-2xl shadow-red-600/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {gameState === 'PLAYING' ? (isRolling ? 'SHAKING...' : 'ROLL DICES') : 'ENTER ARCTIC STAR'}
            <Dices className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 frost-glass rounded-[30px] border border-red-500/20 text-center">
             <div className="flex justify-between items-center px-4">
                <div className="text-center">
                    <p className="text-xs font-black text-red-500 uppercase">You</p>
                    <p className="text-2xl font-black text-white">{positions.player}</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                    <p className="text-xs font-black text-slate-500 uppercase">AI</p>
                    <p className="text-2xl font-black text-white">{positions.ai}</p>
                </div>
             </div>
        </div>
      </div>

      <div className="flex-1 frost-glass rounded-[60px] p-12 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
        {/* Parchisi Star Board */}
        <div className="relative w-full max-w-[500px] aspect-square bg-[#050507] border-8 border-slate-800 rounded-3xl p-4 shadow-2xl flex items-center justify-center">
            {/* Center Star */}
            <div className="absolute w-[25%] h-[25%] bg-gradient-to-br from-red-500 to-red-700 rounded-full border-4 border-white/20 flex items-center justify-center z-10 animate-pulse">
                <Star className="text-white w-12 h-12 fill-current" />
            </div>

            {/* Path visualization */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10">
                <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
                <rect x="45" y="10" width="10" height="80" fill="white" />
                <rect x="10" y="45" width="80" height="10" fill="white" />
            </svg>

            {/* Player Token */}
            <div 
                className="absolute transition-all duration-700 ease-in-out z-20"
                style={{ 
                    transform: `rotate(${(positions.player / WIN_SCORE) * 360}deg) translateY(-180px) rotate(-${(positions.player / WIN_SCORE) * 360}deg)`
                }}
            >
                <div className="w-12 h-12 bg-red-600 rounded-2xl border-4 border-white shadow-[0_0_20px_rgba(239,68,68,0.8)] flex items-center justify-center">
                    <User className="text-white w-6 h-6" />
                </div>
            </div>

            {/* AI Token */}
            <div 
                className="absolute transition-all duration-700 ease-in-out z-20"
                style={{ 
                    transform: `rotate(${(positions.ai / WIN_SCORE) * 360 + 180}deg) translateY(-180px) rotate(-${(positions.ai / WIN_SCORE) * 360 + 180}deg)`
                }}
            >
                <div className="w-10 h-10 bg-slate-700 rounded-2xl border-4 border-white/40 shadow-2xl flex items-center justify-center">
                    <Compass className="text-white w-5 h-5" />
                </div>
            </div>
            
            <div className="absolute bottom-8 text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Arctic Star Circuit</div>
        </div>

        {gameState === 'WON' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center z-50 rounded-[60px] animate-in zoom-in duration-300">
             <Trophy className="w-24 h-24 text-yellow-500 mb-6 drop-shadow-[0_0_40px_rgba(234,179,8,0.5)]" />
             <h2 className="text-7xl font-black text-white italic tracking-tighter">STAR WINNER!</h2>
             <p className="text-emerald-400 text-3xl font-black mt-4 mono">+${(betAmount * 6).toFixed(2)}</p>
             <button onClick={() => setGameState('IDLE')} className="mt-10 px-12 py-5 bg-red-600 hover:bg-red-500 rounded-full font-black text-xl shadow-2xl transition-all">PLAY AGAIN</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Parchisi;
