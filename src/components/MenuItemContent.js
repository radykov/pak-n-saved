// /src/components/MenuItemContent.js
import React from 'react';
import MenuItemContentTitle from './MenuItemContentTitle';
import MenuItemContentBody from './MenuItemContentBody';
import { mobileView } from '../styles';

const MenuItemContent = ({ title, content, onClose }) => {
    return (
        <div
            style={{
                ...mobileView,
                background: '#ffffff',
                padding: '20px',
                marginTop: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                position: 'relative',
            }}
        >
            <MenuItemContentTitle title={title} />
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    fontSize: '20px',
                    background: 'none',
                    border: 'none',
                    color: '#333',
                    cursor: 'pointer',
                }}
            >
                x
            </button>
            <MenuItemContentBody content={content} />
        </div>
    );
};

export default MenuItemContent;
