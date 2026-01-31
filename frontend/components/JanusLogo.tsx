import React from 'react';

interface JanusLogoProps {
    className?: string;
    size?: number;
}

export const JanusLogo: React.FC<JanusLogoProps> = ({ className = '', size = 24 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Circle border */}
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" fill="none" />

            {/* Left face (looking backward) */}
            <path
                d="M7 8C7 8 6 9 6 10.5C6 12 7 13 7 13"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M7 13C7 13 6.5 14 6.5 15.5C6.5 16.5 7 17 7.5 17.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
            />
            <circle cx="7.5" cy="9" r="0.8" fill="currentColor" />

            {/* Right face (looking forward) */}
            <path
                d="M17 8C17 8 18 9 18 10.5C18 12 17 13 17 13"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M17 13C17 13 17.5 14 17.5 15.5C17.5 16.5 17 17 16.5 17.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
            />
            <circle cx="16.5" cy="9" r="0.8" fill="currentColor" />

            {/* Central dividing line */}
            <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="1.5" />

            {/* Circuit-like connections */}
            <path
                d="M9 10L10.5 10L10.5 12"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M15 10L13.5 10L13.5 12"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
            />
            <circle cx="10.5" cy="12.5" r="0.6" fill="currentColor" />
            <circle cx="13.5" cy="12.5" r="0.6" fill="currentColor" />
        </svg>
    );
};
