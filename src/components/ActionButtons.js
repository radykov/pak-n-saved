import { useState, useCallback, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { findWordsInGrid, useStartingWordInfo } from '../utils/WordUtils';
import { usePlaceWord, useCanPlaceWord, useRemoveWord, useRotateWord } from '../hooks/GridPlaceHooks';
import FoundWordsModal from './FoundWordsModal';
import DraggableWord from './DraggableWord';
import GridCell from './GridCell';
import { CELL_SIZE } from './constants';
import CustomDragLayer from './CustomDragLayer';
import ActionButtons from './ActionButtons';

const WordGame = () => {
    const { startingWords: initialWords, gridDimensions } = useStartingWordInfo();
    const [words, setWords] = useState(initialWords);
    const [selectedWordId, setSelectedWordId] = useState(null);
    const selectedWord = words.find(w => w.id === selectedWordId);
    const [grid, setGrid] = useState(Array(gridDimensions.height).fill().map(() => Array(gridDimensions.width).fill('')));
    const [previewPosition, setPreviewPosition] = useState(null);
    const [foundWords, setFoundWords] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isDraggingPlacedWord, setIsDraggingPlacedWord] = useState(false);
    const [controlsWidth, setControlsWidth] = useState(null);

    // Reference to the grid element
    const gridRef = useRef(null);

    // Calculate and store the width of the grid when component mounts
    useEffect(() => {
        if (gridRef.current) {
            // Use the grid width for the controls
            setControlsWidth(gridRef.current.offsetWidth);
        }
    }, []);

    const placeWord = usePlaceWord(grid, setGrid, words, setWords);
    const removeWord = useRemoveWord(grid, setGrid, words, setWords);
    const canPlaceWord = useCanPlaceWord(grid);
    const rotateWord = useRotateWord(canPlaceWord, setGrid, setWords, grid);

    const hasPlacedWords = words.some(word => word.isPlaced);

    const handleCheckWords = () => {
        const words = findWordsInGrid(grid, initialWords);
        console.log(words);
        setFoundWords(words);
        setShowModal(true);
    };

    const handleReset = () => {
        // Reset grid to empty
        setGrid(Array(gridDimensions.height).fill().map(() => Array(gridDimensions.width).fill('')));
        // Reset words to initial state
        setWords(initialWords.map(word => ({ ...word, isPlaced: false, x: null, y: null })));
        // Clear selected word
        setSelectedWordId(null);
        // Clear preview position
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

            // Check if dropped within the grid bounds
            if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length) {
                const wordToPlace = item.type === 'PLACED_WORD' ? item.word : item;
                if (!wordToPlace) return;

                // Only remove if it's already placed
                if (item.type === 'PLACED_WORD' && wordToPlace.isPlaced) {
                    removeWord(wordToPlace);
                }

                // Try to place the word in the new position
                if (canPlaceWord(wordToPlace, x, y, wordToPlace.orientation)) {
                    placeWord(wordToPlace, x, y, wordToPlace.orientation);
                    setSelectedWordId(null);
                } else if (item.type === 'PLACED_WORD' && wordToPlace.isPlaced) {
                    // If can't place in new position, restore to original position
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

            // Check if cursor is outside the grid
            if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
                setPreviewPosition(null);
                return;
            }

            const wordToPreview = item.type === 'PLACED_WORD' ? item.word : item;
            if (!wordToPreview) {
                setPreviewPosition(null);
                return;
            }

            // Track if we're currently dragging a placed word
            if (item.type === 'PLACED_WORD' && !isDraggingPlacedWord) {
                setIsDraggingPlacedWord(true);
                removeWord(wordToPreview);
            }

            setPreviewPosition({ x, y, word: wordToPreview });
        },
    });

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

    const handleGridCellDragEnd = useCallback((item) => {
        // This is called when the drag operation ends outside of a drop target
        if (item.word && item.word.isPlaced) {
            removeWord(item.word);
            setPreviewPosition(null);
            setSelectedWordId(null);
            setIsDraggingPlacedWord(false);
        }
    }, [removeWord]);

    return (
        <div style={{ padding: '20px' }}>
            <CustomDragLayer />
            <div
                id="grid"
                ref={(el) => {
                    drop(el);
                    gridRef.current = el;
                    if (el && !controlsWidth) {
                        setControlsWidth(el.offsetWidth);
                    }
                }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${grid[0].length}, ${CELL_SIZE}px)`,
                    gap: '1px',
                    background: '#ddd',
                    padding: '1px',
                    margin: '0 auto',
                    width: 'fit-content',
                }}
            >
                {Array(grid.length).fill().map((_, y) =>
                    Array(grid[0].length).fill().map((_, x) => {
                        const letter = grid[y][x];
                        const isPreview = previewPosition &&
                            previewPosition.x === x &&
                            previewPosition.y === y;
                        const isFirstLetter = letter &&
                            words.some(w => w.isPlaced && w.x === x && w.y === y);
                        const previewLetter = getPreviewLetter(x, y, previewPosition);
                        const word = words.find(w => {
                            if (!w.isPlaced) return false;
                            const dx = w.orientation === 'horizontal' ? 1 : 0;
                            const dy = w.orientation === 'vertical' ? 1 : 0;
                            const wordLength = w.text.length;

                            for (let i = 0; i < wordLength; i++) {
                                const newX = w.x + (dx * i);
                                const newY = w.y + (dy * i);
                                if (newX === x && newY === y) {
                                    return true;
                                }
                            }
                            return false;
                        });

                        return (
                            <GridCell
                                key={`${x}-${y}`}
                                x={x}
                                y={y}
                                letter={letter}
                                isPreview={isPreview}
                                isFirstLetter={isFirstLetter}
                                previewWord={previewLetter}
                                onDragStart={() => { }}
                                onDragEnd={handleGridCellDragEnd}
                                word={word}
                                isSelected={word && selectedWordId === word.id}
                                onSelect={handleWordSelect}
                                canPlaceWord={canPlaceWord}
                            />
                        );
                    })
                )}
            </div>

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginTop: '20px',
                    gap: '8px',
                    alignItems: 'flex-start',
                }}
            >
                {words.filter(word => !word.isPlaced).map(word => (
                    <DraggableWord
                        key={word.id}
                        word={word}
                        onDragStart={() => { }}
                        onDragEnd={(item, result) => {
                            if (!result) {
                                removeWord(item);
                            }
                        }}
                        isSelected={selectedWordId === word.id}
                        onSelect={handleWordSelect}
                    />
                ))}
            </div>

            <ActionButtons
                onReset={handleReset}
                onRotate={() => selectedWord && rotateWord(selectedWord)}
                onCheck={handleCheckWords}
                isResetDisabled={!hasPlacedWords}
                isRotateDisabled={!selectedWord}
                isCheckDisabled={!hasPlacedWords}
                controlsWidth={controlsWidth}
            />

            {showModal && (
                <FoundWordsModal
                    words={foundWords}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default WordGame;