// This file has been removed as it is no longer needed.
export interface DescriptionGenerateResponse {
  video_id: string
  generated_description: string
  success: boolean
  message: string
}

export interface DescriptionSaveRequest {
  description: string
}

export interface DescriptionSaveResponse {
  id: number
  description: string
  video_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface DescriptionRegenerateWithTemplateRequest {
  custom_template: string
}
