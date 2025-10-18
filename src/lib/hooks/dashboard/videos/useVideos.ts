"use client";

import { useEffect, useMemo, useCallback, useReducer } from 'react';
import { DashboardVideosResponse, VideoStats } from '@/types/dashboard/videos';
import { VIDEOS_PER_PAGE } from '@/types/dashboard/videos';
import { initialVideosState, videosReducer } from './Reducers/videosReducer';

const useVideos = () => {
  const [state, dispatch] = useReducer(videosReducer, initialVideosState);

  const mapVideoData = useCallback((v: any) => {
    const publishedAt = v.published_at || v.created_at || new Date().toISOString();
    const youtubeId = v.youtube_video_id || v.video_id || null;
    const daysSince = (() => {
      const then = new Date(publishedAt).getTime();
      const now = Date.now();
      const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
      return Number.isFinite(diffDays) ? diffDays : 0;
    })();

    return {
      video_id: youtubeId || v.id || String(Math.random()),
      title: v.title || "Untitled",
      description: v.description || "",
      published_at: publishedAt,
      thumbnail_url: v.thumbnail_url || "",
      channel_title: "",
      tags: [],
      view_count: v.view_count ?? 0,
      like_count: v.like_count ?? 0,
      comment_count: v.comment_count ?? 0,
      duration: v.duration || "PT0S",
      duration_seconds: v.duration_seconds ?? 0,
      privacy_status: v.privacy_status || v.video_status || "private",
      analytics: {
        view_count: v.view_count ?? 0,
        like_count: v.like_count ?? 0,
        comment_count: v.comment_count ?? 0,
        duration: v.duration || "PT0S",
        duration_seconds: v.duration_seconds ?? 0,
        privacy_status: v.privacy_status || v.video_status || "private",
        published_at: publishedAt,
        title: v.title || "Untitled",
        description: v.description || "",
        tags: [],
        category_id: "",
        default_language: null as any,
        default_audio_language: null as any,
      },
      engagement_rate: v.engagement_rate ?? 0,
      performance_score: v.performance_score ?? 0,
      days_since_published: daysSince,
    };
  }, []);

  const fetchData = async (refresh: boolean = false) => {
  dispatch({ type: 'FETCH_START' });
  dispatch({ type: 'REFRESH_START' });

    try {
  const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        refresh: refresh.toString(),
        limit: '50', // Request more videos to work with
        offset: '0',
      });

      const response = await fetch(`https://backend.postsiva.com/dashboard-overview/videos?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard videos');
      }

      const raw = await response.json();
      const videos = Array.isArray(raw?.data?.videos) ? raw.data.videos : [];

      // Map backend videos to dashboard video shape with safe defaults
  const mappedVideos = videos.map(mapVideoData);

      const result: DashboardVideosResponse = {
        success: !!raw?.success,
        message: raw?.message || "",
        data: mappedVideos,
        count: mappedVideos.length,
      };

      dispatch({ type: 'FETCH_SUCCESS', payload: { mappedVideos, response: result } });
    } catch (err: any) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
    } finally {
      // End loading handled in reducer on success/error
    }
  };

  const loadMoreVideos = useCallback(async () => {
  if (state.isLoadingMore || !state.hasMore) return;

  dispatch({ type: 'LOAD_MORE_START' });
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const nextPage = state.currentPage + 1;
      const startIndex = nextPage * VIDEOS_PER_PAGE - VIDEOS_PER_PAGE;
      const endIndex = startIndex + VIDEOS_PER_PAGE - 1;
      
      const moreVideos = state.allVideos.slice(startIndex, endIndex + 1);
      
      if (moreVideos.length > 0) {
        dispatch({ type: 'LOAD_MORE_SUCCESS', payload: { moreVideos } });
      } else {
        dispatch({ type: 'SET_HAS_MORE', payload: false });
      }
    } catch (err: any) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'LOAD_MORE_END' });
    }
  }, [state.isLoadingMore, state.hasMore, state.currentPage, state.allVideos]);

  useEffect(() => {
    fetchData(false); // Initial load with refresh=false
  }, []);

  // Calculate video stats
  const videoStats: VideoStats = useMemo(() => {
    if (!state.allVideos.length) {
      return {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        avgEngagement: 0,
        avgPerformanceScore: 0,
      };
    }

    const videos = state.allVideos;
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum: number, video: any) => sum + video.view_count, 0);
    const totalLikes = videos.reduce((sum: number, video: any) => sum + video.like_count, 0);
    const totalComments = videos.reduce((sum: number, video: any) => sum + video.comment_count, 0);
    
    const avgEngagement = totalVideos > 0 
      ? videos.reduce((sum: number, video: any) => sum + video.engagement_rate, 0) / totalVideos 
      : 0;
    
    const avgPerformanceScore = totalVideos > 0 
      ? videos.reduce((sum: number, video: any) => sum + video.performance_score, 0) / totalVideos 
      : 0;

    return {
      totalVideos,
      totalViews,
      totalLikes,
      totalComments,
      avgEngagement: parseFloat(avgEngagement.toFixed(2)),
      avgPerformanceScore: parseFloat(avgPerformanceScore.toFixed(2)),
    };
  }, [state.allVideos]);

  return { 
    data: state.data, 
    videos: state.displayedVideos, // Return only displayed videos for pagination
    allVideos: state.allVideos, // Return all videos for stats calculation
    videoStats, 
    isLoading: state.isLoading, 
    isLoadingMore: state.isLoadingMore,
    error: state.error,
    hasMore: state.hasMore,
    loadMoreVideos,
    refetch: () => {
      dispatch({ type: 'REFRESH_START' });
      fetchData(true); // Refresh with refresh=true
    }
  };
};

export default useVideos;
