import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from 'app/reducers';
import * as fromCountryValidation from './country-validation.reducer';

export const countryValidationFeatureKey = 'countryValidation';

export interface CountryValidationState {
  [fromCountryValidation.countryValidationFeatureKey]: fromCountryValidation.State;
}

export interface AppState extends State {
  [countryValidationFeatureKey]: CountryValidationState;
}

export const reducers: ActionReducerMap<CountryValidationState> = {
  [fromCountryValidation.countryValidationFeatureKey]: fromCountryValidation.reducer,
};

export const selectCountryValidationFeatureState = createFeatureSelector<CountryValidationState>(countryValidationFeatureKey);

export const selectCountryValidation = createSelector(
  selectCountryValidationFeatureState,
  (state) => state[fromCountryValidation.countryValidationFeatureKey]
);

export const selectCountryValidationRulesData = createSelector(selectCountryValidation, (state) => state.rules.data);
export const selectCountryValidationRulesLoading = createSelector(selectCountryValidation, (state) => state.rules.isLoading);
