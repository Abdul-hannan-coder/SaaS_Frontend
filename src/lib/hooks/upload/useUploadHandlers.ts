"use client"

import { useCallback } from "react"
import { UploadState, UploadHandlers } from "@/types/upload"
import { STORAGE_KEYS } from "@/lib/hooks/auth/authConstants"

interface UseUploadHandlersProps {
  state: UploadState
  updateState: (updates: Partial<UploadState>) => void
  toast: any
  router: any
  uploadVideo: any
  resetUploadState: any
  downloadVideo: any
  generateTitles: any
  generateDescriptionAPI: any
  regenerateDescriptionWithTemplate: any
  generateTimestampsAPI: any
  generateThumbnailsAPI: any
  updatePrivacyStatus: any
  resetPrivacyState: any
  selectPlaylist: any
  resetPlaylistSelectionState: any
  uploadToYouTube: any
  resetYouTubeUploadState: any
  getCurrentVideoId: any
  getVideoPreview: any
  previewData: any
  uploadedVideoData: any
  privacyError: string | null
  playlistSelectionError: string | null
  uploadError: string | null
  processAllInOne?: (videoId: string) => Promise<any>
}

export const useUploadHandlers = ({
  state,
  updateState,
  toast,
  router,
  uploadVideo,
  resetUploadState,
  downloadVideo,
  generateTitles,
  generateDescriptionAPI,
  regenerateDescriptionWithTemplate,
  generateTimestampsAPI,
  generateThumbnailsAPI,
  updatePrivacyStatus,
  resetPrivacyState,
  selectPlaylist,
  resetPlaylistSelectionState,
  uploadToYouTube,
  resetYouTubeUploadState,
  getCurrentVideoId,
  getVideoPreview,
  previewData,
  uploadedVideoData,
  privacyError,
  playlistSelectionError,
  uploadError,
  processAllInOne,
}: UseUploadHandlersProps): UploadHandlers => {

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

  // Check if Gemini API key exists before allowing upload (align with all-in-one)
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
      // Reset the file input
      event.target.value = ''
      return
    }

    updateState({
      uploadedFile: file,
      isUploading: true,
      uploadProgress: 0
    })
    
    resetUploadState()

    try {
      const result = await uploadVideo(file, (progress: number) => {
        updateState({ uploadProgress: progress })
      })
      
      if (result) {
        updateState({
          uploadedVideoData: result,
          uploadProgress: 100,
          showCelebration: true,
          currentStep: "title"
        })
        
        console.log('=== VIDEO UPLOAD SUCCESS ===')
        console.log('Upload completed successfully!')
        console.log('Video ID (UUID):', result.id)
        console.log('Response Data:', result)
      }
    } catch (error) {
      console.error('Video upload failed:', error)
      updateState({
        isUploading: false,
        uploadProgress: 0
      })
    } finally {
      updateState({ isUploading: false })
    }
  }, [uploadVideo, resetUploadState, updateState, toast])

  const handleYouTubeUrlDownload = useCallback(async () => {
    if (!state.youtubeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await downloadVideo(state.youtubeUrl)
      
      updateState({
        uploadedVideoData: result,
        showCelebration: true,
        youtubeUrl: ""
      })

      toast({
        title: "Success!",
        description: "Video downloaded successfully from YouTube",
      })

      console.log('=== VIDEO DOWNLOAD SUCCESS ===')
      console.log('Download completed successfully!')
      console.log('Video ID (UUID):', result.id)
      
    } catch (error) {
      console.error('Video download failed:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download video from YouTube",
        variant: "destructive",
      })
    }
  }, [state.youtubeUrl, downloadVideo, updateState, toast])

  const generateTitlesHandler = useCallback(async () => {
    const videoId = uploadedVideoData?.id || getCurrentVideoId()
    if (!videoId) {
      toast({ 
        title: 'Upload Required', 
        description: 'Please upload a video first before generating titles.' 
      })
      return
    }

    updateState({ isProcessing: true })
    try {
      const result = await generateTitles(videoId)
      if (result && result.generated_titles) {
        updateState({
          content: {
            ...state.content,
            titles: result.generated_titles,
          }
        })
      }
    } catch (error) {
      console.error('Failed to generate titles:', error)
    } finally {
      updateState({ isProcessing: false })
    }
  }, [uploadedVideoData, getCurrentVideoId, generateTitles, state.content, updateState, toast])

  const generateDescription = useCallback(async () => {
    const videoId = uploadedVideoData?.id || getCurrentVideoId()
    if (!videoId) {
      toast({ 
        title: 'Upload Required', 
        description: 'Please upload a video first before generating description.' 
      })
      return
    }

    updateState({ isProcessing: true })
    try {
      const result = await generateDescriptionAPI(videoId)
      if (result && result.generated_description) {
        updateState({
          content: {
            ...state.content,
            description: result.generated_description,
          }
        })
      }
    } catch (error) {
      console.error('Failed to generate description:', error)
    } finally {
      updateState({ isProcessing: false })
    }
  }, [uploadedVideoData, getCurrentVideoId, generateDescriptionAPI, state.content, updateState, toast])

  const generateTimestamps = useCallback(async () => {
    const videoId = uploadedVideoData?.id || getCurrentVideoId()
    if (!videoId) {
      toast({ 
        title: 'Upload Required', 
        description: 'Please upload a video first before generating timestamps.' 
      })
      return
    }

    updateState({ isProcessing: true })
    try {
      const result = await generateTimestampsAPI(videoId)
      if (result && result.generated_timestamps) {
        updateState({
          content: {
            ...state.content,
            timestamps: result.generated_timestamps,
          }
        })
      }
    } catch (error) {
      console.error('Failed to generate timestamps:', error)
    } finally {
      updateState({ isProcessing: false })
    }
  }, [uploadedVideoData, getCurrentVideoId, generateTimestampsAPI, state.content, updateState, toast])

  const generateThumbnails = useCallback(async () => {
    const videoId = uploadedVideoData?.id || getCurrentVideoId()
    
    console.log('[UploadHandlers] generateThumbnails called:', {
      videoId,
      uploadedVideoDataId: uploadedVideoData?.id,
      getCurrentVideoIdResult: getCurrentVideoId(),
      hasVideoId: !!videoId
    })
    
    if (!videoId) {
      toast({ 
        title: 'Upload Required', 
        description: 'Please upload a video first before generating thumbnails.' 
      })
      return
    }

    // Guard against accidental double-clicks / re-entrancy
    if (state.isProcessing) {
      console.warn('[UploadHandlers] generateThumbnails ignored: already processing')
      return
    }

    updateState({ isProcessing: true })
    try {
      console.log('[UploadHandlers] Calling generateThumbnailsAPI with videoId:', videoId)
      console.log('[UploadHandlers] Video ID type and value:', {
        videoId,
        videoIdType: typeof videoId,
        videoIdLength: videoId?.length,
        isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(videoId || '')
      })
      
      const result = await generateThumbnailsAPI(videoId)
      
      console.log('[UploadHandlers] generateThumbnailsAPI result:', {
        success: result?.success,
        thumbnailsCount: result?.thumbnails?.length,
        thumbnails: result?.thumbnails?.map((url: string, i: number) => `Thumbnail ${i + 1}: ${url.substring(0, 100)}...`),
        message: result?.message,
        videoId: result?.video_id
      })
      
      if (result && result.thumbnails) {
        console.log('[UploadHandlers] Updating state with thumbnails:', {
          currentThumbnailsCount: state.content.thumbnails.length,
          newThumbnailsCount: result.thumbnails.length
        })
        
        updateState({
          content: {
            ...state.content,
            thumbnails: result.thumbnails,
          }
        })
      } else {
        console.warn('[UploadHandlers] No thumbnails in result or result is falsy:', result)
      }
    } catch (error) {
      console.error('[UploadHandlers] Failed to generate thumbnails:', error)
    } finally {
      updateState({ isProcessing: false })
    }
  }, [uploadedVideoData, getCurrentVideoId, generateThumbnailsAPI, state.content, updateState, toast])

  const handleDirectUpload = useCallback(async () => {
    // Simple confirmation before upload
    const confirmed = window.confirm("Are you sure you want to upload this video to YouTube?")
    if (!confirmed) return

    try {
      const videoId = previewData?.id || uploadedVideoData?.id || getCurrentVideoId()
      if (!videoId) {
        toast({
          title: "Error",
          description: "No video ID found. Please try uploading again.",
          variant: "destructive",
        })
        return
      }

      console.log('[UploadHandlers] Starting YouTube upload process:', {
        videoId,
        selectedPrivacy: state.selectedPrivacy,
        selectedPlaylist: state.selectedPlaylist,
        timestamp: new Date().toISOString()
      })

      // Set the main upload state to loading
      updateState({ isUploading: true })

      toast({
        title: "Preparing upload...",
        description: "Setting up privacy and playlist before uploading to YouTube.",
      })

      // Step 1: Update privacy status
      if (state.selectedPrivacy) {
        console.log('[UploadHandlers] Setting privacy to:', state.selectedPrivacy)
        try {
          resetPrivacyState()
          await updatePrivacyStatus(videoId, state.selectedPrivacy)
          console.log('[UploadHandlers] ✅ Privacy status updated successfully')
        } catch (error) {
          console.error('[UploadHandlers] ⚠️ Privacy status update failed:', error)
          // Don't throw - privacy might already be set from a previous attempt
          // Just show a warning toast
          toast({
            title: "Privacy Warning",
            description: `Could not update privacy to ${state.selectedPrivacy}. Will use existing setting.`,
            variant: "default",
          })
        }
      } else {
        console.log('[UploadHandlers] ℹ️ No privacy selected, using default')
      }

      // Step 2: Add to playlist if selected
      if (state.selectedPlaylist?.id) {
        console.log('[UploadHandlers] Adding video to playlist:', {
          playlistName: state.selectedPlaylist.name,
          playlistId: state.selectedPlaylist.id
        })
        try {
          resetPlaylistSelectionState()
          await selectPlaylist(videoId, state.selectedPlaylist.id)
          console.log('[UploadHandlers] ✅ Video added to playlist successfully')
        } catch (error) {
          console.error('[UploadHandlers] ❌ Playlist selection failed:', error)
          // Don't fail the entire upload if playlist fails, just warn
          toast({
            title: "Playlist Warning",
            description: `Failed to add video to playlist: ${playlistSelectionError || 'Unknown error'}`,
            variant: "default",
          })
        }
      } else {
        console.log('[UploadHandlers] ℹ️ No playlist selected, skipping playlist step')
      }

      // Step 3: Upload to YouTube (no params needed - privacy and playlist already set)
      toast({
        title: "Uploading to YouTube...",
        description: "Please wait while we upload your video. This may take a few minutes.",
      })

      console.log('[UploadHandlers] Calling YouTube upload API for videoId:', videoId)
      resetYouTubeUploadState()
      
      try {
        await uploadToYouTube(videoId)
        
        toast({
          title: "Success!",
          description: `Video uploaded to YouTube successfully as ${state.selectedPrivacy}!`,
        })
      } catch (uploadErr: any) {
        console.error('[UploadHandlers] ⚠️ YouTube upload encountered an error:', uploadErr)
        
        // Check if it's a thumbnail-specific error (error code UPLOAD_005)
        const errorData = uploadErr?.response?.data
        const isThumbnailError = errorData?.code === 'UPLOAD_005' || 
                                 errorData?.details?.error_type === 'thumbnail_upload_failure' ||
                                 errorData?.message?.includes('thumbnail')
        
        if (isThumbnailError && errorData?.details?.youtube_video_id) {
          // Video uploaded successfully, only thumbnail failed - treat as partial success
          console.log('[UploadHandlers] ℹ️ Video uploaded but thumbnail failed:', {
            youtubeVideoId: errorData.details.youtube_video_id,
            error: errorData.message
          })
          
          toast({
            title: "Video Uploaded (Thumbnail Warning)",
            description: "Video uploaded successfully to YouTube, but custom thumbnail couldn't be set. You may need to verify your YouTube account or set it manually.",
            variant: "default",
          })
        } else {
          // Complete upload failure - rethrow to be caught by outer catch
          throw uploadErr
        }
      }

      // Reset states
      updateState({
        selectedPlaylist: null,
        isUploading: false
      })
      
      // Clear upload draft once fully uploaded
      try {
        const { clearUploadDraft } = await import('@/lib/storage/uploadDraft')
        clearUploadDraft(videoId)
      } catch {}

      // Navigate to dashboard after successful upload
      console.log('[UploadHandlers] ✅ Upload complete, navigating to dashboard')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500) // 1.5 second delay to let user see success message
      
    } catch (error) {
      console.error('[UploadHandlers] ❌ Upload process failed:', error)
      console.error('[UploadHandlers] Error details:', {
        errorMessage: (error as Error)?.message,
        errorStack: (error as Error)?.stack,
        uploadError,
        privacyError,
        playlistSelectionError,
      })
      
      // Reset loading state on error
      updateState({ isUploading: false })
      
      // Determine which step failed
      let errorDescription = "Failed to upload video to YouTube"
      if ((error as Error)?.message?.includes('privacy')) {
        errorDescription = `Privacy setup failed: ${privacyError || (error as Error).message}`
      } else if ((error as Error)?.message?.includes('playlist')) {
        errorDescription = `Playlist setup failed: ${playlistSelectionError || (error as Error).message}`
      } else {
        errorDescription = uploadError || (error as Error).message || "Failed to upload video to YouTube"
      }
      
      toast({
        title: "Upload Failed",
        description: errorDescription,
        variant: "destructive",
      })
    }
  }, [previewData, uploadedVideoData, getCurrentVideoId, resetYouTubeUploadState, uploadToYouTube, resetPrivacyState, updatePrivacyStatus, resetPlaylistSelectionState, selectPlaylist, updateState, toast, uploadError, privacyError, playlistSelectionError, state.selectedPrivacy, state.selectedPlaylist, router])

  const handlePublish = useCallback(async (type: "public" | "private" | "unlisted" | "schedule") => {
    console.log('[UploadHandlers] handlePublish called:', {
      type,
      currentSelectedPrivacy: state.selectedPrivacy,
      currentSelectedPlaylist: state.selectedPlaylist,
      timestamp: new Date().toISOString()
    })
    
    updateState({ publishType: type })
    
    if (type === "schedule") {
      alert("Scheduling feature coming soon!")
      return
    }

    // Important: Use the privacy selected in Stage 2 (state.selectedPrivacy), not the 'type' parameter
    // The 'type' parameter is legacy and will be ignored
    console.log('[UploadHandlers] ℹ️ Using privacy from Stage 2:', state.selectedPrivacy)
    console.log('[UploadHandlers] ℹ️ Ignoring type parameter:', type)

    // Direct upload with confirmation - privacy and playlist will be set inside handleDirectUpload
    handleDirectUpload()
  }, [state.selectedPrivacy, state.selectedPlaylist, updateState, handleDirectUpload])

  const handlePlaylistSelection = useCallback((playlistId: string) => {
    setTimeout(() => {
      updateState({
        showPlaylistSelector: false,
        currentStep: "preview"
      })
    }, 0)
  }, [updateState])

  const handleSaveApiKey = useCallback(async () => {
    if (!state.geminiApiKey.trim()) {
      updateState({ saveButtonText: "Enter API Key" })
      setTimeout(() => updateState({ saveButtonText: "Save Key" }), 2000)
      return
    }

    updateState({
      isSaving: true,
      saveButtonText: "Saving..."
    })

    try {
      // TODO: Implement saveGeminiKey function
      updateState({ saveButtonText: "Saved Successfully!" })
      
      setTimeout(() => {
        updateState({ saveButtonText: "Save Key" })
      }, 2000)
    } catch (error) {
      console.error('Failed to save API key:', error)
      updateState({ saveButtonText: "Save Failed" })
      
      setTimeout(() => {
        updateState({ saveButtonText: "Save Key" })
      }, 2000)
    } finally {
      updateState({ isSaving: false })
    }
  }, [state.geminiApiKey, updateState])

  const handleAllInOne = useCallback(async () => {
    try {
      const idFromStorage = getCurrentVideoId()
      const fallbackId = uploadedVideoData?.id || previewData?.id
      const videoId = idFromStorage || fallbackId
      console.log('[AllInOne][Handlers] IDs', {
        idFromStorage,
        uploadedVideoDataId: uploadedVideoData?.id,
        previewDataId: previewData?.id,
        chosen: videoId,
      })
      if (!videoId) {
        toast({ title: 'Upload Required', description: 'Please upload a video first.' })
        return
      }
      if (processAllInOne) {
        const result = await processAllInOne(videoId)
        console.log('[AllInOne][Handlers] API result', result)
      }
      updateState({ currentStep: 'preview', previewStage: 3, showFinalPreview: true })
      if (getVideoPreview) {
        await getVideoPreview(videoId)
      }

      // After All-In-One processing, automatically trigger the YouTube upload
      // This calls: POST /youtube-upload/{videoId}/upload on the backend
      try {
        console.log('[AllInOne][Handlers] Initiating YouTube upload for videoId:', videoId)
        updateState({ isUploading: true })
        toast({ title: 'Uploading to YouTube...', description: 'All-in-one finished. Uploading to YouTube now.' })
        resetYouTubeUploadState()

        try {
          await uploadToYouTube(videoId)
          toast({ title: 'Success!', description: 'Video uploaded to YouTube successfully.' })
        } catch (uploadErr: any) {
          console.error('[AllInOne][Handlers] ⚠️ YouTube upload encountered an error:', uploadErr)
          const errorData = uploadErr?.response?.data
          const isThumbnailError = errorData?.code === 'UPLOAD_005' ||
                                   errorData?.details?.error_type === 'thumbnail_upload_failure' ||
                                   errorData?.message?.includes('thumbnail')

          if (isThumbnailError && errorData?.details?.youtube_video_id) {
            console.log('[AllInOne][Handlers] ℹ️ Video uploaded but thumbnail failed:', {
              youtubeVideoId: errorData.details.youtube_video_id,
              error: errorData.message
            })
            toast({
              title: 'Video Uploaded (Thumbnail Warning)',
              description: 'Video uploaded, but custom thumbnail could not be set. You may need to verify your YouTube account or set it manually.',
              variant: 'default',
            })
          } else {
            // If it's not a thumbnail-only issue, rethrow so outer catch handles it
            throw uploadErr
          }
        }

        // Reset states after successful (or partial) upload
        updateState({ selectedPlaylist: null, isUploading: false })

        // Clear upload draft
        try {
          const { clearUploadDraft } = await import('@/lib/storage/uploadDraft')
          clearUploadDraft(videoId)
        } catch {}

        // Navigate to dashboard after a short delay so user sees toasts
        setTimeout(() => router.push('/dashboard'), 1500)
      } catch (e) {
        console.error('[AllInOne][Handlers] YouTube upload failed after All-in-one:', e)
        updateState({ isUploading: false })
        toast({ title: 'Upload Failed', description: 'Failed to upload video to YouTube after processing.', variant: 'destructive' })
      }
    } catch (e) {
      console.error('All-in-one failed', e)
    }
  }, [uploadedVideoData, getCurrentVideoId, processAllInOne, updateState, getVideoPreview, toast])

  return {
    handleFileUpload,
    handleYouTubeUrlDownload,
    generateTitlesHandler,
    generateDescription,
    generateTimestamps,
    generateThumbnails,
    handlePublish,
    handlePlaylistSelection,
    handleSaveApiKey,
    handleAllInOne,
  }
}
