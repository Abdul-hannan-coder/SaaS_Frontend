import { useCallback, useReducer } from 'react'
import axios from 'axios'
import useAuth from '../auth/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { createUploadAxios } from './uploadApi'
import { API_BASE_URL } from '@/lib/config/appConfig'
import { mapAxiosError } from '@/lib/utils/errorUtils'
import type { TitleGenerateResponse, TitleSaveRequest, TitleSaveResponse, TitleRegenerateRequest } from './titleTypes'
import { titleReducer, initialTitleState } from './titleReducer'

export default function useTitle() {
  const { getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const [state, dispatch] = useReducer(titleReducer, initialTitleState)

  const axiosInstance = createUploadAxios('[Title]')

  const generateTitles = useCallback(async (videoId: string): Promise<TitleGenerateResponse | undefined> => {
    if (!videoId) {
      const errorMsg = 'Video ID is required'
      dispatch({ type: 'SET_ERROR', payload: errorMsg })
      toast({ title: 'Missing Video ID', description: errorMsg })
      return
    }

    if (!API_BASE_URL) {
      const errorMsg = 'API configuration error. Please check your environment settings.'
      dispatch({ type: 'SET_ERROR', payload: errorMsg })
      toast({ title: 'Configuration Error', description: errorMsg })
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const headers = getAuthHeaders()
      const url = `/title-generator/${videoId}/generate`
      
      console.log('[Title][Generate] Request', {
        url: `${API_BASE_URL}${url}`,
        videoId,
        hasAuthHeader: !!(headers as any)?.Authorization,
        headers: { ...headers, Authorization: (headers as any)?.Authorization ? 'Bearer ***' : undefined },
      })

  const res = await axiosInstance.post(url, '', { headers })
      
      console.log('[Title][Generate] Response', {
        status: res.status,
        keys: Object.keys(res.data || {}),
        titlesCount: res.data?.generated_titles?.length,
        videoId: res.data?.video_id,
        success: res.data?.success,
        message: res.data?.message,
        fullData: res.data,
      })

    const titles = res.data?.generated_titles || []
    dispatch({ type: 'SET_TITLES', payload: titles })

      toast({ 
        title: 'Titles Generated', 
        description: `Generated ${titles.length} titles successfully.` 
      })
      
      return res.data
    } catch (error: any) {
      console.error('[Title][Generate] Error:', error)
      const errorMessage = mapAxiosError(error, 'Failed to generate titles')
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast({ title: 'Failed to generate titles', description: errorMessage })
      throw new Error(errorMessage)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [getAuthHeaders, toast])

  const saveTitle = useCallback(async (videoId: string, title: string): Promise<TitleSaveResponse | undefined> => {
    if (!videoId || !title) {
      const errorMsg = 'Video ID and title are required'
      dispatch({ type: 'SET_ERROR', payload: errorMsg })
      toast({ title: 'Missing Data', description: errorMsg })
      return
    }

    if (!API_BASE_URL) {
      const errorMsg = 'API configuration error. Please check your environment settings.'
      dispatch({ type: 'SET_ERROR', payload: errorMsg })
      toast({ title: 'Configuration Error', description: errorMsg })
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const headers = getAuthHeaders()
      const url = `/title-generator/${videoId}/save`

      console.log('[Title][Save] Request', {
        url: `${API_BASE_URL}${url}`,
        videoId,
        titleLength: title.length,
        hasAuthHeader: !!(headers as any)?.Authorization,
        headers: { ...headers, Authorization: (headers as any)?.Authorization ? 'Bearer ***' : undefined },
      })

      const requestData: TitleSaveRequest = { title }
      const res = await axiosInstance.post(url, requestData, { headers })

      console.log('[Title][Save] Response', {
        status: res.status,
        keys: Object.keys(res.data || {}),
        id: res.data?.id,
        title: res.data?.title,
        videoId: res.data?.video_id,
        userId: res.data?.user_id,
      })

      toast({ title: 'Title Saved', description: 'Title saved successfully.' })
      return res.data
    } catch (error: any) {
      console.error('[Title][Save] Error:', error)
      const errorMessage = mapAxiosError(error, 'Failed to save title')
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast({ title: 'Failed to save title', description: errorMessage })
      throw new Error(errorMessage)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [getAuthHeaders, toast])

  const regenerateTitlesWithRequirements = useCallback(async (
    videoId: string, 
    userRequirements: string
  ): Promise<TitleGenerateResponse | undefined> => {
    if (!videoId || !userRequirements) {
      const errorMsg = 'Video ID and requirements are required'
      dispatch({ type: 'SET_ERROR', payload: errorMsg })
      toast({ title: 'Missing Data', description: errorMsg })
      return
    }

    if (!API_BASE_URL) {
      const errorMsg = 'API configuration error. Please check your environment settings.'
      dispatch({ type: 'SET_ERROR', payload: errorMsg })
      toast({ title: 'Configuration Error', description: errorMsg })
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const headers = getAuthHeaders()
      const url = `/title-generator/${videoId}/regenerate-with-requirements`
      
      console.log('[Title][Regenerate] Request', {
        url: `${API_BASE_URL}${url}`,
        videoId,
        requirementsLength: userRequirements.length,
        hasAuthHeader: !!(headers as any)?.Authorization,
        headers: { ...headers, Authorization: (headers as any)?.Authorization ? 'Bearer ***' : undefined },
      })

      const requestData: TitleRegenerateRequest = {
        user_requirements: userRequirements
      }

      const res = await axiosInstance.post(url, requestData, { headers })
      
      console.log('[Title][Regenerate] Response', {
        status: res.status,
        keys: Object.keys(res.data || {}),
        titlesCount: res.data?.generated_titles?.length,
        videoId: res.data?.video_id,
        success: res.data?.success,
        message: res.data?.message,
        fullData: res.data,
      })

  const titles = res.data?.generated_titles || []
  dispatch({ type: 'SET_TITLES', payload: titles })

      toast({ 
        title: 'Titles Regenerated', 
        description: `Generated ${titles.length} new titles based on your requirements.` 
      })
      
      return res.data
    } catch (error: any) {
      console.error('[Title][Regenerate] Error:', error)
      const errorMessage = mapAxiosError(error, 'Failed to regenerate titles')
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast({ 
        title: 'Failed to regenerate titles', 
        description: errorMessage 
      })
      
      throw new Error(errorMessage)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [getAuthHeaders, toast])

  const clearTitles = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  return {
    isLoading: state.isLoading,
    error: state.error,
    generatedTitles: state.generatedTitles,
    generateTitles,
    saveTitle,
    regenerateTitlesWithRequirements,
    clearTitles,
  }
}
