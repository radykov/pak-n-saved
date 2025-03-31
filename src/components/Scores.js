// Scores.js
import React from 'react';

const Scores = ({ scores, maxScore, controlsWidth, getScoreColor }) => {
    if (!scores || scores.length === 0) return null;

    return (
        <div style={{ width: controlsWidth || 'auto', margin: '10px auto 0', textAlign: 'center' }}>
            {scores.map((score, index) => (
                <div
                    key={index}
                    style={{
                        fontWeight: 'bold',
                        color: getScoreColor(score, maxScore),
                        marginTop: index === 0 ? 0 : '5px',
                    }}
                >
                    {`Attempt #${scores.length - index}: ${score} / ${maxScore}`}
                </div>
            ))}
        </div>
    );
};

export default Scores;
