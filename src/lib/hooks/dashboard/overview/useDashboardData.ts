
"use client";

import { useEffect, useReducer } from "react";
import { overviewReducer, initialOverviewState } from './Reducers/overviewReducer'
import type { DashboardOverviewResponse } from '@/types/dashboard/overview'

// Types moved to overviewTypes.ts

const useDashboardOverview = () => {
  const [state, dispatch] = useReducer(overviewReducer, initialOverviewState)

  const fetchDashboardOverview = async (refresh: boolean = false) => {
    try {
      dispatch({ type: 'FETCH_START' })

      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error("No authentication token found");
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.postsiva.com";
      const response = await fetch(`${API_BASE_URL}/dashboard-overview/?refresh=${refresh}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: DashboardOverviewResponse = await response.json();
      if (result.success) {
        dispatch({ type: 'FETCH_SUCCESS', payload: result })
      } else {
        throw new Error(result.message || "Failed to fetch dashboard overview");
      }
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err instanceof Error ? err.message : "An error occurred" })
    }
  };

  useEffect(() => {
    fetchDashboardOverview(false);
  }, []);

  return {
    data: state.data?.data || null,
    overviewData: state.data?.data || null,
    isLoading: state.isLoading,
    error: state.error,
    refetch: () => fetchDashboardOverview(true)
  };
};

export default useDashboardOverview;
