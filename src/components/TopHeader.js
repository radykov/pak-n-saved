// /src/components/TopHeader.js
import React, { useState } from 'react';
import Menu from './Menu';
import { theme, mobileView } from '../styles';

const TopHeader = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div style={{ width: '100%', background: theme.colors.headerBackground }}>
            <header
                style={{
                    ...mobileView,
                    position: 'relative',
                    color: theme.colors.headerText,
                    padding: '10px',
                    textAlign: 'center',
                }}
            >
                <h1 style={{ margin: 0 }}>Pak n Saved</h1>
                <button
                    onClick={() => setMenuOpen(true)}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '10px',
                        background: 'none',
                        border: 'none',
                        color: theme.colors.headerText,
                        fontSize: '28px',
                        cursor: 'pointer',
                    }}
                >
                    &#9776;
                </button>
                {menuOpen && <Menu onClose={() => setMenuOpen(false)} />}
            </header>
        </div>
    );
};

export default TopHeader;
