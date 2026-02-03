
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MoveUp, Zap, Trophy, History, RefreshCw, AlertCircle, Snowflake, Fish, Truck, ChevronLeft, ChevronRight, Waves, Timer } from 'lucide-react';

interface CrossingProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

type LaneType = 'ICE_ROAD' | 'FREEZING_RIVER' | 'GLACIER_CRACK' | 'SAFE_SNOW';

interface Obstacle {
  id: number;
  x: number;
  width: number;
  speed: number;
  type?: string;
}

interface LaneData {
  id: number;
  type: LaneType;
  multiplier: number;
  obstacles: Obstacle[];
  direction: 1 | -1;
  difficulty: number;
}

const TOTAL_LANES = 15;
const PENGUIN_SIZE = 38;

const MULTIPLIERS = [
  1.00, 1.15, 1.35, 1.60, 1.95, 2.40, 3.00, 3.80, 4.90, 6.40, 8.50, 11.50, 15.80, 22.00, 31.50, 45.00
];

const ArcticCrossing: React.FC<CrossingProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'CRASHED' | 'FINISHED'>('IDLE');
  const [currentRow, setCurrentRow] = useState(0);
  const [penguinX, setPenguinX] = useState(50); // percentage
  const [lanes, setLanes] = useState<LaneData[]>([]);
  const [shake, setShake] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  const arenaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  // Procedural Lane Generator
  const initLanes = useCallback(() => {
    const newLanes: LaneData[] = [];
    for (let i = 0; i <= TOTAL_LANES; i++) {
      let type: LaneType = 'SAFE_SNOW';
      if (i > 0 && i < TOTAL_LANES) {
        const rand = Math.random();
        if (rand < 0.4) type = 'ICE_ROAD';
        else if (rand < 0.8) type = 'FREEZING_RIVER';
        else type = 'GLACIER_CRACK';
      }
      
      const difficulty = 1 + (i * 0.15);
      const speed = (0.04 + Math.random() * 0.12) * difficulty;
      const direction = Math.random() > 0.5 ? 1 : -1;
      
      const obstacles: Obstacle[] = [];
      if (type !== 'SAFE_SNOW') {
        const count = type === 'FREEZING_RIVER' ? 3 : 2;
        const spacing = 100 / count;
        for (let j = 0; j < count; j++) {
          obstacles.push({
            id: j,
            x: j * spacing + (Math.random() * 10),
            width: type === 'FREEZING_RIVER' ? 22 : 12,
            speed
          });
        }
      }

      newLanes.push({
        id: i,
        type,
        multiplier: MULTIPLIERS[i],
        obstacles,
        direction: direction as 1 | -1,
        difficulty
      });
    }
    setLanes(newLanes);
  }, []);

  useEffect(() => {
    initLanes();
  }, [initLanes]);

  // Main Loop
  const updateObstacles = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    setLanes(prevLanes => prevLanes.map(lane => {
      if (lane.type === 'SAFE_SNOW') return lane;
      return {
        ...lane,
        obstacles: lane.obstacles.map(obs => {
          let newX = obs.x + (obs.speed * lane.direction * 4);
          if (newX > 115) newX = -25;
          if (newX < -25) newX = 115;
          return { ...obs, x: newX };
        })
      };
    }));

    // Detailed Collision Detection
    const activeLane = lanes[currentRow];
    if (activeLane && activeLane.type !== 'SAFE_SNOW') {
      const hit = activeLane.obstacles.some(obs => {
        const obsStart = obs.x;
        const obsEnd = obs.x + obs.width;
        const pengStart = penguinX - 4;
        const pengEnd = penguinX + 4;
        
        const isOverlapping = (pengStart < obsEnd && pengEnd > obsStart);
        
        // Logical check based on lane mechanics
        if (activeLane.type === 'FREEZING_RIVER') {
          // In river, you must stay ON the ice floe obstacles
          return !isOverlapping;
        } else {
          // On roads/cracks, you must AVOID the obstacles
          return isOverlapping;
        }
      });

      if (hit) {
        setGameState('CRASHED');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else if (activeLane.type === 'FREEZING_RIVER') {
        // Penguin drifts with the ice floe
        const driftSpeed = activeLane.obstacles[0].speed * activeLane.direction * 4;
        setPenguinX(px => Math.min(96, Math.max(4, px + driftSpeed)));
      }
    }

    requestRef.current = requestAnimationFrame(updateObstacles);
  }, [gameState, currentRow, lanes, penguinX]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateObstacles);
    return () => cancelAnimationFrame(requestRef.current);
  }, [updateObstacles]);

  // Smooth Auto-Scroll Logic
  useEffect(() => {
    if (arenaRef.current) {
      const scrollTarget = currentRow * 70; // 70 is lane height + padding
      arenaRef.current.scrollTo({
        top: arenaRef.current.scrollHeight - (scrollTarget + 500),
        behavior: 'smooth'
      });
    }
  }, [currentRow]);

  const startGame = () => {
    if (balance < betAmount) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onLoss(betAmount);
    initLanes();
    setCurrentRow(0);
    setPenguinX(50);
    setGameState('PLAYING');
  };

  const moveForward = () => {
    if (gameState !== 'PLAYING') return;
    const nextRow = currentRow + 1;
    setCurrentRow(nextRow);
    if (nextRow > highScore) setHighScore(nextRow);
    
    if (nextRow === TOTAL_LANES) {
      onWin(betAmount * MULTIPLIERS[TOTAL_LANES]);
      setGameState('FINISHED');
    }
  };

  const cashOut = () => {
    if (gameState !== 'PLAYING' || currentRow === 0) return;
    onWin(betAmount * MULTIPLIERS[currentRow]);
    setGameState('FINISHED');
  };

  const moveSideways = (dir: number) => {
    if (gameState !== 'PLAYING') return;
    setPenguinX(px => Math.min(92, Math.max(8, px + dir)));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        e.preventDefault();
        moveForward();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') moveSideways(-6);
      if (e.key === 'ArrowRight' || e.key === 'd') moveSideways(6);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, currentRow]);

  return (
    <div className={`flex flex-col lg:flex-row gap-8 w-full max-w-[1400px] mx-auto pb-32 transition-transform ${shake ? 'animate-shake' : ''}`}>
      
      {/* Enhanced Sidebar Controls */}
      <div className="w-full lg:w-[380px] space-y-4">
        <div className="bg-[#1a1c22] rounded-3xl overflow-hidden border border-white/5 shadow-2xl p-6 space-y-6 relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Snowflake className="w-24 h-24 text-sky-500" />
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Arctic Expedition</span>
            <MoveUp className="w-4 h-4 text-sky-400" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Wager Credits</label>
            <div className="relative group">
              <input 
                type="number" value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                disabled={gameState === 'PLAYING'}
                className="w-full bg-[#0f1115] border-2 border-white/5 rounded-2xl px-6 py-5 text-2xl font-black text-white focus:outline-none focus:border-sky-500/30 transition-all mono shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                <button onClick={() => setBetAmount(Math.max(1, Math.floor(betAmount / 2)))} className="px-3 py-2 bg-[#2f323a] text-[10px] font-black rounded-xl hover:bg-white/5">1/2</button>
                <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-2 bg-[#2f323a] text-[10px] font-black rounded-xl hover:bg-white/5">2x</button>
              </div>
            </div>
          </div>

          {/* Real-time Multiplier Stat Card */}
          <div className="bg-[#0f1115] p-5 rounded-[28px] border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                <Timer className="w-8 h-8 text-sky-400" />
             </div>
             <div className="flex justify-between items-end mb-3">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Current Payout</span>
                  <span className="text-4xl font-black text-white italic tracking-tighter mono">
                    {MULTIPLIERS[currentRow].toFixed(2)}x
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-sky-500 uppercase block">Next</span>
                  <span className="text-lg font-black text-slate-400 mono">
                    {MULTIPLIERS[Math.min(currentRow + 1, TOTAL_LANES)].toFixed(2)}x
                  </span>
                </div>
             </div>
             <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 transition-all duration-500 shadow-[0_0_20px_rgba(14,165,233,0.6)]" 
                  style={{ width: `${(currentRow / TOTAL_LANES) * 100}%` }}
                />
             </div>
          </div>

          {gameState === 'IDLE' || gameState === 'CRASHED' || gameState === 'FINISHED' ? (
            <button 
              onClick={startGame}
              className="w-full py-6 bg-sky-600 hover:bg-sky-500 text-white font-black text-xl rounded-2xl shadow-xl active:scale-95 transition-all uppercase italic tracking-tighter flex items-center justify-center gap-3 group"
            >
              Start New Trek
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          ) : (
            <div className="space-y-3">
              <button 
                onClick={moveForward}
                className="w-full py-7 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-2xl rounded-2xl shadow-2xl active:scale-95 flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <MoveUp className="w-7 h-7 group-hover:-translate-y-1 transition-transform relative z-10" />
                <span className="text-[10px] uppercase tracking-widest opacity-80 relative z-10">Ascend</span>
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => moveSideways(-8)} className="py-4 bg-[#2f323a] hover:bg-[#3f434d] rounded-2xl flex items-center justify-center transition-all active:scale-90">
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button onClick={() => moveSideways(8)} className="py-4 bg-[#2f323a] hover:bg-[#3f434d] rounded-2xl flex items-center justify-center transition-all active:scale-90">
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>

              <button 
                onClick={cashOut}
                disabled={currentRow === 0}
                className="w-full py-5 border-2 border-sky-500/30 text-sky-400 font-black text-sm rounded-2xl hover:bg-sky-500/10 transition-all uppercase tracking-[0.2em] disabled:opacity-30 disabled:grayscale"
              >
                Collect ${ (betAmount * MULTIPLIERS[currentRow]).toFixed(2) }
              </button>
            </div>
          )}
        </div>

        {/* Tactical Info Logs */}
        <div className="bg-[#1a1c22] rounded-3xl p-6 border border-white/5 space-y-4 shadow-xl relative overflow-hidden">
           <div className="flex items-center gap-2 text-sky-400 border-b border-white/5 pb-3">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-widest">Tactical HUD</span>
           </div>
           <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-bold uppercase">Personal Best</span>
                <span className="text-white font-black mono">{highScore} Lanes</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-bold uppercase">Difficulty</span>
                <span className="text-orange-400 font-black mono">Tier {Math.floor(currentRow / 3) + 1}</span>
              </div>
           </div>
           <p className="text-[10px] text-slate-600 leading-relaxed font-medium mt-4 pt-4 border-t border-white/5 italic">
             "Stay on the white blocks in water. Dodge the red sleds on ice."
           </p>
        </div>
      </div>

      {/* Main Game Arena - Scrollable */}
      <div 
        ref={arenaRef}
        className="flex-1 bg-[#050507] rounded-[48px] border border-white/5 p-4 flex flex-col items-center relative h-[850px] shadow-[inset_0_0_150px_rgba(0,0,0,1)] overflow-y-auto scroll-smooth custom-scrollbar"
      >
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none z-40" />
        
        {/* The procedurally generated world */}
        <div className="relative w-full max-w-4xl flex flex-col-reverse py-[100px]">
          {lanes.map((lane, idx) => (
            <div 
              key={lane.id}
              className={`relative h-[70px] w-full flex items-center transition-all duration-700 ${
                idx < currentRow ? 'grayscale-[0.8] opacity-30 scale-[0.98]' : 'grayscale-0 opacity-100'
              } ${
                lane.type === 'FREEZING_RIVER' ? 'bg-[#081a2b]' : 
                lane.type === 'ICE_ROAD' ? 'bg-[#0a0a14]' : 
                lane.type === 'GLACIER_CRACK' ? 'bg-[#0d0d1a]' : 
                'bg-white/[0.03]'
              } border-t border-white/5`}
            >
              {/* Lane Aesthetics */}
              {lane.type === 'FREEZING_RIVER' && (
                <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                   <div className="w-[200%] h-full flex animate-waves">
                      <Waves className="w-12 h-12 text-sky-400" />
                      <Waves className="w-12 h-12 text-sky-400 ml-4" />
                      <Waves className="w-12 h-12 text-sky-400 ml-4" />
                   </div>
                </div>
              )}

              {/* Lane Multiplier Label (Floating Sidebar) */}
              <div className="absolute -left-12 flex flex-col items-center">
                <span className={`text-[9px] font-black mono transition-colors duration-500 ${idx === currentRow ? 'text-sky-400' : 'text-slate-700'}`}>
                  {lane.multiplier}X
                </span>
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${idx <= currentRow ? 'bg-sky-500' : 'bg-white/5'}`} />
              </div>

              {/* Lane Obstacles (Dynamic Sprites) */}
              {lane.obstacles.map(obs => (
                <div 
                  key={obs.id}
                  className={`absolute h-10 rounded-2xl flex items-center justify-center transition-transform shadow-2xl overflow-hidden ${
                    lane.type === 'ICE_ROAD' ? 'bg-red-500/20 border-2 border-red-500/40' : 
                    lane.type === 'FREEZING_RIVER' ? 'bg-white/10 border-2 border-sky-200/20' : 
                    'bg-slate-700/40 border-2 border-slate-600/20'
                  }`}
                  style={{ left: `${obs.x}%`, width: `${obs.width}%` }}
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                   {lane.type === 'ICE_ROAD' ? (
                      <Truck className="text-red-500 w-5 h-5 animate-pulse" />
                   ) : lane.type === 'FREEZING_RIVER' ? (
                      <Fish className="text-sky-300 w-5 h-5 opacity-40" />
                   ) : (
                      <AlertCircle className="text-slate-400 w-5 h-5" />
                   )}
                </div>
              ))}
            </div>
          ))}

          {/* The Penguin Character */}
          <div 
            className={`absolute z-[100] transition-all duration-300 ease-out flex flex-col items-center justify-center pointer-events-none ${
                gameState === 'CRASHED' ? 'animate-shake' : ''
            }`}
            style={{ 
              left: `${penguinX}%`, 
              bottom: `${currentRow * 70 + 15}px`, // 70 is lane height
              width: `${PENGUIN_SIZE}px`,
              height: `${PENGUIN_SIZE}px`
            }}
          >
            <div className="relative group/penguin">
                {/* Visual trail */}
                <div className="absolute -bottom-2 w-full h-1 bg-sky-500/20 blur-md rounded-full scale-150 animate-pulse" />
                
                <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] border-2 border-sky-100 overflow-hidden relative ${gameState === 'PLAYING' ? 'hover:scale-110' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-sky-50" />
                    <Snowflake className={`w-7 h-7 text-sky-600 relative z-10 ${gameState === 'PLAYING' ? 'animate-spin-slow' : ''}`} />
                    {gameState === 'CRASHED' && (
                        <div className="absolute inset-0 bg-red-500/40 z-20 flex items-center justify-center">
                            <AlertCircle className="text-white w-8 h-8" />
                        </div>
                    )}
                </div>
                
                {/* Current Multiplier Bubble */}
                {gameState === 'PLAYING' && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1a1c22] border border-sky-500/30 px-3 py-1 rounded-full whitespace-nowrap animate-bounce shadow-2xl">
                    <span className="text-[9px] font-black text-white mono">{MULTIPLIERS[currentRow]}x</span>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Global Overlays */}
        {gameState === 'CRASHED' && (
            <div className="absolute inset-0 z-[200] bg-red-950/40 backdrop-blur-2xl flex flex-col items-center justify-center animate-in zoom-in duration-500">
                <div className="p-10 bg-red-600 rounded-full mb-8 shadow-[0_0_100px_rgba(220,38,38,0.6)] animate-bounce border-4 border-white/20">
                    <AlertCircle className="w-24 h-24 text-white" />
                </div>
                <h2 className="text-8xl font-black text-white italic uppercase tracking-tighter drop-shadow-2xl">FROZEN!</h2>
                <div className="mt-6 flex flex-col items-center gap-2">
                    <p className="text-red-400 text-2xl font-black uppercase tracking-[0.4em]">Expedition Terminated</p>
                    <p className="text-white/60 font-medium">Lost at lane {currentRow} with {MULTIPLIERS[currentRow]}x</p>
                </div>
                <button 
                  onClick={startGame} 
                  className="mt-14 px-16 py-6 bg-white text-black rounded-3xl font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 uppercase italic"
                >
                  Restart Voyage
                </button>
            </div>
        )}

        {gameState === 'FINISHED' && (
            <div className="absolute inset-0 z-[200] bg-[#050507]/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-in zoom-in duration-500">
                <div className="p-10 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-full mb-8 shadow-[0_0_100px_rgba(16,185,129,0.5)] animate-pulse border-4 border-white/20">
                    <Trophy className="w-24 h-24 text-white" />
                </div>
                <h2 className="text-8xl font-black text-white italic uppercase tracking-tighter drop-shadow-2xl">ARCTIC LEGEND</h2>
                <div className="mt-6 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 bg-emerald-500/20 border border-emerald-500/40 px-8 py-5 rounded-3xl backdrop-blur-md">
                        <Zap className="w-10 h-10 text-emerald-400 fill-current" />
                        <span className="text-6xl font-black text-white mono">+${(betAmount * MULTIPLIERS[currentRow]).toFixed(2)}</span>
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.6em]">Perfect Passage Complete</p>
                </div>
                <button 
                  onClick={() => setGameState('IDLE')} 
                  className="mt-14 px-16 py-6 bg-emerald-600 text-white rounded-3xl font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20 uppercase italic"
                >
                  New Expedition
                </button>
            </div>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 text-white/5 pointer-events-none z-0">
            <Snowflake className="w-12 h-12" />
            <span className="text-4xl font-black uppercase tracking-[0.5em] italic text-center">ARCTIC CROSS v2.0</span>
            <Snowflake className="w-12 h-12" />
        </div>
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-sky-500/10 to-transparent pointer-events-none z-40" />
      </div>

      <style>{`
        @keyframes waves {
          from { transform: translateX(0); }
          to { transform: translateX(-50px); }
        }
        .animate-waves {
          animation: waves 2s ease-in-out infinite alternate;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default ArcticCrossing;
