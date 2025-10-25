# Privacy & Playlist Selection Bug Fix

## Problem Description

**Reported Issue**: In stage-wise upload, when users select privacy settings (private/public/unlisted) and playlists in the final stages, these selections are **not being sent to the YouTube upload API**. Videos always upload as **public** regardless of the user's selection.

## Root Cause Analysis

### Issue Breakdown

The YouTube upload flow had a critical gap in data transmission:

1. **User Selection (Stage 2)**:
   - User selects privacy: `private`, `public`, or `unlisted`
   - User selects playlist from their channel
   - Selections stored in state: `state.selectedPrivacy` and `state.selectedPlaylist`

2. **Upload Trigger (Stage 3)**:
   - User clicks "Upload to YouTube" button
   - `handlePublish()` → calls `handleDirectUpload()`
   - `handleDirectUpload()` → calls `uploadToYouTube(videoId)`

3. **The Bug**:
   ```typescript
   // ❌ OLD CODE - Only passed videoId
   await uploadToYouTube(videoId)
   
   // API request sent as:
   POST /youtube-upload/{videoId}/upload
   Body: {}  // ❌ Empty body - no privacy or playlist!
   ```

4. **Result**:
   - Backend receives upload request without privacy/playlist parameters
   - Backend defaults to `public` privacy
   - Video uploads without being added to any playlist

### Why This Happened

The `uploadToYouTube` function in `useYouTubeUpload.ts` was originally designed to:
- Accept only `videoId` as parameter
- Send an empty request body `{}`
- No way to pass additional parameters like privacy or playlist

Meanwhile, the UI correctly captured user selections but never passed them to the API.

### Comparison with All-in-One Flow

The all-in-one upload flow **works correctly** because:
```typescript
// ✅ All-in-one passes privacy and playlist
await saveAllInOne(currentVideoId, {
  selected_title: selectedTitle,
  selected_thumbnail_url: selectedThumbnail,
  description,
  timestamps,
  privacy_status: privacyStatus,        // ✅ Privacy included
  playlist_name: playlistName || undefined, // ✅ Playlist included
})
```

## The Solution

### File 1: `src/lib/hooks/youtube/useYouTubeUpload.ts`

**Added optional parameters interface and updated function signature:**

```typescript
// NEW: Interface for upload parameters
interface YouTubeUploadParams {
  privacy_status?: 'public' | 'private' | 'unlisted'
  playlist_id?: string
}

// Updated function signature
const uploadToYouTube = useCallback(async (
  videoId: string, 
  params?: YouTubeUploadParams  // ✅ New optional params
) => {
  // ...
  
  console.log(`[YouTube Upload] Uploading video ${videoId} to YouTube...`, params)
  
  const response = await axios.post(
    `https://backend.postsiva.com/youtube-upload/${videoId}/upload`,
    params || {},  // ✅ Pass params instead of empty object
    { headers }
  )
  
  // ...
}, [getAuthHeaders])
```

### File 2: `src/lib/hooks/upload/useUploadHandlers.ts`

**Updated `handleDirectUpload` to pass privacy and playlist:**

```typescript
const handleDirectUpload = useCallback(async () => {
  // ... confirmation and setup ...
  
  // ✅ NEW: Build upload parameters from state
  const uploadParams: { 
    privacy_status?: 'public' | 'private' | 'unlisted', 
    playlist_id?: string 
  } = {}
  
  if (state.selectedPrivacy) {
    uploadParams.privacy_status = state.selectedPrivacy
    console.log('[Upload] Setting privacy status:', state.selectedPrivacy)
  }
  
  if (state.selectedPlaylist?.id) {
    uploadParams.playlist_id = state.selectedPlaylist.id
    console.log('[Upload] Setting playlist:', state.selectedPlaylist.name, state.selectedPlaylist.id)
  }

  // ✅ Pass params to YouTube upload
  await uploadToYouTube(videoId, uploadParams)

  toast({
    title: "Success!",
    description: `Video uploaded to YouTube successfully as ${state.selectedPrivacy}!`,
    //                                                     ↑ Now shows actual privacy
  })
  
  // ...
}, [
  // ... existing deps ...
  state.selectedPrivacy,      // ✅ Added dependency
  state.selectedPlaylist      // ✅ Added dependency
])
```

## What Changed

### Before Fix

```
[User Selects Privacy: private]
[User Selects Playlist: "My Tutorials"]
[User Clicks Upload]
  ↓
handleDirectUpload()
  ↓
uploadToYouTube(videoId)
  ↓
POST /youtube-upload/{id}/upload
Body: {}
  ↓
[Backend uploads as public, no playlist]
  ↓
❌ Video is public on YouTube
```

### After Fix

```
[User Selects Privacy: private]
[User Selects Playlist: "My Tutorials"]
[User Clicks Upload]
  ↓
handleDirectUpload()
  ↓
Build params: {
  privacy_status: "private",
  playlist_id: "PLxxx..."
}
  ↓
uploadToYouTube(videoId, params)
  ↓
POST /youtube-upload/{id}/upload
Body: {
  privacy_status: "private",
  playlist_id: "PLxxx..."
}
  ↓
[Backend uploads as private, adds to playlist]
  ↓
✅ Video is private on YouTube
✅ Video added to selected playlist
```

## Testing Checklist

### Test Case 1: Privacy Status
- [ ] Upload a video through stage-wise flow
- [ ] In Stage 2, select "Private"
- [ ] Complete Stage 3 and upload to YouTube
- [ ] Verify video appears as **private** on YouTube
- [ ] Check browser console for log: `[Upload] Setting privacy status: private`

### Test Case 2: Playlist Selection
- [ ] Upload a video through stage-wise flow
- [ ] In Stage 2, select a specific playlist
- [ ] Complete Stage 3 and upload to YouTube
- [ ] Verify video is added to the selected playlist
- [ ] Check browser console for log: `[Upload] Setting playlist: [name] [id]`

### Test Case 3: Unlisted Status
- [ ] Upload a video through stage-wise flow
- [ ] In Stage 2, select "Unlisted"
- [ ] Upload to YouTube
- [ ] Verify video is **unlisted** (not public, not private)

### Test Case 4: No Playlist (Optional Field)
- [ ] Upload a video through stage-wise flow
- [ ] In Stage 2, leave playlist as "No playlist selected"
- [ ] Upload to YouTube
- [ ] Verify video uploads successfully without being added to any playlist

### Test Case 5: Public with Playlist
- [ ] Select "Public" privacy
- [ ] Select a playlist
- [ ] Upload to YouTube
- [ ] Verify video is **public** AND added to playlist

## API Request Format

The YouTube upload API now receives:

```json
POST /youtube-upload/{videoId}/upload
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "privacy_status": "private",     // or "public" or "unlisted"
  "playlist_id": "PLxxxxxxxxxxxxx"  // Optional: YouTube playlist ID
}
```

## Success Indicators

### 1. Console Logs
When upload is triggered, you should see:
```
[Upload] Setting privacy status: private
[Upload] Setting playlist: My Tutorials PLxxx...
[YouTube Upload] Uploading video abc-123 to YouTube... { privacy_status: 'private', playlist_id: 'PLxxx...' }
```

### 2. Toast Notification
Success message now includes privacy status:
```
✅ Video uploaded to YouTube successfully as private!
```

### 3. YouTube Dashboard
- Video appears with correct privacy setting
- Video is listed in the selected playlist
- Privacy badge matches selection (🔒 Private, 🌐 Public, 🔗 Unlisted)

## Edge Cases Handled

1. **No Privacy Selected**: Falls back to default (empty params)
2. **No Playlist Selected**: Only sends `privacy_status`, not `playlist_id`
3. **Invalid Playlist ID**: Backend validation will handle
4. **Both Empty**: Sends empty object `{}` (backward compatible)

## Files Modified

1. ✅ `src/lib/hooks/youtube/useYouTubeUpload.ts`
   - Added `YouTubeUploadParams` interface
   - Updated `uploadToYouTube` function signature
   - Changed request body from `{}` to `params || {}`

2. ✅ `src/lib/hooks/upload/useUploadHandlers.ts`
   - Updated `handleDirectUpload` to build `uploadParams`
   - Added console.log for debugging
   - Updated success toast message
   - Added `state.selectedPrivacy` and `state.selectedPlaylist` to dependencies

## Build Status

✅ **Build Successful**  
✅ **No TypeScript Errors**  
✅ **All Routes Compile**  

```
Route                        Size     First Load JS
/dashboard/upload            23.5 kB  191 kB
/dashboard/all-in-one        7.55 kB  172 kB
```

## User Impact

**Before**: Users frustrated that privacy settings don't work—always uploads as public  
**After**: Users can confidently set privacy and playlist, knowing selections will be respected

## Prevention Guidelines

When adding new upload parameters in the future:

1. ✅ Update API function signature to accept parameters
2. ✅ Pass parameters from UI state to API call
3. ✅ Add parameters to useCallback dependencies
4. ✅ Log parameters for debugging
5. ✅ Test all combinations (public/private/unlisted × with/without playlist)

## Related Issues

- All-in-one upload already working correctly (uses `saveAllInOne` with privacy/playlist)
- Stage-wise upload now matches all-in-one behavior
- Both flows use consistent parameter names: `privacy_status`, `playlist_id` or `playlist_name`

---

**Fix Date**: October 25, 2025  
**Build Version**: Next.js 15.2.4  
**Status**: ✅ Resolved
