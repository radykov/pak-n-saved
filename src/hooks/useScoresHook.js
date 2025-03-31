import { useState, useEffect, useCallback } from 'react';

const useScoresHook = (levelId) => {
    const localStorageKey = `levelScores-${levelId}`;
    const [scores, setScores] = useState([]);

    // Load scores from localStorage when the level id changes.
    useEffect(() => {
        const storedScores = localStorage.getItem(localStorageKey);
        if (storedScores) {
            try {
                setScores(JSON.parse(storedScores));
            } catch (error) {
                console.error("Failed to parse stored scores:", error);
            }
        } else {
            setScores([]);
        }
    }, [localStorageKey]);

    // Function to update scores by adding a new score.
    const updateScores = useCallback((newScore) => {
        setScores((prevScores) => {
            const updatedScores = [newScore, ...prevScores];
            localStorage.setItem(localStorageKey, JSON.stringify(updatedScores));
            return updatedScores;
        });
    }, [localStorageKey]);

    // Function to reset scores.
    const resetScores = useCallback(() => {
        setScores([]);
        localStorage.removeItem(localStorageKey);
    }, [localStorageKey]);

    return { scores, updateScores, resetScores };
};

export default useScoresHook;
