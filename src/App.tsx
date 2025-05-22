import React from 'react';
import { BoardProvider } from './contexts/BoardContext';
import Board from './components/Board';

function App() {
  return (
    <div className="h-screen w-full">
      <BoardProvider>
        <Board />
      </BoardProvider>
    </div>
  );
}

export default App;
