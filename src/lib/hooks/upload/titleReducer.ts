// This file has been removed as it is no longer needed.
import { TitleState } from './titleTypes'

export const initialTitleState: TitleState = {
  isLoading: false,
  error: null,
  generatedTitles: [],
}

export type TitleAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TITLES'; payload: string[] }
  | { type: 'CLEAR' }

export function titleReducer(state: TitleState, action: TitleAction): TitleState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_TITLES':
      return { ...state, generatedTitles: action.payload }
    case 'CLEAR':
      return { ...state, generatedTitles: [], error: null }
    default:
      return state
  }
}
