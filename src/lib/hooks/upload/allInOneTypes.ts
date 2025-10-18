// This file has been removed as it is no longer needed.
export interface AllInOneTimestamp {
  time: string
  title: string
}

export interface AllInOneThumbnail {
  thumbnail_id: number
  image_url: string
  success: boolean
}

export interface AllInOneProcessResponse {
  success: boolean
  message: string
  video_id: string
  total_tasks: number
  completed_tasks: number
  failed_tasks: number
  results: {
    titles: {
      success: boolean
      message: string
      generated_titles: string[]
      error: string | null
    }
    description: {
      success: boolean
      message: string
      generated_description: string
      error: string | null
    }
    timestamps: {
      success: boolean
      message: string
      generated_timestamps: AllInOneTimestamp[]
      error: string | null
    }
    thumbnails: {
      success: boolean
      message: string
      generated_thumbnails: AllInOneThumbnail[]
      error: string | null
    }
  }
  processing_time_seconds: number
  errors: string[]
}

export interface AllInOneSaveRequest {
  selected_title: string
  selected_thumbnail_url: string
  description: string
  timestamps: AllInOneTimestamp[]
  privacy_status?: string
  playlist_name?: string
  schedule_datetime?: string
}

export interface AllInOneSaveResponse {
  success: boolean
  message: string
  video_id: string
  saved_at: string
}

export interface AllInOneState {
  isProcessing: boolean
  isSaving: boolean
  error: string | null
  processedData: AllInOneProcessResponse | null
}
