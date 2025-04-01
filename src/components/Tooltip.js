import { useState } from 'react';
// Reusable Tooltip component
const Tooltip = ({ text, children }) => {
    const [visible, setVisible] = useState(false);

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

export default Tooltip;