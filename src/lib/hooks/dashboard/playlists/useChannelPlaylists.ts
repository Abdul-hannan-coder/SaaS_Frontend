"use client"

import { useEffect, useReducer } from "react"
import { API_BASE_URL } from '@/lib/config/appConfig'
import {
  channelPlaylistsReducer,
  initialChannelPlaylistsState,
} from './Reducers/channelPlaylistsReducer'

export interface ChannelPlaylist {
  id: string
  name: string
}

interface PlaylistsApiResponse {
  success: boolean
  message: string
  data?: {
    playlists?: Array<{
      playlist_id: string
      playlist_name: string
    }>
  }
  refreshed?: boolean
}

export function useChannelPlaylists() {
  const [state, dispatch] = useReducer(channelPlaylistsReducer, initialChannelPlaylistsState)

  const fetchChannelPlaylists = async () => {
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
    } finally {
      // handled by reducer
    }
  }

  useEffect(() => {
    fetchChannelPlaylists()
  }, [])

  return {
    playlists: state.playlists,
    isLoading: state.isLoading,
    error: state.error,
    fetchChannelPlaylists
  }
}
