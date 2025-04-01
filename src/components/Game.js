// /src/components/Game.js
import React from 'react';
import { mobileView } from '../styles';
import WordGame from './WordGame'

const Game = () => {
    return (
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
    );
};

export default Game;
