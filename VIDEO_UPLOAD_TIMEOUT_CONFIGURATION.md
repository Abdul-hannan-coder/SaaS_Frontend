# Video Upload Connection Timeout Configuration

## Summary
Updated connection timeout to **5 minutes (300,000ms)** for all video upload operations in both stage-wise and all-in-one upload processes.

---

## Changes Made

### 1. ✅ Stage-Wise Upload (Already Configured)
**File:** `src/lib/hooks/upload/useVideos.ts`

**Location:** Line 106-108
```typescript
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout for large files
})
```

**Status:** ✅ Already set to 5 minutes (300,000ms)

**Used by:**
- Direct file upload from computer
- YouTube URL download and processing
- Stage-wise upload flow

---

### 2. ✅ All-In-One Upload & Processing (Updated)
**File:** `src/lib/hooks/upload/uploadApi.ts`

**Location:** Line 4-11
```typescript
export function createUploadAxios(tag: string): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 300000, // 5 minutes (300 seconds) for video upload and heavy AI processing tasks
  })
```

**Status:** ✅ Updated from 2 minutes (120,000ms) to 5 minutes (300,000ms)

**Used by:**
- `useAllInOne.ts` - All-in-one process and save operations
- `useTitle.ts` - Title generation
- `useTranscript.ts` - Description generation
- `useTimestamps.ts` - Timestamps generation
- `useThumbnail.ts` - Thumbnail generation

---

## Timeout Values Across the System

| Operation | Timeout | File | Status |
|-----------|---------|------|--------|
| **Video Upload** | 5 minutes (300,000ms) | `useVideos.ts` | ✅ Configured |
| **All-In-One Process** | 5 minutes (300,000ms) | `uploadApi.ts` | ✅ Updated |
| **AI Processing** | 5 minutes (300,000ms) | `uploadApi.ts` | ✅ Updated |
| **Thumbnail Generation** | 5 minutes (300,000ms) | `uploadApi.ts` | ✅ Updated |

---

## Why 5 Minutes?

### Video Upload Considerations:
1. **Large file sizes** - Videos can be several GB in size
2. **Variable upload speeds** - Users may have slower internet connections
3. **Network variability** - Connection quality can fluctuate during upload
4. **Processing time** - Backend may need time to process and store the video

### Calculation Example:
- File size: 500 MB
- Slow connection: 1 Mbps (≈ 125 KB/s)
- Upload time: ~67 minutes theoretical
- With 10 Mbps: ~6.7 minutes
- **5 minutes** is reasonable for connections ≥ 15 Mbps

---

## Benefits

### For Users:
✅ **Fewer timeout errors** for large video uploads
✅ **Better experience** on slower connections
✅ **More reliable** uploads without interruption
✅ **Consistent behavior** across stage-wise and all-in-one flows

### For System:
✅ **Reduced retry attempts** from timeout failures
✅ **Lower server load** from repeated upload attempts
✅ **Better completion rates** for upload operations
✅ **Unified timeout policy** across all upload endpoints

---

## What This Affects

### ✅ Stage-Wise Upload Flow:
1. Upload video step → **5 min timeout**
2. Title generation → **5 min timeout**
3. Description generation → **5 min timeout**
4. Timestamps generation → **5 min timeout**
5. Thumbnail generation → **5 min timeout**

### ✅ All-In-One Upload Flow:
1. Upload video → **5 min timeout** (via `useVideos.ts`)
2. Process all-in-one → **5 min timeout** (via `uploadApi.ts`)
3. Save content → **5 min timeout** (via `uploadApi.ts`)
4. Upload to YouTube → Separate YouTube API timeout

---

## Testing Recommendations

### Test Scenarios:
1. ✅ **Small video (< 50 MB)** - Should complete quickly
2. ✅ **Medium video (50-200 MB)** - Should complete within 2-3 minutes on average connection
3. ✅ **Large video (200-500 MB)** - Should complete within 5 minutes on decent connection
4. ⚠️ **Very large video (> 500 MB)** - May still timeout on slow connections

### Network Conditions to Test:
- Fast connection (50+ Mbps) → Should always succeed
- Medium connection (10-20 Mbps) → Should succeed for videos < 300 MB
- Slow connection (< 5 Mbps) → May timeout for videos > 200 MB

---

## Monitoring

### Console Logs to Watch:
```javascript
// In uploadApi.ts
[Tag] Request: {
  method: "POST",
  url: "/videos/upload",
  timeout: 300000  // ✅ Should show 300000 (5 minutes)
}

// In useVideos.ts
[Video][Upload] Starting video upload
// After 5 minutes, if still uploading:
Error: timeout of 300000ms exceeded
```

---

## Future Considerations

### If Timeouts Still Occur:
1. **Increase timeout further** - Consider 10 minutes for very large files
2. **Implement chunked uploads** - Break large files into smaller chunks
3. **Add resume capability** - Allow uploads to resume after interruption
4. **Show upload speed** - Display current upload speed to user
5. **Estimate time remaining** - Calculate and show ETA based on current speed

### Recommended Next Steps:
- Monitor upload success rates
- Track average upload times
- Identify users experiencing timeouts
- Consider implementing chunked uploads for files > 500 MB

---

## Technical Details

### Axios Timeout Behavior:
- Timeout is measured from request start to response completion
- Includes:
  - Connection establishment time
  - Upload time (for request body)
  - Server processing time
  - Download time (for response)

### Connection vs Request Timeout:
- **Connection timeout**: Time to establish connection (not separately configurable in axios)
- **Request timeout**: Total time for entire request/response cycle
- Our 5-minute timeout covers the **entire request lifecycle**

---

## Files Modified

1. ✅ `src/lib/hooks/upload/uploadApi.ts`
   - Changed timeout from 120,000ms (2 min) to 300,000ms (5 min)
   - Updated comment to reflect new timeout value

2. ℹ️ `src/lib/hooks/upload/useVideos.ts`
   - No change needed (already configured to 5 minutes)

---

## Verification

### Before:
- Stage-wise upload: 5 minutes ✅
- All-in-one process: 2 minutes ❌

### After:
- Stage-wise upload: 5 minutes ✅
- All-in-one process: 5 minutes ✅

**Result:** ✅ Both flows now have consistent 5-minute timeout
