# Testing Checklist - Adobe Stock SEO Optimizer

## 🧪 Automated Tests

### Unit Tests Status
- ✅ `utils/parallelProcessor.test.ts` - Parallel processing logic
- ✅ `utils/exportUtils.test.ts` - Export functionality (CSV, JSON, TXT)
- ✅ `utils/imageUtils.test.ts` - Thumbnail generation
- ✅ `services/historyService.test.ts` - History management

### Running Tests
```bash
npm install  # Install test dependencies first
npm test     # Run tests
npm run test:ui  # Run with UI
npm run test:coverage  # Run with coverage
```

---

## 📋 Manual Testing Checklist

### 1. Environment Setup
- [ ] Create `.env.local` file with `GEMINI_API_KEY`
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] App loads without errors in browser

### 2. File Upload & Validation

#### Basic Upload
- [ ] Click upload area opens file picker
- [ ] Can select single image (JPEG, PNG, WebP)
- [ ] Can select multiple images
- [ ] Image previews display correctly
- [ ] File names shown on hover

#### File Size Validation
- [ ] Upload file > 10MB shows error
- [ ] Error message is clear and helpful
- [ ] Valid files still process if mixed with invalid

#### File Count Validation
- [ ] Upload 21+ files shows error (max 20)
- [ ] Error message indicates limit
- [ ] Can upload exactly 20 files

#### File Type Validation
- [ ] Upload non-image file (e.g., .txt) shows error
- [ ] Upload unsupported image format shows error
- [ ] Only JPEG, PNG, WebP accepted

#### Mixed Valid/Invalid Files
- [ ] Upload mix of valid/invalid files
- [ ] Valid files process, invalid ones rejected
- [ ] Clear error messages for rejected files

### 3. Image Processing

#### Single Image
- [ ] Select 1 image
- [ ] Choose title count (1, 3, 5, 10, 15, 20)
- [ ] Click "Generate" button
- [ ] Loading spinner appears
- [ ] Progress bar shows 0-100%
- [ ] Results display after completion
- [ ] Exactly requested number of titles generated
- [ ] Exactly 48 keywords generated
- [ ] All keywords are lowercase

#### Multiple Images (Sequential)
- [ ] Upload 2-3 images
- [ ] Process all images
- [ ] Each image processes correctly
- [ ] Results maintain order
- [ ] Progress updates correctly

#### Multiple Images (Parallel)
- [ ] Upload 5+ images
- [ ] Process all images
- [ ] Images process in batches of 3
- [ ] Progress bar updates smoothly
- [ ] All results display correctly
- [ ] Processing is faster than sequential

### 4. Error Handling

#### Network Errors
- [ ] Disconnect network during processing
- [ ] App handles error gracefully
- [ ] Error message is clear
- [ ] Can retry after error

#### API Errors
- [ ] Invalid API key shows error
- [ ] Error message is helpful
- [ ] App doesn't crash

#### Partial Failures
- [ ] Process 3 images where 1 fails
- [ ] Successful images still process
- [ ] Failed image shows error
- [ ] Error summary displays correctly
- [ ] Can see which images failed

#### Retry Logic
- [ ] Temporary network issue triggers retry
- [ ] Retries happen automatically (up to 3 times)
- [ ] Validation errors don't retry
- [ ] Console shows retry attempts

### 5. Results Display

#### Result Cards
- [ ] Image preview displays
- [ ] File name shown
- [ ] All titles displayed
- [ ] All keywords displayed as tags
- [ ] Copy buttons work for titles
- [ ] Copy button works for keywords
- [ ] Visual feedback on copy (checkmark)

#### Export Functionality
- [ ] CSV export button works
- [ ] CSV file downloads
- [ ] CSV opens correctly in Excel/Sheets
- [ ] JSON export button works
- [ ] JSON file downloads
- [ ] JSON is valid and parseable
- [ ] TXT export button works
- [ ] TXT file downloads
- [ ] TXT is readable
- [ ] Export works with multiple results

### 6. History Management

#### Saving to History
- [ ] Processed images saved to history
- [ ] History accessible via header button
- [ ] Thumbnails display in history
- [ ] File names shown
- [ ] Timestamps shown
- [ ] Metadata preserved

#### History View
- [ ] History view displays correctly
- [ ] Empty state shows when no history
- [ ] Can navigate back to generator
- [ ] History items display in reverse chronological order

#### History Operations
- [ ] Delete single item works
- [ ] Clear all works (with confirmation)
- [ ] Confirmation dialog appears
- [ ] History updates after deletion

#### History Limits
- [ ] Process 51+ images
- [ ] History limited to 50 items
- [ ] Oldest items removed automatically
- [ ] No storage errors

### 7. Memory Management

#### Object URL Cleanup
- [ ] Upload images multiple times
- [ ] Check browser memory (DevTools)
- [ ] Memory doesn't grow indefinitely
- [ ] Object URLs cleaned up properly

#### Large Batches
- [ ] Process 20 images
- [ ] Check memory usage
- [ ] No memory leaks
- [ ] App remains responsive

### 8. UI/UX

#### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on tablet (768px)
- [ ] Works on mobile (375px)
- [ ] Layout adapts correctly
- [ ] Buttons accessible
- [ ] Text readable

#### Dark Mode
- [ ] Dark mode toggle works (if implemented)
- [ ] Colors contrast correctly
- [ ] Text readable in dark mode
- [ ] Images display correctly

#### Loading States
- [ ] Loading spinner during processing
- [ ] Progress bar updates
- [ ] Status messages clear
- [ ] Buttons disabled during processing

#### Error Messages
- [ ] Error messages are clear
- [ ] Error messages are actionable
- [ ] Errors don't block UI
- [ ] Can recover from errors

### 9. Performance

#### Processing Speed
- [ ] Single image processes in reasonable time (<30s)
- [ ] Parallel processing faster than sequential
- [ ] Progress updates smoothly
- [ ] UI remains responsive during processing

#### Large Files
- [ ] Large images (near 10MB) process correctly
- [ ] Processing time reasonable
- [ ] No timeouts

### 10. Edge Cases

#### Empty States
- [ ] No images uploaded - button disabled
- [ ] No history - empty state shown
- [ ] No results - appropriate message

#### Special Characters
- [ ] File names with special characters work
- [ ] Titles/keywords with special characters handled
- [ ] Export handles special characters

#### Rapid Actions
- [ ] Rapidly click buttons - no double processing
- [ ] Upload while processing - handled correctly
- [ ] Navigate away during processing - handled

#### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

---

## 🐛 Known Issues to Test

1. **API Key Handling**
   - Test with missing API key
   - Test with invalid API key
   - Test with expired API key

2. **Storage Quota**
   - Fill localStorage to near limit
   - Test quota exceeded scenario
   - Verify cleanup works

3. **Concurrent Processing**
   - Start processing, then start again
   - Verify no race conditions
   - Verify state management

---

## ✅ Test Results Template

```
Date: __________
Tester: __________
Browser: __________
OS: __________

[ ] All critical tests passed
[ ] All important tests passed
[ ] Issues found: __________
[ ] Notes: __________
```

---

## 🚀 Quick Test Script

1. **5-Minute Smoke Test:**
   - Upload 1 image → Process → Verify results
   - Upload 3 images → Process → Verify all process
   - Export CSV → Verify download
   - Check history → Verify saved

2. **15-Minute Full Test:**
   - Run all validation tests
   - Test error scenarios
   - Test edge cases
   - Verify performance

3. **30-Minute Comprehensive Test:**
   - Full checklist
   - Multiple browsers
   - Performance profiling
   - Memory leak testing

---

*Last updated: After Phase 2 upgrades*

