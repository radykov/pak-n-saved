import { useState, useCallback, useRef } from 'react';
import { findWordsInGrid, useStartingWordInfo } from '../utils/WordUtils';
import { usePlaceWord, useCanPlaceWord, useRemoveWord, useRotateWord, useDropWord } from '../hooks/GridPlaceHooks';
import FoundWordsModal from './FoundWordsModal';
import WordGrid from './WordGrid';
import CustomDragLayer from './CustomDragLayer';
import WordsList from './WordsList';
import Scores from './Scores';
import { ResetButton, RotateButton, CheckButton } from './ActionButtons';
import useScoresHook from '../hooks/useScoresHook';

const WordGame = () => {
    const { startingWords: initialWords, gridDimensions, id, maxScore } = useStartingWordInfo();
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
    const [showModal, setShowModal] = useState(false);
    const [isDraggingPlacedWord, setIsDraggingPlacedWord] = useState(false);
    const [controlsWidth, setControlsWidth] = useState(null);

    // Use the custom hook for scores storage and management.
    const { scores, updateScores, resetScores } = useScoresHook(id);

    const gridRef = useRef(null);

    const placeWord = usePlaceWord(grid, setGrid, words, setWords);
    const removeWord = useRemoveWord(grid, setGrid, words, setWords);
    const canPlaceWord = useCanPlaceWord(grid);
    const rotateWord = useRotateWord(canPlaceWord, setGrid, setWords, grid);

    const hasPlacedWords = words.some((word) => word.isPlaced);

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

    const handleCheckWords = () => {
        const found = findWordsInGrid(grid, initialWords);
        console.log(found);
        setFoundWords(found);
        // Update scores via the custom hook.
        updateScores(found.length);
        setShowModal(true);
    };

    const handleReset = () => {
        setGrid(
            Array(gridDimensions.height)
                .fill()
                .map(() => Array(gridDimensions.width).fill(''))
        );
        setWords(initialWords.map((word) => ({ ...word, isPlaced: false, x: null, y: null })));
        setSelectedWordId(null);
        setPreviewPosition(null);
        // Reset the scores via the custom hook if desired.
        resetScores();
        setShowModal(false);
    };

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
    };

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
        },
        [removeWord]
    );

    const getScoreColor = (score, maxScore) => {
        const percentage = (score / maxScore) * 100;
        if (percentage < 50) return 'red';
        if (percentage <= 75) return 'orange';
        if (percentage < 100) return 'blue';
        return 'green';
    };

    const controlsContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0',
        width: controlsWidth || 'auto',
        margin: '20px auto 0',
    };

    return (
        <div style={{ padding: '20px' }}>
            <CustomDragLayer />
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
                onDragEnd={handleDragEnd}
            />
            <div style={controlsContainerStyle}>
                <ResetButton onClick={handleReset} disabled={!hasPlacedWords} />
                <RotateButton
                    onClick={() => selectedWord && rotateWord(selectedWord)}
                    disabled={!selectedWord}
                />
                <CheckButton onClick={handleCheckWords} disabled={!hasPlacedWords} />
            </div>
            <Scores
                scores={scores}
                maxScore={maxScore}
                controlsWidth={controlsWidth}
                getScoreColor={getScoreColor}
            />
            {showModal && <FoundWordsModal words={foundWords} onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default WordGame;
