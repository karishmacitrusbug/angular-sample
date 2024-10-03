import { RolloutTrackingItemVM } from '@global/interfaces/tracking/rollout-tracking-item.vm';
import { TrackingDetailsVM } from '@global/interfaces/tracking/tracking-details.vm';
import { TrackingItemVM } from '@global/interfaces/tracking/tracking-item.vm';
import { createAction, props } from '@ngrx/store';

export const enter = createAction('[Tracking] enter');

export const getTrackings = createAction('[Tracking] getTrackings');
export const getTrackingsSuccess = createAction(
  '[Tracking] getTrackingsSuccess',
  props<{ data: (TrackingItemVM | RolloutTrackingItemVM)[] }>()
);
export const getTrackingsError = createAction('[Tracking] getTrackingsError', props<{ error: string }>());

export const getTrackingsDetails = createAction('[Tracking] getTrackingsDetails', props<{ shippingId: string }>());
export const getTrackingsDetailsSuccess = createAction('[Tracking] getTrackingsDetailsSuccess', props<{ data: TrackingDetailsVM }>());
export const getTrackingsDetailsError = createAction('[Tracking] getTrackingsDetailsError', props<{ error: string }>());

export const selectItem = createAction('[Tracking] selectItem', props<{ id: string }>());

export const updateKeyword = createAction('[Tracking] update Keyword', props<{ keyword: string }>());

export const reuseData = createAction('[Tracking] reuseData', props<{ shipmentId: string }>());
