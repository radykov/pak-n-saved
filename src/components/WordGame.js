import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MAX_WIDTH_STYLE } from '../styles';
import { findWordsInGrid, useStartingWordInfo } from '../utils/WordUtils';
import { usePlaceWord, useCanPlaceWord, useRemoveWord, useRotateWord, useDropWord } from '../hooks/GridPlaceHooks';
import WordGrid from './WordGrid';
import CustomDragLayer from './CustomDragLayer';
import WordsList from './WordsList';
import TopContent from './TopContent';
import { RotateButton } from './ActionButtons';
import { useGameContext } from '../contexts/GameContext';
import { BackButton, NextButton } from './NavButtons';
import ScoreHelper from '../utils/ScoreHelper';
import FoundWords from './FoundWords';
// import solve from '../utils/Solver';

const WordGame = () => {
    const { currentLevelId, setCurrentLevelId, savedScores, updateSavedScore } = useGameContext();
    const { startingWords: initialWords, wordDroppedText, endingText, gridDimensions, startingText, maxScore, hasNextLevel } = useStartingWordInfo(currentLevelId);
    const savedScore = savedScores[currentLevelId] || 0;

    const [words, setWords] = useState(initialWords);
    const [selectedWordId, setSelectedWordId] = useState(null);
    const selectedWord = words.find((w) => w.id === selectedWordId);
    const [grid, setGrid] = useState(
        Array(gridDimensions.height)
            .fill()
            .map(() => Array(gridDimensions.width).fill(''))
    );
    const [previewPosition, setPreviewPosition] = useState(null);
    const [foundWords, setFoundWords] = useState([]);
    const [isDraggingPlacedWord, setIsDraggingPlacedWord] = useState(false);
    const [controlsWidth, setControlsWidth] = useState(null);
    const [currentScore, setCurrentScore] = useState(0);

    const gridRef = useRef(null);

    // Reset local states whenever the level changes or new starting info is provided.
    useEffect(() => {
        setWords(initialWords);
        setGrid(
            Array(gridDimensions.height)
                .fill()
                .map(() => Array(gridDimensions.width).fill(''))
        );
        setPreviewPosition(null);
        setFoundWords([]);
        setIsDraggingPlacedWord(false);
        setCurrentScore(0);
        setSelectedWordId(null);
    }, [currentLevelId, initialWords, gridDimensions]);
    const [initialPosition, setInitialPosition] = useState(null);
    const placeWord = usePlaceWord(grid, setGrid, words, setWords);
    const removeWord = useRemoveWord(grid, setGrid, words, setWords);
    const canPlaceWord = useCanPlaceWord(grid);
    const rotateWord = useRotateWord(canPlaceWord, setGrid, setWords, grid);

    const drop = useDropWord({
        gridRef,
        gridDimensions,
        placeWord,
        removeWord,
        canPlaceWord,
        setPreviewPosition,
        isDraggingPlacedWord,
        setIsDraggingPlacedWord,
        setSelectedWordId,
    });

    // Automatically update score when grid changes.
    useEffect(() => {
        const found = findWordsInGrid(grid, initialWords);
        setFoundWords(found);
        setCurrentScore(found.length);
    }, [grid, initialWords]);

    const setGridRef = useCallback(
        (el) => {
            drop(el);
            gridRef.current = el;
            if (el && !controlsWidth) {
                setControlsWidth(el.offsetWidth);
            }
        },
        [drop, controlsWidth]
    );

    const handleWordSelect = (word) => {
        setSelectedWordId(word.id);
        const element = document.getElementById(`word-${word.id}`);
        if (element) {
            const rect = element.getBoundingClientRect();
            setInitialPosition({ x: rect.left, y: rect.top });
        }
    };

    const handleWordDeselect = () => {
        setSelectedWordId(null);
        setInitialPosition(null);
    }

    const getPreviewLetter = useCallback((x, y, previewPosition) => {
        if (!previewPosition?.word) return null;

        const { word, x: startX, y: startY } = previewPosition;
        const relativeX = x - startX;
        const relativeY = y - startY;

        if (word.orientation === 'horizontal') {
            if (y !== startY || relativeX < 0 || relativeX >= word.text.length) return null;
        } else {
            if (x !== startX || relativeY < 0 || relativeY >= word.text.length) return null;
        }

        const index = word.orientation === 'horizontal' ? relativeX : relativeY;
        return { word, index, x: startX, y: startY };
    }, []);

    const handleGridCellDragEnd = useCallback(
        (item) => {
            if (item.word && item.word.isPlaced) {
                removeWord(item.word);
                setPreviewPosition(null);
                setSelectedWordId(null);
                setIsDraggingPlacedWord(false);
            }
        },
        [removeWord]
    );

    const unplacedWords = words.filter((word) => !word.isPlaced);
    const handleDragEnd = useCallback(
        (item, result) => {
            if (!result) {
                removeWord(item);
            }
            else {
                handleWordDeselect()
            }
        },
        [removeWord]
    );

    // Handlers for navigation buttons.
    const handleBack = () => {
        const newLevelId = Number(currentLevelId) - 1;
        setCurrentLevelId(newLevelId.toString());
    };

    const handleNext = () => {
        // Save the current level's score before moving on.
        updateSavedScore(currentLevelId, currentScore);
        const newLevelId = Number(currentLevelId) + 1;
        setCurrentLevelId(newLevelId.toString());
    };

    // Use the currentScore rather than savedScore to determine if the level can be passed.
    const { canPass } = !hasNextLevel ? { canPass: false } : ScoreHelper.getScoreData(Math.max(currentScore, savedScore), maxScore);

    // Container style for the grid and nav buttons.
    const controlsContainerStyle = {
        ...MAX_WIDTH_STYLE,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        margin: unplacedWords.length !== 0 ? '20px auto 0' : ''
    };

    // Fixed width containers to reserve space even when a button isn't rendered.
    const navButtonWrapperStyle = {
        width: '80px',
        display: 'flex',
        justifyContent: 'center'
    };

    // Determine if any words are placed on the grid.
    const hasPlacedWords = words.some(word => word.isPlaced);

    return (
        <div>
            <CustomDragLayer selectedWord={selectedWord} initialPosition={initialPosition} />
            <div style={{
                position: 'relative', width: '100%', margin: '20px 0', textAlign: 'center', boxSizing: 'border-box'     // Ensures padding is counted within width
            }}>
                <TopContent
                    hasPlacedWords={hasPlacedWords}
                    savedScore={savedScore}
                    canPass={canPass}
                    startingText={startingText}
                    wordDroppedText={wordDroppedText}
                    endingText={endingText}
                    currentScore={currentScore}
                    maxScore={maxScore}
                />
                {/* Display the found words directly under TopContent */}
                <FoundWords words={foundWords} />
            </div>
            <WordGrid
                grid={grid}
                words={words}
                selectedWordId={selectedWordId}
                previewPosition={previewPosition}
                getPreviewLetter={getPreviewLetter}
                handleGridCellDragEnd={handleGridCellDragEnd}
                canPlaceWord={canPlaceWord}
                handleWordSelect={handleWordSelect}
                setGridRef={setGridRef}
            />
            <WordsList
                words={unplacedWords}
                selectedWordId={selectedWordId}
                onSelect={handleWordSelect}
                onDeselect={handleWordDeselect}
                onDragEnd={handleDragEnd}
            />
            <div style={controlsContainerStyle}>
                <div style={navButtonWrapperStyle}>
                    <BackButton onClick={handleBack} isEnabled={currentLevelId !== "1"} />
                </div>
                <div style={navButtonWrapperStyle}>
                    <RotateButton
                        onClick={() => selectedWord && rotateWord(selectedWord)}
                        disabled={!selectedWord}
                    />
                </div>
                <div style={navButtonWrapperStyle}>
                    <NextButton onClick={handleNext} isEnabled={canPass} />
                </div>
            </div>
        </div>
    );
};

export default WordGame;
