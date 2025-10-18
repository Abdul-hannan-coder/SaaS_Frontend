import type { DashboardVideosResponse } from '@/types/dashboard/videos'
import { VIDEOS_PER_PAGE, VideosState } from '@/types/dashboard/videos'

export const initialVideosState: VideosState = {
  data: null,
  allVideos: [],
  displayedVideos: [],
  isLoading: true,
  isLoadingMore: false,
  error: null,
  hasMore: true,
  currentPage: 1,
}

export type VideosAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { mappedVideos: any[]; response: DashboardVideosResponse } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'LOAD_MORE_START' }
  | { type: 'LOAD_MORE_SUCCESS'; payload: { moreVideos: any[] } }
  | { type: 'LOAD_MORE_END' }
  | { type: 'SET_HAS_MORE'; payload: boolean }
  | { type: 'REFRESH_START' }

export function videosReducer(state: VideosState, action: VideosAction): VideosState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null, currentPage: 1 }
    case 'FETCH_SUCCESS': {
      const { mappedVideos, response } = action.payload
      const initialVideos = mappedVideos.slice(0, VIDEOS_PER_PAGE)
      return {
        ...state,
        data: response,
        allVideos: mappedVideos,
        displayedVideos: initialVideos,
        hasMore: mappedVideos.length > VIDEOS_PER_PAGE,
        isLoading: false,
        error: null,
        currentPage: 1,
      }
    }
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload }
    case 'LOAD_MORE_START':
      return { ...state, isLoadingMore: true }
    case 'LOAD_MORE_SUCCESS': {
      const nextPage = state.currentPage + 1
      const displayedVideos = [...state.displayedVideos, ...action.payload.moreVideos]
      const hasMore = state.allVideos.length > displayedVideos.length
      return { ...state, displayedVideos, currentPage: nextPage, hasMore }
    }
    case 'LOAD_MORE_END':
      return { ...state, isLoadingMore: false }
    case 'SET_HAS_MORE':
      return { ...state, hasMore: action.payload }
    case 'REFRESH_START':
      return { ...state, currentPage: 1 }
    default:
      return state
  }
}
