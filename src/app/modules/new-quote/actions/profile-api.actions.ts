import { NewQuoteDefaults } from '@global/interfaces/new-quote-defaults.interface';
import { createAction, props } from '@ngrx/store';

export const loadNewQuoteDefaults = createAction('[Profile API] loadNewQuoteDefaults');
export const loadNewQuoteDefaultsSuccess = createAction(
  '[Profile API] loadNewQuoteDefaultsSuccess',
  props<{ defaults: Partial<NewQuoteDefaults> }>()
);
export const loadNewQuoteDefaultsError = createAction('[Profile API] loadNewQuoteDefaultsError', props<{ error: string }>());
