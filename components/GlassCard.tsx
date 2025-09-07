import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
    return (
        <div className={`
            bg-white/10 dark:bg-gray-900/10 
            backdrop-blur-2xl rounded-xl 
            border border-black/5 dark:border-white/10 
            shadow-lg shadow-gray-200/50 dark:shadow-2xl dark:shadow-black/40 
            ${className}`
        }>
            {children}
        </div>
    );
};

export default GlassCard;