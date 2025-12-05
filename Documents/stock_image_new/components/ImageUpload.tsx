import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploadProps {
  imagePreviews: {name: string, url: string}[];
  onImageChange: (files: File[] | null) => void;
  onValidationError?: (message: string) => void;
  disabled: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES = 20;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const ImageUpload: React.FC<ImageUploadProps> = ({ imagePreviews, onImageChange, onValidationError, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const validateFiles = (files: File[]): { valid: boolean; message?: string; validFiles?: File[] } => {
    if (files.length === 0) {
      return { valid: false, message: 'No files selected.' };
    }

    if (files.length > MAX_FILES) {
      return { 
        valid: false, 
        message: `Too many files. Maximum ${MAX_FILES} files allowed. You selected ${files.length}.` 
      };
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are supported.`);
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large. Maximum size is ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB.`);
        continue;
      }

      // Check if file is actually an image by reading first bytes
      if (file.size === 0) {
        errors.push(`${file.name}: File is empty.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return { 
        valid: false, 
        message: `No valid files found. ${errors.length > 0 ? errors[0] : 'Please select valid image files.'}` 
      };
    }

    if (errors.length > 0 && validFiles.length > 0) {
      // Some files are valid, some are not
      const errorMsg = `${errors.length} file(s) were skipped: ${errors.slice(0, 2).join(' ')}${errors.length > 2 ? '...' : ''}`;
      return { valid: true, validFiles, message: errorMsg };
    }

    return { valid: true, validFiles };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : null;
    
    if (!files || files.length === 0) {
      setValidationError(null);
      onImageChange(null);
      return;
    }

    const validation = validateFiles(files);
    
    if (!validation.valid) {
      setValidationError(validation.message || 'Invalid files selected.');
      if (onValidationError) {
        onValidationError(validation.message || 'Invalid files selected.');
      }
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setValidationError(null);
    
    if (validation.message && onValidationError) {
      // Show warning but still process valid files
      onValidationError(validation.message);
    }

    onImageChange(validation.validFiles || files);
    
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) {
      return;
    }

    const validation = validateFiles(files);
    
    if (!validation.valid) {
      setValidationError(validation.message || 'Invalid files selected.');
      if (onValidationError) {
        onValidationError(validation.message || 'Invalid files selected.');
      }
      return;
    }

    setValidationError(null);
    
    if (validation.message && onValidationError) {
      onValidationError(validation.message);
    }

    onImageChange(validation.validFiles || files);
  }, [disabled, onValidationError, onImageChange]);

  return (
    <div
      className={`relative w-full min-h-[200px] rounded-lg border-2 border-dashed flex items-center justify-center text-center p-4 transition-all duration-300 ${
        disabled 
          ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600' 
          : isDragging
          ? 'cursor-pointer bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 border-4'
          : 'cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-gray-700/30 border-gray-300 dark:border-gray-600'
      }`}
      onClick={!disabled ? handleAreaClick : undefined}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, image/webp"
        disabled={disabled}
        multiple
      />
      {imagePreviews.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 w-full">
            {imagePreviews.map((preview) => (
                <div key={preview.name} className="relative aspect-square group">
                    <img src={preview.url} alt={preview.name} className="object-cover h-full w-full rounded-md" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs text-center break-words">{preview.name}</p>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
          <UploadIcon className={`h-12 w-12 mb-2 transition-transform ${isDragging ? 'scale-110 text-blue-500 dark:text-blue-400' : ''}`} />
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {isDragging ? 'Drop images here' : 'Click or drag images to upload'}
          </span>
          <span className="text-sm">You can select up to {MAX_FILES} files (max {(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB each)</span>
          <span className="text-xs mt-1">Supported: JPEG, PNG, WebP</span>
        </div>
      )}
      {validationError && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
          {validationError}
        </div>
      )}
    </div>
  );
};
