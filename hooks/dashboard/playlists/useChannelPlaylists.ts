"use client"

import { useState, useEffect } from "react"

export interface ChannelPlaylist {
  id: string
  name: string
}

export function useChannelPlaylists() {
  const [playlists, setPlaylists] = useState<ChannelPlaylist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchChannelPlaylists = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Get token from localStorage (you might want to adjust this based on your auth implementation)
      const token = localStorage.getItem('auth_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1emFpciIsImV4cCI6MTc1Njk1Mjg0M30.Ihzz_NStHsvcxRQHL7DniM5ZhvBT4oUjGlUTDYeGpww'
      
      const response = await fetch('https://saas-backend.duckdns.org/playlists/channel-playlists', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ChannelPlaylist[] = await response.json()
      setPlaylists(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching channel playlists:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchChannelPlaylists()
  }, [])

  return {
    playlists,
    isLoading,
    error,
    fetchChannelPlaylists
  }
}
