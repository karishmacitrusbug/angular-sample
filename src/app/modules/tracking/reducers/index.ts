import { filterTrackingItems } from '@global/helpers/tracking/filter-tracking-items.helper';
import { findItemById } from '@global/helpers/tracking/find-item-by-id.helper';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from 'app/reducers';
import * as fromTracking from './tracking.reducer';

export const trackingFeatureKey = 'tracking';

export interface TrackingState {
  [fromTracking.trackingKey]: fromTracking.State;
}

export interface AppState extends State {
  [trackingFeatureKey]: TrackingState;
}

export const reducers: ActionReducerMap<TrackingState> = {
  [fromTracking.trackingKey]: fromTracking.reducer,
};

export const selectTrackingFeatureState = createFeatureSelector<TrackingState>(trackingFeatureKey);

export const selectTrackingItems = createSelector(selectTrackingFeatureState, (state) => {
  const data = state[fromTracking.trackingKey];
  return !data.keyword ? data.items.data : filterTrackingItems(data.items.data, data.keyword);
});

export const selectSelectedItem = createSelector(selectTrackingFeatureState, (state) => {
  const items = state[fromTracking.trackingKey].items;
  const selectedId = state[fromTracking.trackingKey].selectedItemId;
  return selectedId ? findItemById(items.data, selectedId) : undefined;
});

export const selectTrackingItemsLoading = createSelector(
  selectTrackingFeatureState,
  (state) => state[fromTracking.trackingKey].items.isLoading
);

export const selectTrackingItemDetails = createSelector(
  selectTrackingFeatureState,
  (state) => state[fromTracking.trackingKey].trackingDetails?.data
);
export const selectTrackingItemDetailsLoading = createSelector(
  selectTrackingFeatureState,
  (state) => state[fromTracking.trackingKey].trackingDetails?.isLoading
);
