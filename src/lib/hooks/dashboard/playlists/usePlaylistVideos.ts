"use client";
import { useEffect, useReducer } from "react";
import { API_BASE_URL } from '@/lib/config/appConfig'
import { mapAxiosError } from '@/lib/utils/errorUtils'
import { initialPlaylistVideosState, playlistVideosReducer } from './Reducers/playlistVideosReducer'

export interface PlaylistVideoDetails {
  video_id: string;
  title: string;
  description: string;
  published_at: string;
  thumbnail_url: string;
  position: number;
  duration: string;
  duration_seconds: number;
  duration_minutes: number;
  privacy_status: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  engagement_rate: number;
  performance_score: number;
  days_since_published: number;
  tags: string[];
  category_id: string;
  // Backend returns `url`; some other endpoints use `youtube_url`.
  url?: string;
  youtube_url?: string;
  performance_level?: string;
  engagement_level?: string;
  content_category?: string;
  content_type?: string;
  growth_potential?: string;
}

// Matches GET /playlists/{playlistId}/videos response (maps to flattened array)
export interface PlaylistVideosResponse {
  success: boolean;
  message: string;
  data: PlaylistVideoDetails[];
  count: number;
}

const usePlaylistVideos = (playlistId: string) => {
  const [state, dispatch] = useReducer(playlistVideosReducer, initialPlaylistVideosState)

  const fetchPlaylistVideos = async (refresh: boolean = false) => {
    dispatch({ type: 'INIT' })
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${API_BASE_URL}/playlists/${playlistId}/videos?refresh=${refresh}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch playlist videos");
      }

      const raw = await response.json();
      const mapped: PlaylistVideosResponse = {
        success: !!raw?.success,
        message: raw?.message || '',
        data: Array.isArray(raw?.data?.videos) ? raw.data.videos : [],
        count: typeof raw?.data?.total_videos === 'number' ? raw.data.total_videos : (Array.isArray(raw?.data?.videos) ? raw.data.videos.length : 0),
      };
      dispatch({ type: 'SUCCESS', payload: mapped })
    } catch (err: any) {
      const errorMessage = mapAxiosError(err, 'Failed to fetch playlist videos')
      dispatch({ type: 'ERROR', payload: errorMessage })
    } finally {
      // reducer sets loading state
    }
  };

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistVideos(false); // Initial load with refresh=false
    }
  }, [playlistId]);

  return { 
    playlistData: state.playlistData, 
    isLoading: state.isLoading, 
    error: state.error,
    refetch: () => fetchPlaylistVideos(true) // Refresh with refresh=true
  };
};

export default usePlaylistVideos;
