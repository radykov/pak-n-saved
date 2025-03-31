import React from 'react';
import { RotateCw } from 'lucide-react';
import { theme } from '../styles'; // Adjust the path based on your project structure

// Reusable Tooltip component
const Tooltip = ({ text, children }) => {
    const [visible, setVisible] = React.useState(false);

    const showTooltip = () => setVisible(true);
    const hideTooltip = () => setVisible(false);

    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onTouchStart={showTooltip}
            onTouchEnd={hideTooltip}
        >
            {children}
            {visible && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '8px',
                        padding: '4px 8px',
                        backgroundColor: 'black',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        zIndex: 1000,
                    }}
                >
                    {text}
                </div>
            )}
        </div>
    );
};

const ResetButton = ({ onClick, disabled }) => {
    const style = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        fontWeight: 'bold',
        fontSize: '16px',
        backgroundColor: disabled ? '#cccccc' : '#ff5252',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.7 : 1,
    };

    const button = (
        <button style={style} onClick={onClick} disabled={disabled}>
            Clear
        </button>
    );

    return disabled ? (
        <Tooltip text="Clears the grid">{button}</Tooltip>
    ) : (
        button
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
        color: disabled ? '#f0f0f0' : theme.colors.default,
        backgroundColor: disabled ? '#cccccc' : theme.colors.arrowEnabled,
        borderRadius: '4px',
        border: 'none',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.7 : 1,
    };

    const button = (
        <button style={style} onClick={onClick} disabled={disabled}>
            <RotateCw size={19} />
        </button>
    );

    return disabled ? (
        <Tooltip text="Rotates the selected word">{button}</Tooltip>
    ) : (
        button
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

    const button = (
        <button style={style} onClick={onClick} disabled={disabled}>
            Check
        </button>
    );

    return disabled ? (
        <Tooltip text="Calculates your score">{button}</Tooltip>
    ) : (
        button
    );
};

export { ResetButton, RotateButton, CheckButton };
