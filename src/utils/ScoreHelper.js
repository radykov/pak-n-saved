class ScoreHelper {
    static getScoreData(currentScore, maxScore) {
        const percentage = (currentScore / maxScore) * 100;
        let color;
        if (percentage < 50) {
            color = '#ff4444'; // red
        } else if (percentage < 80) {
            color = '#ffa500'; // orange
        } else {
            color = '#4CAF50'; // green
        }
        const canPass = currentScore >= 0.8 * maxScore;
        return { color, canPass };
    }
}

export default ScoreHelper;
