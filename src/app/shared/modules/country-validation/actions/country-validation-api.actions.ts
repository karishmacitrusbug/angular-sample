import { CountryValidationRule } from '@global/modules/common-country-validation/types/country-validation-rule.interface';
import { createAction, props } from '@ngrx/store';

export const load = createAction('[Country validation API] load');
export const loadSuccess = createAction('[Country validation API] loadSuccess', props<{ rules: CountryValidationRule[] }>());
export const loadError = createAction('[Country validation API] loadError', props<{ error: string }>());
