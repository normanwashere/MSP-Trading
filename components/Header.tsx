

import React, { useState } from 'react';
import { Screen, UserRole, User, Location } from '../types';
import { LOGO_URL } from '../constants';


interface HeaderProps {
    currentScreen: Screen;
    currentUser: User;
    onLogout: () => void;
    locations: Location[];
    activeLocationId: string;
    onSetActiveLocationId: (locationId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentScreen, currentUser, onLogout, locations, activeLocationId, onSetActiveLocationId }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    
    return (
        <header className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-6">
             <div className="flex items-center gap-3">
                <img src={LOGO_URL} alt="Logo" className="h-8 w-8 md:hidden" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">{currentScreen}</h1>
            </div>
            <div className="flex items-center justify-end flex-wrap gap-2 sm:gap-4">
                <div className="relative">
                    <button 
                        onClick={() => setDropdownOpen(!isDropdownOpen)}
                        onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                        className="flex items-center gap-2 bg-white/50 dark:bg-black/40 text-gray-700 dark:text-gray-200 rounded-md border border-gray-900/10 dark:border-white/20 focus:ring-2 focus:ring-blue-500 focus:outline-none py-1 pl-3 pr-2 text-sm"
                    >
                       <span>User: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white/60 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-xl border border-black/5 dark:border-white/10 z-20">
                            <button 
                                onClick={onLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {currentUser.role === UserRole.Superadmin && (
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Location:</span>
                        <select 
                            value={activeLocationId} 
                            onChange={(e) => onSetActiveLocationId(e.target.value)}
                            className="bg-white/50 dark:bg-black/40 text-gray-700 dark:text-gray-200 rounded-md border border-gray-900/10 dark:border-white/20 focus:ring-2 focus:ring-blue-500 focus:outline-none py-1 pl-3 pr-8 text-sm"
                        >
                            <option value="all">All Locations</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;