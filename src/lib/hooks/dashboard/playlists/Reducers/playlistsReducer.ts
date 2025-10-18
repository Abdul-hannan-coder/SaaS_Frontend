import type { Playlist } from '@/types/dashboard/playlists'

export interface PlaylistsState {
  isLoading: boolean
  error: string | null
  playlists: Playlist[]
}

export const initialPlaylistsState: PlaylistsState = {
  isLoading: true,
  error: null,
  playlists: [],
}

export type PlaylistsAction =
  | { type: 'INIT' }
  | { type: 'SUCCESS'; payload: Playlist[] }
  | { type: 'ERROR'; payload: string }
  | { type: 'CLEAR' }

export function playlistsReducer(
  state: PlaylistsState,
  action: PlaylistsAction
): PlaylistsState {
  switch (action.type) {
    case 'INIT':
      return { ...state, isLoading: true, error: null }
    case 'SUCCESS':
      return { ...state, isLoading: false, playlists: action.payload }
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload }
    case 'CLEAR':
      return { ...initialPlaylistsState, isLoading: false }
    default:
      return state
  }
}
