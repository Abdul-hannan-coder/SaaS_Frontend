"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Eye, RefreshCw, AlertCircle, ImageIcon, Globe, Lock, Users, Play, Sparkles, FileText, Clock, Edit3 } from "lucide-react"
import { UploadState, UploadHandlers } from "@/types/upload"
import { EditModal } from "@/components/upload/ui/EditModal"
import { UpdateVideoRequest } from "@/lib/hooks/upload/useUpdateVideo"
import { useChannelPlaylists } from "@/lib/hooks/dashboard/playlists/useChannelPlaylists"

interface PreviewSectionProps {
  state: UploadState
  updateState: (updates: Partial<UploadState>) => void
  handlers: UploadHandlers
  previewData: any
  previewLoading: boolean
  previewError: string | null
  uploadedVideoData: any
  getCurrentVideoId: () => string | null
  getVideoPreview: (videoId: string) => Promise<void>
  onUpdateVideo?: (updates: UpdateVideoRequest) => Promise<void>
  isUpdatingVideo?: boolean
}

export function PreviewSection({
  state,
  updateState,
  handlers,
  previewData,
  previewLoading,
  previewError,
  uploadedVideoData,
  getCurrentVideoId,
  getVideoPreview,
  onUpdateVideo,
  isUpdatingVideo = false
}: PreviewSectionProps) {

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Use the channel playlists hook directly
  const { playlists, isLoading: playlistsLoading, error: playlistsError, fetchChannelPlaylists } = useChannelPlaylists()

  const privacyOptions = [
    { value: 'public' as const, label: 'Public', description: 'Anyone can search for and view', icon: Globe },
    { value: 'unlisted' as const, label: 'Unlisted', description: 'Anyone with the link can view', icon: Users },
    { value: 'private' as const, label: 'Private', description: 'Only you can view', icon: Lock },
  ]

  const handlePrivacySelect = (privacy: 'public' | 'private' | 'unlisted') => {
    console.log('[PreviewSection] Privacy selected:', {
      selectedPrivacy: privacy,
      previousPrivacy: state.selectedPrivacy,
      timestamp: new Date().toISOString()
    })
    updateState({ selectedPrivacy: privacy })
  }

  const handlePlaylistSelect = (playlist: any) => {
    console.log('[PreviewSection] Playlist selected:', {
      playlistId: playlist.id,
      playlistName: playlist.name,
      previousPlaylist: state.selectedPlaylist,
      timestamp: new Date().toISOString()
    })
    updateState({ selectedPlaylist: playlist })
  }

  const handleShowPreview = () => {
    updateState({ showFinalPreview: true })
    const videoId = uploadedVideoData?.id || getCurrentVideoId()
    if (videoId) {
      getVideoPreview(videoId)
    }
  }

  const handleAllInOne = async () => {
    const videoId = uploadedVideoData?.id || getCurrentVideoId()
    if (!videoId) return
    // @ts-ignore add handler injected via handlers if present
    if ((handlers as any).processAllInOne) {
      await (handlers as any).processAllInOne(videoId)
      // Move to final preview and refresh preview data
      updateState({ previewStage: 3, showFinalPreview: true })
      await getVideoPreview(videoId)
    }
  }

  const handleStageNavigation = (stage: 1 | 2 | 3) => {
    updateState({ previewStage: stage })
    
    // Load playlists when entering stage 2
    if (stage === 2) {
      fetchChannelPlaylists()
    }
  }

  const handleEditVideo = async (updates: UpdateVideoRequest) => {
    if (onUpdateVideo) {
      await onUpdateVideo(updates)
      
      // Update local state with the new values
      if (updates.title) {
        updateState({ customTitle: updates.title })
      }
      if (updates.description) {
        updateState({ customDescription: updates.description })
      }
      if (updates.timestamps) {
        updateState({ customTimestamps: updates.timestamps })
      }
      if (updates.privacy_status) {
        updateState({ selectedPrivacy: updates.privacy_status as 'public' | 'private' | 'unlisted' })
      }
      if (updates.playlist_name) {
        // Find the playlist by name and update selectedPlaylist
        const playlist = playlists.find(p => p.name === updates.playlist_name)
        if (playlist) {
          updateState({ selectedPlaylist: playlist })
        }
      }
    }
  }

  return (
    <Card className="border-0 shadow-lg crypto-card">
      <CardHeader className="pb-4 sm:pb-5 md:pb-6 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold crypto-text-primary">
          <div className="p-1.5 sm:p-2 bg-brand-10 rounded-lg crypto-glow">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 crypto-profit" />
          </div>
          <span className="text-base sm:text-lg md:text-2xl lg:text-3xl">
          {state.previewStage === 1 ? "Review Content" : state.previewStage === 2 ? "Settings" : "Final Preview"}
          </span>
        </CardTitle>
        <p className="text-sm sm:text-base md:text-lg crypto-text-secondary mt-1.5 sm:mt-2">
          {state.previewStage === 1 ? "Review your generated content" : 
           state.previewStage === 2 ? "Configure privacy and playlist settings" : 
           "Final review before upload"}
        </p>
        
        {/* Stage Progress Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-4 sm:mt-5 md:mt-6 p-3 sm:p-4 bg-card/50 rounded-xl border border-primary/30">
          {[1, 2, 3].map((stageNum) => (
            <div key={stageNum} className="flex items-center w-full sm:w-auto">
              <div
                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 transition-all duration-200 ${
                  state.previewStage === stageNum
                    ? "border-brand-primary bg-brand-primary text-white shadow-lg scale-110 crypto-glow"
                    : state.previewStage > stageNum
                      ? "border-profit bg-profit text-white shadow-md crypto-glow"
                      : "border-primary bg-card text-primary"
                }`}
              >
                <span className="text-xs sm:text-sm font-semibold">{stageNum}</span>
              </div>
              <span className={`ml-2 sm:ml-3 text-xs sm:text-sm font-medium ${
                state.previewStage === stageNum ? "crypto-text-primary" : 
                state.previewStage > stageNum ? "crypto-text-secondary" : "crypto-text-tertiary"
              }`}>
                {stageNum === 1 ? "Content" : stageNum === 2 ? "Settings" : "Preview"}
              </span>
              {stageNum < 3 && (
                <div className={`h-0.5 sm:h-1 flex-1 mx-2 sm:mx-4 rounded-full transition-all duration-300 ${
                  state.previewStage > stageNum ? "bg-profit" : "bg-primary"
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-5 md:space-y-6 px-4 sm:px-6">
        
        {/* Stage 1: Content Review */}
        {state.previewStage === 1 && (
          <>
            {/* Title Section */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm font-medium">Selected Title</Label>
              <div className="p-3 sm:p-4 border rounded-lg bg-muted/20">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg">
                  {state.content.selectedTitle || state.customTitle || 'No title selected'}
                </h3>
              </div>
            </div>

            {/* Thumbnail Section */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm font-medium">Selected Thumbnail</Label>
              <div className="p-3 sm:p-4 border rounded-lg bg-muted/20">
                {state.content.selectedThumbnail ? (
                  <div className="w-full max-w-sm mx-auto">
                    <img
                      src={state.content.selectedThumbnail}
                      alt="Selected thumbnail"
                      className="w-full h-auto rounded-lg border"
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-sm mx-auto h-24 sm:h-32 border rounded-lg flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                    <span className="ml-2 text-xs sm:text-sm">No thumbnail selected</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm font-medium">Description</Label>
              <div className="p-3 sm:p-4 border rounded-lg bg-muted/20 max-h-40 sm:max-h-48 overflow-y-auto">
                {state.content.description || state.customDescription ? (
                  <pre className="text-xs sm:text-sm whitespace-pre-wrap">
                    {state.content.description || state.customDescription}
                  </pre>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground italic">No description generated</p>
                )}
              </div>
            </div>

            {/* Timestamps Section */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm font-medium">Timestamps</Label>
              <div className="p-3 sm:p-4 border rounded-lg bg-muted/20 max-h-40 sm:max-h-48 overflow-y-auto">
                {state.content.timestamps || state.customTimestamps ? (
                  <pre className="text-xs sm:text-sm whitespace-pre-wrap font-mono">
                    {state.content.timestamps || state.customTimestamps}
                  </pre>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground italic">No timestamps generated</p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button 
                variant="outline"
                onClick={() => updateState({ currentStep: "thumbnail" })}
                className="text-xs sm:text-sm"
              >
                Back to Thumbnails
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                  className="border-primary text-primary hover:bg-brand-10 hover:border-brand-primary text-xs sm:text-sm"
                >
                  <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Edit
                </Button>
                <Button 
                  onClick={() => handleStageNavigation(2)}
                  className="text-xs sm:text-sm"
                >
                  Continue to Settings
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Stage 2: Privacy & Playlist Settings */}
        {state.previewStage === 2 && (
          <>
            {/* Privacy Settings */}
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-sm sm:text-base font-medium">Choose Privacy Setting</Label>
              <div className="grid gap-2 sm:gap-3">
                {privacyOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <div
                      key={option.value}
                      className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                        state.selectedPrivacy === option.value
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() => handlePrivacySelect(option.value)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-sm sm:text-base">{option.label}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Playlist Selection */}
            <div className="space-y-3 sm:space-y-4 overflow-x-hidden">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm sm:text-base font-medium">Add to Playlist (Optional)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchChannelPlaylists}
                  disabled={playlistsLoading}
                  className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${playlistsLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
              
              {playlistsLoading && (
                <div className="text-center p-3 sm:p-4">
                  <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Loading playlists...</p>
                </div>
              )}

              {playlistsError && (
                <div className="text-center p-3 sm:p-4 border rounded-lg bg-destructive/10">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-destructive">{playlistsError}</p>
                </div>
              )}

              {!playlistsLoading && !playlistsError && playlists.length > 0 && (
                <div className="grid gap-2 sm:gap-3 max-h-56 sm:max-h-60 overflow-y-auto overflow-x-hidden">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className={`p-2.5 sm:p-3 border rounded-lg cursor-pointer transition-colors overflow-x-hidden ${
                        state.selectedPlaylist?.id === playlist.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() => handlePlaylistSelect(playlist)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="font-medium text-xs sm:text-sm truncate">{playlist.name}</div>
                        </div>
                        <Badge variant="outline" className="text-xs ml-1 sm:ml-2 flex-shrink-0">
                          <span className="hidden sm:inline">Available</span>
                          <span className="sm:hidden">✓</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!playlistsLoading && !playlistsError && playlists.length === 0 && (
                <div className="text-center p-4 sm:p-6 text-muted-foreground text-xs sm:text-sm border rounded-lg bg-muted/20">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                  <p>No playlists found</p>
                  <p className="text-xs">Create playlists on YouTube first</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button 
                variant="outline"
                onClick={() => handleStageNavigation(1)}
                className="text-xs sm:text-sm"
              >
                Back to Content
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                  className="border-primary text-primary hover:bg-brand-10 hover:border-brand-primary text-xs sm:text-sm"
                >
                  <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Edit
                </Button>
                <Button 
                  onClick={() => handleStageNavigation(3)}
                  className="text-xs sm:text-sm"
                >
                  Continue to Preview
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Stage 3: Final Preview & Upload */}
        {state.previewStage === 3 && (
          <>
            {!state.showFinalPreview ? (
              <div className="text-center py-6 sm:py-8">
                <Eye className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Ready to Preview</h3>
                <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm">
                  Click below to see a comprehensive preview of your video content before uploading.
                </p>
                <Button 
                  onClick={handleShowPreview}
                  className="gap-2 text-xs sm:text-sm"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  Show Preview
                </Button>
              </div>
            ) : (
              <>
                {/* Preview Loading/Error States */}
                {previewLoading && (
                  <div className="text-center p-6 sm:p-8">
                    <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-3 sm:mb-4" />
                    <p className="text-muted-foreground text-xs sm:text-sm">Loading preview data...</p>
                  </div>
                )}

                {previewError && (
                  <div className="text-center p-6 sm:p-8 border rounded-lg bg-destructive/10">
                    <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-destructive mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium mb-2">Failed to Load Preview</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{previewError}</p>
                    <Button
                      onClick={() => {
                        const videoId = uploadedVideoData?.id || getCurrentVideoId()
                        if (videoId) {
                          getVideoPreview(videoId)
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Retry
                    </Button>
                  </div>
                )}

                {/* Final Preview - Only Important Content */}
                {!previewLoading && !previewError && (
                  <div className="space-y-4 sm:space-y-5 md:space-y-6">
                    {/* All-in-One Result (if present) */}
                    {state.allInOneResult && (
                      <div className="border rounded-xl p-4 sm:p-5 md:p-6 crypto-card border-primary/30 shadow-sm">
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 crypto-text-primary">All-in-One Summary</h3>
                        <div className="text-xs sm:text-sm text-muted-foreground mb-2">{state.allInOneResult.message}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div>Total tasks: <span className="font-medium">{state.allInOneResult.total_tasks}</span></div>
                          <div>Completed: <span className="font-medium">{state.allInOneResult.completed_tasks}</span></div>
                          <div>Failed: <span className="font-medium">{state.allInOneResult.failed_tasks}</span></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Video Title */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 crypto-profit" />
                        Video Title
                      </Label>
                      <div className="p-4 sm:p-5 md:p-6 border rounded-xl crypto-card border-primary/30 shadow-sm">
                        <h3 className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl crypto-text-primary">
                          {previewData?.title || state.content.selectedTitle || (state.allInOneResult?.results?.titles?.generated_titles?.[0]) || state.customTitle || 'No title generated'}
                        </h3>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 crypto-profit" />
                        Video Thumbnail
                      </Label>
                      <div className="p-4 sm:p-5 md:p-6 border rounded-xl crypto-card border-primary/30 shadow-sm">
                        {(previewData?.thumbnail_url || state.content.selectedThumbnail) ? (
                          <div className="w-full max-w-md mx-auto">
                            <img
                              src={previewData?.thumbnail_url || state.content.selectedThumbnail}
                              alt="Video thumbnail"
                              className="w-full h-auto rounded-xl border-2 border-primary/30 shadow-lg"
                            />
                          </div>
                        ) : (
                          <div className="w-full max-w-md mx-auto h-32 sm:h-40 md:h-48 border-2 border-dashed border-blue-200/30 rounded-xl flex items-center justify-center text-muted-foreground bg-blue-50/20">
                            <div className="text-center">
                              <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 crypto-text-tertiary" />
                              <span className="crypto-profit text-xs sm:text-sm">No thumbnail available</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 crypto-profit" />
                        Video Description
                      </Label>
                      <div className="border rounded-xl p-4 sm:p-5 md:p-6 crypto-card border-primary/30 shadow-sm max-h-56 sm:max-h-60 overflow-y-auto">
                        {(previewData?.description || state.content.description || state.allInOneResult?.results?.description?.generated_description || state.customDescription) ? (
                          <pre className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed crypto-text-primary">
                            {previewData?.description || state.content.description || state.allInOneResult?.results?.description?.generated_description || state.customDescription}
                          </pre>
                        ) : (
                          <div className="text-center py-6 sm:py-8">
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 crypto-text-tertiary" />
                            <p className="text-xs sm:text-sm crypto-profit italic">No description generated</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 crypto-profit" />
                        Video Timestamps
                      </Label>
                      <div className="border rounded-xl p-4 sm:p-5 md:p-6 crypto-card border-primary/30 shadow-sm max-h-56 sm:max-h-60 overflow-y-auto">
                        {(previewData?.timestamps || state.content.timestamps || (state.allInOneResult?.results?.timestamps?.generated_timestamps?.map((t: any) => `${t.time} ${t.title}`).join("\n")) || state.customTimestamps) ? (
                          <pre className="text-xs sm:text-sm whitespace-pre-wrap font-mono leading-relaxed crypto-text-primary">
                            {previewData?.timestamps || state.content.timestamps || (state.allInOneResult?.results?.timestamps?.generated_timestamps?.map((t: any) => `${t.time} ${t.title}`).join("\n")) || state.customTimestamps}
                          </pre>
                        ) : (
                          <div className="text-center py-6 sm:py-8">
                            <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 crypto-text-tertiary" />
                            <p className="text-xs sm:text-sm crypto-profit italic">No timestamps generated</p>
                          </div>
                        )}
                      </div>
                    </div>

                                        {/* Summary Info */}
                    <div className="border rounded-xl p-4 sm:p-5 md:p-6 crypto-card border-primary/30 shadow-sm">
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6 crypto-text-primary flex items-center gap-2">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                        Upload Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3">
                          <Label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">Privacy Setting</Label>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Badge className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium capitalize ${
                              state.selectedPrivacy === 'public' ? 'bg-profit/10 text-profit border-profit/20' : 
                              state.selectedPrivacy === 'unlisted' ? 'bg-brand-10 crypto-text-primary border-brand-200' : 
                              'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {state.selectedPrivacy === 'public' && <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                              {state.selectedPrivacy === 'unlisted' && <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                              {state.selectedPrivacy === 'private' && <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                              {state.selectedPrivacy}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <Label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">Playlist</Label>
                          <div className="flex items-center gap-2 min-w-0">
                            {state.selectedPlaylist ? (
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Play className="w-3 h-3 sm:w-4 sm:h-4 crypto-profit flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium crypto-text-primary truncate block min-w-0">{state.selectedPlaylist.name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Play className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="text-xs sm:text-sm">No playlist selected</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edit and Upload Buttons */}
                    <div className="pt-4 sm:pt-5 md:pt-6 space-y-3 sm:space-y-4">
                      {/* Edit Button */}
                      <Button
                        onClick={() => setIsEditModalOpen(true)}
                        variant="outline"
                        className="w-full border-primary cursor-pointer crypto-text-primary hover:bg-brand-10 hover:border-brand-primary font-medium py-2.5 sm:py-3 px-4 sm:px-6 text-xs sm:text-sm md:text-base"
                        disabled={state.isUploading}
                      >
                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Edit Video Details
                      </Button>

                      {/* Upload Button */}
                      <Button
                        onClick={() => handlers.handlePublish('public')}
                        className="w-full bg-gradient-to-r cursor-pointer from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary text-white font-semibold py-3 sm:py-3.5 md:py-4 px-6 sm:px-8 text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        disabled={state.isUploading}
                        size="lg"
                      >
                        {state.isUploading ? (
                          <>
                            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 animate-spin" />
                            <span className="text-xs sm:text-sm md:text-base">Uploading to YouTube...</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                            <span className="text-xs sm:text-sm md:text-base">Upload to YouTube</span>
                          </>
                        )}
                      </Button>
                      {state.isUploading && (
                        <div className="mt-3 sm:mt-4 text-center">
                          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-brand-primary"></div>
                            Please wait while we upload your video...
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-3 sm:pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => handleStageNavigation(2)}
                    className="text-xs sm:text-sm"
                  >
                    Back to Settings
                  </Button>
                </div>
              </>
            )}
          </>
        )}

      </CardContent>

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        state={state}
        onSave={handleEditVideo}
        isSaving={isUpdatingVideo}
      />
    </Card>
  )
}

