"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, Sparkles, CheckCircle, ImageIcon, Save } from "lucide-react"
import useVideos from "@/lib/hooks/upload/useVideos"
import { STORAGE_KEYS } from "@/lib/hooks/auth/authConstants"
import useAllInOne from "@/lib/hooks/upload/useAllInOne"
import usePrivacyStatus from "@/lib/hooks/upload/usePrivacyStatus"
import { useChannelPlaylists } from "@/lib/hooks/dashboard/playlists/useChannelPlaylists"
import { AllInOneTimestamp } from "@/lib/hooks/upload/allInOneTypes"
import { useToast } from "@/lib/hooks/common/useToast"
import useYouTubeUpload from "@/lib/hooks/youtube/useYouTubeUpload"

export default function AllInOnePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const { uploadVideo, isUploading, progress, getCurrentVideoId } = useVideos()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { processAllInOne, saveAllInOne, isProcessing, isSaving, processedData } = useAllInOne()
  const { playlists, fetchChannelPlaylists } = useChannelPlaylists()
  const { uploadToYouTube, isUploading: isUploadingToYouTube, resetState: resetYouTubeUploadState } = useYouTubeUpload()
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)
  
  // Selected content
  const [selectedTitle, setSelectedTitle] = useState<string>("")
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [timestamps, setTimestamps] = useState<AllInOneTimestamp[]>([])
  const [privacyStatus, setPrivacyStatus] = useState<string>("public")
  const [playlistName, setPlaylistName] = useState<string>("")
  
  // UI state
  const [step, setStep] = useState<"upload" | "processing" | "review">("upload")

  // Fetch playlists only once on mount, not on every render
  useEffect(() => {
    fetchChannelPlaylists()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load processed data into form
  useEffect(() => {
    if (!processedData?.results) return // Guard against running on every render
    
    const { titles, description: desc, timestamps: ts, thumbnails } = processedData.results
    
    if (titles.success && titles.generated_titles.length > 0) {
      setSelectedTitle(titles.generated_titles[0])
    }
    
    if (desc.success && desc.generated_description) {
      setDescription(desc.generated_description)
    }
    
    if (ts.success && ts.generated_timestamps) {
      setTimestamps(ts.generated_timestamps)
    }
    
    if (thumbnails.success && thumbnails.generated_thumbnails.length > 0) {
      setSelectedThumbnail(thumbnails.generated_thumbnails[0].image_url)
    }
  }, [processedData]) // This is safe because processedData is from reducer state

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check for Gemini API key (align with stage-wise flow)
    const hasKeyFlag = localStorage.getItem(STORAGE_KEYS.HAS_GEMINI_KEY) === 'true'
    const keyPreview = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY_PREVIEW)
    const keyFull = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY)
    const hasGeminiKey = hasKeyFlag || !!(keyFull && keyFull.trim()) || !!(keyPreview && keyPreview.trim())
    if (!hasGeminiKey) {
      toast({
        title: "Gemini API Key Required",
        description: "Please go to Settings and enter your Gemini API key before uploading videos.",
        variant: "destructive",
      })
      event.target.value = ''
      return
    }

    setUploadedFile(file)
    setStep("upload")

    try {
      console.log('[AllInOne] Starting video upload...')
      const result = await uploadVideo(file)
      
      if (result?.id) {
        console.log('[AllInOne] Upload successful, video ID:', result.id)
        setCurrentVideoId(result.id)
        
        // Start processing
        setStep("processing")
        await processAllInOne(result.id)
        setStep("review")
      }
    } catch (error) {
      console.error('[AllInOne] Upload or processing failed:', error)
      setStep("upload")
    }
  }

  const handleSave = async () => {
    if (!currentVideoId) {
      toast({
        title: "Error",
        description: "No video ID found. Please try uploading again.",
        variant: "destructive",
      })
      return
    }

    if (!selectedTitle || !selectedThumbnail || !description) {
      toast({
        title: "Missing Fields",
        description: "Please select a title, thumbnail, and ensure description is filled.",
        variant: "destructive",
      })
      return
    }

    try {
      // Step 1: Save the video content
      const savePayload = {
        selected_title: selectedTitle,
        selected_thumbnail_url: selectedThumbnail,
        description,
        timestamps,
        privacy_status: privacyStatus,
        playlist_name: playlistName || undefined,
      }
      
      console.log('[AllInOne] Saving content with payload:', {
        videoId: currentVideoId,
        payload: savePayload,
        hasPrivacyStatus: !!privacyStatus,
        hasPlaylistName: !!playlistName,
        timestamp: new Date().toISOString()
      })
      
      await saveAllInOne(currentVideoId, savePayload)

      toast({
        title: "Success!",
        description: "Your video content has been saved successfully.",
      })

      // Step 2: Upload to YouTube
      try {
        console.log('[AllInOne] Starting YouTube upload for videoId:', currentVideoId)
        
        toast({
          title: "Uploading to YouTube...",
          description: "Please wait while we upload your video to YouTube.",
        })

        resetYouTubeUploadState()
        await uploadToYouTube(currentVideoId)

        toast({
          title: "YouTube Upload Successful!",
          description: "Your video has been uploaded to YouTube successfully.",
        })

        console.log('[AllInOne] YouTube upload completed successfully')

      } catch (uploadError: any) {
        console.error('[AllInOne] YouTube upload failed:', uploadError)
        
        // Check if it's a thumbnail-specific error
        const errorData = uploadError?.response?.data
        const isThumbnailError = errorData?.code === 'UPLOAD_005' || 
                                 errorData?.details?.error_type === 'thumbnail_upload_failure' ||
                                 errorData?.message?.includes('thumbnail')
        
        if (isThumbnailError && errorData?.details?.youtube_video_id) {
          // Video uploaded successfully, only thumbnail failed
          console.log('[AllInOne] Video uploaded but thumbnail failed:', {
            youtubeVideoId: errorData.details.youtube_video_id,
            error: errorData.message
          })
          
          toast({
            title: "Video Uploaded (Thumbnail Warning)",
            description: "Video uploaded to YouTube, but custom thumbnail couldn't be set. You may need to verify your YouTube account or set it manually.",
            variant: "default",
          })
        } else {
          // Complete upload failure
          toast({
            title: "YouTube Upload Failed",
            description: "Video content was saved, but failed to upload to YouTube. Please try again from the dashboard.",
            variant: "destructive",
          })
        }
      }

      // Reset and go back to upload
      setTimeout(() => {
        setStep("upload")
        setUploadedFile(null)
        setCurrentVideoId(null)
        setSelectedTitle("")
        setSelectedThumbnail("")
        setDescription("")
        setTimestamps([])
        setPrivacyStatus("public")
        setPlaylistName("")
      }, 2000)
      
    } catch (error) {
      console.error('[AllInOne] Save failed:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save video content. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-brand-primary" />
        <div>
          <h1 className="text-3xl font-bold">All-in-One Video Generator</h1>
          <p className="text-muted-foreground">Upload a video and let AI generate everything</p>
        </div>
      </div>

      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Video</CardTitle>
            <CardDescription>
              Upload a video file and we'll automatically generate titles, descriptions, timestamps, and thumbnails using AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="video-upload"
                  ref={fileInputRef}
                  disabled={isUploading}
                />
                
                {!isUploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div className="space-y-1">
                      <Label htmlFor="video-upload" className="cursor-pointer">
                        <p className="text-lg font-medium">Click to upload or drag and drop</p>
                      </Label>
                      <p className="text-sm text-muted-foreground">MP4, MOV, AVI, or any video format</p>
                    </div>
                    <Button
                      type="button"
                      variant="crypto"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" /> Select Video File
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
                    <div className="w-full max-w-md space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="truncate mr-2">
                          {uploadedFile?.name ? `Uploading ${uploadedFile.name}` : 'Uploading video...'}
                        </span>
                        <span className="flex-shrink-0 font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                )}
              </div>
              
              {uploadedFile && !isUploading && (
                <p className="text-sm text-muted-foreground">
                  Selected: {uploadedFile.name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === "processing" && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-6">
              <Loader2 className="h-16 w-16 animate-spin text-brand-primary" />
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">AI is Working Its Magic ✨</h3>
                <p className="text-muted-foreground">
                  Generating titles, descriptions, timestamps, and thumbnails...
                </p>
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "review" && processedData && (
        <div className="space-y-6">
          {/* Titles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-primary" />
                Select a Title
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processedData.results.titles.generated_titles.map((title, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedTitle(title)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTitle === title
                        ? "border-brand-primary bg-brand-primary/10"
                        : "border-border hover:border-brand-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="flex-1">{title}</p>
                      {selectedTitle === title && (
                        <CheckCircle className="h-5 w-5 text-brand-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Thumbnails */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-brand-primary" />
                Thumbnail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processedData.results.thumbnails.generated_thumbnails.length > 0 ? (
                <div className="max-w-md">
                  <div
                    onClick={() => setSelectedThumbnail(processedData.results.thumbnails.generated_thumbnails[0].image_url)}
                    className={`relative aspect-video border-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                      selectedThumbnail === processedData.results.thumbnails.generated_thumbnails[0].image_url
                        ? "border-brand-primary ring-2 ring-brand-primary/20"
                        : "border-border hover:border-brand-primary/50"
                    }`}
                  >
                    <img
                      src={processedData.results.thumbnails.generated_thumbnails[0].image_url}
                      alt="Generated Thumbnail"
                      className="w-full h-full object-cover rounded-lg"
                      loading="eager"
                    />
                    {selectedThumbnail === processedData.results.thumbnails.generated_thumbnails[0].image_url && (
                      <div className="absolute top-2 right-2 bg-brand-primary rounded-full p-1">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No thumbnail generated</div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Edit the generated description..."
              />
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {timestamps.map((ts, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <Input
                      value={ts.time}
                      onChange={(e) => {
                        const newTimestamps = [...timestamps]
                        newTimestamps[index].time = e.target.value
                        setTimestamps(newTimestamps)
                      }}
                      className="w-24"
                      placeholder="00:00"
                    />
                    <Input
                      value={ts.title}
                      onChange={(e) => {
                        const newTimestamps = [...timestamps]
                        newTimestamps[index].title = e.target.value
                        setTimestamps(newTimestamps)
                      }}
                      className="flex-1"
                      placeholder="Chapter title"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Playlist */}
          <Card>
            <CardHeader>
              <CardTitle>Video Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Privacy Status</Label>
                  <Select value={privacyStatus} onValueChange={setPrivacyStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Playlist (Optional)</Label>
                  <Select value={playlistName} onValueChange={setPlaylistName}>
                    <SelectTrigger>
                      <SelectValue placeholder="No playlist" />
                    </SelectTrigger>
                    <SelectContent>
                      {playlists.length === 0 ? (
                        <div className="px-2 py-1 text-sm text-muted-foreground">No playlists found</div>
                      ) : (
                        playlists.map((playlist) => (
                          <SelectItem key={playlist.id} value={playlist.name}>
                            {playlist.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setStep("upload")
                setUploadedFile(null)
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isUploadingToYouTube || !selectedTitle || !selectedThumbnail || !description}
              className="min-w-[150px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isUploadingToYouTube ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading to YouTube...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save & Upload to YouTube
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
