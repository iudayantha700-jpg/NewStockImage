
export interface StockMetadata {
  titles: string[];
  keywords: string[];
}

export interface ImageResult {
  fileName: string;
  previewUrl: string;
  metadata: StockMetadata;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  fileName: string;
  thumbnailDataUrl: string;
  metadata: StockMetadata;
}
