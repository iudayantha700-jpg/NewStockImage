
import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../types';
import { ResultCard } from './ResultCard';
import { TrashIcon, SearchIcon, CheckIcon, XIcon, DownloadIcon } from './Icons';
import { exportToCSV, exportToJSON, exportToText } from '../utils/exportUtils';

interface HistoryViewProps {
  history: HistoryItem[];
  onDelete: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onDelete, onClear, onClose }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState<boolean>(false);

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) {
      return history;
    }

    const query = searchQuery.toLowerCase();
    return history.filter(item => {
      const fileNameMatch = item.fileName.toLowerCase().includes(query);
      const titlesMatch = item.metadata.titles.some(title => title.toLowerCase().includes(query));
      const keywordsMatch = item.metadata.keywords.some(keyword => keyword.toLowerCase().includes(query));
      return fileNameMatch || titlesMatch || keywordsMatch;
    });
  }, [history, searchQuery]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredHistory.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredHistory.map(item => item.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} item(s)? This cannot be undone.`)) {
      selectedIds.forEach(id => onDelete(id));
      setSelectedIds(new Set());
      setBatchMode(false);
    }
  };

  const handleBulkExport = (format: 'csv' | 'json' | 'txt') => {
    if (selectedIds.size === 0) return;

    const selectedItems = history.filter(item => selectedIds.has(item));
    const results = selectedItems.map(item => ({
      fileName: item.fileName,
      previewUrl: item.thumbnailDataUrl,
      metadata: item.metadata
    }));

    switch (format) {
      case 'csv':
        exportToCSV(results);
        break;
      case 'json':
        exportToJSON(results);
        break;
      case 'txt':
        exportToText(results);
        break;
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
            <TrashIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No History Yet</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
            Generate some SEO metadata for your images to see them listed here. Your history is saved locally.
        </p>
        <button 
            onClick={onClose} 
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Go to Generator
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">History</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {filteredHistory.length === history.length 
                ? `You have ${history.length} saved item${history.length !== 1 ? 's' : ''}.`
                : `Showing ${filteredHistory.length} of ${history.length} item${history.length !== 1 ? 's' : ''}.`
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {batchMode && selectedIds.size > 0 && (
              <>
                <button
                  onClick={() => handleBulkExport('csv')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
                  title="Export selected as CSV"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Export CSV ({selectedIds.size})
                </button>
                <button
                  onClick={() => handleBulkExport('json')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                  title="Export selected as JSON"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Export JSON ({selectedIds.size})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete ({selectedIds.size})
                </button>
              </>
            )}
            {!batchMode && (
              <button
                onClick={() => setBatchMode(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <CheckIcon className="h-4 w-4" />
                Select Multiple
              </button>
            )}
            {batchMode && (
              <button
                onClick={() => {
                  setBatchMode(false);
                  setSelectedIds(new Set());
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <XIcon className="h-4 w-4" />
                Cancel
              </button>
            )}
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by filename, title, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>

        {/* Batch Mode Controls */}
        {batchMode && filteredHistory.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={handleSelectAll}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {selectedIds.size === filteredHistory.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-gray-500 dark:text-gray-400">
              {selectedIds.size} of {filteredHistory.length} selected
            </span>
          </div>
        )}
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No items found matching "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {filteredHistory.map((item) => (
            <div key={item.id} className="relative group bg-gray-50 dark:bg-gray-800/50 p-1 rounded-2xl">
              <div className="flex justify-between items-center px-2 py-2 mb-2">
                <div className="flex items-center gap-3">
                  {batchMode && (
                    <button
                      onClick={() => handleToggleSelect(item.id)}
                      className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                        selectedIds.has(item.id)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                      }`}
                    >
                      {selectedIds.has(item.id) && <CheckIcon className="h-3 w-3" />}
                    </button>
                  )}
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                {!batchMode && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <TrashIcon className="h-3 w-3" />
                    Delete
                  </button>
                )}
              </div>
              
              <ResultCard result={{
                fileName: item.fileName,
                previewUrl: item.thumbnailDataUrl,
                metadata: item.metadata
              }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
