
import React, { useState } from 'react';
import type { ImageResult } from '../types';
import { ClipboardCheckIcon, ClipboardIcon, TitleIcon, TagIcon } from './Icons';

interface ResultCardProps {
  result: ImageResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [copiedKeywords, setCopiedKeywords] = useState(false);
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<number | null>(null);

  const copyKeywordsToClipboard = () => {
    // Ensure keywords are lowercase when copied (simple letters)
    const keywordsString = result.metadata.keywords.map(k => k.toLowerCase()).join(', ');
    navigator.clipboard.writeText(keywordsString);
    setCopiedKeywords(true);
    setTimeout(() => setCopiedKeywords(false), 2000);
  };

  const copyTitleToClipboard = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedTitleIndex(index);
    setTimeout(() => setCopiedTitleIndex(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="md:col-span-1">
                <img src={result.previewUrl} alt={result.fileName} className="object-cover w-full h-auto rounded-lg shadow-md" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center font-medium truncate">{result.fileName}</p>
            </div>
            <div className="md:col-span-2">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                    <TitleIcon className="h-6 w-6 text-blue-500" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Generated Titles ({result.metadata.titles.length})
                    </h3>
                    </div>
                    <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                    {result.metadata.titles.map((title, index) => (
                        <li key={index} className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center gap-4">
                        <span className="flex-1">{title}</span>
                        <button
                            onClick={() => copyTitleToClipboard(title, index)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                            aria-label={`Copy title ${index + 1}`}
                        >
                            {copiedTitleIndex === index ? (
                            <ClipboardCheckIcon className="h-5 w-5 text-green-500" />
                            ) : (
                            <ClipboardIcon className="h-5 w-5" />
                            )}
                        </button>
                        </li>
                    ))}
                    </ul>
                </div>

                <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <TagIcon className="h-6 w-6 text-blue-500" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Generated Keywords</h3>
                        <span className="text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                        {result.metadata.keywords.length}
                        </span>
                    </div>
                    <button
                        onClick={copyKeywordsToClipboard}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        {copiedKeywords ? <ClipboardCheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardIcon className="h-5 w-5" />}
                        {copiedKeywords ? 'Copied!' : 'Copy Keywords'}
                    </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                    {result.metadata.keywords.map((keyword, index) => (
                        <span
                        key={index}
                        className="bg-gray-100 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 text-sm font-medium px-3 py-1.5 rounded-md"
                        >
                        {keyword.toLowerCase()}
                        </span>
                    ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
