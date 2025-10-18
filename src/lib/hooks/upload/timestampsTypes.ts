// This file has been removed as it is no longer needed.
export interface TimestampsGenerateResponse {
  video_id: string
  generated_timestamps: string
  success: boolean
  message: string
}

export interface TimestampsSaveRequest {
  timestamps: string
}

export interface TimestampsSaveResponse {
  id: number
  timestamps: string
  video_id: string
  user_id: string
  created_at: string
  updated_at: string
}
