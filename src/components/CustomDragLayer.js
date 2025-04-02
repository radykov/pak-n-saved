import { useDragLayer } from 'react-dnd';
import { memo } from 'react';

const CustomDragLayer = memo(({ selectedWord, initialPosition }) => {
    const {
        isDragging,
        item,
        initialSourceOffset,
        diff,
    } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        initialSourceOffset: monitor.getInitialSourceClientOffset(),
        diff: monitor.getDifferenceFromInitialOffset(),
        isDragging: monitor.isDragging(),
    }));

    let word = selectedWord;
    let position;

    if (isDragging && item && initialSourceOffset && diff) {
        // During drag, use the dragged item and calculate position
        word = item.type === 'PLACED_WORD' ? item.word : item;
        position = {
            x: initialSourceOffset.x + diff.x,
            y: initialSourceOffset.y + diff.y,
        };
    } else if (selectedWord && initialPosition) {
        console.log("clicekd to drag");
        // When selected but not dragging, use initial position
        word = selectedWord;
        position = initialPosition;
    } else {
        return null;
    }

    if (!word || !position) return null;

    const isVertical = word.orientation === 'vertical';
    const fontSize = 32;

    const style = {
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 1000,
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        padding: '8px 16px',
        background: '#fff',
        border: '2px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        opacity: 0.8,
        willChange: 'transform',
        writingMode: isVertical ? 'vertical-rl' : 'horizontal-tb',
        textOrientation: isVertical ? 'mixed' : 'initial',
        height: isVertical ? `${word.text.length * fontSize}px` : 'auto',
        width: isVertical ? 'auto' : `${word.text.length * fontSize}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1',
        fontSize,
        borderWidth: '4px',
    };

    return <div style={style}>{word.text}</div>;
});

export default CustomDragLayer;