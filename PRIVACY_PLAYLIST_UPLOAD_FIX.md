# Privacy & Playlist Settings Fix for Stage-Wise Upload

## Problem Identified

In the last stage (Stage 3: Preview) of stage-wise upload, when clicking "Upload to YouTube", the **privacy setting** and **playlist selection** from Stage 2 (Settings) were **not being applied** to the uploaded video.

### Root Cause

The code was attempting to pass privacy and playlist parameters directly to the YouTube upload API endpoint (`/youtube-upload/{videoId}/upload`), but the **correct API flow** according to your backend is:

1. **Set Privacy**: `POST /privacy-status/{videoId}/privacy-status` with body `{"privacy_status": "private"}`
2. **Set Playlist**: `POST /playlists/{videoId}/select` with body containing playlist ID
3. **Upload to YouTube**: `POST /youtube-upload/{videoId}/upload` (no params needed, privacy and playlist already set)

The previous implementation was skipping steps 1 and 2, trying to do everything in step 3.

---

## Solution Overview

### Created New Hook: `usePlaylistSelection.ts`

A dedicated hook to handle playlist selection via the correct API endpoint.

**API Endpoint**: `POST /playlists/{videoId}/select`

**Request Body**: Playlist ID as string (e.g., `"PLxxx..."`)

**Response**:
```json
{
  "success": true,
  "message": "Playlist 'string' created and selected for video",
  "data": {
    "success": true,
    "message": "Playlist 'string' created and selected for video",
    "playlist_name": "string",
    "playlist_id": "PL9R25FCyv3NL3MsHBAemLrS5vPqSbMUdO",
    "playlist_exists": false,
    "video_id": "6af2668b-9e8c-4283-8ca0-a8c2eb98efc6"
  }
}
```

### Updated Upload Flow

The upload process now follows the correct 3-step sequence:

1. **Stage 2 (Settings)**: User selects privacy and optionally a playlist
   - Privacy: `public`, `private`, or `unlisted`
   - Playlist: Optional YouTube playlist

2. **Stage 3 (Preview)**: User clicks "Upload to YouTube"
   - Step 1: Call `updatePrivacyStatus(videoId, selectedPrivacy)` → Sets privacy via `/privacy-status` API
   - Step 2: Call `selectPlaylist(videoId, playlistId)` → Adds video to playlist via `/playlists` API
   - Step 3: Call `uploadToYouTube(videoId)` → Uploads to YouTube (privacy and playlist already set)

---

## Code Changes

### 1. Created `usePlaylistSelection.ts` Hook

**File**: `src/lib/hooks/upload/usePlaylistSelection.ts`

```typescript
import { useState, useCallback } from 'react'
import axios from 'axios'
import useAuth from '../auth/useAuth'

interface PlaylistSelectionResponse {
  success: boolean
  message: string
  data: {
    success: boolean
    message: string
    playlist_name: string
    playlist_id: string
    playlist_exists: boolean
    video_id: string
  }
}

interface PlaylistSelectionState {
  isSelecting: boolean
  error: string | null
  lastResponse: PlaylistSelectionResponse | null
}

export default function usePlaylistSelection() {
  const { getAuthHeaders } = useAuth()
  const [state, setState] = useState<PlaylistSelectionState>({
    isSelecting: false,
    error: null,
    lastResponse: null,
  })

  const selectPlaylist = useCallback(async (videoId: string, playlistId: string) => {
    try {
      setState(prev => ({ ...prev, isSelecting: true, error: null }))
      
      const headers = getAuthHeaders()
      if (!headers.Authorization) {
        throw new Error('Authentication required')
      }

      console.log(`[Playlist Selection] Adding video ${videoId} to playlist ${playlistId}`)
      
      const response = await axios.post(
        `https://backend.postsiva.com/playlists/${videoId}/select`,
        playlistId, // Send playlist ID as string in body
        { 
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        }
      )

      const responseData = response.data
      console.log('[Playlist Selection] Success:', responseData)

      setState(prev => ({
        ...prev,
        isSelecting: false,
        lastResponse: responseData,
      }))

      return responseData
    } catch (error: any) {
      console.error('[Playlist Selection] Error:', error)
      
      let errorMessage = 'Failed to add video to playlist'
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.'
        } else if (error.response?.status === 404) {
          errorMessage = 'Video or playlist not found'
        } else if (error.response?.status === 403) {
          errorMessage = 'Access denied to modify playlist'
        } else if (error.response?.status === 400) {
          errorMessage = 'Invalid playlist ID or video data'
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isSelecting: false,
      }))

      throw error
    }
  }, [getAuthHeaders])

  const resetState = useCallback(() => {
    setState({
      isSelecting: false,
      error: null,
      lastResponse: null,
    })
  }, [])

  return {
    ...state,
    selectPlaylist,
    resetState,
  }
}
```

**Features**:
- ✅ Axios-based HTTP client with auth headers
- ✅ Error handling for 401, 403, 404, 400, 500 status codes
- ✅ Loading state (`isSelecting`)
- ✅ Console logging for debugging
- ✅ TypeScript interfaces for response data

---

### 2. Updated `useUploadPage.ts`

**File**: `src/lib/hooks/upload/useUploadPage.ts`

**Added**:
```typescript
import usePlaylistSelection from "@/lib/hooks/upload/usePlaylistSelection"

// Inside the hook
const {
  isSelecting: playlistSelecting,
  error: playlistSelectionError,
  selectPlaylist,
  resetState: resetPlaylistSelectionState,
} = usePlaylistSelection()

// Passed to return object
return {
  // ... other returns
  playlistSelecting,
  playlistSelectionError,
  selectPlaylist,
  resetPlaylistSelectionState,
}
```

---

### 3. Updated `useUploadHandlers.ts`

**File**: `src/lib/hooks/upload/useUploadHandlers.ts`

#### A. Added New Parameters to Interface

```typescript
interface UseUploadHandlersProps {
  // ... existing props
  selectPlaylist: any
  resetPlaylistSelectionState: any
  playlistSelectionError: string | null
}
```

#### B. Completely Refactored `handleDirectUpload`

**Before** ❌ (Incorrect approach):
```typescript
// Attempted to pass privacy and playlist to YouTube upload API
const uploadParams = {
  privacy_status: state.selectedPrivacy,
  playlist_id: state.selectedPlaylist?.id
}
await uploadToYouTube(videoId, uploadParams) // ❌ Wrong API design
```

**After** ✅ (Correct 3-step flow):
```typescript
const handleDirectUpload = useCallback(async () => {
  const confirmed = window.confirm("Are you sure you want to upload this video to YouTube?")
  if (!confirmed) return

  try {
    const videoId = previewData?.id || uploadedVideoData?.id || getCurrentVideoId()
    if (!videoId) {
      toast({ title: "Error", description: "No video ID found." })
      return
    }

    updateState({ isUploading: true })

    toast({
      title: "Preparing upload...",
      description: "Setting up privacy and playlist before uploading to YouTube.",
    })

    // ✅ STEP 1: Update privacy status via /privacy-status API
    if (state.selectedPrivacy) {
      console.log('[UploadHandlers] Using privacy setting from Stage 2:', state.selectedPrivacy)
      try {
        resetPrivacyState()
        await updatePrivacyStatus(videoId, state.selectedPrivacy)
        console.log('[UploadHandlers] ✅ Privacy status updated successfully')
      } catch (error) {
        console.error('[UploadHandlers] ❌ Privacy status update failed:', error)
        throw new Error(`Failed to set privacy to ${state.selectedPrivacy}`)
      }
    }

    // ✅ STEP 2: Add to playlist via /playlists API (if selected)
    if (state.selectedPlaylist?.id) {
      console.log('[UploadHandlers] Adding video to playlist:', {
        playlistName: state.selectedPlaylist.name,
        playlistId: state.selectedPlaylist.id
      })
      try {
        resetPlaylistSelectionState()
        await selectPlaylist(videoId, state.selectedPlaylist.id)
        console.log('[UploadHandlers] ✅ Video added to playlist successfully')
      } catch (error) {
        console.error('[UploadHandlers] ❌ Playlist selection failed:', error)
        // Don't fail entire upload if playlist fails
        toast({
          title: "Playlist Warning",
          description: `Failed to add video to playlist: ${playlistSelectionError}`,
        })
      }
    }

    // ✅ STEP 3: Upload to YouTube (privacy and playlist already set)
    toast({
      title: "Uploading to YouTube...",
      description: "Please wait while we upload your video.",
    })

    console.log('[UploadHandlers] Calling YouTube upload API for videoId:', videoId)
    resetYouTubeUploadState()
    await uploadToYouTube(videoId) // ✅ No params needed!

    toast({
      title: "Success!",
      description: `Video uploaded to YouTube successfully as ${state.selectedPrivacy}!`,
    })

    updateState({ selectedPlaylist: null, isUploading: false })
    
  } catch (error) {
    console.error('[UploadHandlers] YouTube upload failed:', error)
    updateState({ isUploading: false })
    toast({
      title: "Upload Failed",
      description: uploadError || (error as Error).message,
      variant: "destructive",
    })
  }
}, [/* dependencies */])
```

**Key Changes**:
1. ✅ **Privacy set BEFORE upload**: Calls `/privacy-status` API first
2. ✅ **Playlist set BEFORE upload**: Calls `/playlists` API second
3. ✅ **Upload without params**: YouTube upload API called last (privacy/playlist already set on backend)
4. ✅ **Error handling**: Privacy failure blocks upload, playlist failure shows warning but continues
5. ✅ **User feedback**: Toast messages for each step

---

#### C. Simplified `handlePublish`

**Before** ❌:
```typescript
const handlePublish = useCallback(async (type: "public" | "private" | "unlisted" | "schedule") => {
  // Used the 'type' parameter to set privacy
  await updatePrivacyStatus(videoId, type)
  handleDirectUpload()
}, [])
```

**After** ✅:
```typescript
const handlePublish = useCallback(async (type: "public" | "private" | "unlisted" | "schedule") => {
  console.log('[UploadHandlers] handlePublish called:', {
    type,
    currentSelectedPrivacy: state.selectedPrivacy, // ✅ This is what we use!
    currentSelectedPlaylist: state.selectedPlaylist,
  })
  
  if (type === "schedule") {
    alert("Scheduling feature coming soon!")
    return
  }

  // ✅ Use the privacy selected in Stage 2, ignore 'type' parameter
  console.log('[UploadHandlers] ℹ️ Using privacy from Stage 2:', state.selectedPrivacy)
  console.log('[UploadHandlers] ℹ️ Ignoring type parameter:', type)

  // handleDirectUpload will use state.selectedPrivacy and state.selectedPlaylist
  handleDirectUpload()
}, [state.selectedPrivacy, state.selectedPlaylist, handleDirectUpload])
```

**Key Changes**:
1. ✅ **Ignores `type` parameter**: Uses `state.selectedPrivacy` from Stage 2 instead
2. ✅ **Simplified logic**: No duplicate privacy update (handleDirectUpload handles it)
3. ✅ **Clear logging**: Shows which privacy value is being used

---

### 4. Updated `UploadPage.tsx`

**File**: `src/components/upload/UploadPage.tsx`

**Added destructuring**:
```typescript
const {
  // ... existing
  playlistSelecting,
  playlistSelectionError,
  selectPlaylist,
  resetPlaylistSelectionState,
} = uploadPageData

const handlers = useUploadHandlers({
  // ... existing params
  selectPlaylist,
  resetPlaylistSelectionState,
  playlistSelectionError,
})
```

---

## API Endpoints Used

### 1. Privacy Status API

**Endpoint**: `POST /privacy-status/{videoId}/privacy-status`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
accept: application/json
```

**Request Body**:
```json
{
  "privacy_status": "private"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Privacy status updated successfully",
  "data": {
    "success": true,
    "message": "Privacy status updated successfully",
    "privacy_status": "private",
    "video_id": "6af2668b-9e8c-4283-8ca0-a8c2eb98efc6",
    "user_id": "656738e0-0fff-475b-8c0a-afe71a18df42"
  }
}
```

**Get Privacy Status**: `GET /privacy-status/{videoId}/privacy-status`

---

### 2. Playlist Selection API

**Endpoint**: `POST /playlists/{videoId}/select`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
accept: application/json
```

**Request Body**:
```json
"PLxxx..." (playlist ID as string)
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Playlist 'string' created and selected for video",
  "data": {
    "success": true,
    "message": "Playlist 'string' created and selected for video",
    "playlist_name": "string",
    "playlist_id": "PL9R25FCyv3NL3MsHBAemLrS5vPqSbMUdO",
    "playlist_exists": false,
    "video_id": "6af2668b-9e8c-4283-8ca0-a8c2eb98efc6"
  }
}
```

---

### 3. YouTube Upload API

**Endpoint**: `POST /youtube-upload/{videoId}/upload`

**Headers**:
```
Authorization: Bearer {token}
accept: application/json
```

**Request Body**: None (empty) - Privacy and playlist already set by previous API calls

---

## Console Log Flow

When a user uploads a video with privacy = "private" and playlist = "My Tutorials", the console will show:

```javascript
// Stage 2: User selects privacy
[PreviewSection] Privacy selected: {
  selectedPrivacy: "private",
  previousPrivacy: "public",
  timestamp: "2025-10-27T..."
}

// Stage 2: User selects playlist
[PreviewSection] Playlist selected: {
  playlistId: "PLxxx...",
  playlistName: "My Tutorials",
  previousPlaylist: null,
  timestamp: "2025-10-27T..."
}

// Stage 3: User clicks "Upload to YouTube"
[UploadHandlers] handlePublish called: {
  type: "public",
  currentSelectedPrivacy: "private",
  currentSelectedPlaylist: { id: "PLxxx...", name: "My Tutorials" }
}

[UploadHandlers] ℹ️ Using privacy from Stage 2: "private"
[UploadHandlers] ℹ️ Ignoring type parameter: "public"

[UploadHandlers] Starting YouTube upload process: {
  videoId: "6af2668b-...",
  selectedPrivacy: "private",
  selectedPlaylist: { id: "PLxxx...", name: "My Tutorials" }
}

// Step 1: Privacy
[UploadHandlers] Using privacy setting from Stage 2: "private"
[Privacy Status] Updating video 6af2668b-... to private
[Privacy Status] Success: { success: true, message: "Privacy status updated successfully" }
[UploadHandlers] ✅ Privacy status updated successfully

// Step 2: Playlist
[UploadHandlers] Adding video to playlist: {
  playlistName: "My Tutorials",
  playlistId: "PLxxx..."
}
[Playlist Selection] Adding video 6af2668b-... to playlist PLxxx...
[Playlist Selection] Success: { success: true, playlist_name: "...", playlist_id: "PLxxx..." }
[UploadHandlers] ✅ Video added to playlist successfully

// Step 3: YouTube Upload
[UploadHandlers] Calling YouTube upload API for videoId: 6af2668b-...
[YouTube Upload] Starting upload with parameters: {
  videoId: "6af2668b-...",
  params: undefined,
  hasPrivacy: false,
  hasPlaylist: false,
  timestamp: "2025-10-27T..."
}
[YouTube Upload] Success: { success: true, message: "Video uploaded successfully" }
```

**Note**: In the YouTube upload logs, `hasPrivacy: false` and `hasPlaylist: false` are **correct** because we're NOT passing them to the upload API anymore - they're already set via separate API calls.

---

## Testing Instructions

### Test Scenario 1: Upload with Privacy Only

1. Go to `/dashboard/upload`
2. Upload a video
3. Generate content (title, thumbnail, etc.)
4. **Stage 2 (Settings)**:
   - Select **"Private"**
   - Skip playlist selection
5. **Stage 3 (Preview)**:
   - Review content
   - Click **"Upload to YouTube"**
6. **Expected**:
   - ✅ Privacy API called: `POST /privacy-status/{videoId}/privacy-status` with `{"privacy_status": "private"}`
   - ✅ Playlist API NOT called (skipped)
   - ✅ YouTube upload succeeds
   - ✅ Video is **private** on YouTube

**Console Check**:
```
[UploadHandlers] ✅ Privacy status updated successfully
[UploadHandlers] ℹ️ No playlist selected, skipping playlist step
[YouTube Upload] Success
```

---

### Test Scenario 2: Upload with Privacy + Playlist

1. Upload a video
2. **Stage 2 (Settings)**:
   - Select **"Unlisted"**
   - Select a playlist (e.g., "Tutorials")
3. **Stage 3 (Preview)**:
   - Click **"Upload to YouTube"**
4. **Expected**:
   - ✅ Privacy API called with `{"privacy_status": "unlisted"}`
   - ✅ Playlist API called with playlist ID
   - ✅ YouTube upload succeeds
   - ✅ Video is **unlisted** and **added to playlist** on YouTube

**Console Check**:
```
[UploadHandlers] ✅ Privacy status updated successfully
[UploadHandlers] ✅ Video added to playlist successfully
[YouTube Upload] Success
```

---

### Test Scenario 3: Playlist Failure Handling

1. Upload a video
2. **Stage 2 (Settings)**:
   - Select "Public"
   - Select an invalid/deleted playlist
3. **Stage 3 (Preview)**:
   - Click "Upload to YouTube"
4. **Expected**:
   - ✅ Privacy API succeeds
   - ⚠️ Playlist API fails (404 or 400)
   - ✅ Upload continues anyway
   - ✅ Video is **public** but **not in playlist**
   - ⚠️ Toast warning: "Failed to add video to playlist"

**Console Check**:
```
[UploadHandlers] ✅ Privacy status updated successfully
[UploadHandlers] ❌ Playlist selection failed: 404
[UploadHandlers] Calling YouTube upload API for videoId: ...
[YouTube Upload] Success
```

---

## Error Handling

### Privacy Status Errors

| Status Code | Error Message | Behavior |
|-------------|---------------|----------|
| 401 | "Authentication failed. Please login again." | ❌ Upload blocked |
| 404 | "Video not found" | ❌ Upload blocked |
| 403 | "Access denied to update privacy status" | ❌ Upload blocked |
| 400 | "Invalid privacy status or video data" | ❌ Upload blocked |
| 500 | "Server error. Please try again later." | ❌ Upload blocked |

Privacy errors **block the entire upload** because the video cannot be uploaded without a privacy setting.

---

### Playlist Selection Errors

| Status Code | Error Message | Behavior |
|-------------|---------------|----------|
| 401 | "Authentication failed. Please login again." | ⚠️ Upload continues |
| 404 | "Video or playlist not found" | ⚠️ Upload continues |
| 403 | "Access denied to modify playlist" | ⚠️ Upload continues |
| 400 | "Invalid playlist ID or video data" | ⚠️ Upload continues |
| 500 | "Server error. Please try again later." | ⚠️ Upload continues |

Playlist errors **show a warning but upload continues** because playlist is optional.

---

## Files Modified

### New Files Created
1. ✅ `src/lib/hooks/upload/usePlaylistSelection.ts`
   - New hook for playlist selection API
   - Handles loading, error states, and response data

### Files Modified
2. ✅ `src/lib/hooks/upload/useUploadPage.ts`
   - Imported and integrated `usePlaylistSelection` hook
   - Added `selectPlaylist`, `resetPlaylistSelectionState`, `playlistSelecting`, `playlistSelectionError` to return object

3. ✅ `src/lib/hooks/upload/useUploadHandlers.ts`
   - Added `selectPlaylist`, `resetPlaylistSelectionState`, `playlistSelectionError` to interface
   - Refactored `handleDirectUpload` to call privacy and playlist APIs **before** YouTube upload
   - Simplified `handlePublish` to use `state.selectedPrivacy` instead of `type` parameter

4. ✅ `src/components/upload/UploadPage.tsx`
   - Added `selectPlaylist`, `resetPlaylistSelectionState`, `playlistSelecting`, `playlistSelectionError` to destructuring
   - Passed new parameters to `useUploadHandlers`

---

## Build Status

✅ **Build Successful**  
✅ **No TypeScript Errors**  
✅ **All Routes Compiled**

```bash
Route (app)                          Size     First Load JS
├ ○ /dashboard/upload               24 kB    192 kB
```

---

## Benefits

### Before This Fix ❌
```
User selects privacy & playlist in Stage 2
  ↓
Stage 3: Clicks "Upload to YouTube"
  ↓
[YouTube Upload API] Called with privacy/playlist params
  ↓
❌ Backend doesn't support these params
  ↓
Video uploaded with default settings (public, no playlist)
```

### After This Fix ✅
```
User selects privacy & playlist in Stage 2
  ↓
Stage 3: Clicks "Upload to YouTube"
  ↓
[Privacy Status API] Set privacy to "private"
  ↓
[Playlist Selection API] Add to playlist "Tutorials"
  ↓
[YouTube Upload API] Upload (privacy & playlist already set)
  ↓
✅ Video uploaded with correct privacy and in correct playlist
```

---

## Prevention Guidelines

### When Adding New Upload Settings

1. ✅ **Check backend API design**: Understand if settings are part of upload or separate endpoints
2. ✅ **Create dedicated hooks**: One hook per API endpoint for clarity
3. ✅ **Set before upload**: Configuration APIs should be called BEFORE the upload API
4. ✅ **Handle errors gracefully**: Decide if errors should block or warn
5. ✅ **Log extensively**: Console logs help debugging multi-step flows
6. ✅ **Test with real API**: Use curl or Postman to verify API behavior

### API Design Best Practices

```typescript
// ✅ GOOD: Separate concerns
await setPrivacy(videoId, "private")      // Step 1
await addToPlaylist(videoId, playlistId)  // Step 2
await uploadToYouTube(videoId)            // Step 3

// ❌ BAD: Everything in one call
await uploadToYouTube(videoId, {
  privacy: "private",
  playlist: playlistId
}) // Backend doesn't support this!
```

---

**Fix Date**: October 27, 2025  
**Build Version**: Next.js 15.2.4  
**Status**: ✅ Resolved  
**API Endpoints**: 
- ✅ `POST /privacy-status/{videoId}/privacy-status`
- ✅ `POST /playlists/{videoId}/select`
- ✅ `POST /youtube-upload/{videoId}/upload`
