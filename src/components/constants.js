export const CELL_SIZE = 60;

// Prevent touch scrolling for better mobile interaction
export const onTouchStart = (e) => {
    e.preventDefault();
};

export const onContextMenu = (e) => {
    e.preventDefault();
};

export const TOUCH_STYLE = {
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    KhtmlUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
};