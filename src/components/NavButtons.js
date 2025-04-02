import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Tooltip from './Tooltip';
import { ENABLED_BUTTON_STYLE, DISABLED_BUTTON_STYLE, CHEVRON_SIZE } from '../styles';

function getStyle(isEnabled) {
    return {
        ...ENABLED_BUTTON_STYLE,
        ...(isEnabled ? {} : { display: 'none' })
    };
}
export const BackButton = ({ onClick, isEnabled }) => {
    return (
        <button onClick={onClick} disabled={!isEnabled} style={getStyle(isEnabled)}>
            <ChevronLeft size={CHEVRON_SIZE} />

        </button>
    );
};

export const NextButton = ({ onClick, isEnabled }) => {
    return <button onClick={onClick} disabled={!isEnabled} style={getStyle(isEnabled)}>
        <ChevronRight size={CHEVRON_SIZE} />
    </button>;

};
