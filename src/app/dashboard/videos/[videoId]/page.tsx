"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import useVideo from '@/lib/hooks/dashboard/videos/useVideo';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { asNumber } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Eye, MessageCircle, ThumbsUp, Calendar, Clock, Tag, ExternalLink, TrendingUp, TrendingDown, Target, Activity, BarChart3, Lightbulb, ChevronDown, ChevronUp, Pencil, RefreshCw } from "lucide-react"
import Link from "next/link"
import CommentsSection from "@/components/dashboard/videos/CommentsSection"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Helper functions
const formatDuration = (duration: string) => {
  if (!duration || duration === "PT0S") return "0:00"
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return duration
  
  const hours = parseInt(match[1] || "0")
  const minutes = parseInt(match[2] || "0")
  const seconds = parseInt(match[3] || "0")
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPerformanceColor = (level?: string) => {
  if (!level) return "text-gray-600 bg-gray-100"
  switch (level.toLowerCase()) {
    case "excellent": return "crypto-profit bg-profit/10"
    case "good": return "text-blue-600 bg-blue-100"
    case "average": return "crypto-text-secondary bg-brand-10"
    case "poor": return "text-red-600 bg-red-100"
    default: return "text-gray-600 bg-gray-100"
  }
}

const getEngagementColor = (level?: string) => {
  if (!level) return "text-gray-600 bg-gray-100"
  switch (level.toLowerCase()) {
    case "high": return "crypto-profit bg-profit/10"
    case "medium": return "crypto-text-secondary bg-brand-10"
    case "low": return "text-red-600 bg-red-100"
    default: return "text-gray-600 bg-gray-100"
  }
}

const getGrowthColor = (potential?: string) => {
  if (!potential) return "text-gray-600 bg-gray-100"
  switch (potential.toLowerCase()) {
    case "high": return "crypto-profit bg-profit/10"
    case "medium": return "crypto-text-secondary bg-brand-10"
    case "low": return "text-red-600 bg-red-100"
    default: return "text-gray-600 bg-gray-100"
  }
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrivacy, setEditPrivacy] = useState("");
  const [isEditDescExpanded, setIsEditDescExpanded] = useState(false);
  
  const { data, video: videoData, isLoading, error, refetch } = useVideo(videoId);

  // Prefill edit form when opening
  useEffect(() => {
    if (isEditOpen && videoData) {
      setEditTitle(videoData.title || "");
      setEditDescription(videoData.description || "");
      setEditPrivacy(videoData.privacy_status || "public");
    }
  }, [isEditOpen, videoData]);

  const handleOpenEdit = () => {
    setEditError(null);
    setIsEditOpen(true);
  }

  const handleUpdateVideo = async () => {
    if (!videoId) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const endpoint = `https://backend.postsiva.com/single-video/${videoId}`
      const body: any = {
        title: editTitle,
        description: editDescription,
        privacy_status: editPrivacy,
      }
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Update failed (${res.status}): ${text || res.statusText}`)
      }

      // Refresh data
      await refetch()
      setIsEditOpen(false)
    } catch (e: any) {
      setEditError(e?.message || 'Failed to update video')
    } finally {
      setEditLoading(false)
    }
  }

  // Update page title when video data loads
  useEffect(() => {
    if (videoData?.title) {
  document.title = `${videoData.title} - Postsiva`;
    }
  }, [videoData?.title]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Error Loading Video</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/dashboard/videos">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Videos
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Video Not Found</h2>
          <p className="text-muted-foreground mb-4">The video you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/dashboard/videos">Back to Videos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
      {/* Mobile Back Button - Only visible on mobile */}
      

      {/* Header Section */}
      <div className="md:hidden">
        <h1 className="text-2xl font-bold text-foreground">Video Details</h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive video analytics</p>
      </div>
      
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold text-foreground">Video Details</h1>
        <p className="text-muted-foreground mt-1">Comprehensive video analytics and insights</p>
      </div>
      <div className="md:hidden">
        <Button variant="outline" size="sm" asChild className="w-full h-10">
          <Link href="/dashboard/videos" className="flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Videos
          </Link>
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          className="flex-1 md:flex-none h-10 text-xs sm:text-sm px-3 sm:px-4"
        >
          <RefreshCw className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="hidden sm:inline">Refresh for live data</span>
          <span className="sm:hidden">Refresh</span>
        </Button>
        <Button size="sm" variant="crypto" onClick={handleOpenEdit} className="flex-1 md:flex-none h-10 px-3 sm:px-4">
          <Pencil className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="hidden sm:inline">Edit Video</span>
          <span className="sm:hidden">Edit</span>
        </Button>
      </div>

      {/* Main Video Card */}
      <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={videoData.thumbnail_url || "/placeholder.svg"}
                alt={videoData.title}
                className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover rounded-t-lg"
              />
              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 bg-black/85 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-medium">
                {formatDuration(videoData.duration)}
              </div>
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4">
                <Button size="sm" asChild className="crypto-button-primary h-9 sm:h-10">
                  <Link href={videoData.youtube_url || `https://www.youtube.com/watch?v=${videoData.video_id}`} target="_blank" className="flex items-center">
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Watch on YouTube</span>
                    <span className="sm:hidden">Watch</span>
                  </Link>
                </Button>
              </div>
            </div>
            <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
              <div>
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-2 sm:mb-3">{videoData.title}</h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Published </span>
                    <span className="truncate">{formatDate(videoData.published_at)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {formatDuration(videoData.duration)}
                  </span>
                  <Badge variant="secondary" className="text-xs">{videoData.content_category}</Badge>
                  <Badge variant={videoData.privacy_status === "public" ? "default" : "secondary"} className="text-xs">
                    {videoData.privacy_status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 md:gap-2 text-muted-foreground mb-1">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Views</span>
                  </div>
                  <div className="text-base sm:text-lg md:text-2xl font-bold break-all">{videoData.view_count.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 md:gap-2 text-muted-foreground mb-1">
                    <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Likes</span>
                  </div>
                  <div className="text-base sm:text-lg md:text-2xl font-bold">{videoData.like_count}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 md:gap-2 text-muted-foreground mb-1">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Comments</span>
                  </div>
                  <div className="text-base sm:text-lg md:text-2xl font-bold">{videoData.comment_count}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg md:text-xl">Description</CardTitle>
          </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div 
                  className={`text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line transition-all duration-300 ${
                    isDescriptionExpanded ? 'max-h-none' : 'max-h-20 overflow-hidden'
                  }`}
                >
                  {videoData.description}
                </div>
                
                {videoData.description && videoData.description.length > 200 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show More
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

        {/* Performance Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm font-medium">Performance Score</span>
                      <span className="text-xs md:text-sm text-muted-foreground">{videoData.performance_score || 0}</span>
                    </div>
                    <Progress value={Math.min(videoData.performance_score || 0, 100)} className="h-2" />
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${getPerformanceColor(videoData.performance_level)} text-xs`}>
                        {videoData.performance_level}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm font-medium">Engagement Rate</span>
                      <span className="text-xs md:text-sm text-muted-foreground">{videoData.engagement_rate || 0}%</span>
                    </div>
                    <Progress value={Math.min((videoData.engagement_rate || 0) * 10, 100)} className="h-2" />
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${getEngagementColor(videoData.engagement_level)} text-xs`}>
                        {videoData.engagement_level}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="text-center p-2 md:p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg md:text-2xl font-bold text-blue-600">{videoData.views_per_day || 0}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Views per Day</div>
                    </div>
                    <div className="text-center p-2 md:p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg md:text-2xl font-bold crypto-profit">{(videoData.watch_time_hours || 0).toFixed(2)}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Watch Time (hrs)</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-2 md:p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg md:text-2xl font-bold text-purple-600">{videoData.days_since_published || 0}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Days Since Published</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Comments Section */}
        <div className="mt-4 sm:mt-5 md:mt-6">
          <CommentsSection videoId={videoId} />
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg w-full max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-4 overflow-y-auto max-h-[60vh] space-y-4">
            {editError ? (
              <div className="text-sm text-red-600">{editError}</div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy Status</Label>
              <Select value={editPrivacy} onValueChange={setEditPrivacy}>
                <SelectTrigger id="privacy" className="w-full">
                  <SelectValue placeholder="Select privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className={`transition-all duration-300 ${isEditDescExpanded ? '' : 'max-h-28 overflow-hidden'}`}>
                <Textarea id="description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={isEditDescExpanded ? 10 : 3} className="w-full resize-y" />
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setIsEditDescExpanded(!isEditDescExpanded)}>
                  {isEditDescExpanded ? 'View less' : 'View more'}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-[var(--border-primary)]">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={editLoading}>Cancel</Button>
            <Button onClick={handleUpdateVideo} disabled={editLoading} className="crypto-button-primary">
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
