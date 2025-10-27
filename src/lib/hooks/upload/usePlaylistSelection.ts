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

  /**
   * Select a playlist for a video
   * @param videoId - The video UUID
   * @param playlistId - The YouTube playlist ID (e.g., "PLxxx...")
   */
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
        playlistId, // Send playlist ID as string in body (as per your curl example)
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
        } else {
          errorMessage = `Request failed: ${error.response?.status} ${error.response?.statusText}`
        }
      } else if (error.message) {
        errorMessage = error.message
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
