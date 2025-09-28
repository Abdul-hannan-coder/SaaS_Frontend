"use client";
import { useState, useEffect } from "react";
import { ComprehensivePlaylistResponse } from "@/types/dashboard/playlists";

const usePlaylistAnalytics = (playlistId: string) => {
  const [playlistData, setPlaylistData] =
    useState<ComprehensivePlaylistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylistData = async (refresh: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token') 

      const response = await fetch(
        `https://saas-backend.duckdns.org/dashboard/playlists/${playlistId}/comprehensive?refresh=${refresh}`,
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

      const data: ComprehensivePlaylistResponse = await response.json();
      setPlaylistData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistData(false); // Initial load with refresh=false
    }
  }, [playlistId]);

  return { 
    playlistData, 
    isLoading, 
    error,
    refetch: () => fetchPlaylistData(true) // Refresh with refresh=true
  };
};

export default usePlaylistAnalytics;
