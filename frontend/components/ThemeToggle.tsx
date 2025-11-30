'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

interface ThemeToggleProps {
  inline?: boolean;
  className?: string;
}

export default function ThemeToggle({ inline = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (inline) {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300
                    hover:bg-light-hover dark:hover:bg-dark-hover transition-all duration-200 ${className}`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <>
            <FiSun className="w-5 h-5 text-secondary" />
            <span className="font-medium">Light Mode</span>
          </>
        ) : (
          <>
            <FiMoon className="w-5 h-5 text-primary" />
            <span className="font-medium">Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-3 bg-white dark:bg-dark-card rounded-full shadow-lg hover:shadow-xl 
                  transition-all duration-200 border border-gray-200 dark:border-gray-800
                  hover:scale-110 ${className}`}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <FiSun className="w-5 h-5 text-secondary" />
      ) : (
        <FiMoon className="w-5 h-5 text-primary" />
      )}
    </button>
  );
}
