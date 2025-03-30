
function getSubWords(words, dictionary) {
    const subWords = new Set();
    for (const { text } of words) {
        const wordLength = text.length;
        // Generate sub-words of lengths from 3 up to wordLength - 1
        for (let substrLength = 3; substrLength < wordLength; substrLength++) {
            // Iterate all possible starting positions for the current length
            for (let start = 0; start <= wordLength - substrLength; start++) {
                const end = start + substrLength;
                const substring = text.slice(start, end);
                // Check if the substring is a valid word in the dictionary (case-insensitive)
                if (dictionary.has(substring.toLowerCase())) {
                    subWords.add(substring);
                }
            }
        }
    }
    return subWords;
}

export default getSubWords;