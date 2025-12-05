
import React from 'react' ;
import { GeminiIcon, HistoryIcon, SparklesIcon } from './Icons';

interface HeaderProps {
    onViewChange: (view: 'generator' | 'history') => void;
    currentView: 'generator' | 'history';
}

export const Header: React.FC<HeaderProps> = ({ onViewChange, currentView }) => {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('generator')}>
            <GeminiIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold text-gray-800 dark:text-white hidden sm:inline">Powered by Gemini</span>
             <span className="text-lg font-semibold text-gray-800 dark:text-white sm:hidden">SEO Opt</span>
          </div>
          
          <nav className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
             <button 
                onClick={() => onViewChange('generator')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    currentView === 'generator' 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
             >
                <SparklesIcon className="h-4 w-4" />
                Generator
             </button>
             <button 
                onClick={() => onViewChange('history')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    currentView === 'history' 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
             >
                <HistoryIcon className="h-4 w-4" />
                History
             </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
