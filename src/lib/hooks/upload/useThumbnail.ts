import { useCallback, useReducer } from 'react'
import { isAxiosError } from 'axios'
import useAuth from '../auth/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { mapAxiosError } from '@/lib/utils/errorUtils'
import { API_BASE_URL } from '@/lib/config/appConfig'
import { createUploadAxios } from './uploadApi'
import {
  ThumbnailBatchResponse,
  ThumbnailGenerateResponse,
  ThumbnailSaveRequest,
  ThumbnailSaveResponse,
  ThumbnailUploadResponse,
} from './thumbnailTypes'
import {
  initialThumbnailState,
  thumbnailReducer,
} from './thumbnailReducer'

export default function useThumbnail() {
  const { getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const [state, dispatch] = useReducer(thumbnailReducer, initialThumbnailState)

  const axiosInstance = createUploadAxios('thumbnail')

  const generateSingleThumbnail = useCallback(async (videoId: string): Promise<ThumbnailGenerateResponse | undefined> => {
    const headers = getAuthHeaders()
    const url = `/thumbnail-generator/${videoId}/generate`
    
    console.log('[Thumbnail][Single Generate] Request', {
      url,
      videoId,
      hasAuthHeader: !!(headers as any)?.Authorization,
    })

    // Add timeout for faster failure detection
    const res = await axiosInstance.post(url, '', { 
      headers,
      timeout: 30000 // 30 second timeout
    })
    
    console.log('[Thumbnail][Single Generate] Response', {
      status: res.status,
      success: res.data?.success,
      imageUrl: res.data?.image_url,
      videoId: res.data?.video_id,
      width: res.data?.width,
      height: res.data?.height,
      message: res.data?.message,
    })

    return res.data
  }, [getAuthHeaders])

  const generateThumbnails = useCallback(async (videoId: string): Promise<ThumbnailBatchResponse | undefined> => {
    console.log('[Thumbnail][Batch Generate] Entry point - videoId received:', {
      videoId,
      videoIdType: typeof videoId,
      videoIdLength: videoId?.length,
      isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(videoId || '')
    })
    
    if (!videoId) {
      const errorMsg = 'Video ID is required'
      dispatch({ type: 'ERROR', payload: errorMsg })
      toast({ title: 'Missing Video ID', description: errorMsg })
      return
    }

  dispatch({ type: 'INIT_BATCH' })

    try {
      console.log('[Thumbnail][Batch Generate] Starting generation of 5 thumbnails for video:', videoId)

      // Generate 5 thumbnails concurrently with staggered requests to avoid overloading
      const generateWithDelay = async (index: number): Promise<{result: ThumbnailGenerateResponse | null, index: number}> => {
        // Add small delay between requests to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, index * 200))
        
        try {
          const result = await generateSingleThumbnail(videoId)
          
          // Mark this specific thumbnail as loaded and update state immediately
          dispatch({ type: 'SET_ITEM_DONE', index })
          
          // Add thumbnail to the list as soon as it's ready
          if (result?.image_url) {
            dispatch({ type: 'ADD_OR_SET_THUMBNAIL', index, url: result.image_url })
          }
          
          return { result: result || null, index }
        } catch (error) {
          console.error(`[Thumbnail][Batch Generate] Failed to generate thumbnail ${index + 1}:`, error)
          // Mark as failed (not loading anymore)
          dispatch({ type: 'SET_ITEM_DONE', index })
          return { result: null, index }
        }
      }

      // Generate all thumbnails with staggered timing
      const promises = Array.from({ length: 5 }, (_, index) => generateWithDelay(index))
      const results = await Promise.allSettled(promises)
      
      // Extract successful thumbnails
      const thumbnails: string[] = []
      const failedCount = results.filter((result, index) => {
        if (result.status === 'fulfilled' && result.value?.result?.image_url) {
          thumbnails.push(result.value.result.image_url)
          console.log(`[Thumbnail][Batch Generate] Thumbnail ${index + 1} generated:`, result.value.result.image_url)
          return false
        } else {
          console.error(`[Thumbnail][Batch Generate] Thumbnail ${index + 1} failed:`, result)
          return true
        }
      }).length

      console.log('[Thumbnail][Batch Generate] Results', {
        totalRequested: 5,
        successful: thumbnails.length,
        failed: failedCount,
        thumbnails: thumbnails.map((url, i) => `Thumbnail ${i + 1}: ${url.substring(0, 100)}...`)
      })

      if (thumbnails.length === 0) {
        throw new Error('Failed to generate any thumbnails')
      }

      // Final update with all thumbnails
  dispatch({ type: 'SUCCESS_BATCH', thumbnails })

      const successMessage = thumbnails.length === 5 
        ? 'All 5 thumbnails generated successfully!' 
        : `${thumbnails.length} out of 5 thumbnails generated successfully.`

      toast({ 
        title: 'Thumbnails Generated', 
        description: successMessage
      })

      const response: ThumbnailBatchResponse = {
        thumbnails,
        video_id: videoId,
        success: true,
        message: successMessage
      }
      
      return response
    } catch (error: any) {
      const errorMessage = mapAxiosError(
        isAxiosError(error) ? error : (error as any),
        'Failed to generate thumbnails'
      )
      dispatch({ type: 'ERROR', payload: errorMessage })
      toast({ title: 'Failed to generate thumbnails', description: errorMessage })
      throw new Error(errorMessage)
    }
  }, [getAuthHeaders, toast, generateSingleThumbnail])

  const regenerateThumbnails = useCallback(async (videoId: string): Promise<ThumbnailBatchResponse | undefined> => {
    // Use the same logic as generateThumbnails for regeneration
    return generateThumbnails(videoId)
  }, [generateThumbnails])

  const saveThumbnail = useCallback(async (videoId: string, thumbnailUrl: string): Promise<ThumbnailSaveResponse | undefined> => {
    if (!videoId || !thumbnailUrl) {
      const errorMsg = 'Video ID and thumbnail URL are required'
      dispatch({ type: 'ERROR', payload: errorMsg })
      toast({ title: 'Missing Data', description: errorMsg })
      return
    }

    // Validate thumbnail URL format
    if (!thumbnailUrl.startsWith('http')) {
      const errorMsg = 'Invalid thumbnail URL format'
      dispatch({ type: 'ERROR', payload: errorMsg })
      toast({ title: 'Invalid URL', description: errorMsg })
      return
    }

    dispatch({ type: 'INIT_SINGLE' })

    try {
      const headers = getAuthHeaders()
      const url = `/thumbnail-generator/${videoId}/save`
      
      console.log('[Thumbnail][Save] Request Details', {
        url,
        videoId,
        thumbnailUrl: thumbnailUrl,
        thumbnailUrlLength: thumbnailUrl.length,
        hasAuthHeader: !!(headers as any)?.Authorization,
        requestPayload: { thumbnail_url: thumbnailUrl }
      })

      const requestData: ThumbnailSaveRequest = {
        thumbnail_url: thumbnailUrl
      }

      // Ensure headers are properly set
      const requestHeaders = {
        ...headers,
        'Content-Type': 'application/json',
        accept: 'application/json',
      }

      console.log('[Thumbnail][Save] Making API call with data:', {
        url,
        requestData,
        headers: Object.keys(requestHeaders)
      })

      const res = await axiosInstance.post(url, requestData, { headers: requestHeaders })
      
      console.log('[Thumbnail][Save] Response', {
        status: res.status,
        success: res.data?.success,
        message: res.data?.message,
        videoId: res.data?.video_id,
        thumbnailUrl: res.data?.thumbnail_url,
        savedAt: res.data?.saved_at,
        fullResponse: res.data
      })

      if (res.data?.success) {
        toast({ 
          title: 'Thumbnail Saved', 
          description: 'Thumbnail saved successfully.' 
        })
      } else {
        throw new Error(res.data?.message || 'Save operation failed')
      }
      
      return res.data
    } catch (error: any) {
      const errorMessage = mapAxiosError(
        isAxiosError(error) ? error : (error as any),
        'Failed to save thumbnail'
      )
      dispatch({ type: 'ERROR', payload: errorMessage })
      toast({ title: 'Failed to save thumbnail', description: errorMessage })
      throw new Error(errorMessage)
    }
  }, [getAuthHeaders, toast])

  const uploadCustomThumbnail = useCallback(async (videoId: string, file: File): Promise<ThumbnailUploadResponse | undefined> => {
    if (!videoId || !file) {
      const errorMsg = 'Video ID and file are required'
      dispatch({ type: 'ERROR', payload: errorMsg })
      toast({ title: 'Missing Data', description: errorMsg })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Please select a valid image file'
      dispatch({ type: 'ERROR', payload: errorMsg })
      toast({ title: 'Invalid File', description: errorMsg })
      return
    }

  dispatch({ type: 'INIT_SINGLE' })

    try {
      const headers = getAuthHeaders()
      const url = `/thumbnail-generator/${videoId}/upload`
      
      console.log('[Thumbnail][Upload] Request', {
        url,
        videoId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasAuthHeader: !!(headers as any)?.Authorization,
      })

      // Create FormData for multipart upload
      const formData = new FormData()
      formData.append('file', file, file.name)

      // Prepare headers without Content-Type (let axios set it for multipart)
      const uploadHeaders = {
        ...headers,
        accept: 'application/json',
        // Remove Content-Type to let axios set the boundary for multipart
      }
      delete (uploadHeaders as any)['Content-Type']

      const res = await axiosInstance.post(url, formData, { 
        headers: uploadHeaders,
      })
      
      console.log('[Thumbnail][Upload] Response', {
        status: res.status,
        success: res.data?.success,
        message: res.data?.message,
        videoId: res.data?.video_id,
        thumbnailPath: res.data?.thumbnail_path,
        originalFilename: res.data?.original_filename,
        fileSize: res.data?.file_size,
        contentType: res.data?.content_type,
        savedAt: res.data?.saved_at,
      })

      // Add the uploaded thumbnail to the generated thumbnails list
      if (res.data?.thumbnail_path) {
        const thumbnailUrl = `${API_BASE_URL}/${res.data.thumbnail_path}`
        // append to existing list preserving positions of batch-generated items
        dispatch({ type: 'SUCCESS_BATCH', thumbnails: [...(state.generatedThumbnails || []), thumbnailUrl] })
      }

      toast({ 
        title: 'Custom Thumbnail Uploaded', 
        description: `Thumbnail "${file.name}" uploaded successfully.` 
      })
      
      return res.data
    } catch (error: any) {
      const errorMessage = mapAxiosError(
        isAxiosError(error) ? error : (error as any),
        'Failed to upload custom thumbnail'
      )
      dispatch({ type: 'ERROR', payload: errorMessage })
      toast({ title: 'Failed to upload thumbnail', description: errorMessage })
      throw new Error(errorMessage)
    }
  }, [getAuthHeaders, toast])

  const clearThumbnails = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  return {
    isLoading: state.isLoading,
    error: state.error,
    generatedThumbnails: state.generatedThumbnails,
    thumbnailLoadingStates: state.thumbnailLoadingStates,
    generateThumbnails,
    regenerateThumbnails,
    saveThumbnail,
    uploadCustomThumbnail,
    clearThumbnails,
  }
}
