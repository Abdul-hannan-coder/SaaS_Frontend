// This file has been removed as it is no longer needed.
import { ThumbnailGenerateResponse, ThumbnailBatchResponse, ThumbnailSaveRequest, ThumbnailSaveResponse, ThumbnailUploadResponse } from './thumbnailTypes'

export interface ThumbnailState {
  isLoading: boolean
  error: string | null
  generatedThumbnails: string[]
  thumbnailLoadingStates: boolean[]
}

export const initialThumbnailState: ThumbnailState = {
  isLoading: false,
  error: null,
  generatedThumbnails: [],
  thumbnailLoadingStates: [false, false, false, false, false],
}

export type ThumbnailAction =
  | { type: 'INIT_BATCH' }
  | { type: 'INIT_SINGLE' }
  | { type: 'SET_ITEM_DONE'; index: number }
  | { type: 'ADD_OR_SET_THUMBNAIL'; index: number; url: string }
  | { type: 'SUCCESS_BATCH'; thumbnails: string[] }
  | { type: 'SUCCESS_SAVE' }
  | { type: 'ERROR'; payload: string }
  | { type: 'CLEAR' }

export function thumbnailReducer(
  state: ThumbnailState,
  action: ThumbnailAction
): ThumbnailState {
  switch (action.type) {
    case 'INIT_BATCH':
      return {
        ...state,
        isLoading: true,
        error: null,
        generatedThumbnails: [],
        thumbnailLoadingStates: [true, true, true, true, true],
      }
    case 'INIT_SINGLE':
      return { ...state, isLoading: true, error: null }
    case 'SET_ITEM_DONE': {
      const next = [...state.thumbnailLoadingStates]
      if (action.index >= 0 && action.index < next.length) next[action.index] = false
      return { ...state, thumbnailLoadingStates: next }
    }
    case 'ADD_OR_SET_THUMBNAIL': {
      const next = [...state.generatedThumbnails]
      next[action.index] = action.url
      return { ...state, generatedThumbnails: next }
    }
    case 'SUCCESS_BATCH':
      return {
        ...state,
        isLoading: false,
        generatedThumbnails: action.thumbnails,
        thumbnailLoadingStates: [false, false, false, false, false],
      }
    case 'SUCCESS_SAVE':
      return { ...state, isLoading: false }
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload, thumbnailLoadingStates: [false, false, false, false, false] }
    case 'CLEAR':
      return { ...initialThumbnailState }
    default:
      return state
  }
}
