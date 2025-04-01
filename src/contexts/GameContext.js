// src/contexts/GameContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    // Initialize the current level id from local storage or default to level 1.
    const [currentLevelId, setCurrentLevelId] = useState(() => {
        const storedLevelId = localStorage.getItem("currentLevelId");
        return storedLevelId ? storedLevelId : "1";
    });

    // Initialize max scores from local storage or default to an empty object.
    const [savedScores, setSavedScores] = useState(() => {
        const storedScores = localStorage.getItem("savedScores");
        return storedScores ? JSON.parse(storedScores) : {};
    });

    // Save current level id changes to local storage.
    useEffect(() => {
        localStorage.setItem("currentLevelId", currentLevelId);
    }, [currentLevelId]);

    // Save max scores changes to local storage.
    useEffect(() => {
        localStorage.setItem("savedScores", JSON.stringify(savedScores));
    }, [savedScores]);

    // Update the maximum score for a given level if the new score is higher.
    const updateSavedScore = (levelId, score) => {
        setSavedScores(prevScores => {
            const prevScore = prevScores[levelId] || 0;
            if (score > prevScore) {
                return { ...prevScores, [levelId]: score };
            }
            return prevScores;
        });
    };

    return (
        <GameContext.Provider value={{ currentLevelId, setCurrentLevelId, savedScores, updateSavedScore }}>
            {children}
        </GameContext.Provider>
    );
};

// Helper hook to access the game context.
export const useGameContext = () => useContext(GameContext);
