

import React, { useState } from 'react';
import { LOGO_URL } from '../constants';
import GlassCard from './GlassCard';
import { User } from '../types';

interface LoginPageProps {
    onLogin: (email: string, pass: string) => boolean;
    allUsers: User[];
    theme: string;
    setTheme: (theme: string) => void;
}

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

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, allUsers, theme, setTheme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(email, password);
        if (!success) {
            setError('Invalid email or password.');
        }
    };

    const handleForgotPassword = () => {
        if (!email.trim()) {
            alert('Please enter your email address to reset your password.');
        } else {
            alert(`If an account exists for ${email}, a password reset link has been sent.`);
        }
    };

    const handleDemoLogin = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        if (userId) {
            const userToLogin = allUsers.find(u => u.id === userId);
            if (userToLogin && userToLogin.password) {
                onLogin(userToLogin.email, userToLogin.password);
            }
        }
    };
    
    const commonInputClasses = "w-full bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-md p-2 border border-gray-900/10 dark:border-white/20 placeholder:text-gray-500";
    const commonLabelClasses = "block text-sm font-medium text-gray-500 dark:text-gray-400";


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="flex flex-col items-center mb-8">
                    <img src={LOGO_URL} alt="Logo" className="h-64 w-64" />
                </div>
                <GlassCard className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className={`${commonLabelClasses} mb-1`}>Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={commonInputClasses}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="password" className={commonLabelClasses}>Password</label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={commonInputClasses}
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="text-sm p-3 text-center rounded-md bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 flex justify-center">
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                    </div>

                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-400 dark:border-gray-600"></div>
                        <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-xs">Or</span>
                        <div className="flex-grow border-t border-gray-400 dark:border-gray-600"></div>
                    </div>

                    <div>
                        <label className={`${commonLabelClasses} text-center mb-2`}>Quick Demo Login</label>
                        <select
                            onChange={handleDemoLogin}
                            className={commonInputClasses + " text-center cursor-pointer"}
                            value=""
                        >
                            <option value="" disabled>Select a user to sign in...</option>
                            {allUsers.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>

                </GlassCard>
            </div>
        </div>
    );
};

export default LoginPage;