
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Puzzle, Zap, RotateCcw, CheckCircle2, Info, Settings2, Target, AlertCircle, PenTool, Hash } from 'lucide-react';

interface SudokuProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

const MULTIPLIERS: Record<Difficulty, number> = {
  EASY: 1.25,
  MEDIUM: 3.5,
  HARD: 12.0,
  EXPERT: 50.0
};

const EMPTY_BOARD = Array(81).fill(0);

// Simple Backtracking Sudoku Solver & Generator
const isValid = (board: number[], index: number, num: number) => {
  const row = Math.floor(index / 9);
  const col = index % 9;
  
  for (let i = 0; i < 9; i++) {
    if (board[row * 9 + i] === num) return false;
    if (board[i * 9 + col] === num) return false;
  }
  
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[(startRow + i) * 9 + (startCol + j)] === num) return false;
    }
  }
  return true;
};

const solveSudoku = (board: number[]): boolean => {
  const emptyIndex = board.indexOf(0);
  if (emptyIndex === -1) return true;
  
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, emptyIndex, num)) {
      board[emptyIndex] = num;
      if (solveSudoku(board)) return true;
      board[emptyIndex] = 0;
    }
  }
  return false;
};

const generateSudoku = (difficulty: Difficulty) => {
  const board = Array(81).fill(0);
  
  for (let i = 0; i < 9; i += 3) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        let num;
        do {
          num = Math.floor(Math.random() * 9) + 1;
        } while (!isValid(board, (i + row) * 9 + (i + col), num));
        board[(i + row) * 9 + (i + col)] = num;
      }
    }
  }
  
  solveSudoku(board);
  const solution = [...board];
  
  const removeCount = difficulty === 'EASY' ? 35 : difficulty === 'MEDIUM' ? 45 : difficulty === 'HARD' ? 55 : 64;
  for (let i = 0; i < removeCount; i++) {
    let idx;
    do {
      idx = Math.floor(Math.random() * 81);
    } while (board[idx] === 0);
    board[idx] = 0;
  }
  
  return { puzzle: board, solution };
};

const Sudoku: React.FC<SudokuProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON'>('IDLE');
  const [board, setBoard] = useState<number[]>(EMPTY_BOARD);
  const [notes, setNotes] = useState<Record<number, number[]>>({});
  const [initialBoard, setInitialBoard] = useState<number[]>(EMPTY_BOARD);
  const [solution, setSolution] = useState<number[]>(EMPTY_BOARD);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [errors, setErrors] = useState<number[]>([]);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [shake, setShake] = useState(false);

  const startGame = () => {
    if (balance < betAmount) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    onLoss(betAmount);
    const { puzzle, solution: sol } = generateSudoku(difficulty);
    setBoard(puzzle);
    setInitialBoard([...puzzle]);
    setSolution(sol);
    setNotes({});
    setGameState('PLAYING');
    setSelectedIdx(null);
    setErrors([]);
  };

  const checkBoard = (currentBoard: number[]) => {
    const newErrors: number[] = [];
    for (let i = 0; i < 81; i++) {
      if (currentBoard[i] !== 0 && currentBoard[i] !== solution[i]) {
        newErrors.push(i);
      }
    }
    setErrors(newErrors);

    if (newErrors.length === 0 && !currentBoard.includes(0)) {
      setGameState('WON');
      onWin(betAmount * MULTIPLIERS[difficulty]);
    }
  };

  const handleCellClick = (idx: number) => {
    if (gameState !== 'PLAYING') return;
    setSelectedIdx(idx);
  };

  const handleNumberInput = (num: number) => {
    if (gameState !== 'PLAYING' || selectedIdx === null || initialBoard[selectedIdx] !== 0) return;
    
    if (isNoteMode) {
      if (num === 0) return;
      setNotes(prev => {
        const currentNotes = prev[selectedIdx] || [];
        const newNotes = currentNotes.includes(num) 
          ? currentNotes.filter(n => n !== num)
          : [...currentNotes, num].sort();
        return { ...prev, [selectedIdx]: newNotes };
      });
      // Clear board number if placing a note
      const newBoard = [...board];
      newBoard[selectedIdx] = 0;
      setBoard(newBoard);
    } else {
      const newBoard = [...board];
      newBoard[selectedIdx] = num === board[selectedIdx] ? 0 : num;
      setBoard(newBoard);
      // Clear notes if placing a concrete number
      if (num !== 0) {
        setNotes(prev => {
          const next = { ...prev };
          delete next[selectedIdx];
          return next;
        });
      }
      checkBoard(newBoard);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING' || selectedIdx === null) return;
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleNumberInput(0);
      } else if (e.key.toLowerCase() === 'n') {
        setIsNoteMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, selectedIdx, board, isNoteMode]);

  const isRelated = (idx: number) => {
    if (selectedIdx === null) return false;
    const r1 = Math.floor(selectedIdx / 9), c1 = selectedIdx % 9;
    const r2 = Math.floor(idx / 9), c2 = idx % 9;
    const b1 = Math.floor(r1 / 3) * 3 + Math.floor(c1 / 3);
    const b2 = Math.floor(r2 / 3) * 3 + Math.floor(c2 / 3);
    return r1 === r2 || c1 === c2 || b1 === b2;
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-8 w-full max-w-[1400px] mx-auto pb-32 transition-transform ${shake ? 'animate-shake' : ''}`}>
      
      {/* Sidebar Controls */}
      <div className="w-full lg:w-[380px] space-y-4">
        <div className="bg-[#1a1c22] rounded-2xl overflow-hidden border border-white/5 shadow-2xl p-6 space-y-6">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Wager Station</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bet Amount</label>
            <div className="relative group">
              <input 
                type="number" value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                disabled={gameState === 'PLAYING'}
                className="w-full bg-[#0f1115] border-2 border-white/5 rounded-xl px-4 py-4 text-xl font-black text-white focus:outline-none focus:border-cyan-500/30 transition-all mono shadow-inner"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setBetAmount(betAmount / 2)} className="px-3 py-2 bg-[#2f323a] text-[10px] font-black rounded-lg">1/2</button>
                <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-2 bg-[#2f323a] text-[10px] font-black rounded-lg">2x</button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atmosphere</label>
            <div className="grid grid-cols-2 gap-2">
              {(['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  disabled={gameState === 'PLAYING'}
                  className={`py-3 rounded-xl font-black text-[10px] tracking-widest transition-all border ${
                    difficulty === d ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-[#0f1115] border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {d} ({MULTIPLIERS[d]}x)
                </button>
              ))}
            </div>
          </div>

          {gameState !== 'PLAYING' ? (
            <button 
              onClick={startGame}
              className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-lg rounded-xl shadow-lg active:scale-95 transition-all uppercase italic tracking-tighter"
            >
              Fracture Grid
            </button>
          ) : (
            <div className="space-y-6">
              {/* Note Mode Toggle */}
              <button 
                onClick={() => setIsNoteMode(!isNoteMode)}
                className={`w-full py-4 flex items-center justify-center gap-3 rounded-xl font-black text-[10px] tracking-widest transition-all border ${
                  isNoteMode 
                  ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
                  : 'bg-[#0f1115] border-white/5 text-slate-500'
                }`}
              >
                {isNoteMode ? <PenTool className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                {isNoteMode ? 'NOTE MODE: ON' : 'NOTE MODE: OFF'}
              </button>

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => handleNumberInput(num)}
                    className="py-4 bg-[#2f323a] hover:bg-[#3f434d] text-white font-black rounded-xl transition-all active:scale-90"
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setGameState('IDLE')}
                className="w-full py-4 border border-red-500/30 text-red-500 font-black text-xs rounded-xl hover:bg-red-500/10 transition-all uppercase tracking-widest"
              >
                Forfeit Match
              </button>
            </div>
          )}
        </div>

        <div className="bg-[#1a1c22] rounded-2xl p-6 border border-white/5 space-y-4 shadow-xl">
           <div className="flex items-center gap-2 text-cyan-400 border-b border-white/5 pb-3">
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Arctic Rules</span>
           </div>
           <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
             Solve the grid by ensuring every row, column, and 3x3 block contains numbers 1-9 once. <span className="text-white font-bold">Press 'N'</span> to toggle Note Mode.
           </p>
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="flex-1 bg-[#0f1115] rounded-[40px] border border-white/5 p-4 md:p-8 flex flex-col items-center justify-center relative min-h-[850px] shadow-[inset_0_0_100px_rgba(0,0,0,1)]">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        
        {gameState === 'IDLE' ? (
          <div className="flex flex-col items-center opacity-20 text-center space-y-6">
            <Puzzle className="w-48 h-48 text-cyan-500 animate-float" />
            <h2 className="text-4xl font-black uppercase tracking-[0.5em] text-white">Grid Ready</h2>
          </div>
        ) : (
          <div className="relative w-full max-w-[650px] aspect-square grid grid-cols-9 bg-[#0d0d12] border-[10px] border-[#1a1c22] rounded-3xl shadow-3xl overflow-hidden p-1">
            {board.map((val, i) => {
              const isLocked = initialBoard[i] !== 0;
              const isSelected = selectedIdx === i;
              const related = isRelated(i);
              const hasError = errors.includes(i);
              const cellNotes = notes[i] || [];
              
              const row = Math.floor(i / 9);
              const col = i % 9;
              const borderClasses = `
                ${col % 3 === 2 && col !== 8 ? 'border-r-4 border-white/10' : 'border-r border-white/5'}
                ${row % 3 === 2 && row !== 8 ? 'border-b-4 border-white/10' : 'border-b border-white/5'}
              `;

              return (
                <div 
                  key={i} 
                  onClick={() => handleCellClick(i)}
                  className={`relative flex items-center justify-center cursor-pointer transition-all duration-200 ${borderClasses} ${
                    isSelected ? 'bg-cyan-500/20 z-10' : related ? 'bg-white/[0.02]' : 'bg-transparent'
                  } hover:bg-white/[0.05]`}
                >
                  {val !== 0 ? (
                    <span className={`text-xl md:text-3xl font-black animate-in zoom-in duration-300 ${
                      hasError ? 'text-red-500' : isLocked ? 'text-slate-600' : 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                    }`}>
                      {val}
                    </span>
                  ) : cellNotes.length > 0 ? (
                    <div className="grid grid-cols-3 grid-rows-3 gap-0 w-full h-full p-1 opacity-60">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <span key={n} className="text-[8px] md:text-[10px] font-bold text-amber-500 text-center leading-none">
                          {cellNotes.includes(n) ? n : ''}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-cyan-400/50 animate-pulse pointer-events-none" />
                  )}
                </div>
              );
            })}

            {/* Win Overlay */}
            {gameState === 'WON' && (
              <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in zoom-in duration-500">
                <div className="p-8 bg-cyan-600 rounded-full mb-6 shadow-[0_0_80px_rgba(34,211,238,0.4)] animate-bounce">
                  <CheckCircle2 className="w-20 h-20 text-white" />
                </div>
                <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase">Grid Deciphered</h2>
                <div className="mt-4 flex items-center gap-3 text-cyan-400">
                  <Zap className="w-6 h-6 fill-current" />
                  <span className="text-4xl font-black mono">+${(betAmount * MULTIPLIERS[difficulty]).toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setGameState('IDLE')} 
                  className="mt-12 px-12 py-5 bg-white text-black rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                  Return to Base
                </button>
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/5 pointer-events-none">
            <Settings2 className="w-8 h-8" />
            <span className="text-3xl font-black uppercase tracking-[0.5em] italic">Arctic Puzzle Logic</span>
            <Settings2 className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default Sudoku;
