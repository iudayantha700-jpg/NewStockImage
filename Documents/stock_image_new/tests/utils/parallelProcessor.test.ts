import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processInParallel } from '../../utils/parallelProcessor';

describe('processInParallel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process items in parallel with concurrency limit', async () => {
    const items = [1, 2, 3, 4, 5];
    const processor = vi.fn(async (item: number) => item * 2);
    const concurrency = 2;

    const results = await processInParallel(items, processor, concurrency);

    expect(results).toHaveLength(5);
    expect(results[0].result).toBe(2);
    expect(results[1].result).toBe(4);
    expect(results[2].result).toBe(6);
    expect(results[3].result).toBe(8);
    expect(results[4].result).toBe(10);
    expect(processor).toHaveBeenCalledTimes(5);
  });

  it('should maintain original order of results', async () => {
    const items = [3, 1, 4, 2, 5];
    const processor = vi.fn(async (item: number, index: number) => {
      // Simulate different processing times
      await new Promise(resolve => setTimeout(resolve, item * 10));
      return item * 2;
    });

    const results = await processInParallel(items, processor, 2);

    // Results should be in original order despite different processing times
    expect(results.map(r => r.result)).toEqual([6, 2, 8, 4, 10]);
  });

  it('should handle errors gracefully', async () => {
    const items = [1, 2, 3];
    const processor = vi.fn(async (item: number) => {
      if (item === 2) {
        throw new Error('Processing failed');
      }
      return item * 2;
    });

    const results = await processInParallel(items, processor, 2);

    expect(results).toHaveLength(3);
    expect(results[0].result).toBe(2);
    expect(results[1].error?.message).toBe('Processing failed');
    expect(results[2].result).toBe(6);
  });

  it('should call onProgress callback', async () => {
    const items = [1, 2, 3];
    const processor = vi.fn(async (item: number) => item * 2);
    const onProgress = vi.fn();

    await processInParallel(items, processor, 2, onProgress);

    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenCalledWith(1, 3);
    expect(onProgress).toHaveBeenCalledWith(2, 3);
    expect(onProgress).toHaveBeenCalledWith(3, 3);
  });

  it('should handle empty array', async () => {
    const items: number[] = [];
    const processor = vi.fn(async (item: number) => item * 2);

    const results = await processInParallel(items, processor, 2);

    expect(results).toHaveLength(0);
    expect(processor).not.toHaveBeenCalled();
  });

  it('should respect concurrency limit', async () => {
    const items = [1, 2, 3, 4, 5];
    const processingOrder: number[] = [];
    const processor = vi.fn(async (item: number) => {
      processingOrder.push(item);
      await new Promise(resolve => setTimeout(resolve, 10));
      return item;
    });

    await processInParallel(items, processor, 2);

    // First batch should process items 1 and 2 together
    expect(processingOrder.slice(0, 2)).toContain(1);
    expect(processingOrder.slice(0, 2)).toContain(2);
  });
});

