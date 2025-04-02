// /src/styles.js

export const THEME_COLOR = '#F7A800';
const WHITE = '#ffffff';
const BLACK = '#000000';
export const DISABLED_BUTTON_BACKGROUND = '#cccccc';
export const CHEVRON_SIZE = 19;
export const MAX_WIDTH_STYLE = {
    width: 'min(480px, 100vw)',
}
const GENERIC_BUTTON_STYLES = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    fontWeight: 'bold',
    fontSize: '16px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
}

export const DISABLED_BUTTON_STYLE = {
    ...GENERIC_BUTTON_STYLES,
    backgroundColor: DISABLED_BUTTON_BACKGROUND,
    cursor: 'not-allowed',
    opacity: 0.7
};

export const ENABLED_BUTTON_STYLE = {
    ...GENERIC_BUTTON_STYLES,
    backgroundColor: THEME_COLOR,
    cursor: 'pointer',
    opacity: 1
};

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
    ...MAX_WIDTH_STYLE,
    touchAction: 'none',
    margin: '0 auto',
    padding: '0 10px',
};
