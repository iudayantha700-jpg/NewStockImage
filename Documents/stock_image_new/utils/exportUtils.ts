import type { ImageResult } from '../types';

/**
 * Export results as CSV
 */
export function exportToCSV(results: ImageResult[]): void {
  if (results.length === 0) {
    alert('No results to export');
    return;
  }

  // Find maximum number of titles across all results
  const maxTitles = Math.max(...results.map(r => r.metadata.titles.length), 1);
  
  // Create CSV header dynamically based on actual title count
  const headers = [
    'File Name',
    ...Array.from({ length: maxTitles }, (_, i) => `Title ${i + 1}`),
    'Keywords'
  ];
  
  // Create CSV rows
  const rows = results.map(result => {
    // Pad titles to match header count, or truncate if needed
    const titles = Array.from({ length: maxTitles }, (_, i) => {
      const title = result.metadata.titles[i] || '';
      return `"${title.replace(/"/g, '""')}"`;
    }).join(',');
    const keywords = `"${result.metadata.keywords.join(', ')}"`;
    return `"${result.fileName.replace(/"/g, '""')}",${titles},${keywords}`;
  });

  // Combine header and rows
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `adobe-stock-seo-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export results as JSON
 */
export function exportToJSON(results: ImageResult[]): void {
  if (results.length === 0) {
    alert('No results to export');
    return;
  }

  const jsonContent = JSON.stringify(results, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `adobe-stock-seo-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export all titles and keywords as a simple text file
 */
export function exportToText(results: ImageResult[]): void {
  if (results.length === 0) {
    alert('No results to export');
    return;
  }

  const lines: string[] = [];
  
  results.forEach((result, index) => {
    lines.push(`=== ${result.fileName} ===`);
    lines.push('');
    lines.push('TITLES:');
    result.metadata.titles.forEach((title, i) => {
      lines.push(`${i + 1}. ${title}`);
    });
    lines.push('');
    lines.push('KEYWORDS:');
    lines.push(result.metadata.keywords.join(', '));
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  const textContent = lines.join('\n');
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `adobe-stock-seo-${new Date().toISOString().split('T')[0]}.txt`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

