import { useState, useCallback, useEffect } from 'react';
import { useDrag, useDrop, useDragLayer } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { theme } from '../styles';
import { RotateCw } from 'lucide-react';

// Constants
const GRID_SIZE = 5;
const CELL_SIZE = 60;

const initialWords = [
    { id: '1', text: 'REACT', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
    { id: '2', text: 'DRAG', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
    { id: '3', text: 'DROP', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
    { id: '4', text: 'GAME', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
];

// Touch event handling for mobile compatibility
const onTouchStart = (e) => {
    e.preventDefault();
};

const TOUCH_STYLE = {
    touchAction: 'none',
};

// Utility function to check if a word can be placed
const canPlaceWord = (grid, word, x, y, orientation) => {
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
        if (newX >= GRID_SIZE || newY >= GRID_SIZE) return false;
        if (currentPositions.has(`${newX},${newY}`)) continue;
        if (grid[newY][newX] !== '') return false;
    }
    return true;
};

// DraggableWord Component
const DraggableWord = ({ word, onDragEnd, isSelected, onSelect }) => {
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
        ...TOUCH_STYLE,
    };

    return (
        <div ref={drag} style={style} onClick={() => onSelect(word)} onTouchStart={onTouchStart}>
            {word.text}
        </div>
    );
};

// GridCell Component
const GridCell = ({ x, y, letter, isFirstLetter, previewWord, word, isSelected, onSelect, canPlaceWord, grid }) => {
    const [{ isDragging }, drag, preview] = useDrag({
        type: 'PLACED_WORD',
        item: { type: 'PLACED_WORD', x, y, letter, word },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            if (!monitor.getDropResult() && item.word) {
                onSelect(null); // Clear selection if dropped outside
            }
        },
    });

    useEffect(() => {
        if (letter) {
            preview(getEmptyImage(), { captureDraggingState: true });
        }
    }, [preview, letter]);

    const isPartOfPreview =
        previewWord &&
        ((previewWord.word.orientation === 'horizontal' &&
            y === previewWord.y &&
            x >= previewWord.x &&
            x < previewWord.x + previewWord.word.text.length) ||
            (previewWord.word.orientation === 'vertical' &&
                x === previewWord.x &&
                y >= previewWord.y &&
                y < previewWord.y + previewWord.word.text.length));

    const isInvalidPreview =
        isPartOfPreview && !canPlaceWord(grid, previewWord.word, previewWord.x, previewWord.y, previewWord.word.orientation);

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
            ? isInvalidPreview
                ? '#ffebee' // Light red for invalid
                : '#f7d794' // Yellow for valid
            : isSelected
                ? '#f7d794'
                : '#fff',
        position: 'relative',
        color: letter ? '#000' : previewWord ? '#999' : '#000',
        cursor: letter ? 'move' : 'default',
        opacity: isDragging ? 0 : 1,
        transition: 'all 0.2s ease',
        boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        ...TOUCH_STYLE,
    };

    return (
        <div
            ref={letter ? drag : null}
            style={style}
            onClick={() => word && onSelect(word)}
            onTouchStart={onTouchStart}
        >
            {letter || (previewWord?.word?.text?.[previewWord.index])}
            {isFirstLetter && (
                <span style={{ color: 'red', position: 'absolute', top: 2, right: 2 }}>*</span>
            )}
        </div>
    );
};

// CustomDragLayer Component
const CustomDragLayer = () => {
    const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    if (!isDragging || !currentOffset) return null;

    const word = item.type === 'PLACED_WORD' ? item.word : item;
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

    return <div style={style}>{word.text}</div>;
};

// Grid Component
const Grid = ({ grid, words, selectedWord, previewPosition, dropRef, getPreviewLetter, canPlaceWord, onSelect }) => {
    const getWordAt = useCallback(
        (x, y) => {
            return words.find((w) => {
                if (!w.isPlaced) return false;
                const dx = w.orientation === 'horizontal' ? 1 : 0;
                const dy = w.orientation === 'vertical' ? 1 : 0;
                for (let i = 0; i < w.text.length; i++) {
                    const newX = w.x + dx * i;
                    const newY = w.y + dy * i;
                    if (newX === x && newY === y) return true;
                }
                return false;
            });
        },
        [words]
    );

    return (
        <div
            id="grid"
            ref={dropRef}
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
            {grid.map((row, y) =>
                row.map((letter, x) => {
                    const isFirstLetter = letter && words.some((w) => w.isPlaced && w.x === x && w.y === y);
                    const previewLetter = getPreviewLetter(x, y, previewPosition);
                    const word = getWordAt(x, y);

                    return (
                        <GridCell
                            key={`${x}-${y}`}
                            x={x}
                            y={y}
                            letter={letter}
                            isFirstLetter={isFirstLetter}
                            previewWord={previewLetter}
                            word={word}
                            isSelected={word && selectedWord?.id === word.id}
                            onSelect={onSelect}
                            canPlaceWord={canPlaceWord}
                            grid={grid}
                        />
                    );
                })
            )}
        </div>
    );
};

// WordList Component
const WordList = ({ words, selectedWord, onSelect, onDragEnd }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '20px',
                gap: '8px',
            }}
        >
            {words
                .filter((word) => !word.isPlaced)
                .map((word) => (
                    <DraggableWord
                        key={word.id}
                        word={word}
                        onDragEnd={onDragEnd}
                        isSelected={selectedWord?.id === word.id}
                        onSelect={onSelect}
                    />
                ))}
        </div>
    );
};

// Main WordGame Component
const WordGame = () => {
    const [words, setWords] = useState(initialWords);
    const [selectedWord, setSelectedWord] = useState(null);
    const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('')));
    const [previewPosition, setPreviewPosition] = useState(null);

    const placeWord = useCallback(
        (word, x, y, orientation) => {
            const newGrid = grid.map((row) => [...row]);
            const dx = orientation === 'horizontal' ? 1 : 0;
            const dy = orientation === 'vertical' ? 1 : 0;

            for (let i = 0; i < word.text.length; i++) {
                const newX = x + dx * i;
                const newY = y + dy * i;
                newGrid[newY][newX] = word.text[i];
            }

            setGrid(newGrid);
            setWords((prev) =>
                prev.map((w) => (w.id === word.id ? { ...w, isPlaced: true, x, y, orientation } : w))
            );
        },
        [grid]
    );

    const removeWord = useCallback(
        (word) => {
            const newGrid = grid.map((row) => [...row]);
            const dx = word.orientation === 'horizontal' ? 1 : 0;
            const dy = word.orientation === 'vertical' ? 1 : 0;

            for (let i = 0; i < word.text.length; i++) {
                const newX = word.x + dx * i;
                const newY = word.y + dy * i;
                newGrid[newY][newX] = '';
            }

            setGrid(newGrid);
            setWords((prev) =>
                prev.map((w) => (w.id === word.id ? { ...w, isPlaced: false, x: 0, y: 0 } : w))
            );
        },
        [grid]
    );

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

    const [, drop] = useDrop({
        accept: ['WORD', 'PLACED_WORD'],
        drop: (item, monitor) => {
            const offset = monitor.getClientOffset();
            const gridElement = document.getElementById('grid');
            if (!gridElement) return;

            const gridRect = gridElement.getBoundingClientRect();
            const x = Math.floor((offset.x - gridRect.left) / CELL_SIZE);
            const y = Math.floor((offset.y - gridRect.top) / CELL_SIZE);

            if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
                const wordToPlace = item.type === 'PLACED_WORD' ? item.word : item;
                if (!wordToPlace) return;

                if (item.type === 'PLACED_WORD') {
                    removeWord(wordToPlace);
                }

                if (canPlaceWord(grid, wordToPlace, x, y, wordToPlace.orientation)) {
                    placeWord(wordToPlace, x, y, wordToPlace.orientation);
                    setSelectedWord(null);
                } else if (item.type === 'PLACED_WORD') {
                    placeWord(wordToPlace, wordToPlace.x, wordToPlace.y, wordToPlace.orientation);
                }
            }
            setPreviewPosition(null);
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

            if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
                setPreviewPosition(null);
                return;
            }

            const wordToPreview = item.type === 'PLACED_WORD' ? item.word : item;
            if (!wordToPreview) {
                setPreviewPosition(null);
                return;
            }

            if (item.type === 'PLACED_WORD') {
                removeWord(wordToPreview);
            }

            setPreviewPosition({ x, y, word: wordToPreview });

            if (
                !canPlaceWord(grid, wordToPreview, x, y, wordToPreview.orientation) &&
                item.type === 'PLACED_WORD'
            ) {
                placeWord(wordToPreview, wordToPreview.x, wordToPreview.y, wordToPreview.orientation);
            }
        },
    });

    const handleWordSelect = (word) => {
        setSelectedWord(word);
    };

    const rotateWord = useCallback(
        (word) => {
            const rotatedWord = {
                ...word,
                orientation: word.orientation === 'horizontal' ? 'vertical' : 'horizontal',
            };

            if (word.isPlaced) {
                // Create a new grid and remove the original word
                const newGrid = grid.map((row) => [...row]);
                const dx = word.orientation === 'horizontal' ? 1 : 0;
                const dy = word.orientation === 'vertical' ? 1 : 0;
                for (let i = 0; i < word.text.length; i++) {
                    const newX = word.x + dx * i;
                    const newY = word.y + dy * i;
                    newGrid[newY][newX] = '';
                }

                // Check if the rotated word can be placed on the updated grid
                if (canPlaceWord(newGrid, rotatedWord, word.x, word.y, rotatedWord.orientation)) {
                    // Place the rotated word on the new grid
                    const rotatedDx = rotatedWord.orientation === 'horizontal' ? 1 : 0;
                    const rotatedDy = rotatedWord.orientation === 'vertical' ? 1 : 0;
                    for (let i = 0; i < rotatedWord.text.length; i++) {
                        const newX = word.x + rotatedDx * i;
                        const newY = word.y + rotatedDy * i;
                        newGrid[newY][newX] = rotatedWord.text[i];
                    }
                    setGrid(newGrid);
                    setWords((prev) =>
                        prev.map((w) => (w.id === word.id ? { ...rotatedWord, isPlaced: true, x: word.x, y: word.y } : w))
                    );
                } else {
                    // If it can't be placed, update the grid with the word removed and mark it as unplaced
                    setGrid(newGrid);
                    setWords((prev) =>
                        prev.map((w) => (w.id === word.id ? { ...rotatedWord, isPlaced: false, x: 0, y: 0 } : w))
                    );
                }
            } else {
                // If the word isn't placed, just update its orientation
                setWords((prev) => prev.map((w) => (w.id === word.id ? rotatedWord : w)));
            }
        },
        [grid]
    );

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
        },
    };

    return (
        <div style={{ padding: '20px' }}>
            <CustomDragLayer />
            <Grid
                grid={grid}
                words={words}
                selectedWord={selectedWord}
                previewPosition={previewPosition}
                dropRef={drop}
                getPreviewLetter={getPreviewLetter}
                canPlaceWord={canPlaceWord}
                onSelect={handleWordSelect}
            />
            <WordList
                words={words}
                selectedWord={selectedWord}
                onSelect={handleWordSelect}
                onDragEnd={(item, result) => {
                    if (!result && item.isPlaced) {
                        removeWord(item);
                    }
                }}
            />
            {selectedWord && (
                <div style={rotationControlsStyle}>
                    <RotateCw size={32} style={iconStyle} onClick={() => rotateWord(selectedWord)} />
                </div>
            )}
        </div>
    );
};

export default WordGame;