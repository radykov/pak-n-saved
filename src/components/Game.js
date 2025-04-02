// /src/components/Game.js
import React, { useEffect } from 'react';
import { mobileView } from '../styles';
import WordGame from './WordGame'
import { GameProvider } from '../contexts/GameContext';

const Game = () => {
    useEffect(() => {
        // Add passive event listeners to improve touch handling
        document.addEventListener('touchmove', (e) => { }, { passive: false });
        document.addEventListener('touchstart', (e) => { }, { passive: true });

        // Clean up
        return () => {
            document.removeEventListener('touchmove', (e) => { });
            document.removeEventListener('touchstart', (e) => { });
        };
    }, []);

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
