import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createThumbnail } from '../../utils/imageUtils';

describe('imageUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create thumbnail from file', async () => {
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
      result: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
    };

    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

    // Mock Image
    const mockImage = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      width: 800,
      height: 600,
      src: '',
    };

    vi.spyOn(window, 'Image').mockImplementation(() => mockImage as unknown as HTMLImageElement);

    // Mock canvas
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
      })),
      toDataURL: vi.fn(() => 'data:image/jpeg;base64,thumbnail'),
    };

    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as unknown as HTMLElement);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Trigger FileReader onload
    const promise = createThumbnail(file);
    
    // Simulate FileReader load
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: mockFileReader.result } } as ProgressEvent<FileReader>);
    }

    // Simulate Image load
    await new Promise(resolve => setTimeout(resolve, 0));
    if (mockImage.onload) {
      mockImage.onload();
    }

    const result = await promise;

    expect(result).toBe('data:image/jpeg;base64,thumbnail');
    expect(mockCanvas.width).toBe(300); // Should be resized to maxWidth
    expect(mockCanvas.height).toBe(225); // Maintains aspect ratio
  });

  it('should handle images smaller than maxWidth', async () => {
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
      result: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
    };

    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

    const mockImage = {
      onload: null as (() => void) | null,
      width: 200,
      height: 150,
      src: '',
    };

    vi.spyOn(window, 'Image').mockImplementation(() => mockImage as unknown as HTMLImageElement);

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
      })),
      toDataURL: vi.fn(() => 'data:image/jpeg;base64,thumbnail'),
    };

    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as unknown as HTMLElement);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const promise = createThumbnail(file, 300);
    
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: mockFileReader.result } } as ProgressEvent<FileReader>);
    }

    await new Promise(resolve => setTimeout(resolve, 0));
    if (mockImage.onload) {
      mockImage.onload();
    }

    const result = await promise;

    expect(result).toBe('data:image/jpeg;base64,thumbnail');
    expect(mockCanvas.width).toBe(200); // Should keep original size
    expect(mockCanvas.height).toBe(150);
  });

  it('should handle canvas context failure gracefully', async () => {
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
      result: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
    };

    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

    const mockImage = {
      onload: null as (() => void) | null,
      width: 800,
      height: 600,
      src: '',
    };

    vi.spyOn(window, 'Image').mockImplementation(() => mockImage as unknown as HTMLImageElement);

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => null), // Return null to simulate failure
      toDataURL: vi.fn(),
    };

    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as unknown as HTMLElement);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const promise = createThumbnail(file);
    
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: mockFileReader.result } } as ProgressEvent<FileReader>);
    }

    await new Promise(resolve => setTimeout(resolve, 0));
    if (mockImage.onload) {
      mockImage.onload();
    }

    const result = await promise;

    expect(result).toBe(''); // Should return empty string on failure
  });

  it('should handle image load errors gracefully', async () => {
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
      result: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
    };

    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

    const mockImage = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      width: 800,
      height: 600,
      src: '',
    };

    vi.spyOn(window, 'Image').mockImplementation(() => mockImage as unknown as HTMLImageElement);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const promise = createThumbnail(file);
    
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: mockFileReader.result } } as ProgressEvent<FileReader>);
    }

    await new Promise(resolve => setTimeout(resolve, 0));
    if (mockImage.onerror) {
      mockImage.onerror();
    }

    const result = await promise;

    expect(result).toBe(''); // Should return empty string on error
  });
});

