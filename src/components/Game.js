// /src/components/Game.js
import React, { useEffect, useState } from 'react';
import WordButton from './WordButton';
import { useLevel } from '../contexts/LevelContext';
import wordsData from '../words.json';
import { mobileView } from '../styles';
import WordGame from './WordGame'

const Game = () => {
    const { currentLevel, levelInfo, updateLevelInfo } = useLevel();
    return (
        <div
            style={{
                ...mobileView,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 0',
            }}
        >
            <WordGame />
        </div>
    );
};

export default Game;
