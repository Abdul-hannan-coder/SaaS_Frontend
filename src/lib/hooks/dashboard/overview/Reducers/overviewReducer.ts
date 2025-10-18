import type { DashboardOverviewResponse, OverviewState } from '@/types/dashboard/overview'

export const initialOverviewState: OverviewState = {
  data: null,
  isLoading: true,
  error: null,
}

export type OverviewAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: DashboardOverviewResponse }
  | { type: 'FETCH_ERROR'; payload: string }

export function overviewReducer(
  state: OverviewState,
  action: OverviewAction
): OverviewState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, data: action.payload, error: null }
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload }
    default:
      return state
  }
}
