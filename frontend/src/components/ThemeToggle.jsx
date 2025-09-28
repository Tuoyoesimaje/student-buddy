import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '', showLabels = true, size = 'md' }) => {
  const { theme, changeTheme, isLoading } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const themes = [
    {
      value: 'light',
      icon: SunIcon,
      label: 'Light',
      ariaLabel: 'Set light theme'
    },
    {
      value: 'dark',
      icon: MoonIcon,
      label: 'Dark',
      ariaLabel: 'Set dark theme'
    },
    {
      value: 'system',
      icon: ComputerDesktopIcon,
      label: 'System',
      ariaLabel: 'Set system theme'
    }
  ];

  if (isLoading) {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {themes.map((themeOption) => (
          <div
            key={themeOption.value}
            className={`${sizeClasses[size]} rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse`}
          >
            <div className={`${iconSizeClasses[size]} bg-gray-200 dark:bg-gray-600 rounded`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isActive = theme === themeOption.value;
        
        return (
          <button
            key={themeOption.value}
            onClick={() => changeTheme(themeOption.value)}
            className={`
              ${sizeClasses[size]} rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
              ${isActive 
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
            aria-label={themeOption.ariaLabel}
            title={showLabels ? undefined : themeOption.label}
          >
            <Icon className={iconSizeClasses[size]} />
          </button>
        );
      })}
      
      {showLabels && (
        <div className="ml-3 flex items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {themes.find(t => t.value === theme)?.label || 'System'}
          </span>
        </div>
      )}
    </div>
  );
};

// Quick toggle component (just light/dark)
export const QuickThemeToggle = ({ className = '', size = 'md' }) => {
  const { isDark, toggleTheme, isLoading } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse ${className}`}>
        <div className={`${iconSizeClasses[size]} bg-gray-200 dark:bg-gray-600 rounded`} />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]} rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
        bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600
        ${className}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <SunIcon className={iconSizeClasses[size]} />
      ) : (
        <MoonIcon className={iconSizeClasses[size]} />
      )}
    </button>
  );
};

export default ThemeToggle;
