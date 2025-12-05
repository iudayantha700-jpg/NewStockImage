
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { HistoryView } from './components/HistoryView';
import { generateStockMetadata } from './services/geminiService';
import { getHistory, saveHistoryItem, deleteHistoryItem, clearHistory } from './services/historyService';
import { createThumbnail } from './utils/imageUtils';
import { processInParallel } from './utils/parallelProcessor';
import type { StockMetadata, ImageResult, HistoryItem } from './types';
import { AdobeStockIcon, SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{name: string, url: string}[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Array<{fileName: string, message: string}>>([]);
  const [results, setResults] = useState<ImageResult[]>([]);
  
  // Settings
  const [titleCount, setTitleCount] = useState<number>(5);
  
  // History State
  const [view, setView] = useState<'generator' | 'history'>('generator');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Cleanup object URLs on unmount or when previews change
  useEffect(() => {
    return () => {
      imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [imagePreviews]);

  const handleImageChange = (files: File[] | null) => {
    if (files) {
      // Clean up old object URLs before setting new ones
      imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
      
      setImageFiles(files);
      setResults([]);
      setError(null);
      setErrors([]);
      const newPreviews = Array.from(files).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
      }));
      setImagePreviews(newPreviews);
    }
  };
  
  const handleReset = () => {
      setImageFiles([]);
      imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
      setImagePreviews([]);
      setResults([]);
      setError(null);
      setIsLoading(false);
      setProcessingStatus(null);
  }

  const handleAnalyzeClick = useCallback(async () => {
    if (imageFiles.length === 0) {
      setError('Please upload at least one image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setErrors([]);
    setResults([]);
    setProgress(0);
    
    const newResults: ImageResult[] = [];
    const newErrors: Array<{fileName: string, message: string}> = [];

    // Process images in parallel with concurrency limit of 3
    const processResults = await processInParallel(
      imageFiles.map((file, index) => ({ file, preview: imagePreviews[index], index })),
      async (item, index) => {
        setProcessingStatus(`Analyzing image ${index + 1} of ${imageFiles.length}: "${item.file.name}"`);
        
        const metadata = await generateStockMetadata(item.file, titleCount);
        
        // Generate thumbnail
        let thumbnail = "";
        try {
            thumbnail = await createThumbnail(item.file);
        } catch (thumbError) {
            console.warn("Could not generate thumbnail", thumbError);
        }
        
        // Save to history
        const historyItem: HistoryItem = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2) + index,
            timestamp: Date.now(),
            fileName: item.file.name,
            thumbnailDataUrl: thumbnail,
            metadata: metadata
        };
        
        const updatedHistory = saveHistoryItem(historyItem);
        setHistory(updatedHistory);

        return {
            fileName: item.file.name,
            previewUrl: item.preview.url,
            metadata: metadata
        };
      },
      3, // Concurrency limit: process 3 images at a time
      (completed, total) => {
        const percentage = (completed / total) * 100;
        setProgress(percentage);
        setProcessingStatus(`Processing: ${completed} of ${total} images completed`);
      }
    );

    // Process results
    for (const result of processResults) {
      if (result.error) {
        console.error(`Error processing ${result.item.file.name}:`, result.error);
        newErrors.push({
          fileName: result.item.file.name,
          message: result.error.message
        });
      } else if (result.result) {
        newResults.push(result.result);
        setResults([...newResults]); // Update results incrementally
      }
    }
    
    setProcessingStatus(null);
    setIsLoading(false);
    setProgress(100);
    
    // Show summary if there were errors
    if (newErrors.length > 0 && newResults.length === 0) {
      setError(`Failed to process all ${newErrors.length} image(s). Please check the errors below and try again.`);
    } else if (newErrors.length > 0) {
      setError(`Successfully processed ${newResults.length} image(s), but ${newErrors.length} failed.`);
    }
    
    setErrors(newErrors);
  }, [imageFiles, imagePreviews, titleCount]);

  // History Handlers
  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to delete all history? This cannot be undone.")) {
        const updated = clearHistory();
        setHistory(updated);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header onViewChange={setView} currentView={view} />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          
          {view === 'generator' ? (
            <div className="animate-fade-in">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-4 mb-4">
                    <AdobeStockIcon className="h-12 w-12 text-gray-700 dark:text-gray-300" />
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Stock Photo SEO Optimizer
                    </h1>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Upload your photos and let AI generate powerful titles and keywords to boost your visibility on Adobe Stock.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                    <ImageUpload
                        imagePreviews={imagePreviews}
                        onImageChange={handleImageChange}
                        onValidationError={(msg) => setError(msg)}
                        disabled={isLoading}
                    />
                    
                    <div className="mt-6 flex justify-center">
                        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                            <label htmlFor="title-count" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Variations:
                            </label>
                            <select
                                id="title-count"
                                value={titleCount}
                                onChange={(e) => setTitleCount(Number(e.target.value))}
                                disabled={isLoading}
                                className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1.5 disabled:opacity-50"
                            >
                                {[1, 3, 5, 10, 15, 20].map(n => (
                                    <option key={n} value={n}>{n} Titles</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                        onClick={handleAnalyzeClick}
                        disabled={imageFiles.length === 0 || isLoading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                        >
                        <SparklesIcon className="h-5 w-5" />
                        {isLoading ? 'Analyzing...' : `Generate for ${imageFiles.length} Image${imageFiles.length === 1 ? '' : 's'}`}
                        </button>
                        {imageFiles.length > 0 && !isLoading && (
                            <button
                                onClick={handleReset}
                                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Start Over
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-8 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {errors.length > 0 && (
                    <div className="mt-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Processing Errors: </strong>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                        {errors.map((err, idx) => (
                            <li key={idx}>
                                <span className="font-medium">{err.fileName}:</span> {err.message}
                            </li>
                        ))}
                    </ul>
                    </div>
                )}

                {isLoading && <Loader status={processingStatus} progress={progress} />}

                {results.length > 0 && !isLoading && (
                    <div className="mt-8">
                    <ResultsDisplay results={results} />
                    </div>
                )}
            </div>
          ) : (
            <HistoryView 
                history={history} 
                onDelete={handleDeleteHistory} 
                onClear={handleClearHistory}
                onClose={() => setView('generator')} 
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
