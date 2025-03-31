import React from 'react';
import { RotateCw } from 'lucide-react';
import { theme } from '../styles'; // Adjust the path based on your project structure

const ResetButton = ({ onClick, disabled }) => {
    const style = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        fontWeight: 'bold',
        fontSize: '16px',
        backgroundColor: '#ff5252',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.7 : 1,
    };

    return (
        <button style={style} onClick={onClick} disabled={disabled}>
            Reset
        </button>
    );
};

const RotateButton = ({ onClick, disabled }) => {
    const style = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? '#cccccc' : theme.colors.default,
        backgroundColor: disabled ? '#f0f0f0' : theme.colors.arrowEnabled,
        borderRadius: '4px',
        border: 'none',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.7 : 1,
    };

    return (
        <button style={style} onClick={onClick} disabled={disabled}>
            <RotateCw size={19} />
        </button>
    );
};

const CheckButton = ({ onClick, disabled }) => {
    const style = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        fontWeight: 'bold',
        fontSize: '16px',
        backgroundColor: disabled ? '#cccccc' : '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.7 : 1,
    };

    return (
        <button style={style} onClick={onClick} disabled={disabled}>
            Check
        </button>
    );
};

export { ResetButton, RotateButton, CheckButton };