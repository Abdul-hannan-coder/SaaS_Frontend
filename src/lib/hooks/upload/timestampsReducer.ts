// This file has been removed as it is no longer needed.
import { TimestampsGenerateResponse, TimestampsSaveRequest, TimestampsSaveResponse } from './timestampsTypes'

export interface TimestampsState {
  isLoading: boolean
  error: string | null
  generatedTimestamps: string
}

export const initialTimestampsState: TimestampsState = {
  isLoading: false,
  error: null,
  generatedTimestamps: '',
}

export type TimestampsAction =
  | { type: 'INIT' }
  | { type: 'SUCCESS_GENERATE'; payload: string }
  | { type: 'SUCCESS_SAVE' }
  | { type: 'ERROR'; payload: string }
  | { type: 'CLEAR' }

export function timestampsReducer(
  state: TimestampsState,
  action: TimestampsAction
): TimestampsState {
  switch (action.type) {
    case 'INIT':
      return { ...state, isLoading: true, error: null }
    case 'SUCCESS_GENERATE':
      return { ...state, isLoading: false, generatedTimestamps: action.payload }
    case 'SUCCESS_SAVE':
      return { ...state, isLoading: false }
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload }
    case 'CLEAR':
      return { ...initialTimestampsState }
    default:
      return state
  }
}
