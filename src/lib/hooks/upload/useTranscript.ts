import { useCallback, useReducer } from 'react'
import axios, { isAxiosError } from 'axios'
import useAuth from '../auth/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { mapAxiosError } from '@/lib/utils/errorUtils'
import { createUploadAxios } from './uploadApi'
import {
  DescriptionGenerateResponse,
  DescriptionSaveRequest,
  DescriptionSaveResponse,
  DescriptionRegenerateWithTemplateRequest,
} from './descriptionTypes'
import {
  descriptionReducer,
  initialDescriptionState,
} from './descriptionReducer'

export default function useTranscript() {
  const { getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const [state, dispatch] = useReducer(descriptionReducer, initialDescriptionState)

  const axiosInstance = createUploadAxios('description')

  const generateDescription = useCallback(async (videoId: string): Promise<DescriptionGenerateResponse | undefined> => {
    if (!videoId) {
      const errorMsg = 'Video ID is required'
      dispatch({ type: 'ERROR', payload: errorMsg })
      toast({ title: 'Missing Video ID', description: errorMsg })
      return
    }

    dispatch({ type: 'INIT' })

    try {
      const headers = getAuthHeaders()
      const url = `/description-generator/${videoId}/generate`
      
      console.log('[Description][Generate] Request', {
        url,
        videoId,
        hasAuthHeader: !!(headers as any)?.Authorization,
      })

      const res = await axiosInstance.post(url, '', { headers })
      
      console.log('[Description][Generate] Response', {
        status: res.status,
        keys: Object.keys(res.data || {}),
        descriptionLength: res.data?.generated_description?.length,
        videoId: res.data?.video_id,
        success: res.data?.success,
        message: res.data?.message,
        fullData: res.data,
      })

  const description = res.data?.generated_description || ''
  dispatch({ type: 'SUCCESS_GENERATE', payload: description })

      toast({ 
        title: 'Description Generated', 
        description: 'Description generated successfully.' 
      })
      
      return res.data
    } catch (error: any) {
      const errorMessage = mapAxiosError(
        isAxiosError(error) ? error : (error as any),
        'Failed to generate description'
      )
      dispatch({ type: 'ERROR', payload: errorMessage })
      toast({ title: 'Failed to generate description', description: errorMessage })
      throw new Error(errorMessage)
    }
  }, [getAuthHeaders, toast])

  const saveDescription = useCallback(async (videoId: string, description: string): Promise<DescriptionSaveResponse | undefined> => {
    if (!videoId || !description) {
      const errorMsg = 'Video ID and description are required'
      dispatch({ type: 'ERROR', payload: errorMsg })
      toast({ title: 'Missing Data', description: errorMsg })
      return
    }

    dispatch({ type: 'INIT' })

    try {
      const headers = getAuthHeaders()
      const url = `/description-generator/${videoId}/save`
      
      console.log('[Description][Save] Request', {
        url,
        videoId,
        descriptionLength: description.length,
        hasAuthHeader: !!(headers as any)?.Authorization,
      })

      const requestData: DescriptionSaveRequest = {
        description
      }

      const res = await axiosInstance.post(url, requestData, { headers })
      
      console.log('[Description][Save] Response', {
        status: res.status,
        keys: Object.keys(res.data || {}),
        id: res.data?.id,
        descriptionLength: res.data?.description?.length,
        videoId: res.data?.video_id,
        userId: res.data?.user_id,
      })

      toast({ title: 'Description Saved', description: 'Description saved successfully.' })
      
      return res.data
    } catch (error: any) {
      const errorMessage = mapAxiosError(
        isAxiosError(error) ? error : (error as any),
        'Failed to save description'
      )
      dispatch({ type: 'ERROR', payload: errorMessage })
      toast({ title: 'Failed to save description', description: errorMessage })
      throw new Error(errorMessage)
    }
  }, [getAuthHeaders, toast])

  const regenerateDescription = useCallback(async (videoId: string): Promise<DescriptionGenerateResponse | undefined> => {
    if (!videoId) {
      const errorMsg = 'Video ID is required'
      dispatch({ type: 'ERROR', payload: errorMsg })
      toast({ title: 'Missing Video ID', description: errorMsg })
      return
    }

    dispatch({ type: 'INIT' })

    try {
      const headers = getAuthHeaders()
      const url = `/description-generator/${videoId}/regenerate`
      
      console.log('[Description][Regenerate] Request', {
        url,
        videoId,
        hasAuthHeader: !!(headers as any)?.Authorization,
      })

      const res = await axiosInstance.post(url, '', { headers })
      
      console.log('[Description][Regenerate] Response', {
        status: res.status,
        keys: Object.keys(res.data || {}),
        descriptionLength: res.data?.generated_description?.length,
        videoId: res.data?.video_id,
        success: res.data?.success,
        message: res.data?.message,
        fullData: res.data,
      })

  const description = res.data?.generated_description || ''
  dispatch({ type: 'SUCCESS_GENERATE', payload: description })

      toast({ 
        title: 'Description Regenerated', 
        description: 'New description generated successfully.' 
      })
      
      return res.data
    } catch (error: any) {
      const errorMessage = mapAxiosError(
        isAxiosError(error) ? error : (error as any),
        'Failed to regenerate description'
      )
      dispatch({ type: 'ERROR', payload: errorMessage })
      toast({ title: 'Failed to regenerate description', description: errorMessage })
      throw new Error(errorMessage)
    }
  }, [getAuthHeaders, toast])

  const regenerateDescriptionWithTemplate = useCallback(async (
    videoId: string, 
    customTemplate: string
  ): Promise<DescriptionGenerateResponse | undefined> => {
    if (!videoId || !customTemplate) {
      const errorMsg = 'Video ID and custom template are required'
      dispatch({ type: 'ERROR', payload: errorMsg })
      toast({ title: 'Missing Data', description: errorMsg })
      return
    }

    dispatch({ type: 'INIT' })

    try {
      const headers = getAuthHeaders()
      const url = `/description-generator/${videoId}/regenerate-with-template`
      
      console.log('[Description][Regenerate Template] Request', {
        url,
        videoId,
        templateLength: customTemplate.length,
        hasAuthHeader: !!(headers as any)?.Authorization,
      })

      const requestData: DescriptionRegenerateWithTemplateRequest = {
        custom_template: customTemplate
      }

      const res = await axiosInstance.post(url, requestData, { headers })
      
      console.log('[Description][Regenerate Template] Response', {
        status: res.status,
        keys: Object.keys(res.data || {}),
        descriptionLength: res.data?.generated_description?.length,
        videoId: res.data?.video_id,
        success: res.data?.success,
        message: res.data?.message,
        fullData: res.data,
      })

  const description = res.data?.generated_description || ''
  dispatch({ type: 'SUCCESS_GENERATE', payload: description })

      toast({ 
        title: 'Description Regenerated with Template', 
        description: 'New description generated using your custom template.' 
      })
      
      return res.data
    } catch (error: any) {
      const errorMessage = mapAxiosError(
        isAxiosError(error) ? error : (error as any),
        'Failed to regenerate description with template'
      )
      dispatch({ type: 'ERROR', payload: errorMessage })
      toast({ title: 'Failed to regenerate with template', description: errorMessage })
      throw new Error(errorMessage)
    }
  }, [getAuthHeaders, toast])

  const clearDescription = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  return {
    isLoading: state.isLoading,
    error: state.error,
    generatedDescription: state.generatedDescription,
    generateDescription,
    saveDescription,
    regenerateDescription,
    regenerateDescriptionWithTemplate,
    clearDescription,
  }
}
