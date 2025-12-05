/**
 * Process items in parallel with a concurrency limit
 */
export async function processInParallel<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  concurrency: number = 3,
  onProgress?: (completed: number, total: number) => void
): Promise<Array<{ item: T; result?: R; error?: Error; index: number }>> {
  const results: Array<{ item: T; result?: R; error?: Error; index: number }> = [];
  let completed = 0;

  // Process items in batches
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchPromises = batch.map(async (item, batchIndex) => {
      const globalIndex = i + batchIndex;
      try {
        const result = await processor(item, globalIndex);
        completed++;
        if (onProgress) {
          try {
            onProgress(completed, items.length);
          } catch (progressError) {
            console.error('Progress callback error:', progressError);
          }
        }
        return { item, result, index: globalIndex };
      } catch (error) {
        completed++;
        if (onProgress) {
          try {
            onProgress(completed, items.length);
          } catch (progressError) {
            console.error('Progress callback error:', progressError);
          }
        }
        return {
          item,
          error: error instanceof Error ? error : new Error(String(error)),
          index: globalIndex
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  // Sort results by original index to maintain order
  results.sort((a, b) => a.index - b.index);

  return results;
}

