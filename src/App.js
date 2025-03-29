// /src/App.js
import React from 'react';
import TopHeader from './components/TopHeader';
import SystemMessage from './components/SystemMessage';
import Game from './components/Game';
import { LevelProvider } from './contexts/LevelContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <LevelProvider>
        <TopHeader />
        <SystemMessage />
        <Game />
      </LevelProvider>
    </DndProvider>
  );
}

export default App;
