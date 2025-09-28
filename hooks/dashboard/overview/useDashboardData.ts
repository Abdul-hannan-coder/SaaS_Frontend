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

import { useState, useEffect } from "react";

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: {
    channel_info: {
      title: string;
      description: string;
      subscriber_count: number;
      total_views: number;
      total_videos: number;
      total_likes: number;
      total_comments: number;
      total_duration: number;
      created_at: string;
      thumbnail_url: string;
      country: string;
      custom_url: string;
      keywords: string;
      featured_channels_title: string;
      featured_channels_urls: string[];
    };
    performance_metrics: {
      avg_views_per_video: number;
      avg_likes_per_video: number;
      avg_comments_per_video: number;
      avg_duration_per_video: number;
      overall_engagement_rate: number;
      videos_per_month: number;
      views_per_month: number;
      subscribers_per_month: number;
      days_since_created: number;
      channel_age_months: number;
    };
    recent_performance: {
      recent_videos_count: number;
      recent_views: number;
      recent_likes: number;
      recent_comments: number;
      recent_engagement_rate: number;
      recent_avg_views: number;
    };
    top_performing_content: {
      top_videos_by_views: Array<{
        video_id: string;
        title: string;
        views: number;
        likes: number;
        comments: number;
        published_at: string;
        duration: string;
        engagement_rate: number;
      }>;
      top_videos_by_engagement: Array<{
        video_id: string;
        title: string;
        views: number;
        likes: number;
        comments: number;
        published_at: string;
        duration: string;
        engagement_rate: number;
      }>;
    };
    monthly_analytics: {
      chart_data: Array<{
        month: string;
        videos: number;
        views: number;
        likes: number;
        comments: number;
        duration: number;
        engagement_rate: number;
      }>;
      total_months: number;
      best_month: any;
      worst_month: any;
    };
    content_analysis: {
      top_categories: any[];
      view_distribution: {
        "0-100": number;
        "101-500": number;
        "501-1000": number;
        "1001-5000": number;
        "5000+": number;
      };
      total_categories: number;
      most_used_tag: string | null;
    };
    growth_insights: {
      subscriber_growth_rate: number;
      view_growth_rate: number;
      video_upload_frequency: number;
      engagement_growth: number;
    };
    channel_status: {
      is_active: boolean;
      engagement_level: string;
      growth_stage: string;
      content_quality: string;
      upload_consistency: string;
    };
    summary_stats: {
      total_watch_time_hours: number;
      avg_video_length_minutes: number;
      total_interactions: number;
      interaction_rate: number;
      subscriber_to_view_ratio: number;
    };
    advanced_analytics: {
      duration_distribution: {
        "0-5min": number;
        "5-15min": number;
        "15-30min": number;
        "30-60min": number;
        "60min+": number;
      };
      engagement_distribution: {
        "0-1%": number;
        "1-3%": number;
        "3-5%": number;
        "5-10%": number;
        "10%+": number;
      };
      content_type_breakdown: {
        shorts: number;
        tutorials: number;
        lectures: number;
        other: number;
      };
      retention_analysis: {
        high_retention_videos: number;
        medium_retention_videos: number;
        low_retention_videos: number;
        avg_retention_rate: number;
      };
      growth_trajectory: {
        trending_up: number;
        stable: number;
        trending_down: number;
        new_content: number;
      };
    };
    performance_scoring: {
      top_videos_by_score: Array<{
        video_id: string;
        title: string;
        score: number;
        views: number;
        likes: number;
        comments: number;
        duration_minutes: number;
      }>;
      avg_performance_score: number;
      total_videos_scored: number;
    };
    weekly_analytics: {
      weekly_data: {
        [key: string]: {
          videos: number;
          views: number;
          likes: number;
          comments: number;
          engagement_rate: number;
        };
      };
      weekly_trend: string;
      best_week: [string, any];
      most_engaging_week: [string, any];
    };
    content_insights: {
      most_effective_content_type: string;
      optimal_video_length: string;
      engagement_sweet_spot: string;
      content_recommendations: string[];
    };
    competitive_analysis: {
      channel_health_score: number;
      growth_potential: string;
      audience_loyalty: string;
      content_consistency: string;
    };
  };
}

const useDashboardOverview = () => {
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardOverview = async (refresh: boolean = false) => {
    try {
      console.log("🏠 Starting dashboard overview fetch...", { refresh });
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token')
      console.log("🎫 Token exists:", !!token);

      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("📡 Making API call to dashboard overview endpoint");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/proxy";
      const response = await fetch(`${API_BASE_URL}/dashboard/overview?refresh=${refresh}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("📋 API Response status:", response.status);
      console.log("📊 Response ok:", response.ok);
      console.log("📊 Response:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: DashboardOverviewResponse = await response.json();
      console.log("🎬 Dashboard overview data received:", result);

      if (result.success) {
        setData(result);
        console.log("✅ Dashboard overview data set successfully");
      } else {
        throw new Error(result.message || "Failed to fetch dashboard overview");
      }
    } catch (err) {
      console.error("❌ Dashboard overview fetch error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      console.log("🏁 Dashboard overview fetch completed");
    }
  };

  useEffect(() => {
    fetchDashboardOverview(false); // Initial load with refresh=false
  }, []);

  return {
    data: data?.data || null,
    overviewData: data?.data || null,
    isLoading,
    error,
    refetch: () => fetchDashboardOverview(true) // Refresh with refresh=true
  };
};

export default useDashboardOverview;