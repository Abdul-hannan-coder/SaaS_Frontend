export interface ThumbnailState {
  isLoading: boolean
  error: string | null
  // Keep array shape for compatibility, but we only ever store one URL
  generatedThumbnails: string[]
}

export const initialThumbnailState: ThumbnailState = {
  isLoading: false,
  error: null,
  generatedThumbnails: [],
}

export type ThumbnailAction =
  | { type: 'INIT_SINGLE' }
  | { type: 'SUCCESS_SINGLE'; thumbnail: string }
  | { type: 'SUCCESS_SAVE' }
  | { type: 'ERROR'; payload: string }
  | { type: 'CLEAR' }

export function thumbnailReducer(
  state: ThumbnailState,
  action: ThumbnailAction
): ThumbnailState {
  switch (action.type) {
    case 'INIT_SINGLE':
      return { ...state, isLoading: true, error: null, generatedThumbnails: [] }
    case 'SUCCESS_SINGLE':
      return { ...state, isLoading: false, generatedThumbnails: [action.thumbnail] }
    case 'SUCCESS_SAVE':
      return { ...state, isLoading: false }
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload }
    case 'CLEAR':
      return { ...initialThumbnailState }
    default:
      return state
  }
}
