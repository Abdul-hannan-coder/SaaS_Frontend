import type { ChannelPlaylist } from '../useChannelPlaylists'

export interface ChannelPlaylistsState {
  isLoading: boolean
  error: string | null
  playlists: ChannelPlaylist[]
}

export const initialChannelPlaylistsState: ChannelPlaylistsState = {
  isLoading: false,
  error: null,
  playlists: [],
}

export type ChannelPlaylistsAction =
  | { type: 'INIT' }
  | { type: 'SUCCESS'; payload: ChannelPlaylist[] }
  | { type: 'ERROR'; payload: string }

export function channelPlaylistsReducer(
  state: ChannelPlaylistsState,
  action: ChannelPlaylistsAction
): ChannelPlaylistsState {
  switch (action.type) {
    case 'INIT':
      return { ...state, isLoading: true, error: null }
    case 'SUCCESS':
      return { ...state, isLoading: false, playlists: action.payload }
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload }
    default:
      return state
  }
}
