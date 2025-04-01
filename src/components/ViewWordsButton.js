import React from 'react';
import { theme } from '../styles'; // Adjust the path based on your project structure

const ViewWordsButton = ({ onClick }) => {
    const buttonStyle = {
        backgroundColor: theme.colors.arrowEnabled,
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: '12px',
        marginLeft: '10px'
    };

    return <button style={buttonStyle} onClick={onClick}>View</button>;
};

export default ViewWordsButton;
