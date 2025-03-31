// /src/components/Menu.js
import React, { useState } from 'react';
import MenuItemContent from './MenuItemContent';
import { mobileView, theme } from '../styles';

const menuItems = [
    { title: 'How to play', content: 'Place words on the grid ' },
    { title: 'About', content: 'Fun game to see how well you can recognize words.' },
];

const Menu = ({ onClose }) => {
    const [selectedItem, setSelectedItem] = useState(null);

    return (
        // Modal overlay
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
        >
            {/* Menu dialog */}
            <div
                style={{
                    width: mobileView.maxWidth,
                    background: '#ffffff',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    border: '2px solid #ccc',
                    position: 'relative',
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        fontSize: '28px',
                        background: 'none',
                        border: 'none',
                        color: theme.colors.wrong,
                        cursor: 'pointer',
                    }}
                >
                    x
                </button>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: theme.colors.menuText }}>Menu</h2>
                <div>
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedItem(item)}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '15px',
                                margin: '10px 0',
                                background: theme.colors.menuItemBackground,
                                color: theme.colors.menuItemText,
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: theme.transitions.ease,
                            }}
                        >
                            {item.title}
                        </button>
                    ))}
                </div>
                {selectedItem && (
                    <MenuItemContent
                        title={selectedItem.title}
                        content={selectedItem.content}
                        onClose={() => setSelectedItem(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default Menu;
