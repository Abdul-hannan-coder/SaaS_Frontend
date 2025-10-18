import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/config/appConfig'
import { mapAxiosError } from '@/lib/utils/errorUtils'
import useAuth from '../auth/useAuth'

export interface Playlist {
  id: string
  name: string
}

interface PlaylistsResponse {
  data: Playlist[]
}

interface PlaylistsState {
  playlists: Playlist[]
  isLoading: boolean
  error: string | null
}

export default function usePlaylists() {
  const { getAuthHeaders } = useAuth()
  const [state, setState] = useState<PlaylistsState>({
    playlists: [],
    isLoading: false,
    error: null,
  })

  const fetchPlaylists = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const headers = getAuthHeaders()
      if (!headers.Authorization) {
        throw new Error('Authentication required')
      }

      console.log('[Playlists] Fetching user playlists...')
      
      const response = await axios.get(
        `${API_BASE_URL}/playlists/channel-playlists`,
        { headers }
      )

      const responseData: PlaylistsResponse = response.data
      console.log('[Playlists] Success:', responseData)

      setState(prev => ({
        ...prev,
        playlists: responseData.data || [],
        isLoading: false,
      }))

      return responseData.data
    } catch (error: any) {
      console.error('[Playlists] Error:', error)
      const errorMessage = mapAxiosError(error, 'Failed to fetch playlists')

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }))

      throw new Error(errorMessage)
    }
  }, [getAuthHeaders])

  const resetState = useCallback(() => {
    setState({
      playlists: [],
      isLoading: false,
      error: null,
    })
  }, [])

  // Auto-fetch playlists on mount
  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  return {
    ...state,
    fetchPlaylists,
    resetState,
  }
}
