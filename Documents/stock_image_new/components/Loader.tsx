import React from 'react';

interface LoaderProps {
  status?: string | null;
  progress?: number; // 0-100
}

export const Loader: React.FC<LoaderProps> = ({ status, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center my-10">
      <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        {status ? status : 'Analyzing your image...'}
      </p>
      {progress !== undefined && (
        <div className="w-full max-w-xs mt-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{Math.round(progress)}%</p>
        </div>
      )}
      {progress === undefined && (
        <p className="text-gray-500 dark:text-gray-400">This may take a few moments.</p>
      )}
    </div>
  );
};
