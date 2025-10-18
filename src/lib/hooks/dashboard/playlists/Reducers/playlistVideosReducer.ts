import type { PlaylistVideosResponse } from '../usePlaylistVideos'

export interface PlaylistVideosState {
  isLoading: boolean
  error: string | null
  playlistData: PlaylistVideosResponse | null
}

export const initialPlaylistVideosState: PlaylistVideosState = {
  isLoading: true,
  error: null,
  playlistData: null,
}

export type PlaylistVideosAction =
  | { type: 'INIT' }
  | { type: 'SUCCESS'; payload: PlaylistVideosResponse }
  | { type: 'ERROR'; payload: string }

export function playlistVideosReducer(
  state: PlaylistVideosState,
  action: PlaylistVideosAction
): PlaylistVideosState {
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
