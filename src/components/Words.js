import {
    TOUCH_STYLE

} from "./constants";
const Words = ({ words }) => {
    if (words.length === 0) {
        return "No new words that are more than 3 letters found";
    }
    return (
        words.map((word, index) => (
            <div
                key={index}
                style={{
                    ...TOUCH_STYLE,
                    padding: '6px 12px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                }}
            >
                {word}
            </div>
        ))
    );
}

export default Words;