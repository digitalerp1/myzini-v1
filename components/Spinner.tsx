
import React from 'react';

const Spinner: React.FC<{ size?: string }> = ({ size = '8' }) => {
    // specific mapping or fallback to style
    const sizeMap: Record<string, string> = {
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
    };

    const pixelSize = sizeMap[size] || `${parseInt(size) * 0.25}rem`;

    return (
        <div 
            className="animate-spin rounded-full border-b-2 border-primary"
            style={{ width: pixelSize, height: pixelSize }}
        ></div>
    );
};

export default Spinner;
