// /src/App.js
import React from 'react';
import TopHeader from './components/TopHeader';
import Game from './components/Game';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend } from 'react-dnd-multi-backend';

const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      preview: true,
      options: { entableMouseEvents: true }
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: {
        enableTouchEvents: true,
        usePreview: false,
        delayTouchStart: 0, // Should already be instant
        delayMouseStart: 0, // Just in case
        ignoreContextMenu: true, // Helps prevent long-press behavior
      },
      preview: true
    }
  ]
};
function App() {
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      < TopHeader />
      <Game />
    </DndProvider >
  );
}

export default App;
