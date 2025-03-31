// WordGrid.js
import React from 'react';
import GridCell from './GridCell'; // Adjust path as necessary
import { CELL_SIZE } from './constants'; // Adjust path as necessary

const WordGrid = ({
    grid,
    words,
    selectedWordId,
    previewPosition,
    getPreviewLetter,
    handleGridCellDragEnd,
    canPlaceWord,
    handleWordSelect,
    setGridRef,
}) => {
    return (
        <div
            id="grid"
            ref={setGridRef}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${grid[0].length}, ${CELL_SIZE}px)`,
                gap: '1px',
                background: '#ddd',
                padding: '1px',
                margin: '0 auto',
                width: 'fit-content',
            }}
        >
            {grid.map((row, y) =>
                row.map((cell, x) => {
                    const letter = grid[y][x];
                    const isPreview =
                        previewPosition &&
                        previewPosition.x === x &&
                        previewPosition.y === y;
                    const isFirstLetter =
                        letter &&
                        words.some((w) => w.isPlaced && w.x === x && w.y === y);
                    const previewLetter = getPreviewLetter(x, y, previewPosition);
                    const word = words.find((w) => {
                        if (!w.isPlaced) return false;
                        const dx = w.orientation === 'horizontal' ? 1 : 0;
                        const dy = w.orientation === 'vertical' ? 1 : 0;
                        const wordLength = w.text.length;

                        for (let i = 0; i < wordLength; i++) {
                            const newX = w.x + dx * i;
                            const newY = w.y + dy * i;
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
    );
};

export default WordGrid;