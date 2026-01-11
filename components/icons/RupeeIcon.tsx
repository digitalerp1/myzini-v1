
import React from 'react';

const RupeeIcon: React.FC<{className?: string}> = ({className = "w-8 h-8 text-white"}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 4h5m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2zM9 8h6"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h3"></path>
    </svg>
);

export default RupeeIcon;
