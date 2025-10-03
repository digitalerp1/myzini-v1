
import React from 'react';

// FIX: Added className prop to allow for custom styling.
const StaffIcon: React.FC<{className?: string}> = ({className = "w-6 h-6"}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.284-1.255-.758-1.684M7 16H5m2 0v-2c0-.653.284-1.255.758-1.684M7 16H5m2 0v4m0-4H5m12 0v-2a3 3 0 00-5.356-1.857M12 6a3 3 0 11-6 0 3 3 0 016 0zm-3 5a3 3 0 11-6 0 3 3 0 016 0z"></path>
    </svg>
);

export default StaffIcon;
