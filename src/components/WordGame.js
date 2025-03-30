import { useState, useCallback, useEffect } from 'react';
import { useDrag, useDrop, useDragLayer } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { theme } from '../styles';
import { RotateCw, CheckCircle, X } from 'lucide-react';
import englishWords from 'an-array-of-english-words';

const GRID_SIZE = 5;
const CELL_SIZE = 60;

const initialWords = [
    { id: '1', text: 'REACT', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
    { id: '2', text: 'DRAG', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
    { id: '3', text: 'DROP', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
    { id: '4', text: 'GAME', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
];

// Prevent touch scrolling for better mobile interaction
const onTouchStart = (e) => {
    e.preventDefault();
};

const TOUCH_STYLE = {
    touchAction: 'none'
};

function getSubWords(words, dictionary) {
    const subWords = new Set();
    for (const { text } of words) {
        const wordLength = text.length;
        // Generate sub-words of lengths from 3 up to wordLength - 1
        for (let substrLength = 3; substrLength < wordLength; substrLength++) {
            // Iterate all possible starting positions for the current length
            for (let start = 0; start <= wordLength - substrLength; start++) {
                const end = start + substrLength;
                const substring = text.slice(start, end);
                // Check if the substring is a valid word in the dictionary (case-insensitive)
                if (dictionary.has(substring.toLowerCase())) {
                    subWords.add(substring);
                }
            }
        }
    }
    return subWords;
}


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
            if (newX >= GRID_SIZE || newY >= GRID_SIZE || newX < 0 || newY < 0) return false;
            if (currentPositions.has(`${newX},${newY}`)) continue;
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

// Function to find all valid words in the grid
const findWordsInGrid = (grid) => {
    const foundWords = new Set();
    const directions = [
        // Horizontal (left to right)
        { dx: 1, dy: 0 },
        // Vertical (top to bottom)
        { dx: 0, dy: 1 },
        // Diagonal (top-left to bottom-right)
        { dx: 1, dy: 1 },
    ];

    // Convert the dictionary to lowercase for case-insensitive comparison
    const dictionary = new Set(englishWords.map(word => word.toLowerCase()));
    const subWords = getSubWords(initialWords, dictionary);

    // Search in all directions starting from each cell
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (grid[y][x] === '') continue;

            directions.forEach(({ dx, dy }) => {
                let word = '';
                let curX = x;
                let curY = y;

                // Continue in this direction until we reach the grid boundary
                while (
                    curX >= 0 && curX < GRID_SIZE &&
                    curY >= 0 && curY < GRID_SIZE &&
                    grid[curY][curX] !== ''
                ) {
                    word += grid[curY][curX];

                    // Check if current word is valid (min length 3)
                    if (word.length >= 3 && dictionary.has(word.toLowerCase()) && !subWords.has(word)) {
                        foundWords.add(word.toLowerCase());
                    }

                    curX += dx;
                    curY += dy;
                }
            });
        }
    }

    return Array.from(foundWords).sort();
};

// FoundWordsModal component
const FoundWordsModal = ({ words, onClose }) => {
    if (!words || words.length === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            }}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    maxWidth: '80%',
                    maxHeight: '80%',
                    overflow: 'auto',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                    }}
                >
                    <h2 style={{ margin: 0 }}>Found Words: {words.length}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}
                >
                    {words.map((word, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                            }}
                        >
                            {word}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// DraggableWord component
const DraggableWord = ({ word, onDragStart, onDragEnd, isSelected, onSelect }) => {
    const [{ isDragging }, drag, preview] = useDrag({
        type: 'WORD',
        item: () => {
            onSelect(word);
            return { type: 'WORD', ...word };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            onDragEnd(item, monitor.getDropResult());
        },
    });

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    const style = {
        padding: word.orientation === 'horizontal' ? '8px 16px' : '16px 8px',
        margin: '4px',
        background: isSelected ? '#f7d794' : '#fff',
        border: '2px solid #ddd',
        borderRadius: '4px',
        cursor: 'move',
        opacity: isDragging ? 0 : 1,
        transition: 'all 0.2s ease',
        boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        writingMode: word.orientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb',
        textOrientation: word.orientation === 'vertical' ? 'mixed' : 'initial',
        height: 'auto',
        width: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1',
        ...TOUCH_STYLE
    };

    return (
        <div
            ref={drag}
            style={style}
            onClick={() => onSelect(word)}
            onTouchStart={onTouchStart}
        >
            {word.text}
        </div>
    );
};

// GridCell component
const GridCell = ({ x, y, letter, isPreview, isFirstLetter, previewWord, onDragStart, onDragEnd, word, isSelected, onSelect, canPlaceWord }) => {
    const [{ isDragging }, drag, preview] = useDrag({
        type: 'PLACED_WORD',
        item: () => {
            // Call onSelect to update the selected word
            if (word) onSelect(word);
            return { type: 'PLACED_WORD', x, y, letter, word };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            // Check if dropped outside the grid
            if (!monitor.didDrop() && item.word) {
                onDragEnd(item);
            }
        },
    });

    useEffect(() => {
        if (letter) {
            preview(getEmptyImage(), { captureDraggingState: true });
        }
    }, [preview, letter]);

    const isPartOfSelectedWord = isSelected && word && (
        (word.orientation === 'horizontal' && y === word.y && x >= word.x && x < word.x + word.text.length) ||
        (word.orientation === 'vertical' && x === word.x && y >= word.y && y < word.y + word.text.length)
    );

    const isPartOfPreview = previewWord && (
        (previewWord.word.orientation === 'horizontal' && y === previewWord.y && x >= previewWord.x && x < previewWord.x + previewWord.word.text.length) ||
        (previewWord.word.orientation === 'vertical' && x === previewWord.x && y >= previewWord.y && y < previewWord.y + previewWord.word.text.length)
    );

    const isInvalidPreview = isPartOfPreview && !canPlaceWord(previewWord.word, previewWord.x, previewWord.y, previewWord.word.orientation);

    const style = {
        width: CELL_SIZE,
        height: CELL_SIZE,
        border: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        background: isPartOfPreview
            ? (isInvalidPreview ? '#ffebee' : '#f7d794')
            : (isPartOfSelectedWord ? '#f7d794' : '#fff'),
        position: 'relative',
        color: letter ? '#000' : (previewWord ? '#999' : '#000'),
        cursor: letter ? 'move' : 'default',
        opacity: isDragging ? 0 : 1,
        transition: 'all 0.2s ease',
        boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        ...TOUCH_STYLE
    };

    return (
        <div
            ref={letter ? drag : null}
            style={style}
            onClick={() => word && onSelect(word)}
            onTouchStart={onTouchStart}
        >
            {letter || (previewWord?.word?.text?.[previewWord.index])}
            {isFirstLetter && <span style={{ color: 'red', position: 'absolute', top: 2, right: 2 }}>*</span>}
        </div>
    );
};

// CustomDragLayer component
const CustomDragLayer = () => {
    const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    if (!isDragging || !currentOffset) {
        return null;
    }

    const word = item.type === 'PLACED_WORD' ? item.word : item;
    if (!word) return null;

    const isVertical = word.orientation === 'vertical';

    const style = {
        position: 'fixed',
        left: currentOffset.x,
        top: currentOffset.y,
        padding: '8px 16px',
        background: '#fff',
        border: '2px solid #ddd',
        borderRadius: '4px',
        cursor: 'move',
        opacity: 0.8,
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 1000,
        writingMode: isVertical ? 'vertical-rl' : 'horizontal-tb',
        textOrientation: isVertical ? 'mixed' : 'initial',
        height: isVertical ? `${word.text.length * 24}px` : 'auto',
        width: isVertical ? 'auto' : `${word.text.length * 16}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1',
    };

    return (
        <div style={style}>
            {word.text}
        </div>
    );
};

// Updated WordGame component
const WordGame = () => {
    const [words, setWords] = useState(initialWords);
    const [selectedWordId, setSelectedWordId] = useState(null);
    const selectedWord = words.find(w => w.id === selectedWordId);
    const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('')));
    const [previewPosition, setPreviewPosition] = useState(null);
    const [foundWords, setFoundWords] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isDraggingPlacedWord, setIsDraggingPlacedWord] = useState(false);

    const placeWord = usePlaceWord(grid, setGrid, words, setWords);
    const removeWord = useRemoveWord(grid, setGrid, words, setWords);
    const canPlaceWord = useCanPlaceWord(grid);
    const rotateWord = useRotateWord(canPlaceWord, setGrid, setWords, grid);

    const handleCheckWords = () => {
        const words = findWordsInGrid(grid);
        setFoundWords(words);
        setShowModal(true);
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
            if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
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
            if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
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

    const rotationControlsStyle = {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        marginTop: '20px',
        padding: '10px',
    };

    const iconStyle = {
        cursor: 'pointer',
        color: theme.colors.default,
        backgroundColor: theme.colors.arrowEnabled,
        transition: 'all 0.2s ease',
        padding: '8px',
        borderRadius: '4px',
        '&:hover': {
            transform: 'scale(1.1)',
        }
    };

    const buttonStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        margin: '20px auto 0',
        transition: 'all 0.2s ease',
    };

    return (
        <div style={{ padding: '20px' }}>
            <CustomDragLayer />
            <div
                id="grid"
                ref={drop}
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    gap: '1px',
                    background: '#ddd',
                    padding: '1px',
                    margin: '0 auto',
                    width: 'fit-content',
                }}
            >
                {Array(GRID_SIZE).fill().map((_, y) =>
                    Array(GRID_SIZE).fill().map((_, x) => {
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

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                {selectedWordId && (
                    <div style={rotationControlsStyle}>
                        <RotateCw
                            size={32}
                            style={iconStyle}
                            onClick={() => rotateWord(selectedWord)}
                        />
                    </div>
                )}
                <button style={buttonStyle} onClick={handleCheckWords}>
                    <CheckCircle size={20} />
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