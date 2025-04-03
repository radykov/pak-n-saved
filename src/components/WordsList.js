import React from 'react';
import DraggableWord from './DraggableWord';

const WordsList = ({ words, selectedWordId, onSelect, onDragEnd, onDeselect }) => {
    return (
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
            {words.map(word => (
                <DraggableWord
                    key={word.id}
                    word={word}
                    onDragStart={() => { }}
                    onDragEnd={onDragEnd}
                    onDeselect={onDeselect}
                    isSelected={selectedWordId === word.id}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
};

export default WordsList;