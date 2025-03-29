// /src/components/SystemMessage.js
import React, { useEffect, useState, useMemo } from 'react';
import { mobileView } from '../styles';
import { useLevel } from '../contexts/LevelContext';
import messages from '../messages.json';

const SystemMessage = () => {
    const { currentLevel, levelInfo } = useLevel();
    const [message, setMessage] = useState('');
    const levelMessages = useMemo(() => messages[String(currentLevel)] || {}, [currentLevel]);

    useEffect(() => {
        if (!levelInfo.completed) {
            setMessage(levelMessages.startingMessage || 'Good luck!');
        } else {
            if (levelInfo.incorrect.length > 0) {
                setMessage(levelMessages.failureMessage || 'Try again!');
            } else {
                setMessage(levelMessages.successMessage || 'Well done!');
            }
        }
    }, [levelInfo, currentLevel, levelMessages]);

    return (
        <div style={{ ...mobileView, padding: '10px', fontSize: 20, textAlign: 'center' }}>
            {message}
        </div>
    );
};

export default SystemMessage;
