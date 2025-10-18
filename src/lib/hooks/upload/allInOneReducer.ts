// This file has been removed as it is no longer needed.
import { AllInOneProcessResponse, AllInOneState } from './allInOneTypes'

export const initialAllInOneState: AllInOneState = {
  isProcessing: false,
  isSaving: false,
  error: null,
  processedData: null,
}

export type AllInOneAction =
  | { type: 'PROCESS_START' }
  | { type: 'PROCESS_SUCCESS'; payload: AllInOneProcessResponse }
  | { type: 'PROCESS_ERROR'; payload: string }
  | { type: 'PROCESS_END' }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_END' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR' }

export function allInOneReducer(
  state: AllInOneState,
  action: AllInOneAction
): AllInOneState {
  switch (action.type) {
    case 'PROCESS_START':
      return { ...state, isProcessing: true, error: null }
    case 'PROCESS_SUCCESS':
      return { ...state, processedData: action.payload }
    case 'PROCESS_ERROR':
      return { ...state, error: action.payload }
    case 'PROCESS_END':
      return { ...state, isProcessing: false }
    case 'SAVE_START':
      return { ...state, isSaving: true, error: null }
    case 'SAVE_END':
      return { ...state, isSaving: false }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'CLEAR':
      return { ...state, processedData: null, error: null }
    default:
      return state
  }
}
