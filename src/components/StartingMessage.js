import React from 'react';

const StartingMessage = ({ message }) => {
    const sentences = message.split('.');

    return (
        <div style={{ textAlign: 'center', margin: '20px 20px' }}>
            {sentences.map((sentence, index) => (
                <div key={index}>{sentence.trim()}</div>
            ))}
        </div>
    );
};

export default StartingMessage;
