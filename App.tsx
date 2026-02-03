
import React, { useState, useCallback } from 'react';
import Layout from './components/Layout';
import { GameType } from './types';
import Plinko from './games/Plinko';
import Crash from './games/Crash';
import Mines from './games/Mines';
import ShellGame from './games/ShellGame';
import Tower from './games/Tower';
import Wheel from './games/Wheel';
import Chess from './games/Chess';
import PingPong from './games/PingPong';
import Dice from './games/Dice';
import Roulette from './games/Roulette';
import Sudoku from './games/Sudoku';
import Slots from './games/Slots';
import Limbo from './games/Limbo';
import Keno from './games/Keno';
import ArcticCrossing from './games/ArcticCrossing';

const App: React.FC = () => {
  const [balance, setBalance] = useState(10000);
  const [currentGame, setCurrentGame] = useState<GameType>('PLINKO');

  const handleWin = useCallback((amount: number) => {
    setBalance(prev => prev + amount);
  }, []);

  const handleLoss = useCallback((amount: number) => {
    setBalance(prev => prev - amount);
  }, []);

  const renderGame = () => {
    switch (currentGame) {
      case 'PLINKO':
        return <Plinko balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'CRASH':
        return <Crash balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'MINES':
        return <Mines balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'SHELLS':
        return <ShellGame balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'SUDOKU':
        return <Sudoku balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'TOWER':
        return <Tower balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'WHEEL':
        return <Wheel balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'CHESS':
        return <Chess balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'PINGPONG':
        return <PingPong balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'DICE':
        return <Dice balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'ROULETTE':
        return <Roulette balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'SLOTS':
        return <Slots balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'LIMBO':
        return <Limbo balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'KENO':
        return <Keno balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      case 'CROSSING':
        return <ArcticCrossing balance={balance} onWin={handleWin} onLoss={handleLoss} />;
      default:
        return <div className="text-center py-20 text-slate-500 font-bold">Initializing Arctic Engine...</div>;
    }
  };

  return (
    <Layout 
      balance={balance} 
      setBalance={setBalance} 
      currentGame={currentGame}
      setCurrentGame={setCurrentGame}
    >
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            className="snowflake" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10px`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDuration: `${Math.random() * 5 + 10}s`,
              animationDelay: `${Math.random() * 10}s`
            }} 
          />
        ))}
      </div>
      <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-700 h-full">
        {renderGame()}
      </div>
    </Layout>
  );
};

export default App;
