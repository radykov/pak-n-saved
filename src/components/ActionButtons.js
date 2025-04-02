import React from 'react';
import { RotateCw } from 'lucide-react';
import { DISABLED_BUTTON_STYLE, ENABLED_BUTTON_STYLE, CHEVRON_SIZE } from '../styles'; // Adjust the path based on your project structure
import Tooltip from './Tooltip';

function getStyle(disabled) {
    return disabled ? DISABLED_BUTTON_STYLE : ENABLED_BUTTON_STYLE;
}


const RotateButton = ({ onClick, disabled }) => {
    const button = (
        <button style={getStyle(disabled)} onClick={onClick} disabled={disabled}>
            <RotateCw size={CHEVRON_SIZE} />
        </button>
    );

    return disabled ? (
        <Tooltip text="Rotates the selected word">{button}</Tooltip>
    ) : (
        button
    );
};

export { RotateButton };
