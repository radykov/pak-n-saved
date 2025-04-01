import englishWords from 'an-array-of-english-words';
import words_and_grid from '../data/words_and_grid.json';
import { useState } from 'react';
const DICTIONARY = new Set(englishWords.map(word => word.toLowerCase()));

function isInDictionary(word) {
    const result = DICTIONARY.has(word.toLowerCase());
    return !!result;

}
function getSubWords(words) {
    const subWords = new Set();
    for (const { text } of words) {
        const wordLength = text.length;
        // Generate sub-words of lengths from 3 up to wordLength - 1
        for (let substrLength = 3; substrLength <= wordLength; substrLength++) {
            // Iterate all possible starting positions for the current length
            for (let start = 0; start <= wordLength - substrLength; start++) {
                const end = start + substrLength;
                const substring = text.slice(start, end);
                if (isInDictionary(substring)) {
                    subWords.add(substring);
                }
            }
        }
    }
    return subWords;
}

// Function to find all valid words in the grid
const findWordsInGrid = (grid, initialWords) => {
    const foundWords = new Set();
    const directions = [
        // Horizontal (left to right)
        { dx: 1, dy: 0 },
        // Vertical (top to bottom)
        { dx: 0, dy: 1 },
        // Diagonal (top-left to bottom-right)
        { dx: 1, dy: 1 },
    ];


    const subWords = getSubWords(initialWords);

    // Search in all directions starting from each cell
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            if (grid[y][x] === '') continue;

            directions.forEach(({ dx, dy }) => {
                let word = '';
                let curX = x;
                let curY = y;

                // Continue in this direction until we reach the grid boundary
                while (
                    curX >= 0 && curX < grid[0].length &&
                    curY >= 0 && curY < grid.length &&
                    grid[curY][curX] !== ''
                ) {
                    word += grid[curY][curX];

                    // Check if current word is valid (min length 3)
                    if (word.length >= 3 && isInDictionary(word) && !subWords.has(word)) {
                        foundWords.add(word.toLowerCase());
                    }

                    curX += dx;
                    curY += dy;
                }
            });
        }
    }

    return Array.from(foundWords).sort();
};

function useStartingWordInfo(level) {
    const [data] = useState(() => {
        const wordData = words_and_grid[level ?? '1'];
        console.log(words_and_grid);
        console.log(wordData);
        const startingWords = wordData['words'].map((word, i) => (
            { id: `${i}`, text: word, isPlaced: false, x: 0, y: 0, orientation: 'horizontal' }));

        return {
            startingWords,
            gridDimensions: wordData.gridDimensions,
            id: "default",
            maxScore: wordData.maxScore,
            startingText: wordData.startingText
        };
    });
    return data;
}


export { getSubWords, findWordsInGrid, useStartingWordInfo };