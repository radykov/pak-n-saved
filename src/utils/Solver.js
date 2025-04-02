import { findWordsInGrid } from './WordUtils';
import words_and_grid_json from '../data/words_and_grid.json';
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
        return { bestGrid, bestFoundArray };
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
                    const result = backtrack(grid, words, index + 1);
                    // Check if we found a better configuration
                    if (result && result.bestFoundArray.length > bestFoundArray.length) {
                        bestFoundArray = result.bestFoundArray;
                        bestGrid = result.bestGrid;
                    }
                    // Backtrack: remove the word using recorded placements
                    removeWord(grid, word, placements);
                }
            }
        }
    }
    return { bestGrid, bestFoundArray };
}

// Updated solver: takes an array of words (strings) as input
function solve(wordList, gridWidth, gridHeight) {
    // Convert array of strings to objects that the algorithm expects
    const words = wordList.map(word => ({
        text: word,
        isPlaced: false,
        x: 0,
        y: 0,
        orientation: 'horizontal'
    }));
    const grid = createEmptyGrid(gridWidth, gridHeight);
    return backtrack(grid, words);
}
let finishedFinding = false;
let runOnStart = true
// Testing, change to true to test and false to skip
if (runOnStart && !finishedFinding) {
    let level = 1;
    let data = words_and_grid_json[level.toString()];
    while (data != null) {
        const wordList = data.words;
        const { bestGrid, bestFoundArray } = solve(wordList, data.gridDimensions.width, data.gridDimensions.height);
        console.log('Best Grid:');
        console.table(bestGrid);
        console.log('Best Found Words Array:', bestFoundArray);
        level += 1;
        data = words_and_grid_json[level.toString()];
    }
    finishedFinding = true;
}

export default solve;
