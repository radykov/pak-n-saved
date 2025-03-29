import { useState, useCallback, useMemo } from 'react';
import { useDrag, useDrop, useDragLayer } from 'react-dnd';
import { theme } from '../styles';
import { RotateCw, RotateCcw } from 'lucide-react';

const GRID_SIZE = 5;
const CELL_SIZE = 60;
const SNAP_THRESHOLD = 20; // pixels within which to snap

const initialWords = [
    { id: '1', text: 'REACT', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
    { id: '2', text: 'DRAG', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
    { id: '3', text: 'DROP', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
    { id: '4', text: 'GAME', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
];

const DraggableWord = ({ word, onDragStart, onDragEnd, isSelected, onSelect }) => {
    const [{ isDragging }, drag] = useDrag({
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

    const style = {
        padding: '8px 16px',
        margin: '4px',
        background: isSelected ? '#f7d794' : '#fff',
        border: '2px solid #ddd',
        borderRadius: '4px',
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease',
        boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        writingMode: word.orientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb',
        textOrientation: word.orientation === 'vertical' ? 'mixed' : 'initial',
        height: word.orientation === 'vertical' ? `${word.text.length * 24}px` : 'auto',
        width: word.orientation === 'horizontal' ? `${word.text.length * 16}px` : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1',
    };

    return (
        <div
            ref={drag}
            style={style}
            onClick={() => onSelect(word)}
        >
            {word.text}
        </div>
    );
};

const GridCell = ({ x, y, letter, isPreview, isFirstLetter, previewWord, onDragStart, onDragEnd, word, isSelected, onSelect }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'PLACED_WORD',
        item: { type: 'PLACED_WORD', x, y, letter, word },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            onDragEnd(item, monitor.getDropResult());
        },
    });

    const isPartOfSelectedWord = isSelected && word && (
        (word.orientation === 'horizontal' && y === word.y && x >= word.x && x < word.x + word.text.length) ||
        (word.orientation === 'vertical' && x === word.x && y >= word.y && y < word.y + word.text.length)
    );

    const isPartOfPreview = previewWord && (
        (previewWord.word.orientation === 'horizontal' && y === previewWord.y && x >= previewWord.x && x < previewWord.x + previewWord.word.text.length) ||
        (previewWord.word.orientation === 'vertical' && x === previewWord.x && y >= previewWord.y && y < previewWord.y + previewWord.word.text.length)
    );

    const style = {
        width: CELL_SIZE,
        height: CELL_SIZE,
        border: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        background: isPartOfPreview || isPartOfSelectedWord ? '#f7d794' : '#fff',
        position: 'relative',
        color: letter ? '#000' : (previewWord ? '#999' : '#000'),
        cursor: letter ? 'move' : 'default',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease',
        boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
    };

    return (
        <div
            ref={letter ? drag : null}
            style={style}
            onClick={() => word && onSelect(word)}
        >
            {letter || (previewWord?.word?.text?.[previewWord.index])}
            {isFirstLetter && <span style={{ color: 'red', position: 'absolute', top: 2, right: 2 }}>*</span>}
        </div>
    );
};

const CustomDragLayer = () => {
    const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    if (!isDragging || !currentOffset) {
        return null;
    }

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
    };

    return (
        <div style={style}>
            {item.type === 'PLACED_WORD' ? item.word.text : item.text}
        </div>
    );
};

const WordGame = () => {
    const [words, setWords] = useState(initialWords);
    const [selectedWord, setSelectedWord] = useState(null);
    const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('')));
    const [previewPosition, setPreviewPosition] = useState(null);

    const canPlaceWord = useCallback((word, x, y, orientation) => {
        const wordLength = word.text.length;
        const dx = orientation === 'horizontal' ? 1 : 0;
        const dy = orientation === 'vertical' ? 1 : 0;

        for (let i = 0; i < wordLength; i++) {
            const newX = x + (dx * i);
            const newY = y + (dy * i);

            if (newX >= GRID_SIZE || newY >= GRID_SIZE) return false;
            if (grid[newY][newX] !== '') return false;
        }
        return true;
    }, [grid]);

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
    }, [grid]);

    const removeWord = useCallback((word) => {
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
    }, [grid]);

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

                // For placed words, remove them first
                if (item.type === 'PLACED_WORD') {
                    removeWord(wordToPlace);
                }

                // Check if we can place the word in the new position
                if (canPlaceWord(wordToPlace, x, y, wordToPlace.orientation)) {
                    placeWord(wordToPlace, x, y, wordToPlace.orientation);
                    setSelectedWord(null); // Deselect the word when successfully placed
                } else {
                    // If we can't place it and it was a placed word, we need to restore it
                    if (item.type === 'PLACED_WORD') {
                        placeWord(wordToPlace, wordToPlace.x, wordToPlace.y, wordToPlace.orientation);
                    }
                }
            }
            setPreviewPosition(null);
        },
        hover: (item, monitor) => {
            const offset = monitor.getClientOffset();
            const gridElement = document.getElementById('grid');
            if (!gridElement) return;

            const gridRect = gridElement.getBoundingClientRect();
            const x = Math.floor((offset.x - gridRect.left) / CELL_SIZE);
            const y = Math.floor((offset.y - gridRect.top) / CELL_SIZE);

            if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
                const wordToPreview = item.type === 'PLACED_WORD' ? item.word : item;
                if (!wordToPreview) return;

                // For placed words, temporarily remove them from the grid for preview
                if (item.type === 'PLACED_WORD') {
                    removeWord(wordToPreview);
                }

                if (canPlaceWord(wordToPreview, x, y, wordToPreview.orientation)) {
                    setPreviewPosition({ x, y, word: wordToPreview });
                } else {
                    setPreviewPosition(null);
                    // Restore the word if we can't place it here
                    if (item.type === 'PLACED_WORD') {
                        placeWord(wordToPreview, wordToPreview.x, wordToPreview.y, wordToPreview.orientation);
                    }
                }
            }
        },
    });

    const handleWordSelect = (word) => {
        setSelectedWord(word);
    };

    const rotateWord = useCallback((word) => {
        if (word.isPlaced) return;

        setWords(prev => prev.map(w => {
            if (w.id !== word.id) return w;

            return {
                ...w,
                orientation: w.orientation === 'horizontal' ? 'vertical' : 'horizontal'
            };
        }));
    }, []);

    const getPreviewLetter = useCallback((x, y, previewPosition) => {
        if (!previewPosition?.word) return null;

        const { word, x: startX, y: startY } = previewPosition;
        const dx = word.orientation === 'horizontal' ? 1 : 0;
        const dy = word.orientation === 'vertical' ? 1 : 0;

        // Calculate the relative position from the start of the word
        const relativeX = x - startX;
        const relativeY = y - startY;

        // Only show preview if we're in the word's path
        if (word.orientation === 'horizontal') {
            if (y !== startY || relativeX < 0 || relativeX >= word.text.length) return null;
        } else {
            if (x !== startX || relativeY < 0 || relativeY >= word.text.length) return null;
        }

        const index = word.orientation === 'horizontal' ? relativeX : relativeY;
        return { word, index, x: startX, y: startY };
    }, []);

    const handleGridCellDragEnd = useCallback((item, result) => {
        if (!result && item.word) {
            removeWord(item.word);
            setPreviewPosition(null);
            setSelectedWord(null);
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
                                isSelected={word && selectedWord?.id === word.id}
                                onSelect={handleWordSelect}
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
                        isSelected={selectedWord?.id === word.id}
                        onSelect={handleWordSelect}
                    />
                ))}
            </div>

            {selectedWord && !selectedWord.isPlaced && (
                <div style={rotationControlsStyle}>
                    <RotateCw
                        size={32}
                        style={iconStyle}
                        onClick={() => rotateWord(selectedWord)}
                    />
                </div>
            )}
        </div>
    );
};

export default WordGame;