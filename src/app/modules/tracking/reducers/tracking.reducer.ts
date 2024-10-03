import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Loadable } from '@global/interfaces/loadable.interface';
import { RolloutTrackingItemVM } from '@global/interfaces/tracking/rollout-tracking-item.vm';
import { TrackingDetailsVM } from '@global/interfaces/tracking/tracking-details.vm';
import { TrackingItemVM } from '@global/interfaces/tracking/tracking-item.vm';
import { createReducer, on } from '@ngrx/store';
import * as TrackingActions from '../actions/tracking.actions';

export const trackingKey = 'tracking';

export interface State {
  items: Loadable<(TrackingItemVM | RolloutTrackingItemVM)[]>;
  trackingDetails?: Loadable<TrackingDetailsVM>;
  selectedItemId: string;
  keyword?: string;
}

export const initialState: State = {
  items: {
    data: [],
    isLoading: false,
  },
  selectedItemId: '',
};

export const reducer = createReducer<State>(
  initialState,
  on(TrackingActions.getTrackings, (state) => ({
    ...state,
    items: LoadableStateReducerHelper.startLoad(state.items),
  })),
  on(TrackingActions.getTrackingsSuccess, (state, { data }) => ({
    ...state,
    items: LoadableStateReducerHelper.loadSuccess(data),
    selectedItemId: data[0]?.id,
  })),
  on(TrackingActions.getTrackingsError, (state, { error }) => ({
    ...state,
    items: LoadableStateReducerHelper.loadError(state.items, error),
  })),

  on(TrackingActions.getTrackingsDetails, (state) => ({
    ...state,
    trackingDetails: LoadableStateReducerHelper.startLoad(state.trackingDetails),
  })),
  on(TrackingActions.getTrackingsDetailsSuccess, (state, { data }) => ({
    ...state,
    trackingDetails: LoadableStateReducerHelper.loadSuccess(data),
  })),
  on(TrackingActions.getTrackingsDetailsError, (state, { error }) => ({
    ...state,
    trackingDetails: LoadableStateReducerHelper.loadError(state.trackingDetails, error),
  })),

  on(
    TrackingActions.selectItem,
    (state, { id }): State => ({
      ...state,
      selectedItemId: id,
    })
  ),
  on(
    TrackingActions.updateKeyword,
    (state, { keyword }): State => ({
      ...state,
      keyword,
    })
  )
);
