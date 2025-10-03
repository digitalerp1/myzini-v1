
import React from 'react';
import MenuIcon from './icons/MenuIcon';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="md:hidden bg-white shadow-md z-20">
            <div className="flex items-center justify-between px-4 h-16">
                <h1 className="text-xl font-bold text-primary">My Zini</h1>
                <button
                    onClick={onMenuClick}
                    className="p-2 text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                    aria-label="Open sidebar"
                >
                    <MenuIcon />
                </button>
            </div>
        </header>
    );
};

export default Header;