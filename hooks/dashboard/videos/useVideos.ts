"use client";

import { useState, useEffect, useMemo } from 'react';
import { DashboardVideosResponse, VideoStats } from '@/types/dashboard/videos';

const useVideos = () => {
  const [data, setData] = useState<DashboardVideosResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (refresh: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://saas-backend.duckdns.org/dashboard/videos?refresh=${refresh}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard videos');
      }

      const result: DashboardVideosResponse = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false); // Initial load with refresh=false
  }, []);

  // Calculate video stats
  const videoStats: VideoStats = useMemo(() => {
    if (!data?.data) {
      return {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        avgEngagement: 0,
        avgPerformanceScore: 0,
      };
    }

    const videos = data.data;
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum, video) => sum + video.view_count, 0);
    const totalLikes = videos.reduce((sum, video) => sum + video.like_count, 0);
    const totalComments = videos.reduce((sum, video) => sum + video.comment_count, 0);
    
    const avgEngagement = totalVideos > 0 
      ? videos.reduce((sum, video) => sum + video.engagement_rate, 0) / totalVideos 
      : 0;
    
    const avgPerformanceScore = totalVideos > 0 
      ? videos.reduce((sum, video) => sum + video.performance_score, 0) / totalVideos 
      : 0;

    return {
      totalVideos,
      totalViews,
      totalLikes,
      totalComments,
      avgEngagement: parseFloat(avgEngagement.toFixed(2)),
      avgPerformanceScore: parseFloat(avgPerformanceScore.toFixed(2)),
    };
  }, [data]);

  return { 
    data, 
    videos: data?.data || [], 
    videoStats, 
    isLoading, 
    error,
    refetch: () => fetchData(true) // Refresh with refresh=true
  };
};

export default useVideos;
