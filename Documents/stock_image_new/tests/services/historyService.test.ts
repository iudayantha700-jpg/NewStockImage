import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getHistory,
  saveHistoryItem,
  deleteHistoryItem,
  clearHistory,
  getStorageInfo,
  checkStorageQuota,
} from '../../services/historyService';
import type { HistoryItem } from '../../types';

describe('historyService', () => {
  const mockStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      }),
      length: 0,
      key: vi.fn(),
    } as unknown as Storage;

    // Mock navigator.storage
    global.navigator.storage = {
      estimate: vi.fn().mockResolvedValue({
        usage: 1000000,
        quota: 5000000,
      }),
    } as unknown as StorageManager;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = getHistory();
      expect(history).toEqual([]);
    });

    it('should return parsed history from localStorage', () => {
      const mockHistory: HistoryItem[] = [
        {
          id: '1',
          timestamp: Date.now(),
          fileName: 'test.jpg',
          thumbnailDataUrl: 'data:image/jpeg;base64,...',
          metadata: {
            titles: ['Title'],
            keywords: ['keyword'],
          },
        },
      ];
      mockStorage['adobe_stock_optimizer_history'] = JSON.stringify(mockHistory);

      const history = getHistory();
      expect(history).toEqual(mockHistory);
    });

    it('should handle invalid JSON gracefully', () => {
      mockStorage['adobe_stock_optimizer_history'] = 'invalid json';
      
      const history = getHistory();
      expect(history).toEqual([]);
    });
  });

  describe('saveHistoryItem', () => {
    it('should save new item to history', () => {
      const item: HistoryItem = {
        id: '1',
        timestamp: Date.now(),
        fileName: 'test.jpg',
        thumbnailDataUrl: 'data:image/jpeg;base64,...',
        metadata: {
          titles: ['Title'],
          keywords: ['keyword'],
        },
      };

      const updated = saveHistoryItem(item);
      expect(updated).toHaveLength(1);
      expect(updated[0]).toEqual(item);
    });

    it('should limit history to 50 items', () => {
      // Create 51 items
      for (let i = 0; i < 51; i++) {
        const item: HistoryItem = {
          id: `item-${i}`,
          timestamp: Date.now() + i,
          fileName: `test${i}.jpg`,
          thumbnailDataUrl: '',
          metadata: {
            titles: ['Title'],
            keywords: ['keyword'],
          },
        };
        saveHistoryItem(item);
      }

      const history = getHistory();
      expect(history).toHaveLength(50);
      expect(history[0].id).toBe('item-50'); // Most recent should be first
    });

    it('should handle storage quota exceeded', () => {
      const setItemSpy = vi.spyOn(global.localStorage, 'setItem');
      setItemSpy.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      const item: HistoryItem = {
        id: '1',
        timestamp: Date.now(),
        fileName: 'test.jpg',
        thumbnailDataUrl: '',
        metadata: {
          titles: ['Title'],
          keywords: ['keyword'],
        },
      };

      const updated = saveHistoryItem(item);
      // Should return empty array or previous history
      expect(Array.isArray(updated)).toBe(true);
    });
  });

  describe('deleteHistoryItem', () => {
    it('should delete item by id', () => {
      const item1: HistoryItem = {
        id: '1',
        timestamp: Date.now(),
        fileName: 'test1.jpg',
        thumbnailDataUrl: '',
        metadata: { titles: ['Title'], keywords: ['keyword'] },
      };
      const item2: HistoryItem = {
        id: '2',
        timestamp: Date.now(),
        fileName: 'test2.jpg',
        thumbnailDataUrl: '',
        metadata: { titles: ['Title'], keywords: ['keyword'] },
      };

      saveHistoryItem(item1);
      saveHistoryItem(item2);

      const updated = deleteHistoryItem('1');
      expect(updated).toHaveLength(1);
      expect(updated[0].id).toBe('2');
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      const item: HistoryItem = {
        id: '1',
        timestamp: Date.now(),
        fileName: 'test.jpg',
        thumbnailDataUrl: '',
        metadata: { titles: ['Title'], keywords: ['keyword'] },
      };

      saveHistoryItem(item);
      const cleared = clearHistory();

      expect(cleared).toEqual([]);
      expect(getHistory()).toEqual([]);
    });
  });

  describe('getStorageInfo', () => {
    it('should return item count and limit status', () => {
      const item: HistoryItem = {
        id: '1',
        timestamp: Date.now(),
        fileName: 'test.jpg',
        thumbnailDataUrl: '',
        metadata: { titles: ['Title'], keywords: ['keyword'] },
      };

      saveHistoryItem(item);
      const info = getStorageInfo();

      expect(info.itemCount).toBe(1);
      expect(info.isNearLimit).toBe(false);
    });

    it('should detect when near limit', () => {
      // Add 40 items (80% of 50)
      for (let i = 0; i < 40; i++) {
        const item: HistoryItem = {
          id: `item-${i}`,
          timestamp: Date.now() + i,
          fileName: `test${i}.jpg`,
          thumbnailDataUrl: '',
          metadata: { titles: ['Title'], keywords: ['keyword'] },
        };
        saveHistoryItem(item);
      }

      const info = getStorageInfo();
      expect(info.isNearLimit).toBe(true);
    });
  });

  describe('checkStorageQuota', () => {
    it('should check storage quota', async () => {
      const quota = await checkStorageQuota();

      expect(quota).toHaveProperty('used');
      expect(quota).toHaveProperty('total');
      expect(quota).toHaveProperty('percentage');
      expect(quota).toHaveProperty('warning');
    });

    it('should handle missing navigator.storage', async () => {
      // @ts-ignore
      delete global.navigator.storage;

      const quota = await checkStorageQuota();

      expect(quota).toHaveProperty('used');
      expect(quota).toHaveProperty('total');
    });
  });
});

