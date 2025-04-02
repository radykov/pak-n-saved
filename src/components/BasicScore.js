import React, { useEffect, useState } from 'react';
import ScoreHelper from '../utils/ScoreHelper';

const BasicScore = ({ currentScore, maxScore, savedScore }) => {
    const [animate, setAnimate] = useState(false);

    // Trigger animation whenever currentScore changes
    useEffect(() => {
        setAnimate(true);
        const timer = setTimeout(() => {
            setAnimate(false);
        }, 500); // animation duration in milliseconds

        return () => clearTimeout(timer);
    }, [currentScore]);

    // Get color from ScoreHelper based on current score and max score
    const { color } = ScoreHelper.getScoreData(currentScore, maxScore);

    const scoreStyle = {
        fontSize: '24px',
        fontWeight: 'bold',
        transition: 'transform 0.5s ease',
        transform: animate ? 'scale(1.2)' : 'scale(1)',
    };

    // Determine the best score text based on the provided conditions
    let bestText = "";
    if (currentScore >= savedScore && currentScore > 0) {
        bestText = "Best";
    } else if (savedScore !== 0 && savedScore > currentScore) {
        bestText = `Best: ${savedScore}`;
    }

    return (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                color,
            }}>
                <span style={scoreStyle}>{currentScore}</span>
                <span style={{ fontSize: '14px', marginLeft: '2px' }}>/{maxScore}</span>
            </div>
            {bestText && (
                <div style={{ fontSize: '16px', color, marginTop: '8px' }}>
                    {bestText}
                </div>
            )}
        </div>
    );
};

export default BasicScore;
