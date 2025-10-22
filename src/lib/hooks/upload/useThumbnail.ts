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
import { initialThumbnailState, thumbnailReducer } from './thumbnailReducer'

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
    console.log('[Thumbnail][Single Mode] Entry point - videoId received:', {
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

    dispatch({ type: 'INIT_SINGLE' })

    try {
      console.log('[Thumbnail][Single Mode] Generating 1 thumbnail for video:', videoId)
      const result = await generateSingleThumbnail(videoId)

      if (!result?.image_url) {
        throw new Error(result?.message || 'Failed to generate thumbnail')
      }

      dispatch({ type: 'SUCCESS_SINGLE', thumbnail: result.image_url })

      toast({ title: 'Thumbnail Generated', description: 'AI generated thumbnail successfully.' })

      const response: ThumbnailBatchResponse = {
        thumbnails: [result.image_url],
        video_id: videoId,
        success: true,
        message: 'Generated 1 thumbnail successfully.'
      }
      return response
    } catch (error: any) {
      const errorMessage = mapAxiosError(
        isAxiosError(error) ? error : (error as any),
        'Failed to generate thumbnail'
      )
      dispatch({ type: 'ERROR', payload: errorMessage })
      toast({ title: 'Failed to generate thumbnail', description: errorMessage })
      throw new Error(errorMessage)
    }
  }, [toast, generateSingleThumbnail])

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

      // Set the uploaded thumbnail as the single generated thumbnail
      if (res.data?.thumbnail_path) {
        const thumbnailUrl = `${API_BASE_URL}/${res.data.thumbnail_path}`
        dispatch({ type: 'SUCCESS_SINGLE', thumbnail: thumbnailUrl })
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
    generateThumbnails,
    regenerateThumbnails,
    saveThumbnail,
    uploadCustomThumbnail,
    clearThumbnails,
  }
}
