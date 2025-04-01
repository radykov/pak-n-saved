import { useDrop } from 'react-dnd';
import { useCallback } from 'react';
import { CELL_SIZE } from '../utils/GridInfo';

// Custom hook for placing a word
const usePlaceWord = (grid, setGrid, words, setWords) => {
    const placeWord = useCallback((word, x, y, orientation) => {
        const newGrid = grid.map(row => [...row]);
        const wordLength = word.text.length;
        const dx = orientation === 'horizontal' ? 1 : 0;
        const dy = orientation === 'vertical' ? 1 : 0;

        for (let i = 0; i < wordLength; i++) {
            const newX = x + (dx * i);
            const newY = y + (dy * i);
            newGrid[newY][newX] = word.text[i];
        }

        setGrid(newGrid);
        setWords(prev => prev.map(w =>
            w.id === word.id
                ? { ...w, isPlaced: true, x, y, orientation }
                : w
        ));
    }, [grid, setGrid, setWords]);

    return placeWord;
};

// Custom hook for removing a word
const useRemoveWord = (grid, setGrid, words, setWords) => {
    const removeWord = useCallback((word) => {
        // Don't proceed if word is not placed
        if (!word || !word.isPlaced) return;

        const newGrid = grid.map(row => [...row]);
        const wordLength = word.text.length;
        const dx = word.orientation === 'horizontal' ? 1 : 0;
        const dy = word.orientation === 'vertical' ? 1 : 0;

        for (let i = 0; i < wordLength; i++) {
            const newX = word.x + (dx * i);
            const newY = word.y + (dy * i);
            newGrid[newY][newX] = '';
        }

        setGrid(newGrid);
        setWords(prev => prev.map(w =>
            w.id === word.id
                ? { ...w, isPlaced: false, x: 0, y: 0 }
                : w
        ));
    }, [grid, setGrid, setWords]);

    return removeWord;
};

// Custom hook for canPlaceWord logic
const useCanPlaceWord = (grid) => {
    const canPlaceWord = useCallback((word, x, y, orientation) => {
        if (!word) return false;

        const wordLength = word.text.length;
        const dx = orientation === 'horizontal' ? 1 : 0;
        const dy = orientation === 'vertical' ? 1 : 0;

        const currentPositions = new Set();
        if (word.isPlaced) {
            const currentDx = word.orientation === 'horizontal' ? 1 : 0;
            const currentDy = word.orientation === 'vertical' ? 1 : 0;
            for (let i = 0; i < wordLength; i++) {
                const posX = word.x + (currentDx * i);
                const posY = word.y + (currentDy * i);
                currentPositions.add(`${posX},${posY}`);
            }
        }

        for (let i = 0; i < wordLength; i++) {
            const newX = x + (dx * i);
            const newY = y + (dy * i);
            if (newX === x && newY === y) continue;
            if (newX >= grid[0].length || newY >= grid.length || newX < 0 || newY < 0) return false;
            // if (currentPositions.has(`${newX},${newY}`)) continue;
            if (grid[newY][newX] !== '') return false;
        }
        return true;
    }, [grid]);

    return canPlaceWord;
};

// Custom hook for rotating a word
const useRotateWord = (canPlaceWord, setGrid, setWords, grid) => {
    const rotateWord = useCallback((word) => {
        if (!word) return;

        const rotatedWord = {
            ...word,
            orientation: word.orientation === 'horizontal' ? 'vertical' : 'horizontal'
        };

        if (word.isPlaced) {
            const newGrid = grid.map(row => [...row]);
            const dx = word.orientation === 'horizontal' ? 1 : 0;
            const dy = word.orientation === 'vertical' ? 1 : 0;
            for (let i = 0; i < word.text.length; i++) {
                const x = word.x + (dx * i);
                const y = word.y + (dy * i);
                newGrid[y][x] = '';
            }

            if (canPlaceWord(rotatedWord, word.x, word.y, rotatedWord.orientation)) {
                const newDx = rotatedWord.orientation === 'horizontal' ? 1 : 0;
                const newDy = rotatedWord.orientation === 'vertical' ? 1 : 0;
                for (let i = 0; i < word.text.length; i++) {
                    const x = word.x + (newDx * i);
                    const y = word.y + (newDy * i);
                    newGrid[y][x] = word.text[i];
                }
                setGrid(newGrid);
                setWords(prev => prev.map(w => w.id === word.id ? { ...rotatedWord, isPlaced: true } : w));
            } else {
                setGrid(newGrid);
                setWords(prev => prev.map(w => w.id === word.id ? { ...rotatedWord, isPlaced: false, x: 0, y: 0 } : w));
            }
        } else {
            setWords(prev => prev.map(w => w.id === word.id ? rotatedWord : w));
        }
    }, [canPlaceWord, setGrid, setWords, grid]);

    return rotateWord;
};

const useDropWord = ({
    gridRef,
    gridDimensions,
    placeWord,
    removeWord,
    canPlaceWord,
    setPreviewPosition,
    isDraggingPlacedWord,
    setIsDraggingPlacedWord,
    setSelectedWordId,
}) => {
    const [, drop] = useDrop({
        accept: ['WORD', 'PLACED_WORD'],
        drop: (item, monitor) => {
            const gridElement = gridRef.current;
            if (!gridElement) return;

            const offset = monitor.getClientOffset();
            const gridRect = gridElement.getBoundingClientRect();
            const x = Math.floor((offset.x - gridRect.left) / CELL_SIZE);
            const y = Math.floor((offset.y - gridRect.top) / CELL_SIZE);

            if (x >= 0 && x < gridDimensions.width && y >= 0 && y < gridDimensions.height) {
                const wordToPlace = item.type === 'PLACED_WORD' ? item.word : item;
                if (!wordToPlace) return;

                if (item.type === 'PLACED_WORD' && wordToPlace.isPlaced) {
                    removeWord(wordToPlace);
                }

                if (canPlaceWord(wordToPlace, x, y, wordToPlace.orientation)) {
                    placeWord(wordToPlace, x, y, wordToPlace.orientation);
                    setSelectedWordId(null);
                } else if (item.type === 'PLACED_WORD' && wordToPlace.isPlaced) {
                    placeWord(wordToPlace, wordToPlace.x, wordToPlace.y, wordToPlace.orientation);
                }
            }
            setPreviewPosition(null);
            setIsDraggingPlacedWord(false);
        },
        hover: (item, monitor) => {
            const offset = monitor.getClientOffset();
            if (!offset) {
                setPreviewPosition(null);
                return;
            }

            const gridElement = gridRef.current;
            if (!gridElement) {
                setPreviewPosition(null);
                return;
            }

            const gridRect = gridElement.getBoundingClientRect();
            const x = Math.floor((offset.x - gridRect.left) / CELL_SIZE);
            const y = Math.floor((offset.y - gridRect.top) / CELL_SIZE);

            if (x < 0 || x >= gridDimensions.width || y < 0 || y >= gridDimensions.height) {
                setPreviewPosition(null);
                return;
            }

            const wordToPreview = item.type === 'PLACED_WORD' ? item.word : item;
            if (!wordToPreview) {
                setPreviewPosition(null);
                return;
            }

            if (item.type === 'PLACED_WORD' && !isDraggingPlacedWord) {
                setIsDraggingPlacedWord(true);
                removeWord(wordToPreview);
            }

            setPreviewPosition({ x, y, word: wordToPreview });
        },
    });

    return drop;
};


export { usePlaceWord, useCanPlaceWord, useRemoveWord, useRotateWord, useDropWord };