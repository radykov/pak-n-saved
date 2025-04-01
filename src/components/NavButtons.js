import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Tooltip from './Tooltip';
import { ENABLED_BUTTON_STYLE, DISABLED_BUTTON_STYLE, CHEVRON_SIZE } from '../styles';

export const BackButton = ({ onClick, isEnabled }) => {
    const style = {
        ...ENABLED_BUTTON_STYLE,
        ...(isEnabled ? {} : { display: 'none' })
    }
    return (
        <button onClick={onClick} disabled={!isEnabled} style={style}>
            <ChevronLeft size={CHEVRON_SIZE} />

        </button>
    );
};

export const NextButton = ({ onClick, isEnabled }) => {
    const tooltipMessage = "To proceed get enough words to turn your score green";
    const button = <button onClick={onClick} disabled={!isEnabled} style={isEnabled ? ENABLED_BUTTON_STYLE : DISABLED_BUTTON_STYLE}>
        <ChevronRight size={CHEVRON_SIZE} />
    </button>;

    if (isEnabled) {
        return button;
    }
    return (
        <Tooltip message={tooltipMessage}>
            {button}
        </Tooltip>
    );
};
