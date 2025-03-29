// /src/components/WordButton.js
import React from 'react';
import { theme } from '../styles';

const WordButton = ({ word, color, onClick }) => {
    let style = {
        padding: '15px 30px',
        margin: '10px auto',
        border: 'none',
        borderRadius: '25px',
        fontSize: '18px',
        fontFamily: theme.fonts.primary,
        cursor: 'pointer',
        transition: `background ${theme.transitions.ease}`,
        display: 'block',
    };

    if (color === 'default') {
        style.background = theme.colors.default;
        style.color = '#333';
        style.border = '2px solid #ccc';
    } else if (color === 'correct') {
        style.background = theme.colors.correct;
        style.color = '#fff';
    } else if (color === 'wrong') {
        style.background = theme.colors.wrong;
        style.color = '#fff';
    } else if (color === 'found') {
        style.background = theme.colors.foundGradient;
        style.color = '#fff';
    }

    return <button style={style} onClick={onClick}>{word}</button>;
};

export default WordButton;
