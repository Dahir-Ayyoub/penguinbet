
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, Swords, RotateCcw, Users, Cpu, ShieldAlert, Coins } from 'lucide-react';

interface ChessProps {
  balance: number;
  onWin: (amount: number) => void;
  onLoss: (amount: number) => void;
}

type Piece = 'r' | 'n' | 'b' | 'q' | 'k' | 'p' | 'R' | 'N' | 'B' | 'Q' | 'K' | 'P' | null;
type GameMode = 'PvE' | 'PvP';

const PIECE_SYMBOLS: Record<string, string> = {
  r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
  R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙'
};

const INITIAL_BOARD: Piece[] = [
  'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
  'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
  'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
];

const PIECE_VALUES: Record<string, number> = {
  p: 10, n: 30, b: 30, r: 50, q: 90, k: 900,
  P: 10, N: 30, B: 30, R: 50, Q: 90, K: 900
};

const Chess: React.FC<ChessProps> = ({ balance, onWin, onLoss }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [board, setBoard] = useState<Piece[]>(INITIAL_BOARD);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'CHECKMATE' | 'STALEMATE' | 'DRAW'>('IDLE');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [turn, setTurn] = useState<'WHITE' | 'BLACK'>('WHITE');
  const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);
  const [legalMoves, setLegalMoves] = useState<number[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('PvE');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const isWhite = (p: Piece) => p !== null && p === p.toUpperCase();
  const getPos = (idx: number) => ({ x: idx % 8, y: Math.floor(idx / 8) });

  const isPathClear = (from: number, to: number, b: Piece[]) => {
    const start = getPos(from);
    const end = getPos(to);
    const dx = Math.sign(end.x - start.x);
    const dy = Math.sign(end.y - start.y);
    let x = start.x + dx;
    let y = start.y + dy;
    while (x !== end.x || y !== end.y) {
      if (b[y * 8 + x] !== null) return false;
      x += dx; y += dy;
    }
    return true;
  };

  const isSquareAttacked = useCallback((idx: number, attackerIsWhite: boolean, b: Piece[]) => {
    for (let i = 0; i < 64; i++) {
      const piece = b[i];
      if (piece && isWhite(piece) === attackerIsWhite) {
        const pos = getPos(i);
        const targetPos = getPos(idx);
        const dx = targetPos.x - pos.x;
        const dy = targetPos.y - pos.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const pType = piece.toLowerCase();

        if (pType === 'p') {
          const dir = attackerIsWhite ? 1 : -1;
          if (dy === dir && absDx === 1) return true;
        } else if (pType === 'r') {
          if ((dx === 0 || dy === 0) && isPathClear(i, idx, b)) return true;
        } else if (pType === 'n') {
          if ((absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1)) return true;
        } else if (pType === 'b') {
          if (absDx === absDy && isPathClear(i, idx, b)) return true;
        } else if (pType === 'q') {
          if ((dx === 0 || dy === 0 || absDx === absDy) && isPathClear(i, idx, b)) return true;
        } else if (pType === 'k') {
          if (absDx <= 1 && absDy <= 1) return true;
        }
      }
    }
    return false;
  }, []);

  const getPseudoLegalMoves = useCallback((idx: number, b: Piece[]) => {
    const moves: number[] = [];
    const piece = b[idx];
    if (!piece) return moves;
    const pos = getPos(idx);
    const pieceLower = piece.toLowerCase();
    const white = isWhite(piece);

    for (let targetIdx = 0; targetIdx < 64; targetIdx++) {
      if (targetIdx === idx) continue;
      const targetPiece = b[targetIdx];
      const dx = getPos(targetIdx).x - pos.x;
      const dy = getPos(targetIdx).y - pos.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (targetPiece && isWhite(targetPiece) === white) continue;

      let valid = false;
      switch (pieceLower) {
        case 'p':
          const dir = white ? -1 : 1;
          if (dx === 0 && !targetPiece) {
            if (dy === dir) valid = true;
            if (dy === 2 * dir && pos.y === (white ? 6 : 1) && b[(pos.y + dir) * 8 + pos.x] === null) valid = true;
          }
          if (absDx === 1 && dy === dir && targetPiece) valid = true;
          break;
        case 'r': if ((dx === 0 || dy === 0) && isPathClear(idx, targetIdx, b)) valid = true; break;
        case 'n': if ((absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1)) valid = true; break;
        case 'b': if (absDx === absDy && isPathClear(idx, targetIdx, b)) valid = true; break;
        case 'q': if ((dx === 0 || dy === 0 || absDx === absDy) && isPathClear(idx, targetIdx, b)) valid = true; break;
        case 'k': if (absDx <= 1 && absDy <= 1) valid = true; break;
      }
      if (valid) moves.push(targetIdx);
    }
    return moves;
  }, []);

  const getMovesForPiece = useCallback((idx: number, b: Piece[]) => {
    const pseudo = getPseudoLegalMoves(idx, b);
    const white = isWhite(b[idx]);
    return pseudo.filter(to => {
      const nextBoard = [...b];
      nextBoard[to] = b[idx];
      nextBoard[idx] = null;
      const kingIdx = nextBoard.findIndex(p => p === (white ? 'K' : 'k'));
      return kingIdx !== -1 && !isSquareAttacked(kingIdx, !white, nextBoard);
    });
  }, [getPseudoLegalMoves, isSquareAttacked]);

  const getAllLegalMoves = useCallback((isWhiteTurn: boolean, b: Piece[]) => {
    let moves: { from: number; to: number }[] = [];
    for (let i = 0; i < 64; i++) {
      if (b[i] && isWhite(b[i]) === isWhiteTurn) {
        const pieceMoves = getMovesForPiece(i, b);
        pieceMoves.forEach(to => moves.push({ from: i, to }));
      }
    }
    return moves;
  }, [getMovesForPiece]);

  // AI Implementation (Minimax with Alpha-Beta Pruning)
  const evaluateBoard = (b: Piece[]) => {
    let score = 0;
    for (let i = 0; i < 64; i++) {
      if (b[i]) {
        const val = PIECE_VALUES[b[i]!];
        score += isWhite(b[i]) ? val : -val;
      }
    }
    return score;
  };

  const minimax = (b: Piece[], depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
    if (depth === 0) return evaluateBoard(b);

    const moves = getAllLegalMoves(isMaximizing, b);
    if (moves.length === 0) return isMaximizing ? -10000 : 10000;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const nextBoard = [...b];
        nextBoard[move.to] = b[move.from];
        nextBoard[move.from] = null;
        const ev = minimax(nextBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const nextBoard = [...b];
        nextBoard[move.to] = b[move.from];
        nextBoard[move.from] = null;
        const ev = minimax(nextBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, ev);
        beta = Math.min(beta, ev);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  const getBestMove = (b: Piece[]) => {
    const moves = getAllLegalMoves(false, b);
    let bestMove = moves[0];
    let minEval = Infinity;
    for (const move of moves) {
      const nextBoard = [...b];
      nextBoard[move.to] = b[move.from];
      nextBoard[move.from] = null;
      const ev = minimax(nextBoard, 2, -Infinity, Infinity, true);
      if (ev < minEval) {
        minEval = ev;
        bestMove = move;
      }
    }
    return bestMove;
  };

  const checkGameOver = useCallback((isWhiteTurn: boolean, b: Piece[]) => {
    const moves = getAllLegalMoves(isWhiteTurn, b);
    if (moves.length === 0) {
      const kingIdx = b.findIndex(p => p === (isWhiteTurn ? 'K' : 'k'));
      if (isSquareAttacked(kingIdx, !isWhiteTurn, b)) {
        return 'CHECKMATE';
      } else {
        return 'STALEMATE';
      }
    }
    return null;
  }, [getAllLegalMoves, isSquareAttacked]);

  const startGame = () => {
    if (balance < betAmount || isLocked) return;
    setIsLocked(true);
    onLoss(betAmount);
    setBoard([...INITIAL_BOARD]);
    setGameState('PLAYING');
    setTurn('WHITE');
    setSelectedIdx(null);
    setLastMove(null);
    setIsLocked(false);
  };

  const executeMove = (from: number, to: number) => {
    const newBoard = [...board];
    const piece = board[from];
    newBoard[to] = piece;
    newBoard[from] = null;
    
    // Auto-promote
    if (piece?.toLowerCase() === 'p' && (Math.floor(to / 8) === 0 || Math.floor(to / 8) === 7)) {
        newBoard[to] = isWhite(piece) ? 'Q' : 'q';
    }

    setBoard(newBoard);
    setLastMove({ from, to });
    setSelectedIdx(null);
    setLegalMoves([]);
    
    const nextTurn = turn === 'WHITE' ? 'BLACK' : 'WHITE';
    setTurn(nextTurn);

    const status = checkGameOver(nextTurn === 'WHITE', newBoard);
    if (status) {
      setGameState(status);
      if (status === 'CHECKMATE') {
        // If it was white's turn, black won, and vice versa
        if (turn === 'WHITE') {
           // White just moved, so black is in checkmate? No, turn just swapped to black.
           // If nextTurn is black and is in checkmate, White won.
           onWin(betAmount * 2);
        }
      } else if (status === 'STALEMATE') {
        onWin(betAmount); // Return bet
      }
    }
  };

  useEffect(() => {
    if (gameMode === 'PvE' && turn === 'BLACK' && gameState === 'PLAYING' && !isAiThinking) {
      setIsAiThinking(true);
      setTimeout(() => {
        const bestMove = getBestMove(board);
        if (bestMove) {
          executeMove(bestMove.from, bestMove.to);
        }
        setIsAiThinking(false);
      }, 600);
    }
  }, [turn, gameState, gameMode, board]);

  const handleTileClick = (idx: number) => {
    if (gameState !== 'PLAYING' || isAiThinking) return;
    const piece = board[idx];
    const canMove = (turn === 'WHITE' && isWhite(piece)) || (gameMode === 'PvP' && turn === 'BLACK' && !isWhite(piece) && piece !== null);

    if (selectedIdx === null) {
      if (piece && canMove) {
        const moves = getMovesForPiece(idx, board);
        if (moves.length > 0) {
            setSelectedIdx(idx);
            setLegalMoves(moves);
        }
      }
    } else {
      if (legalMoves.includes(idx)) {
        executeMove(selectedIdx, idx);
      } else if (piece && canMove) {
        const moves = getMovesForPiece(idx, board);
        setSelectedIdx(idx);
        setLegalMoves(moves);
      } else {
        setSelectedIdx(null);
        setLegalMoves([]);
      }
    }
  };

  const isInCheck = (isWhiteKing: boolean) => {
    const kingIdx = board.findIndex(p => p === (isWhiteKing ? 'K' : 'k'));
    return isSquareAttacked(kingIdx, !isWhiteKing, board);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto pb-32">
      <div className="w-full lg:w-96 space-y-4">
        <div className="frost-glass rounded-[32px] p-8 border border-white/10 shadow-2xl space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Swords className="w-12 h-12 text-indigo-400" />
          </div>
          
          <div className="space-y-4 relative z-10">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block ml-1">Duel Stakes</label>
            <div className="relative">
              <input 
                type="number" value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                disabled={gameState === 'PLAYING'}
                className="w-full bg-black/60 border-2 border-white/5 rounded-2xl px-6 py-4 text-2xl font-black text-white focus:outline-none focus:border-indigo-500/50 transition-all mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500/20 font-black">$</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 relative z-10">
            <button onClick={() => setGameMode('PvE')} className={`py-4 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2 tracking-widest ${gameMode === 'PvE' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>
              <Cpu className="w-4 h-4" /> VERSUS BOT
            </button>
            <button onClick={() => setGameMode('PvP')} className={`py-4 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2 tracking-widest ${gameMode === 'PvP' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>
              <Users className="w-4 h-4" /> LOCAL PvP
            </button>
          </div>

          <button 
            onClick={startGame} 
            disabled={gameState === 'PLAYING' || isLocked} 
            className="w-full py-6 bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-800 text-white font-black text-xl rounded-2xl shadow-xl active:scale-95 transition-all uppercase italic tracking-tighter disabled:opacity-50"
          >
            Deploy Forces
          </button>
        </div>
        
        <div className="frost-glass rounded-[24px] p-6 text-center border border-white/5 space-y-4">
           <div className={`py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 ${turn === 'WHITE' ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}>
              {isAiThinking ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Bot Thinking
                </>
              ) : (
                <>{turn} TURN</>
              )}
           </div>
           
           {isInCheck(turn === 'WHITE') && (
              <div className="flex items-center justify-center gap-2 text-red-500 animate-pulse">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">King in Danger</span>
              </div>
           )}
        </div>
      </div>

      <div className="flex-1 bg-[#050507] rounded-[60px] border border-white/5 p-6 md:p-12 flex flex-col items-center justify-center min-h-[750px] relative shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />
        
        <div className="grid grid-cols-8 grid-rows-8 w-full max-w-[650px] aspect-square border-[12px] border-[#0d0d12] rounded-[32px] shadow-3xl overflow-hidden relative">
          {board.map((piece, i) => {
            const row = Math.floor(i / 8); const col = i % 8;
            const isDark = (row + col) % 2 === 1;
            const isSelected = selectedIdx === i;
            const isLegal = legalMoves.includes(i);
            const isLastMove = lastMove && (lastMove.from === i || lastMove.to === i);
            const pieceIsWhite = piece ? isWhite(piece) : false;
            const isKingInCheck = piece?.toLowerCase() === 'k' && isInCheck(pieceIsWhite);

            return (
              <div 
                key={i} 
                onClick={() => handleTileClick(i)} 
                className={`relative flex items-center justify-center text-4xl md:text-6xl transition-all duration-200 cursor-pointer 
                  ${isDark ? 'bg-blue-950/20' : 'bg-blue-100/5'} 
                  ${isSelected ? 'bg-indigo-500/30 ring-inset ring-4 ring-indigo-500/50' : ''} 
                  ${isLastMove ? 'after:absolute after:inset-0 after:bg-yellow-500/5' : ''} 
                  ${isKingInCheck ? 'bg-red-500/20 animate-pulse' : ''}
                  hover:bg-white/10`}
              >
                {isLegal && (
                  <div className={`absolute z-20 w-4 h-4 rounded-full ${board[i] ? 'border-4 border-red-500/40 scale-[4]' : 'bg-white/20 scale-100 animate-pulse'}`} />
                )}
                {piece && (
                  <span className={`z-10 transition-all duration-300 pointer-events-none 
                    ${isSelected ? '-translate-y-3 scale-110 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]' : 'drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)]'} 
                    ${pieceIsWhite ? 'text-blue-50' : 'text-blue-600'}`}>
                    {PIECE_SYMBOLS[piece]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Game End Overlays */}
        {gameState !== 'IDLE' && gameState !== 'PLAYING' && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in zoom-in duration-300 text-center">
             <div className="p-8 bg-indigo-600 rounded-full mb-6 shadow-[0_0_100px_rgba(79,70,229,0.4)]">
                {gameState === 'CHECKMATE' ? <Trophy className="w-16 h-16 text-white" /> : <RotateCcw className="w-16 h-16 text-white" />}
             </div>
             <h2 className="text-7xl font-black text-white italic uppercase tracking-tighter">
               {gameState === 'CHECKMATE' ? (turn === 'WHITE' ? 'DEFEATED' : 'VICTORY') : gameState}
             </h2>
             {gameState === 'CHECKMATE' && turn === 'BLACK' && (
               <div className="mt-4 flex items-center gap-3 text-emerald-400">
                  <Coins className="w-6 h-6" />
                  <span className="text-3xl font-black mono">+${(betAmount * 2).toFixed(2)}</span>
               </div>
             )}
             <button onClick={() => setGameState('IDLE')} className="mt-12 px-12 py-5 bg-white text-black rounded-full font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl">
                Return to Base
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chess;
