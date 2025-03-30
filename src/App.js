// /src/App.js
import React from 'react';
import TopHeader from './components/TopHeader';
import SystemMessage from './components/SystemMessage';
import Game from './components/Game';
import { LevelProvider } from './contexts/LevelContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend } from 'react-dnd-multi-backend';

const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      preview: true
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true, delayTouchStart: 150 },
      preview: true
    }
  ]
};
function App() {
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>

      {/* // </DndProvider> / <DndProvider backend={TouchBackend} options={{
    //   enableMouseEvents: true, enableTouchEvents: true, delayTouchStart: 200,
    //   delay: 200
    // }}>     */}
      < LevelProvider >
        < TopHeader />
        <SystemMessage />
        <Game />
      </ LevelProvider>
    </DndProvider >
  );
}

export default App;
