// /src/components/LevelSelector.js
import React from 'react';
import { mobileView, theme } from '../styles';
import wordsData from '../words.json';
import { useLevel } from '../contexts/LevelContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LevelSelector = () => {
    const { currentLevel, levelInfo, updateCurrentLevel } = useLevel();

    const canGoLeft = currentLevel > 1;
    // Enable Next if current level has any result (correct or incorrect) and the next level exists.
    const canGoRight =
        ((levelInfo.correct && levelInfo.correct.length > 0) ||
            (levelInfo.incorrect && levelInfo.incorrect.length > 0)) &&
        wordsData.hasOwnProperty(String(currentLevel + 1));

    const goLeft = () => {
        if (canGoLeft) {
            updateCurrentLevel(currentLevel - 1);
        }
    };

    const goRight = () => {
        if (canGoRight) {
            updateCurrentLevel(currentLevel + 1);
        }
    };

    return (
        <div
            style={{
                ...mobileView,
                display: 'flex',
                justifyContent: 'space-around',
                padding: '10px 0',
            }}
        >
            <button
                onClick={goLeft}
                disabled={!canGoLeft}
                style={
                    {
                        padding: '5px 10px',
                        background: canGoLeft ? theme.colors.arrowEnabled : theme.colors.arrowDisabled,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: canGoLeft ? 'pointer' : 'default',
                        transition: theme.transitions.ease,
                    }
                }
            >
                <ChevronLeft size={32} />
            </button>
            <button
                onClick={goRight}
                disabled={!canGoRight}
                style={{
                    padding: '5px 10px',
                    background: canGoRight ? theme.colors.arrowEnabled : theme.colors.arrowDisabled,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: canGoRight ? 'pointer' : 'default',
                    transition: theme.transitions.ease,
                }}
            >
                <ChevronRight size={32} />
            </button>
        </div>
    );
};

export default LevelSelector;
