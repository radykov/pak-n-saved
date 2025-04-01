import React, { useEffect, useState } from 'react';

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

    const percentage = (currentScore / maxScore) * 100;
    let color;

    if (percentage < 50) {
        color = '#ff4444'; // red
    } else if (percentage < 80) {
        color = '#ffa500'; // orange
    } else {
        color = '#4CAF50'; // green
    }

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
