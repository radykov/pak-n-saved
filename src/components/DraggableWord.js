import { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { TOUCH_STYLE, onContextMenu } from './constants';

const DraggableWord = ({ word, onDragEnd, isSelected, onSelect, onDeselect }) => {
    const [{ isDragging }, drag, preview] = useDrag({
        type: 'WORD',
        item: () => {
            onSelect(word); // Called when drag starts
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
        touchAction: 'none',
        ...TOUCH_STYLE,
    };

    return (
        <div
            id={`word-${word.id}`} // Added unique id
            ref={drag}
            style={style}
            onMouseDown={() => onSelect(word)} // Called when clicked
            onMouseUp={() => onDeselect()}
            onTouchStart={(_event) => {
                onSelect(word);
            }}
            onTouchEnd={() => onDeselect()}
            onContextMenu={onContextMenu}
        >
            {word.text}
        </div>
    );
};

export default DraggableWord;