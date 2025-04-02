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
      options: { enableMouseEvents: true } // Fixed typo from entableMouseEvents
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: {
        enableTouchEvents: true,
        enableMouseEvents: true, // Enable mouse events in touch backend
        delayTouchStart: 0,
        delayMouseStart: 0,
        ignoreContextMenu: true,
        touchSlop: 0, // Reduce the distance before a touch is recognized as a drag
        enableKeyboardEvents: false, // Disable keyboard events if not needed
        enableHoverOutsideTarget: false // Optimization
      },
      preview: true
    }
  ],
  // Add this transition detection function for better backend switching
  transition: (event, monitor) => {
    // Use this to debug which backend is being used
    // console.log("Event type:", event.type);
    return getBackendOptions(event, monitor);
  }
};

// Add this function after the HTML5toTouch configuration
function getBackendOptions(event, monitor) {
  // Return 'touch' for touch events, 'html5' otherwise
  if (event && (event.type.startsWith('touch') ||
    (window.navigator &&
      window.navigator.userAgent &&
      window.navigator.userAgent.match(/mobile|tablet|android|ipad|iphone/i)))) {
    return 'touch';
  }
  return 'html5';
}

function App() {
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div style={
        {
          WebkitUserSelect: 'none',
          MsUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }
      }>
        <TopHeader />
        <Game />
      </div>
    </DndProvider >
  );
}
export default App;
