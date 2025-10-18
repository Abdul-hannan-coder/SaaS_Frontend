import { useCallback, useReducer } from 'react'
import axios from 'axios'
import useAuth from '../auth/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { createUploadAxios } from './uploadApi'
import { API_BASE_URL } from '@/lib/config/appConfig'
import { mapAxiosError } from '@/lib/utils/errorUtils'
import type { AllInOneProcessResponse, AllInOneSaveRequest, AllInOneSaveResponse } from './allInOneTypes'
import { allInOneReducer, initialAllInOneState } from './allInOneReducer'

export default function useAllInOne() {
  const { getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const [state, dispatch] = useReducer(allInOneReducer, initialAllInOneState)

  const axiosInstance = createUploadAxios('[AllInOne]')

  const processAllInOne = useCallback(async (videoId: string): Promise<AllInOneProcessResponse | undefined> => {
    if (!videoId) {
      const errorMsg = 'Video ID is required'
      dispatch({ type: 'SET_ERROR', payload: errorMsg })
      toast({ title: 'Missing Video ID', description: errorMsg, variant: 'destructive' })
      return
    }

    dispatch({ type: 'PROCESS_START' })

    try {
      const headers = getAuthHeaders()
      const url = `/all-in-one/${videoId}/process`
      
      console.log('[AllInOne][Process] Request', {
        url: `${API_BASE_URL}${url}`,
        videoId,
        hasAuthHeader: !!(headers as any)?.Authorization,
      })

      const res = await axiosInstance.post(url, '', { headers })
      
      console.log('[AllInOne][Process] Response', {
        status: res.status,
        success: res.data?.success,
        message: res.data?.message,
        totalTasks: res.data?.total_tasks,
        completedTasks: res.data?.completed_tasks,
        failedTasks: res.data?.failed_tasks,
        processingTime: res.data?.processing_time_seconds,
      })

  dispatch({ type: 'PROCESS_SUCCESS', payload: res.data })

      toast({ 
        title: 'Processing Complete', 
        description: res.data?.message || 'All content generated successfully!'
      })
      
      return res.data
    } catch (error: any) {
      let errorMessage = mapAxiosError(error, 'Failed to process video with AI')
      if (!axios.isAxiosError(error)) console.error('[AllInOne][Process] Error (non-axios)', error)
      
      dispatch({ type: 'PROCESS_ERROR', payload: errorMessage })
      toast({ 
        title: 'Failed to process video', 
        description: errorMessage,
        variant: 'destructive'
      })
      
      throw new Error(errorMessage)
    } finally {
      dispatch({ type: 'PROCESS_END' })
    }
  }, [getAuthHeaders, toast])

  const saveAllInOne = useCallback(async (videoId: string, data: AllInOneSaveRequest): Promise<AllInOneSaveResponse | undefined> => {
    if (!videoId) {
      const errorMsg = 'Video ID is required'
      dispatch({ type: 'SET_ERROR', payload: errorMsg })
      toast({ title: 'Missing Video ID', description: errorMsg, variant: 'destructive' })
      return
    }

    if (!data.selected_title || !data.selected_thumbnail_url || !data.description) {
      const errorMsg = 'Please select a title, thumbnail, and ensure description is present'
      dispatch({ type: 'SET_ERROR', payload: errorMsg })
      toast({ title: 'Missing Required Fields', description: errorMsg, variant: 'destructive' })
      return
    }

    dispatch({ type: 'SAVE_START' })

    try {
      const headers = getAuthHeaders()
      const url = `/all-in-one/${videoId}/save-content`
      
      console.log('[AllInOne][Save] Request', {
        url: `${API_BASE_URL}${url}`,
        videoId,
        hasAuthHeader: !!(headers as any)?.Authorization,
        data: {
          ...data,
          selected_title: data.selected_title.substring(0, 50) + '...',
          selected_thumbnail_url: data.selected_thumbnail_url.substring(0, 50) + '...',
          description: data.description.substring(0, 100) + '...',
        }
      })

      const res = await axiosInstance.post(url, data, { 
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        }
      })
      
      console.log('[AllInOne][Save] Response', {
        status: res.status,
        success: res.data?.success,
        message: res.data?.message,
        videoId: res.data?.video_id,
        savedAt: res.data?.saved_at,
      })

      toast({ 
        title: 'Content Saved', 
        description: res.data?.message || 'All content saved successfully!'
      })
      
      return res.data
    } catch (error: any) {
      let errorMessage = mapAxiosError(error, 'Failed to save content')
      if (!axios.isAxiosError(error)) console.error('[AllInOne][Save] Error (non-axios)', error)
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast({ 
        title: 'Failed to save content', 
        description: errorMessage,
        variant: 'destructive'
      })
      
      throw new Error(errorMessage)
    } finally {
      dispatch({ type: 'SAVE_END' })
    }
  }, [getAuthHeaders, toast])

  const clearData = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  return {
    isProcessing: state.isProcessing,
    isSaving: state.isSaving,
    error: state.error,
    processedData: state.processedData,
    processAllInOne,
    saveAllInOne,
    clearData,
  }
}
