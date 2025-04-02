// /src/components/Game.js
import React from 'react';
import { mobileView } from '../styles';
import WordGame from './WordGame'
import { GameProvider } from '../contexts/GameContext';

// Add event listeners to prevent default touch behavior
document.addEventListener('touchstart', (e) => {
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

const Game = () => {
    return (
        <GameProvider>
            <div
                style={{
                    ...mobileView,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',

                }}
            >
                <WordGame />
            </div>
        </GameProvider>

    );
};

export default Game;
