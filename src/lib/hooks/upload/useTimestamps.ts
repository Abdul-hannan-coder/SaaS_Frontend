import { useCallback, useReducer } from 'react'
import axios, { isAxiosError } from 'axios'
import useAuth from '../auth/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { mapAxiosError } from '@/lib/utils/errorUtils'
import { createUploadAxios } from './uploadApi'
import {
  TimestampsGenerateResponse,
  TimestampsSaveRequest,
  TimestampsSaveResponse,
} from './timestampsTypes'
import {
  initialTimestampsState,
  timestampsReducer,
} from './timestampsReducer'

export default function useTimestamps() {
  const { getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const [state, dispatch] = useReducer(timestampsReducer, initialTimestampsState)

  const axiosInstance = createUploadAxios('timestamps')

  const generateTimestamps = useCallback(async (videoId: string): Promise<TimestampsGenerateResponse | undefined> => {
    if (!videoId) {
      const errorMsg = 'Video ID is required'
      dispatch({ type: 'ERROR', payload: errorMsg })
      toast({ title: 'Missing Video ID', description: errorMsg })
      return
    }

    dispatch({ type: 'INIT' })

    try {
      const headers = getAuthHeaders()
      const url = `/timestamps-generator/${videoId}/generate`
      
      console.log('[Timestamps][Generate] Request', { url, videoId, hasAuthHeader: !!(headers as any)?.Authorization })

      const res = await axiosInstance.post(url, '', { headers })
      
      console.log('[Timestamps][Generate] Response', {
        status: res.status,
        keys: Object.keys(res.data || {}),
        timestampsLength: res.data?.generated_timestamps?.length,
        videoId: res.data?.video_id,
        success: res.data?.success,
        message: res.data?.message,
        fullData: res.data,
      })

  const timestamps = res.data?.generated_timestamps || ''
  dispatch({ type: 'SUCCESS_GENERATE', payload: timestamps })

      toast({ 
        title: 'Timestamps Generated', 
        description: 'Timestamps generated successfully.' 
      })
      
      return res.data
    } catch (error: any) {
      const errorMessage = mapAxiosError(
        isAxiosError(error) ? error : (error as any),
        'Failed to generate timestamps'
      )
      dispatch({ type: 'ERROR', payload: errorMessage })
      toast({ title: 'Failed to generate timestamps', description: errorMessage })
      throw new Error(errorMessage)
    }
  }, [getAuthHeaders, toast])

  const saveTimestamps = useCallback(async (videoId: string, timestamps: string): Promise<TimestampsSaveResponse | undefined> => {
    if (!videoId || !timestamps) {
      const errorMsg = 'Video ID and timestamps are required'
      dispatch({ type: 'ERROR', payload: errorMsg })
      toast({ title: 'Missing Data', description: errorMsg })
      return
    }

    dispatch({ type: 'INIT' })

    try {
      const headers = getAuthHeaders()
      const url = `/timestamps-generator/${videoId}/save`
      
      console.log('[Timestamps][Save] Request', {
        url,
        videoId,
        timestampsLength: timestamps.length,
        hasAuthHeader: !!(headers as any)?.Authorization,
      })

      const requestData: TimestampsSaveRequest = {
        timestamps
      }

      const res = await axiosInstance.post(url, requestData, { headers })
      
      console.log('[Timestamps][Save] Response', {
        status: res.status,
        keys: Object.keys(res.data || {}),
        id: res.data?.id,
        timestampsLength: res.data?.timestamps?.length,
        videoId: res.data?.video_id,
        userId: res.data?.user_id,
      })

      toast({ title: 'Timestamps Saved', description: 'Timestamps saved successfully.' })
      
      return res.data
    } catch (error: any) {
      const errorMessage = mapAxiosError(
        isAxiosError(error) ? error : (error as any),
        'Failed to save timestamps'
      )
      dispatch({ type: 'ERROR', payload: errorMessage })
      toast({ title: 'Failed to save timestamps', description: errorMessage })
      throw new Error(errorMessage)
    }
  }, [getAuthHeaders, toast])

  const regenerateTimestamps = useCallback(async (videoId: string): Promise<TimestampsGenerateResponse | undefined> => {
    if (!videoId) {
      const errorMsg = 'Video ID is required'
      dispatch({ type: 'ERROR', payload: errorMsg })
      toast({ title: 'Missing Video ID', description: errorMsg })
      return
    }

    dispatch({ type: 'INIT' })

    try {
      const headers = getAuthHeaders()
      const url = `/timestamps-generator/${videoId}/regenerate`
      
      console.log('[Timestamps][Regenerate] Request', { url, videoId, hasAuthHeader: !!(headers as any)?.Authorization })

      const res = await axiosInstance.post(url, '', { headers })
      
      console.log('[Timestamps][Regenerate] Response', {
        status: res.status,
        keys: Object.keys(res.data || {}),
        timestampsLength: res.data?.generated_timestamps?.length,
        videoId: res.data?.video_id,
        success: res.data?.success,
        message: res.data?.message,
        fullData: res.data,
      })

  const timestamps = res.data?.generated_timestamps || ''
  dispatch({ type: 'SUCCESS_GENERATE', payload: timestamps })

      toast({ 
        title: 'Timestamps Regenerated', 
        description: 'New timestamps generated successfully.' 
      })
      
      return res.data
    } catch (error: any) {
      const errorMessage = mapAxiosError(
        isAxiosError(error) ? error : (error as any),
        'Failed to regenerate timestamps'
      )
      dispatch({ type: 'ERROR', payload: errorMessage })
      toast({ title: 'Failed to regenerate timestamps', description: errorMessage })
      throw new Error(errorMessage)
    }
  }, [getAuthHeaders, toast])

  const clearTimestamps = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  return {
    isLoading: state.isLoading,
    error: state.error,
    generatedTimestamps: state.generatedTimestamps,
    generateTimestamps,
    saveTimestamps,
    regenerateTimestamps,
    clearTimestamps,
  }
}
