'use client';

import { useDarkMode } from './DarkModeProvider';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex items-center justify-center w-14 h-7 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 group shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:hover:shadow-gray-900/70"
      aria-label="Toggle dark mode"
    >
      {/* Background track with animated gradient */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r transition-all duration-500 ease-in-out overflow-hidden">
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-inner' 
            : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 shadow-inner'
        }`}></div>
        
        {/* Animated background pattern */}
        <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
          isDarkMode 
            ? 'bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.3)_0%,transparent_50%)] animate-pulse' 
            : 'bg-[radial-gradient(circle_at_80%_50%,rgba(251,191,36,0.4)_0%,transparent_50%)] animate-pulse'
        }`}></div>
      </div>
      
      {/* Sliding toggle with enhanced visuals */}
      <div className={`relative z-10 w-6 h-6 bg-white dark:bg-gray-100 rounded-full shadow-xl transition-all duration-500 ease-in-out border-2 ${
        isDarkMode 
          ? 'translate-x-3.5 border-blue-200' 
          : '-translate-x-3.5 border-yellow-200'
      }`}>
        {/* Sun icon (light mode) */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          isDarkMode ? 'opacity-0 scale-75 rotate-180' : 'opacity-100 scale-100 rotate-0'
        }`}>
          <svg className="w-3.5 h-3.5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Moon icon (dark mode) */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          isDarkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-180'
        }`}>
          <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
        
        {/* Subtle inner glow */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isDarkMode 
            ? 'shadow-[inset_0_0_8px_rgba(59,130,246,0.3)]' 
            : 'shadow-[inset_0_0_8px_rgba(251,191,36,0.3)]'
        }`}></div>
      </div>
      
      {/* Enhanced glow effect */}
      <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
        isDarkMode 
          ? 'shadow-[0_0_25px_rgba(59,130,246,0.4)]' 
          : 'shadow-[0_0_25px_rgba(251,191,36,0.4)]'
      } opacity-0 group-hover:opacity-100`}></div>
      
      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isDarkMode 
            ? 'bg-blue-400/20' 
            : 'bg-yellow-400/20'
        } scale-0 group-active:scale-110 group-active:opacity-100 opacity-0`}></div>
      </div>
    </button>
  );
};

export default DarkModeToggle; 