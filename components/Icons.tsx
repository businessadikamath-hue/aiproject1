
import React from 'react';

export const SendIcon: React.FC = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

export const BotIcon: React.FC = () => (
    <svg 
        className="w-6 h-6 text-gray-600 dark:text-gray-300" 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M12 8V4H8" />
        <rect x="4" y="12" width="16" height="8" rx="2" />
        <path d="M4 14H2" />
        <path d="M20 14H22" />
        <path d="M15 7h2" />
        <path d="M7 7h2" />
    </svg>
);

export const UserIcon: React.FC = () => (
    <svg 
        className="w-6 h-6 text-gray-600 dark:text-gray-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);


export const LoadingIcon: React.FC = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
  </div>
);
