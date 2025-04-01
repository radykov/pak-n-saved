import { useState, useCallback, useRef, useEffect } from 'react';
import { findWordsInGrid, useStartingWordInfo } from '../utils/WordUtils';
import { usePlaceWord, useCanPlaceWord, useRemoveWord, useRotateWord, useDropWord } from '../hooks/GridPlaceHooks';
import FoundWordsModal from './FoundWordsModal';
import WordGrid from './WordGrid';
import CustomDragLayer from './CustomDragLayer';
import WordsList from './WordsList';
import BasicScore from './BasicScore';
import { RotateButton } from './ActionButtons';

const WordGame = () => {
    const { startingWords: initialWords, gridDimensions, maxScore } = useStartingWordInfo();
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
    const [currentScore, setCurrentScore] = useState(0);

    const gridRef = useRef(null);

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

    // Automatically update score when grid changes
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

    const controlsContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0',
        width: controlsWidth || 'auto',
        margin: '20px auto 0',
    };

    return (
        <div>
            <CustomDragLayer />
            <BasicScore currentScore={currentScore} maxScore={maxScore} />
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
                <RotateButton
                    onClick={() => selectedWord && rotateWord(selectedWord)}
                    disabled={!selectedWord}
                />
            </div>
            {showModal && <FoundWordsModal words={foundWords} onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default WordGame;