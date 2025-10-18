// import { useState, useEffect } from "react"
// import { 
//   MonthlyAnalyticsData, 
//   TopVideoData, 
//   ContentCategoryData, 
//   GrowthTrendData, 
//   WeeklyChartData, 
//   PerformanceData,
//   DashboardStats,
//   ChannelInsights,
//   ContentBreakdown,
//   GrowthMetrics
// } from "@/types/dashboard/overview"

// const monthlyAnalyticsData: MonthlyAnalyticsData[] = [
//   { month: "Jan", views: 12000, subscribers: 18 },
//   { month: "Feb", views: 18500, subscribers: 19 },
//   { month: "Mar", views: 15200, subscribers: 19 },
//   { month: "Apr", views: 24800, subscribers: 20 },
//   { month: "May", views: 22100, subscribers: 21 },
//   { month: "Jun", views: 29500, subscribers: 22 },
//   { month: "Jul", views: 34200, subscribers: 22 },
//   { month: "Aug", views: 32800, subscribers: 23 },
//   { month: "Sep", views: 39100, subscribers: 23 },
//   { month: "Oct", views: 37600, subscribers: 24 },
//   { month: "Nov", views: 42300, subscribers: 24 },
//   { month: "Dec", views: 44100, subscribers: 24 },
// ]

// const topVideosData: TopVideoData[] = [
//   { title: "Python Tutorial #8", views: 525, engagement: 0.95 },
//   { title: "JavaScript Basics", views: 312, engagement: 1.64 },
//   { title: "React Hooks Guide", views: 287, engagement: 2.1 },
//   { title: "CSS Grid Layout", views: 198, engagement: 1.2 },
//   { title: "Node.js Setup", views: 156, engagement: 0.8 },
// ]

// const contentCategoriesData: ContentCategoryData[] = [
//   { name: "Python Tutorials", value: 21, color: "#FD1D1D" },
//   { name: "JavaScript", value: 25, color: "#FF6B35" },
//   { name: "Web Development", value: 18, color: "#F7931E" },
//   { name: "Programming Shorts", value: 15, color: "#FFA500" },
//   { name: "OOP Concepts", value: 8, color: "#004519" },
// ]

// const growthTrendsData: GrowthTrendData[] = [
//   { month: "Jan", totalViews: 12000, subscribers: 18, engagement: 1.2 },
//   { month: "Feb", totalViews: 30500, subscribers: 19, engagement: 1.4 },
//   { month: "Mar", totalViews: 45700, subscribers: 19, engagement: 1.1 },
//   { month: "Apr", totalViews: 70500, subscribers: 20, engagement: 1.8 },
//   { month: "May", totalViews: 92600, subscribers: 21, engagement: 1.6 },
//   { month: "Jun", totalViews: 122100, subscribers: 22, engagement: 2.1 },
//   { month: "Jul", totalViews: 156300, subscribers: 22, engagement: 1.9 },
//   { month: "Aug", totalViews: 189100, subscribers: 23, engagement: 2.3 },
//   { month: "Sep", totalViews: 228200, subscribers: 23, engagement: 2.0 },
//   { month: "Oct", totalViews: 265800, subscribers: 24, engagement: 1.7 },
//   { month: "Nov", totalViews: 308100, subscribers: 24, engagement: 2.2 },
//   { month: "Dec", totalViews: 352200, subscribers: 24, engagement: 2.4 },
// ]

// const chartData: WeeklyChartData[] = [
//   { week: "Week 1", views: 1000, engagement: 1.5 },
//   { week: "Week 2", views: 1500, engagement: 1.7 },
//   { week: "Week 3", views: 2000, engagement: 1.9 },
//   { week: "Week 4", views: 2500, engagement: 2.1 },
// ]

// const performanceData: PerformanceData[] = [
//   { category: "Shorts", count: 18 },
//   { category: "Tutorials", count: 8 },
//   { category: "Lectures", count: 15 },
//   { category: "Other", count: 2 },
// ]

// const dashboardStats: DashboardStats = {
//   totalVideos: 43,
//   totalComments: 19,
//   totalSubscribers: 24,
//   totalViews: 2120,
//   videosChange: "+10 from last week",
//   commentsChange: "+8 this week",
//   subscribersChange: "+2 this month",
//   viewsChange: "+304 from last week"
// }

// const channelInsights: ChannelInsights = {
//   avgViewsPerVideo: 49.3,
//   engagementRate: 2.08,
//   uploadFrequency: 3.4,
//   totalWatchTime: 9.01
// }

// const contentBreakdown: ContentBreakdown = {
//   shorts: 18,
//   tutorials: 8,
//   lectures: 15,
//   other: 2
// }

// const growthMetrics: GrowthMetrics = {
//   subscriberGrowth: 1.89,
//   viewGrowth: 167.37,
//   channelAge: 12.7,
//   healthScore: 11.16
// }

// export const useDashboardData = () => {
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     // Simulate data loading
//     const timer = setTimeout(() => {
//       setIsLoading(false)
//     }, 100)

//     return () => clearTimeout(timer)
//   }, [])

//   return {
//     isLoading,
//     monthlyAnalyticsData,
//     topVideosData,
//     contentCategoriesData,
//     growthTrendsData,
//     chartData,
//     performanceData,
//     dashboardStats,
//     channelInsights,
//     contentBreakdown,
//     growthMetrics
//   }
// }



// hooks/dashboard/overview/useDashboardOverview.ts
// filepath: /hooks/dashboard/overview/useDashboardOverview.ts
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
