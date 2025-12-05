import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV, exportToJSON, exportToText } from '../../utils/exportUtils';
import type { ImageResult } from '../../types';

describe('exportUtils', () => {
  let mockLink: HTMLAnchorElement;
  let mockClick: ReturnType<typeof vi.fn>;
  let mockAppendChild: ReturnType<typeof vi.fn>;
  let mockRemoveChild: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock DOM methods
    mockClick = vi.fn();
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();

    mockLink = {
      click: mockClick,
      setAttribute: vi.fn(),
      style: {} as CSSStyleDeclaration,
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    global.alert = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockResults: ImageResult[] = [
    {
      fileName: 'test1.jpg',
      previewUrl: 'url1',
      metadata: {
        titles: ['Title 1', 'Title 2', 'Title 3'],
        keywords: ['keyword1', 'keyword2', 'keyword3'],
      },
    },
    {
      fileName: 'test2.jpg',
      previewUrl: 'url2',
      metadata: {
        titles: ['Title A', 'Title B'],
        keywords: ['keywordA', 'keywordB'],
      },
    },
  ];

  describe('exportToCSV', () => {
    it('should export results as CSV', () => {
      exportToCSV(mockResults);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.csv'));
      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    });

    it('should show alert for empty results', () => {
      exportToCSV([]);

      expect(global.alert).toHaveBeenCalledWith('No results to export');
      expect(document.createElement).not.toHaveBeenCalled();
    });

    it('should handle quotes in file names and titles', () => {
      const resultsWithQuotes: ImageResult[] = [
        {
          fileName: 'test "quote".jpg',
          previewUrl: 'url1',
          metadata: {
            titles: ['Title with "quotes"'],
            keywords: ['keyword1'],
          },
        },
      ];

      exportToCSV(resultsWithQuotes);

      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('exportToJSON', () => {
    it('should export results as JSON', () => {
      exportToJSON(mockResults);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.json'));
      expect(mockClick).toHaveBeenCalled();
    });

    it('should show alert for empty results', () => {
      exportToJSON([]);

      expect(global.alert).toHaveBeenCalledWith('No results to export');
    });
  });

  describe('exportToText', () => {
    it('should export results as text', () => {
      exportToText(mockResults);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.txt'));
      expect(mockClick).toHaveBeenCalled();
    });

    it('should show alert for empty results', () => {
      exportToText([]);

      expect(global.alert).toHaveBeenCalledWith('No results to export');
    });

    it('should format text correctly', () => {
      const singleResult: ImageResult[] = [
        {
          fileName: 'test.jpg',
          previewUrl: 'url',
          metadata: {
            titles: ['Title 1', 'Title 2'],
            keywords: ['keyword1', 'keyword2'],
          },
        },
      ];

      exportToText(singleResult);

      expect(mockClick).toHaveBeenCalled();
    });
  });
});

