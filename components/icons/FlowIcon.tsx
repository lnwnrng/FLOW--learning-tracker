import React from 'react';

interface FlowIconProps {
    size?: number;
    className?: string;
}

// Custom Flow icon - represents flow state with a stylized water drop + play symbol
const FlowIcon: React.FC<FlowIconProps> = ({ size = 24, className = '' }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            {/* Gradient definition */}
            <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="50%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>

            {/* Flow drop shape with integrated play symbol */}
            <path
                d="M12 2C12 2 6 9 6 14C6 17.3137 8.68629 20 12 20C15.3137 20 18 17.3137 18 14C18 9 12 2 12 2Z"
                fill="url(#flowGradient)"
            />

            {/* Play triangle inside */}
            <path
                d="M10.5 11L14.5 14L10.5 17V11Z"
                fill="white"
                fillOpacity="0.95"
            />
        </svg>
    );
};

export default FlowIcon;
