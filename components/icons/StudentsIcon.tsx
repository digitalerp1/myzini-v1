
import React from 'react';

// FIX: Added className prop to allow for custom styling.
const StudentsIcon: React.FC<{className?: string}> = ({className = "w-6 h-6"}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-5.176-5.97M15 21h6m-6-1a6 6 0 00-6-6m6 6v-1a6 6 0 00-6-6"></path>
    </svg>
);

export default StudentsIcon;
