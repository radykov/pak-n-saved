// WordGame.js
import { useState, useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { theme } from '../styles';
import { findWordsInGrid, useStartingWordInfo } from '../utils/WordUtils';
import { usePlaceWord, useCanPlaceWord, useRemoveWord, useRotateWord } from '../hooks/GridPlaceHooks';
import FoundWordsModal from './FoundWordsModal';
import WordGrid from './WordGrid'; // Import the new component
import { CELL_SIZE } from './constants';
import CustomDragLayer from './CustomDragLayer';
import WordsList from './WordsList';
import { ResetButton, RotateButton, CheckButton } from './ActionButtons'; // Adjust the path as necessary

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

    const gridRef = useRef(null);

    const placeWord = usePlaceWord(grid, setGrid, words, setWords);
    const removeWord = useRemoveWord(grid, setGrid, words, setWords);
    const canPlaceWord = useCanPlaceWord(grid);
    const rotateWord = useRotateWord(canPlaceWord, setGrid, setWords, grid);

    const hasPlacedWords = words.some((word) => word.isPlaced);

    const handleCheckWords = () => {
        const words = findWordsInGrid(grid, initialWords);
        console.log(words);
        setFoundWords(words);
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
    };

    const [, drop] = useDrop({
        accept: ['WORD', 'PLACED_WORD'],
        drop: (item, monitor) => {
            const offset = monitor.getClientOffset();
            const gridElement = document.getElementById('grid');
            if (!gridElement) return;

            const gridRect = gridElement.getBoundingClientRect();
            const x = Math.floor((offset.x - gridRect.left) / CELL_SIZE);
            const y = Math.floor((offset.y - gridRect.top) / CELL_SIZE);

            if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length) {
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

            const gridElement = document.getElementById('grid');
            if (!gridElement) {
                setPreviewPosition(null);
                return;
            }

            const gridRect = gridElement.getBoundingClientRect();
            const x = Math.floor((offset.x - gridRect.left) / CELL_SIZE);
            const y = Math.floor((offset.y - gridRect.top) / CELL_SIZE);

            if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
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
            {showModal && (
                <FoundWordsModal words={foundWords} onClose={() => setShowModal(false)} />
            )}
        </div>
    );
};

export default WordGame;