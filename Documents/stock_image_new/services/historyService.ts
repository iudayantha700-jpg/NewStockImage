
import { HistoryItem } from '../types';

const STORAGE_KEY = 'adobe_stock_optimizer_history';
const MAX_HISTORY_ITEMS = 50;
const QUOTA_WARNING_THRESHOLD = 0.8; // Warn at 80% of quota

/**
 * Check localStorage quota usage (async)
 */
export async function checkStorageQuota(): Promise<{ used: number; total: number; percentage: number; warning: boolean }> {
  try {
    if (!navigator.storage || !navigator.storage.estimate) {
      // Fallback: estimate based on current usage
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      // Assume ~5MB limit (typical browser limit)
      const estimatedTotal = 5 * 1024 * 1024;
      const percentage = (totalSize / estimatedTotal) * 100;
      return {
        used: totalSize,
        total: estimatedTotal,
        percentage,
        warning: percentage > QUOTA_WARNING_THRESHOLD * 100
      };
    }

    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const total = estimate.quota || 0;
    const percentage = total > 0 ? (used / total) * 100 : 0;
    return {
      used,
      total,
      percentage,
      warning: percentage > QUOTA_WARNING_THRESHOLD * 100
    };
  } catch (e) {
    return { used: 0, total: 0, percentage: 0, warning: false };
  }
}

/**
 * Get storage quota info (synchronous version for quick checks)
 */
export function getStorageInfo(): { itemCount: number; isNearLimit: boolean } {
  const history = getHistory();
  return {
    itemCount: history.length,
    isNearLimit: history.length >= MAX_HISTORY_ITEMS * 0.8
  };
}

export const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveHistoryItem = (item: HistoryItem): HistoryItem[] => {
  const history = getHistory();
  // Add to beginning, limit to prevent localStorage quota issues
  const updated = [item, ...history].slice(0, MAX_HISTORY_ITEMS);
  try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
      console.error("Failed to save history (likely quota exceeded)", e);
      // Try to free up space by removing oldest items
      if (updated.length > 10) {
          const reduced = updated.slice(0, Math.floor(updated.length * 0.8));
          try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
              console.warn(`Reduced history to ${reduced.length} items due to storage quota`);
              return reduced;
          } catch (e2) {
              console.error("Failed to save reduced history", e2);
          }
      }
      return history;
  }
  return updated;
};

export const deleteHistoryItem = (id: string): HistoryItem[] => {
  const history = getHistory();
  const updated = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const clearHistory = (): HistoryItem[] => {
  localStorage.removeItem(STORAGE_KEY);
  return [];
};
