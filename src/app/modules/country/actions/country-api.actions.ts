import { createAction, props } from '@ngrx/store';
import { Country } from '@CitT/data';

export const loadAll = createAction('[Country API] loadAll');
export const loadAllSuccess = createAction('[Country API] loadAllSuccess', props<{ data: Country[] }>());
export const loadAllError = createAction('[Country API] loadAllError', props<{ error: string }>());

export const loadDestination = createAction('[Country API] loadDestination');
export const loadDestinationSuccess = createAction('[Country API] loadDestinationSuccess', props<{ data: Country[] }>());
export const loadDestinationError = createAction('[Country API] loadDestinationError', props<{ error: string }>());
