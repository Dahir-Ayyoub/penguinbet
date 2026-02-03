
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Trophy, RotateCcw, Zap } from 'lucide-react';

interface PingPongProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

const PADDLE_WIDTH = 100;
const BALL_SIZE = 20;

const PingPong: React.FC<PingPongProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'ENDED'>('IDLE');
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ballPos, setBallPos] = useState({ x: 50, y: 10 });
  const [ballVel, setBallVel] = useState({ x: 0.5, y: 0.5 });
  const [paddleX, setPaddleX] = useState(50);
  const requestRef = useRef<number>(0);

  const startGame = () => {
    if (balance < betAmount) return;
    onLoss(betAmount);
    setScore(0);
    setBallPos({ x: 50, y: 10 });
    setBallVel({ x: (Math.random() - 0.5) * 1.5, y: 1.2 });
    setGameState('PLAYING');
  };

  const update = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    setBallPos(prev => {
      let nx = prev.x + ballVel.x;
      let ny = prev.y + ballVel.y;
      let nvx = ballVel.x;
      let nvy = ballVel.y;

      // Wall Bounce
      if (nx <= 2 || nx >= 98) nvx *= -1;
      if (ny <= 2) nvy *= -1;

      // Paddle Bounce
      if (ny >= 92 && ny <= 95) {
        if (nx >= paddleX - 10 && nx <= paddleX + 10) {
          nvy = -Math.abs(nvy) * 1.1; // Speed up
          nvx += (nx - paddleX) * 0.2; // Add spin
          setScore(s => s + 1);
        }
      }

      // Lose
      if (ny > 100) {
        setGameState('ENDED');
        if (score > 5) onWin(betAmount * (1 + (score - 5) * 0.5));
        return prev;
      }

      setBallVel({ x: nvx, y: nvy });
      return { x: nx, y: ny };
    });

    requestRef.current = requestAnimationFrame(update);
  }, [gameState, ballVel, paddleX, score, betAmount, onWin]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, update]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'clientX' in e ? e.clientX : (e as React.TouchEvent).touches[0].clientX;
    const relX = ((x - rect.left) / rect.width) * 100;
    setPaddleX(Math.max(10, Math.min(90, relX)));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 w-full max-w-6xl mx-auto">
      <div className="w-full lg:w-96 space-y-8">
        <div className="bg-[#111116] border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8">
          <div className="space-y-4">
             <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Stake</label>
             <input 
              type="number" value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={gameState === 'PLAYING'}
              className="w-full bg-zinc-950 border border-white/5 rounded-3xl px-6 py-5 text-2xl font-black text-white focus:outline-none"
            />
          </div>
          {gameState !== 'PLAYING' && (
             <button onClick={startGame} className="w-full py-6 bg-teal-600 text-white font-black text-xl rounded-3xl shadow-2xl active:scale-95 transition-all">
                START VOLLEY
             </button>
          )}
          <div className="p-6 frost-glass rounded-[30px] border border-teal-500/20 text-center">
             <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Volleys</p>
             <p className="text-5xl font-black text-white mono">{score}</p>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        className="flex-1 bg-[#050507] rounded-[80px] border-8 border-white/5 relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,1)] cursor-none min-h-[600px]"
      >
         <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none" />
         
         {gameState === 'PLAYING' && (
           <>
              <div 
                className="absolute w-8 h-8 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.8)] z-10"
                style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%`, transform: 'translate(-50%, -50%)' }}
              />
              <div 
                className="absolute bottom-10 h-4 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.6)] z-20"
                style={{ left: `${paddleX}%`, width: `${PADDLE_WIDTH}px`, transform: 'translateX(-50%)' }}
              />
           </>
         )}

         {gameState === 'ENDED' && (
            <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in zoom-in duration-300">
               <Trophy className="w-24 h-24 text-teal-400 mb-6" />
               <h2 className="text-6xl font-black text-white italic tracking-tighter">VOLLEY OVER</h2>
               <p className="text-emerald-400 text-3xl font-black mt-4 uppercase tracking-widest">{score} Hits</p>
               <button onClick={() => setGameState('IDLE')} className="mt-12 px-12 py-5 bg-teal-600 rounded-full font-black text-xl transition-all active:scale-95">REDEEM</button>
            </div>
         )}
         
         {gameState === 'IDLE' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
               <span className="text-2xl font-black uppercase tracking-[0.8em] text-slate-700">Arctic Court Ready</span>
            </div>
         )}
      </div>
    </div>
  );
};

export default PingPong;
