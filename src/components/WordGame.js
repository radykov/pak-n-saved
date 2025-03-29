import { useState, useCallback, useMemo } from 'react';
import { useDrag, useDrop, useDragLayer } from 'react-dnd';
import { theme } from '../styles';

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
        item: { type: 'WORD', ...word },
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

const GridCell = ({ x, y, letter, isPreview, isFirstLetter, previewWord, onDragStart, onDragEnd, word }) => {
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

    const style = {
        width: CELL_SIZE,
        height: CELL_SIZE,
        border: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        background: isPreview ? '#f7d794' : '#fff',
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
                if (item.type === 'WORD' && canPlaceWord(item, x, y, item.orientation)) {
                    placeWord(item, x, y, item.orientation);
                }
            }
        },
        hover: (item, monitor) => {
            if (item.type !== 'WORD') return;

            const offset = monitor.getClientOffset();
            const gridElement = document.getElementById('grid');
            if (!gridElement) return;

            const gridRect = gridElement.getBoundingClientRect();
            const x = Math.floor((offset.x - gridRect.left) / CELL_SIZE);
            const y = Math.floor((offset.y - gridRect.top) / CELL_SIZE);

            if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
                if (canPlaceWord(item, x, y, item.orientation)) {
                    setPreviewPosition({ x, y, word: item });
                } else {
                    setPreviewPosition(null);
                }
            }
        },
    });

    const handleWordSelect = (word) => {
        setSelectedWord(word);
    };

    const handleWordRotate = (word) => {
        if (!word.isPlaced) {
            setWords(prev => prev.map(w =>
                w.id === word.id
                    ? { ...w, orientation: w.orientation === 'horizontal' ? 'vertical' : 'horizontal' }
                    : w
            ));
        }
    };

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
        return { word, index };
    }, []);

    const handleGridCellDragEnd = useCallback((item, result) => {
        if (!result && item.word) {
            removeWord(item.word);
        }
    }, [removeWord]);

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
        </div>
    );
};

export default WordGame;