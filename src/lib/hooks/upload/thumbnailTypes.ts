// This file has been removed as it is no longer needed.
export interface ThumbnailGenerateResponse {
  success: boolean
  message: string
  video_id: string
  image_url: string
  width: number
  height: number
}

export interface ThumbnailBatchResponse {
  thumbnails: string[]
  video_id: string
  success: boolean
  message: string
}

export interface ThumbnailSaveRequest {
  thumbnail_url: string
}

export interface ThumbnailSaveResponse {
  success: boolean
  message: string
  video_id: string
  thumbnail_url: string
  saved_at: string
}

export interface ThumbnailUploadResponse {
  success: boolean
  message: string
  video_id: string
  thumbnail_path: string
  original_filename: string
  file_size: number
  content_type: string
  saved_at: string
}
