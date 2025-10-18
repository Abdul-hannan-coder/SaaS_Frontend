export interface PlaylistDetailsResponse {
  success: boolean
  message: string
  data: any
}

export interface PlaylistAnalyticsState {
  isLoading: boolean
  error: string | null
  playlistData: PlaylistDetailsResponse | null
}

export const initialPlaylistAnalyticsState: PlaylistAnalyticsState = {
  isLoading: true,
  error: null,
  playlistData: null,
}

export type PlaylistAnalyticsAction =
  | { type: 'INIT' }
  | { type: 'SUCCESS'; payload: PlaylistDetailsResponse }
  | { type: 'ERROR'; payload: string }

export function playlistAnalyticsReducer(
  state: PlaylistAnalyticsState,
  action: PlaylistAnalyticsAction
): PlaylistAnalyticsState {
  switch (action.type) {
    case 'INIT':
      return { ...state, isLoading: true, error: null }
    case 'SUCCESS':
      return { ...state, isLoading: false, playlistData: action.payload }
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload }
    default:
      return state
  }
}
