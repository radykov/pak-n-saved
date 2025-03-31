import { useState, useCallback, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { theme } from '../styles';
import { RotateCw } from 'lucide-react';
import { findWordsInGrid, useStartingWordInfo } from '../utils/WordUtils';
import { usePlaceWord, useCanPlaceWord, useRemoveWord, useRotateWord } from '../hooks/GridPlaceHooks';
import FoundWordsModal from './FoundWordsModal';
import GridCell from './GridCell';
import { CELL_SIZE } from './constants';
import CustomDragLayer from './CustomDragLayer';
import WordsList from './WordsList'; // Added import

const WordGame = () => {
    const { startingWords: initialWords, gridDimensions, id, maxScore } = useStartingWordInfo();
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
        setGrid(Array(gridDimensions.height).fill().map(() => Array(gridDimensions.width).fill('')));
        setWords(initialWords.map(word => ({ ...word, isPlaced: false, x: null, y: null })));
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
        if (item.word && item.word.isPlaced) {
            removeWord(item.word);
            setPreviewPosition(null);
            setSelectedWordId(null);
            setIsDraggingPlacedWord(false);
        }
    }, [removeWord]);

    // Filter unplaced words and define drag end handler
    const unplacedWords = words.filter(word => !word.isPlaced);
    const handleDragEnd = useCallback((item, result) => {
        if (!result) {
            removeWord(item);
        }
    }, [removeWord]);

    const controlsContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        padding: '0',
        width: controlsWidth || 'auto',
        margin: '20px auto 0',
    };

    const controlButtonsSharedStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        fontWeight: 'bold',
        fontSize: '16px',
    };

    const resetButtonStyle = {
        ...controlButtonsSharedStyles,
        backgroundColor: '#ff5252',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: hasPlacedWords ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease',
        opacity: hasPlacedWords ? 1 : 0.7,
    };

    const rotateButtonStyle = {
        ...controlButtonsSharedStyles,
        cursor: selectedWord ? 'pointer' : 'not-allowed',
        color: selectedWord ? theme.colors.default : '#cccccc',
        backgroundColor: selectedWord ? theme.colors.arrowEnabled : '#f0f0f0',
        borderRadius: '4px',
        border: 'none',
        transition: 'all 0.2s ease',
        opacity: selectedWord ? 1 : 0.7,
    };

    const checkButtonStyle = {
        ...controlButtonsSharedStyles,
        backgroundColor: hasPlacedWords ? '#4caf50' : '#cccccc',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: hasPlacedWords ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease',
        opacity: hasPlacedWords ? 1 : 0.7,
    };

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

            <WordsList
                words={unplacedWords}
                selectedWordId={selectedWordId}
                onSelect={handleWordSelect}
                onDragEnd={handleDragEnd}
            />

            <div style={controlsContainerStyle}>
                <button
                    style={resetButtonStyle}
                    onClick={handleReset}
                    disabled={!hasPlacedWords}
                >
                    Reset
                </button>

                <button
                    style={rotateButtonStyle}
                    onClick={() => selectedWord && rotateWord(selectedWord)}
                    disabled={!selectedWord}
                >
                    <RotateCw size={19} />
                </button>

                <button
                    style={checkButtonStyle}
                    onClick={handleCheckWords}
                    disabled={!hasPlacedWords}
                >
                    Check
                </button>
            </div>

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