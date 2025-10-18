"use client";
import { useEffect, useReducer } from "react";
import { API_BASE_URL } from '@/lib/config/appConfig'
import { 
  initialPlaylistAnalyticsState,
  playlistAnalyticsReducer,
  PlaylistDetailsResponse 
} from './Reducers/playlistAnalyticsReducer'

const usePlaylistAnalytics = (playlistId: string) => {
  const [state, dispatch] = useReducer(playlistAnalyticsReducer, initialPlaylistAnalyticsState)

  const fetchPlaylistData = async (refresh: boolean = false) => {
    dispatch({ type: 'INIT' })
    try {
      const token = localStorage.getItem('auth_token') 

      const response = await fetch(
        `${API_BASE_URL}/playlists/${playlistId}?refresh=${refresh}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comprehensive playlist data");
      }

      const data: PlaylistDetailsResponse = await response.json();
      dispatch({ type: 'SUCCESS', payload: data })
    } catch (err: any) {
      dispatch({ type: 'ERROR', payload: err.message })
    } finally {
      // reducer manages loading state
    }
  };

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistData(false); // Initial load with refresh=false
    }
  }, [playlistId]);

  return { 
    playlistData: state.playlistData, 
    isLoading: state.isLoading, 
    error: state.error,
    refetch: () => fetchPlaylistData(true) // Refresh with refresh=true
  };
};

export default usePlaylistAnalytics;
