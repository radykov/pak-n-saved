import { useDragLayer } from 'react-dnd';
import { memo } from 'react';

// Memoize the component to prevent unnecessary re-renders
const CustomDragLayer = memo(() => {
    const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        currentOffset: monitor.getClientOffset(),
        isDragging: monitor.isDragging(),
        // Remove initialClientOffset if not used to reduce calculation overhead
    }));

    // Early return if not dragging or no offset yet
    if (!isDragging || !currentOffset) {
        return null;
    }

    const word = item.type === 'PLACED_WORD' ? item.word : item;
    if (!word) return null;

    const isVertical = word.orientation === 'vertical';
    const fontSize = 32;

    // Pre-calculate styles outside of render
    const transform = `translate(${currentOffset.x}px, ${currentOffset.y}px)`;

    const style = {
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 1000,
        left: 0,
        top: 0,
        transform,
        WebkitTransform: transform, // For Safari
        msTransform: transform, // For older IE
        padding: '8px 16px',
        background: '#fff',
        border: '2px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        opacity: 0.8,
        // Use CSS transform for positioning instead of left/top for better performance
        willChange: 'transform', // Hint to browser for optimization
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
});

export default CustomDragLayer;