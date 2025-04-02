import React, { useEffect, useState } from 'react';
import ScoreHelper from '../utils/ScoreHelper';

const BasicScore = ({ currentScore, maxScore }) => {
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

    return (
        <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            color,
            margin: '20px 0'
        }}>
            <span style={scoreStyle}>{currentScore}</span>
            <span style={{ fontSize: '14px', marginLeft: '2px' }}>/{maxScore}</span>
        </div>
    );
};

export default BasicScore;
