
import React from 'react';

const Spinner: React.FC<{ size?: string }> = ({ size = '8' }) => {
    return (
        <div className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-primary`}></div>
    );
};

export default Spinner;
