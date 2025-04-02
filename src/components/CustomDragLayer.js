import { useDragLayer } from 'react-dnd';

const CustomDragLayer = () => {
    const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        currentOffset: monitor.getClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    if (!isDragging) {
        return null;
    }

    const word = item.type === 'PLACED_WORD' ? item.word : item;
    if (!word) return null;

    const isVertical = word.orientation === 'vertical';
    const fontSize = 32;
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
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
        zIndex: 1000,
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

    return (
        <div style={style}>
            {word.text}
        </div>
    );
};

export default CustomDragLayer;