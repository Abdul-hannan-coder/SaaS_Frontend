"use client";

import { useState, useEffect } from 'react';
import { SingleVideoResponse } from '@/types/dashboard/videos';

const useVideo = (videoId: string) => {
  const [data, setData] = useState<SingleVideoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (refresh: boolean = false) => {
    console.log('🚀 Starting fetchData function', { refresh });
    
    if (!videoId) {
      console.log('❌ No videoId provided');
      setIsLoading(false);
      return;
    }

    console.log('📡 Setting loading to true and starting fetch');
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      console.log('🎫 Token retrieved:', token ? 'exists' : 'missing');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📞 Making API call to:', `https://saas-backend.duckdns.org/dashboard/videos/${videoId}?refresh=${refresh}`);
      const response = await fetch(`https://saas-backend.duckdns.org/dashboard/videos/${videoId}?refresh=${refresh}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
      });
      
      console.log('📋 API Response:', response);
      console.log('✅ Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch video details');
      }

      const result: SingleVideoResponse = await response.json();
      console.log('🎬 API Result:', result);
      console.log('📦 Video data:', result.data);
      setData(result);
    } catch (err: any) {
      console.log('💥 Error caught:', err);
      setError(err.message);
    } finally {
      console.log('🏁 Setting loading to false');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🎯 useVideo useEffect triggered with videoId:', videoId);
    console.log('🔄 Calling fetchData function');
    fetchData(false); // Initial load with refresh=false
  }, [videoId]);

  return { 
    data, 
    video: data?.data || null, 
    isLoading, 
    error,
    refetch: () => fetchData(true) // Refresh with refresh=true
  };
};

export default useVideo;
