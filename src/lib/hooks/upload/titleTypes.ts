// This file has been removed as it is no longer needed.
export interface TitleGenerateResponse {
  video_id: string
  generated_titles: string[]
  success: boolean
  message: string
}

export interface TitleSaveRequest { title: string }

export interface TitleSaveResponse {
  id: number
  title: string
  video_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface TitleRegenerateRequest { user_requirements: string }

export interface TitleState {
  isLoading: boolean
  error: string | null
  generatedTitles: string[]
}
