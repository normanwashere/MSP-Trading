

import React from 'react';
import { Screen, UserRole } from '../types';
import { ICONS, LOGO_URL } from '../constants';

interface SidebarProps {
    currentScreen: Screen;
    setCurrentScreen: (screen: Screen) => void;
    userRole: UserRole;
    theme: string;
    setTheme: (theme: string) => void;
}

const NavItem: React.FC<{
    screen: Screen;
    label: string;
    currentScreen: Screen;
    onClick: () => void;
}> = ({ screen, label, currentScreen, onClick }) => {
    const isActive = currentScreen === screen;
    
    const liClasses = `
        flex flex-col md:flex-row items-center justify-center md:justify-start 
        p-2 md:p-3 md:my-2 flex-1 md:flex-none
        rounded-lg transition-all duration-200 ease-in-out cursor-pointer
        hover:text-gray-900 dark:hover:text-white md:hover:bg-black/5 dark:md:hover:bg-white/10
        ${isActive ? 'text-white bg-blue-600 shadow-lg' : 'text-gray-600 dark:text-gray-300'}
    `;

    return (
        <li onClick={onClick} className={liClasses}>
            <div className="w-8 h-6 flex items-center justify-center">{ICONS[screen]}</div>
            <span className="text-xs mt-1 md:mt-0 md:ml-4 md:text-sm font-semibold">{label}</span>
        </li>
    );
};

const ThemeToggle: React.FC<{ theme: string; setTheme: (theme: string) => void; }> = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )}
        </button>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ currentScreen, setCurrentScreen, userRole, theme, setTheme }) => {
    const navItems = [
        { screen: Screen.POS, label: 'POS', roles: [UserRole.Superadmin, UserRole.Admin, UserRole.Staff] },
        { screen: Screen.Inventory, label: 'Inventory', roles: [UserRole.Superadmin, UserRole.Admin, UserRole.Staff] },
        { screen: Screen.Expenses, label: 'Expenses', roles: [UserRole.Superadmin, UserRole.Admin, UserRole.Staff] },
        { screen: Screen.Reports, label: 'Reports', roles: [UserRole.Superadmin, UserRole.Admin, UserRole.Staff] },
        { screen: Screen.Settings, label: 'Settings', roles: [UserRole.Superadmin, UserRole.Admin, UserRole.Staff] },
    ];

    return (
        <aside className="fixed bottom-0 md:top-0 left-0 w-full md:w-64 h-20 md:h-full bg-white/10 dark:bg-black/10 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-gray-900/5 dark:border-white/10 z-10">
            <div className="flex md:flex-col h-full justify-between">
                {/* Logo and title - hidden on mobile */}
                <div className="hidden md:flex items-center justify-start p-4 h-20 border-b border-gray-900/10 dark:border-white/10">
                    <img src={LOGO_URL} alt="Logo" className="h-10 w-10" />
                    <h1 className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">MSP POS</h1>
                </div>
                
                <nav className="flex-1 md:flex-auto p-2">
                    <ul className="flex flex-row md:flex-col justify-around md:justify-start h-full md:h-auto">
                        {navItems
                            .filter(item => item.roles.includes(userRole))
                            .map(item => (
                                <NavItem 
                                    key={item.screen}
                                    screen={item.screen}
                                    label={item.label}
                                    currentScreen={currentScreen}
                                    onClick={() => setCurrentScreen(item.screen)}
                                />
                        ))}
                    </ul>
                </nav>
                
                {/* Mobile Theme Toggle */}
                <div className="md:hidden flex items-center pr-2">
                    <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>


                {/* Desktop Footer with Theme Toggle */}
                <div className="hidden md:block p-4 border-t border-gray-900/10 dark:border-white/10 text-center text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center mb-4">
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                    </div>
                    <p>&copy; 2023 MSP Trading Center</p>
                    <p>Version 1.0.0</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;