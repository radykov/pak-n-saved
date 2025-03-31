import { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { onTouchStart, TOUCH_STYLE, CELL_SIZE } from './constants';


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

export default GridCell;