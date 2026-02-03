
import React, { useState, useEffect, useRef } from 'react';
import { CircleDot, Trophy, Zap, Target, MousePointer2 } from 'lucide-react';

interface PoolProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

const Pool: React.FC<PoolProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [aimAngle, setAimAngle] = useState(0);
  const [power, setPower] = useState(50);
  const [isShooting, setIsShooting] = useState(false);
  const [cueBallPos, setCueBallPos] = useState({ x: 50, y: 75 });
  const [eightBallPos, setEightBallPos] = useState({ x: 50, y: 25 });

  const startMatch = () => {
    if (balance < betAmount) return;
    onLoss(betAmount);
    setGameState('PLAYING');
    setCueBallPos({ x: 50, y: 75 });
    setEightBallPos({ x: 45 + Math.random() * 10, y: 20 + Math.random() * 10 });
    setIsShooting(false);
  };

  const executeShot = () => {
    if (gameState !== 'PLAYING' || isShooting) return;
    setIsShooting(true);

    // Physics simulation: Success if angle is close to the 8-ball and power is decent
    const angleToTarget = Math.atan2(eightBallPos.x - cueBallPos.x, cueBallPos.y - eightBallPos.y) * (180 / Math.PI);
    const accuracy = Math.abs(aimAngle - angleToTarget);
    const win = accuracy < 5 && power > 40 && power < 90;

    setTimeout(() => {
        // Move cue ball
        setCueBallPos({ x: eightBallPos.x, y: eightBallPos.y + 5 });
        
        setTimeout(() => {
            if (win) {
                setEightBallPos({ x: 50, y: -10 }); // Sink it
                setTimeout(() => {
                    setGameState('WON');
                    onWin(betAmount * 4.5);
                }, 800);
            } else {
                setEightBallPos({ x: eightBallPos.x + (Math.random() - 0.5) * 40, y: eightBallPos.y - 10 });
                setTimeout(() => setGameState('LOST'), 800);
            }
        }, 300);
    }, 500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 w-full max-w-6xl mx-auto">
      <div className="w-full lg:w-96 space-y-8">
        <div className="frost-glass rounded-[40px] p-8 shadow-2xl space-y-8">
          <div className="space-y-4">
             <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Wager</label>
             <input 
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={gameState === 'PLAYING'}
              className="w-full bg-zinc-950 border border-white/5 rounded-3xl px-6 py-5 text-2xl font-black text-white focus:outline-none focus:ring-4 focus:ring-teal-500/20"
            />
          </div>

          <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-teal-400 uppercase tracking-widest">
                    <span>Aim Precision</span>
                    <span>{aimAngle}°</span>
                </div>
                <input 
                    type="range" min="-30" max="30" value={aimAngle}
                    onChange={(e) => setAimAngle(parseInt(e.target.value))}
                    disabled={isShooting || gameState !== 'PLAYING'}
                    className="w-full accent-teal-500 bg-zinc-900 h-2 rounded-lg appearance-none cursor-pointer"
                />
             </div>

             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-teal-400 uppercase tracking-widest">
                    <span>Shot Power</span>
                    <span>{power}%</span>
                </div>
                <input 
                    type="range" min="10" max="100" value={power}
                    onChange={(e) => setPower(parseInt(e.target.value))}
                    disabled={isShooting || gameState !== 'PLAYING'}
                    className="w-full accent-teal-500 bg-zinc-900 h-2 rounded-lg appearance-none cursor-pointer"
                />
             </div>
          </div>

          <button 
            onClick={gameState === 'PLAYING' ? executeShot : startMatch}
            disabled={isShooting}
            className="w-full py-6 bg-teal-600 hover:bg-teal-500 text-white font-black text-lg rounded-3xl shadow-2xl shadow-teal-600/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {gameState === 'PLAYING' ? (isShooting ? 'FOLLOWING BALL...' : 'TAKE THE SHOT') : 'START NEW RACK'}
            <Target className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 frost-glass rounded-[30px] border border-teal-500/20">
            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-2 text-center">Pro Tips</h4>
            <p className="text-[10px] text-slate-500 leading-tight">Pot the 8-Ball into the corner pocket for 4.5x returns. Avoid maximum power to maintain high precision.</p>
        </div>
      </div>

      <div className="flex-1 frost-glass rounded-[60px] p-8 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden group">
        {/* Pool Table Visual */}
        <div className="relative w-full max-w-[420px] aspect-[1/2] bg-[#0c2d27] rounded-[50px] border-[16px] border-[#1e1008] shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] p-4">
            {/* Pockets */}
            <div className="absolute top-0 left-0 w-12 h-12 bg-black rounded-br-3xl" />
            <div className="absolute top-0 right-0 w-12 h-12 bg-black rounded-bl-3xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-black rounded-tr-3xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-black rounded-tl-3xl" />

            {/* Target Ball */}
            <div 
                className="absolute w-10 h-10 bg-black rounded-full border-4 border-white shadow-2xl transition-all duration-700 ease-out flex items-center justify-center z-10"
                style={{ left: `${eightBallPos.x}%`, top: `${eightBallPos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black text-black">8</div>
            </div>

            {/* Cue Ball */}
            <div 
                className="absolute w-10 h-10 bg-white rounded-full shadow-2xl transition-all duration-500 ease-in-out z-20"
                style={{ left: `${cueBallPos.x}%`, top: `${cueBallPos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
                <div className="absolute top-1 left-1 w-2 h-2 bg-slate-300 rounded-full opacity-40" />
            </div>

            {/* Aiming Line */}
            {gameState === 'PLAYING' && !isShooting && (
                <div 
                    className="absolute z-0 origin-bottom w-0.5 h-[300px] bg-gradient-to-t from-teal-400 to-transparent dashed-border opacity-50"
                    style={{ 
                        left: `${cueBallPos.x}%`, 
                        bottom: '25%', 
                        transform: `translateX(-50%) rotate(${aimAngle}deg)` 
                    }}
                />
            )}
        </div>

        {gameState === 'WON' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center z-50 rounded-[60px] animate-in zoom-in duration-300">
             <Trophy className="w-24 h-24 text-teal-400 mb-6 drop-shadow-[0_0_40px_rgba(45,212,191,0.5)]" />
             <h2 className="text-7xl font-black text-white italic tracking-tighter">SUNK IT!</h2>
             <p className="text-emerald-400 text-3xl font-black mt-4 mono">+${(betAmount * 4.5).toFixed(2)}</p>
             <button onClick={() => setGameState('IDLE')} className="mt-10 px-12 py-5 bg-teal-600 hover:bg-teal-500 rounded-full font-black text-xl shadow-2xl transition-all">NEXT RACK</button>
          </div>
        )}

        {gameState === 'LOST' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-[60px] animate-in zoom-in duration-300">
             <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase">MISSED!</h2>
             <p className="text-red-400 text-2xl font-black mt-4">Shot went off target</p>
             <button onClick={() => setGameState('IDLE')} className="mt-10 px-12 py-5 bg-white/10 rounded-full font-black text-xl transition-all">TRY AGAIN</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pool;
