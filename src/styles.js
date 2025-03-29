// /src/styles.js

const THEME_COLOR = '#F7A800';
const WHITE = '#ffffff';
const BLACK = '#000000';

export const theme = {
    fonts: {
        primary: "'Segoe UI', sans-serif",
    },
    colors: {
        default: WHITE,
        correct: '#4CAF50',
        wrong: '#F44336',
        // Softer pastel rainbow gradient for "found" state
        foundGradient: 'linear-gradient(90deg, #ff9a9e, #fad0c4, #fad0c4, #a18cd1, #fbc2eb)',
        headerBackground: THEME_COLOR,
        headerText: WHITE,
        menuText: BLACK,
        menuBackground: '#e1f5fe',
        menuItemBackground: THEME_COLOR,
        menuItemText: WHITE,
        arrowEnabled: THEME_COLOR,
        arrowDisabled: '#ccc',
    },
    transitions: {
        ease: '0.3s ease-in-out',
    },
};

export const mobileView = {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '0 10px',
};
