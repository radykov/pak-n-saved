import BasicScore from './BasicScore';

const TopContent = ({ hasPlacedWords, savedScore, canPass, startingText, wordDroppedText, endingText, currentScore, maxScore }) => {
    if (canPass) {
        if (endingText) {
            return (
                <div>
                    <div>{endingText}</div>
                    <BasicScore currentScore={currentScore} maxScore={maxScore} savedScore={savedScore} />
                </div>
            );
        }
        return <BasicScore currentScore={currentScore} maxScore={maxScore} savedScore={savedScore} />;
    } else if (!hasPlacedWords && savedScore === 0) {
        if (startingText) {
            return <div>{startingText}</div>;
        }
        return <BasicScore currentScore={currentScore} maxScore={maxScore} savedScore={savedScore} />;
    } else {
        if (wordDroppedText) {
            return (
                <div>
                    <div>{wordDroppedText}</div>
                    <BasicScore currentScore={currentScore} maxScore={maxScore} savedScore={savedScore} />
                </div>
            );
        }
        return <BasicScore currentScore={currentScore} maxScore={maxScore} savedScore={savedScore} />;
    }
};

export default TopContent;