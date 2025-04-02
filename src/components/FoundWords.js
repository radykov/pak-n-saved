import React from 'react';
import Words from './Words';

const FoundWords = ({ words }) => {
    if (!words || words.length === 0) return null;

    return (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Found words: {words.join(', ')}</p>
        </div>
    );
};

export default FoundWords;
