# Testing Guide: All-In-One Save with Privacy & Playlist

## How to Verify the Payload is Being Sent

### Step 1: Open Browser Developer Tools
1. Press `F12` or right-click → "Inspect"
2. Go to the **Network** tab
3. Filter by `Fetch/XHR`

### Step 2: Test the Flow
1. Navigate to `/dashboard/all-in-one`
2. Upload a video
3. Wait for AI processing to complete
4. In the review step:
   - Select a title
   - Select a thumbnail
   - Verify description is filled
   - Verify timestamps are present
   - **Select a privacy status** (default: "public")
   - **Select a playlist** (optional)
5. Click "Save & Upload to YouTube"

### Step 3: Check Network Request
1. In the Network tab, find the request:
   - Name: `save-content`
   - Method: `POST`
   - URL: `https://backend.postsiva.com/all-in-one/{video_id}/save-content`

2. Click on the request and go to the **Payload** tab

3. You should see:
```json
{
  "selected_title": "Your selected title",
  "selected_thumbnail_url": "https://...",
  "description": "Your description...",
  "timestamps": [
    {
      "time": "00:00",
      "title": "Introduction"
    },
    // ... more timestamps
  ],
  "privacy_status": "public",      // ✅ Should be present
  "playlist_name": "Your Playlist" // ✅ Should be present if selected
}
```

### Step 4: Check Console Logs
Open the **Console** tab and look for:

```
[AllInOne] Saving content with payload: {
  videoId: "...",
  payload: { ... },
  hasPrivacyStatus: true,
  hasPlaylistName: true,
  timestamp: "..."
}

[AllInOne][Save] Request {
  url: "...",
  fullPayload: { ... },
  privacy_status: "public",
  playlist_name: "Your Playlist",
  hasPrivacy: true,
  hasPlaylist: true,
  timestampsCount: 5
}
```

---

## Test Cases

### Test Case 1: With Privacy & Playlist
**Input:**
- Privacy: "public"
- Playlist: "Tech Tutorials"

**Expected Payload:**
```json
{
  "privacy_status": "public",
  "playlist_name": "Tech Tutorials"
}
```

### Test Case 2: With Privacy, No Playlist
**Input:**
- Privacy: "private"
- Playlist: (none selected)

**Expected Payload:**
```json
{
  "privacy_status": "private",
  "playlist_name": undefined
}
```
*Note: `undefined` values are typically not sent in JSON*

### Test Case 3: Different Privacy Options
**Input:**
- Privacy: "unlisted"
- Playlist: "Gaming Videos"

**Expected Payload:**
```json
{
  "privacy_status": "unlisted",
  "playlist_name": "Gaming Videos"
}
```

---

## Common Issues & Solutions

### Issue 1: `privacy_status` is missing in payload
**Possible Causes:**
- Privacy selector not updating state
- State variable name mismatch

**Solution:**
- Check console logs for `hasPrivacyStatus: false`
- Verify `setPrivacyStatus` is called on selection change

### Issue 2: `playlist_name` is missing when a playlist is selected
**Possible Causes:**
- Playlist selector not updating state
- Empty string being sent as playlist name

**Solution:**
- Check console logs for `hasPlaylistName: false`
- Verify `setPlaylistName` is called with correct value
- Check if playlists are loaded correctly

### Issue 3: Backend returns error about missing fields
**Possible Causes:**
- Backend expects required fields that are optional in frontend
- Backend validation rules differ from frontend

**Solution:**
- Check backend error message
- Verify API specification matches implementation
- Ensure default values are acceptable

---

## Backend API Expectations

According to the API specification:

**Required Fields:**
- `selected_title` ✅
- `selected_thumbnail_url` ✅
- `description` ✅
- `timestamps` ✅

**Optional Fields:**
- `privacy_status` ✅ (defaults to "public" in frontend)
- `playlist_name` ✅ (defaults to empty string in frontend)

---

## Debugging Commands

### Check Current State in Browser Console
```javascript
// Paste this in the console while on the all-in-one page
console.log({
  privacyStatus: window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
  // Use React DevTools to inspect component state
})
```

### Monitor Network Requests
```javascript
// Add this to watch all POST requests
const originalFetch = window.fetch
window.fetch = function(...args) {
  console.log('Fetch called with:', args)
  return originalFetch.apply(this, args)
}
```

---

## Success Indicators

✅ **Payload is correct if:**
1. Console shows: `hasPrivacyStatus: true`
2. Console shows: `privacy_status: "public"` (or selected value)
3. Network tab shows privacy_status in payload
4. Console shows: `hasPlaylistName: true` (when playlist selected)
5. Network tab shows playlist_name in payload (when selected)
6. Backend responds with success
7. YouTube upload proceeds after save

❌ **Payload is incorrect if:**
1. Console shows: `hasPrivacyStatus: false`
2. Network tab missing privacy_status field
3. Backend returns validation error
4. Console shows errors about missing fields
