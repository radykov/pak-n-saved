import { findWordsInGrid } from './WordUtils';

// Create an empty grid (2D array) with given width and height
function createEmptyGrid(width, height) {
    const grid = [];
    for (let i = 0; i < height; i++) {
        grid.push(new Array(width).fill(''));
    }
    return grid;
}

// Check if a word can be placed at position (x, y) in the given orientation
function canPlaceWord(grid, word, x, y, orientation) {
    const width = grid[0].length;
    const height = grid.length;
    const text = word.text;

    if (orientation === 'horizontal') {
        if (x + text.length > width) return false; // word doesn't fit horizontally
        for (let i = 0; i < text.length; i++) {
            const currentChar = grid[y][x + i];
            if (currentChar !== '' && currentChar !== text[i]) return false;
        }
    } else if (orientation === 'vertical') {
        if (y + text.length > height) return false; // word doesn't fit vertically
        for (let i = 0; i < text.length; i++) {
            const currentChar = grid[y + i][x];
            if (currentChar !== '' && currentChar !== text[i]) return false;
        }
    }
    return true;
}

// Place the word on the grid. Only cells that are empty will be changed.
// Returns a list of cells that were modified.
function placeWord(grid, word, x, y, orientation) {
    const placements = [];
    const text = word.text;

    if (orientation === 'horizontal') {
        for (let i = 0; i < text.length; i++) {
            if (grid[y][x + i] === '') {
                placements.push({ x: x + i, y, prev: '' });
                grid[y][x + i] = text[i];
            }
        }
    } else if (orientation === 'vertical') {
        for (let i = 0; i < text.length; i++) {
            if (grid[y + i][x] === '') {
                placements.push({ x, y: y + i, prev: '' });
                grid[y + i][x] = text[i];
            }
        }
    }
    // Update word details
    word.isPlaced = true;
    word.x = x;
    word.y = y;
    word.orientation = orientation;
    return placements;
}

// Remove a word from the grid using only the recorded placements
function removeWord(grid, word, placements) {
    placements.forEach(place => {
        grid[place.y][place.x] = place.prev;
    });
    word.isPlaced = false;
}


// Backtracking algorithm to place all words
function backtrack(grid, words, index = 0) {

    // Variables to track the best configuration found
    let bestGrid = null;
    let bestFoundArray = [];
    // Base condition: if all words are placed
    if (index === words.length) {
        // Call the word-finding function with the current grid configuration
        const foundArray = findWordsInGrid(grid, words);
        if (foundArray.length > bestFoundArray.length) {
            bestFoundArray = [...foundArray]; // make a copy of the found array
            // Deep copy the grid so that subsequent changes don't affect our saved version
            bestGrid = grid.map(row => [...row]);
        }
        return;
    }

    const word = words[index];
    const height = grid.length;
    const width = grid[0].length;

    // Try every possible starting coordinate and orientation
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            for (const orientation of ['horizontal', 'vertical']) {
                if (canPlaceWord(grid, word, x, y, orientation)) {
                    // Place the word on the grid
                    const placements = placeWord(grid, word, x, y, orientation);
                    // Recurse to place the next word
                    backtrack(grid, words, index + 1);
                    // Backtrack: remove the word using recorded placements
                    removeWord(grid, word, placements);
                }
            }
        }
    }
    return { bestGrid, bestFoundArray };
}

function solve(initialWords, gridWidth, gridHeight) {
    const grid = createEmptyGrid(gridWidth, gridHeight);
    backtrack(grid, initialWords);
}

// Testing, change to true to test and false to skip
if (true) {
    // Sample initial words array
    const initialWords = [
        { id: '1', text: 'REACT', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
        { id: '2', text: 'DRAG', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
        { id: '3', text: 'DROP', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
        { id: '4', text: 'GAME', isPlaced: false, x: 0, y: 0, orientation: 'horizontal' },
    ];

    const { bestGrid, bestFoundArray } = solve(initialWords, 5, 5);

    // Output the best grid configuration and found words
    console.log('Best Grid:');
    console.table(bestGrid);
    console.log('Best Found Words Array:', bestFoundArray);
}

export default solve;



