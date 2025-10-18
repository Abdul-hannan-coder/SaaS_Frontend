// This file has been removed as it is no longer needed.
import { DescriptionGenerateResponse, DescriptionSaveRequest, DescriptionSaveResponse, DescriptionRegenerateWithTemplateRequest } from './descriptionTypes'

export interface DescriptionState {
  isLoading: boolean
  error: string | null
  generatedDescription: string
}

export const initialDescriptionState: DescriptionState = {
  isLoading: false,
  error: null,
  generatedDescription: '',
}

export type DescriptionAction =
  | { type: 'INIT' }
  | { type: 'SUCCESS_GENERATE'; payload: string }
  | { type: 'SUCCESS_SAVE' }
  | { type: 'ERROR'; payload: string }
  | { type: 'CLEAR' }

export function descriptionReducer(
  state: DescriptionState,
  action: DescriptionAction
): DescriptionState {
  switch (action.type) {
    case 'INIT':
      return { ...state, isLoading: true, error: null }
    case 'SUCCESS_GENERATE':
      return { ...state, isLoading: false, generatedDescription: action.payload }
    case 'SUCCESS_SAVE':
      return { ...state, isLoading: false }
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload }
    case 'CLEAR':
      return { ...initialDescriptionState }
    default:
      return state
  }
}
