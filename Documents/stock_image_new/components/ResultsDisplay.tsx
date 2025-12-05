import React from 'react';
import type { ImageResult } from '../types';
import { ResultCard } from './ResultCard';
import { DownloadIcon } from './Icons';
import { exportToCSV, exportToJSON, exportToText } from '../utils/exportUtils';

interface ResultsDisplayProps {
  results: ImageResult[];
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white animate-fade-in">
                Analysis Complete
            </h2>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => exportToCSV(results)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
                    title="Export as CSV"
                >
                    <DownloadIcon className="h-4 w-4" />
                    CSV
                </button>
                <button
                    onClick={() => exportToJSON(results)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                    title="Export as JSON"
                >
                    <DownloadIcon className="h-4 w-4" />
                    JSON
                </button>
                <button
                    onClick={() => exportToText(results)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-600 text-white rounded-lg hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
                    title="Export as Text"
                >
                    <DownloadIcon className="h-4 w-4" />
                    TXT
                </button>
            </div>
        </div>
        {results.map((result, index) => (
            <ResultCard key={result.fileName + index} result={result} />
        ))}
    </div>
  );
};
