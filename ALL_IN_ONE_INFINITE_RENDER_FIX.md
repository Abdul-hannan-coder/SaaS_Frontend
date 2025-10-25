# All-in-One Upload Infinite Render Fix

## Problem Analysis

**Symptom**: When uploading a video in the all-in-one route (`/dashboard/all-in-one`), the page would start the upload but get stuck in what felt like an infinite render loop, causing the entire application to freeze or become unresponsive.

## Root Cause

The infinite render was caused by **useEffect dependency issues** that created a render loop:

### Issue 1: Unstable `fetchChannelPlaylists` function
```tsx
// ❌ BEFORE: Function recreated on every render
const fetchChannelPlaylists = async () => { ... }

useEffect(() => {
  fetchChannelPlaylists()
}, [fetchChannelPlaylists])  // This dependency changes every render!
```

**Why this causes infinite renders:**
1. `fetchChannelPlaylists` was defined as a regular function (not memoized with `useCallback`)
2. Every time the component re-rendered, a NEW function instance was created
3. The `useEffect` saw the dependency changed and ran again
4. Running the effect dispatched a state update (via the reducer)
5. State update triggered a re-render
6. Re-render created a NEW `fetchChannelPlaylists` function
7. Repeat steps 3-6 infinitely 🔄

### Issue 2: Missing early return in processedData effect
```tsx
// ❌ BEFORE: Could run logic even when data doesn't exist
useEffect(() => {
  if (processedData?.results) {
    // ... extract and set data
  }
}, [processedData])
```

While this had a guard, it would still run the effect function body on every render, even when just checking the condition.

## Solution

### Fix 1: Memoize `fetchChannelPlaylists` with `useCallback`

**File**: `src/lib/hooks/dashboard/playlists/useChannelPlaylists.ts`

```tsx
// ✅ AFTER: Function memoized with empty dependencies
const fetchChannelPlaylists = useCallback(async () => {
  try {
    dispatch({ type: 'INIT' })
    
    // Get token from localStorage
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE_URL}/playlists/?refresh=false`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: PlaylistsApiResponse = await response.json()
    const items: ChannelPlaylist[] = data?.data?.playlists?.map(p => ({
      id: p.playlist_id,
      name: p.playlist_name,
    })) || []

    dispatch({ type: 'SUCCESS', payload: items })
  } catch (err) {
    dispatch({ type: 'ERROR', payload: err instanceof Error ? err.message : 'An error occurred' })
    console.error('Error fetching channel playlists:', err)
  }
}, []) // ✅ Empty deps - function stable across renders, token read fresh each call
```

**Why this works:**
- `useCallback` with empty dependencies creates a stable function reference
- The function is created once and reused on every render
- `useEffect` dependency doesn't change anymore, breaking the loop

### Fix 2: Remove dependency from all-in-one page

**File**: `src/app/dashboard/all-in-one/page.tsx`

```tsx
// ✅ AFTER: Run only once on mount
useEffect(() => {
  fetchChannelPlaylists()
}, []) // eslint-disable-line react-hooks/exhaustive-deps
```

**Why this works:**
- Empty dependency array means the effect runs exactly once when the component mounts
- Even if `fetchChannelPlaylists` reference changes (which it won't anymore), we don't care
- We explicitly document that we want to run it once with the eslint-disable comment

### Fix 3: Add early return guard in processedData effect

```tsx
// ✅ AFTER: Early return prevents unnecessary logic execution
useEffect(() => {
  if (!processedData?.results) return // Guard against running on every render
  
  const { titles, description: desc, timestamps: ts, thumbnails } = processedData.results
  
  if (titles.success && titles.generated_titles.length > 0) {
    setSelectedTitle(titles.generated_titles[0])
  }
  
  if (desc.success && desc.generated_description) {
    setDescription(desc.generated_description)
  }
  
  if (ts.success && ts.generated_timestamps) {
    setTimestamps(ts.generated_timestamps)
  }
  
  if (thumbnails.success && thumbnails.generated_thumbnails.length > 0) {
    setSelectedThumbnail(thumbnails.generated_thumbnails[0].image_url)
  }
}, [processedData]) // This is safe because processedData is from reducer state
```

## Files Changed

1. **src/lib/hooks/dashboard/playlists/useChannelPlaylists.ts**
   - Wrapped `fetchChannelPlaylists` with `useCallback`
   - Added empty dependency array to make function stable

2. **src/app/dashboard/all-in-one/page.tsx**
   - Changed `useEffect` for playlist fetching to use empty dependency array
   - Added early return guard in processedData effect
   - Added explanatory comments

## Prevention Guidelines

### ✅ DO:
1. **Always memoize functions** that are used as dependencies in `useEffect`:
   ```tsx
   const myFunction = useCallback(() => { ... }, [deps])
   ```

2. **Use empty dependency arrays** when you want something to run only once:
   ```tsx
   useEffect(() => {
     doSomethingOnce()
   }, [])
   ```

3. **Add early returns** in effects to avoid unnecessary processing:
   ```tsx
   useEffect(() => {
     if (!data) return
     // process data
   }, [data])
   ```

4. **Be explicit about intentions** with ESLint disable comments:
   ```tsx
   useEffect(() => {
     // We only want this to run once on mount
     fetchData()
   }, []) // eslint-disable-line react-hooks/exhaustive-deps
   ```

### ❌ DON'T:
1. **Don't define functions inside components** if they'll be used in `useEffect` dependencies:
   ```tsx
   // ❌ BAD: New function every render
   const fetchData = async () => { ... }
   useEffect(() => { fetchData() }, [fetchData])
   ```

2. **Don't ignore ESLint warnings** without understanding them:
   ```tsx
   // ❌ BAD: Blindly ignoring without fixing root cause
   useEffect(() => { ... }, []) // eslint-disable-line (why?)
   ```

3. **Don't rely on useEffect for data that could be computed**:
   ```tsx
   // ❌ BAD: Effect for derived state
   useEffect(() => {
     setComputed(data.map(x => x * 2))
   }, [data])
   
   // ✅ GOOD: Compute directly
   const computed = data.map(x => x * 2)
   ```

## Testing

After applying these fixes:

1. ✅ **Build succeeds** - TypeScript compilation passes
2. ✅ **No infinite renders** - Page remains responsive during upload
3. ✅ **Upload completes** - Video uploads and processes successfully
4. ✅ **Playlists load** - Channel playlists fetch exactly once
5. ✅ **Form hydrates** - Generated content populates correctly

## Related Issues

This same pattern can cause issues in:
- Any component with `useEffect` depending on non-memoized functions
- Custom hooks that return functions without `useCallback`
- Components that fetch data on every render

Always check for:
- Functions created in component body used in `useEffect` deps
- Missing `useCallback` on functions returned from custom hooks
- State updates triggering effects that trigger more state updates

## Build Output

```
Route (app)                              Size     First Load JS
├ ○ /dashboard/all-in-one               6.61 kB        171 kB
```

The route now builds successfully without any infinite loop warnings.
