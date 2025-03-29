// /src/contexts/LevelContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'nuWordLevels';

// Helper: return a fresh default level info object.
const getDefaultLevelInfo = () => ({ correct: [], incorrect: [], completed: false });

// Retrieve stored data or return a default structure.
const getStoredData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        currentLevel: 1,
        levelData: {} // keys: level number (as string), value: level info object
    };
};

const LevelContext = createContext({
    currentLevel: 1,
    levelInfo: getDefaultLevelInfo(),
    updateCurrentLevel: () => { },
    updateLevelInfo: () => { },
});

export const LevelProvider = ({ children }) => {
    const [data, setData] = useState(getStoredData);

    // Persist changes to local storage.
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    // Change current level and ensure we have a fresh object for that level.
    const updateCurrentLevel = (newLevel) => {
        const newLevelStr = String(newLevel);
        const newLevelInfo = data.levelData[newLevelStr] || getDefaultLevelInfo();
        setData((prev) => ({
            ...prev,
            currentLevel: newLevel,
            levelData: {
                ...prev.levelData,
                [newLevelStr]: newLevelInfo,
            },
        }));
    };

    // Update the info (correct, incorrect, completed) for the current level.
    const updateLevelInfo = (info) => {
        const currentLevelStr = String(data.currentLevel);
        setData((prev) => ({
            ...prev,
            levelData: {
                ...prev.levelData,
                [currentLevelStr]: {
                    ...getDefaultLevelInfo(),
                    ...prev.levelData[currentLevelStr],
                    ...info,
                },
            },
        }));
    };

    const currentLevel = data.currentLevel;
    const levelInfo = data.levelData[String(currentLevel)] || getDefaultLevelInfo();

    return (
        <LevelContext.Provider value={{ currentLevel, levelInfo, updateCurrentLevel, updateLevelInfo }}>
            {children}
        </LevelContext.Provider>
    );
};

export const useLevel = () => useContext(LevelContext);
