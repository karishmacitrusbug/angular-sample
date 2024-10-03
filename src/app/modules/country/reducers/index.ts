import { CountryHelper } from '@global/helpers/country.helper';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from 'app/reducers';
import * as fromCountry from './country.reducer';

export const countryFeatureKey = 'country';

export interface CountryState {
  [fromCountry.countryFeatureKey]: fromCountry.State;
}

export interface AppState extends State {
  [countryFeatureKey]: CountryState;
}

export const reducers: ActionReducerMap<CountryState> = {
  [fromCountry.countryFeatureKey]: fromCountry.reducer,
};

export const selectCountryFeatureState = createFeatureSelector<CountryState>(countryFeatureKey);

export const selectAllCountries = createSelector(selectCountryFeatureState, (state) => state[fromCountry.countryFeatureKey].all);
export const selectAllCountriesData = createSelector(selectAllCountries, (allCountries) => allCountries.data);
export const selectAllCountriesLoading = createSelector(selectAllCountries, (allCountries) => allCountries.isLoading);
export const selectAllCountriesInputData = createSelector(selectAllCountriesData, (countries) =>
  countries.map((country): InputDataVM<string, string> => ({ value: country.value, viewValue: country.label }))
);

export const selectDestinationCountries = createSelector(
  selectCountryFeatureState,
  (state) => state[fromCountry.countryFeatureKey].destination
);
export const selectDestinationCountriesData = createSelector(
  selectDestinationCountries,
  (destinationCountries) => destinationCountries.data
);
export const selectDestinationCountriesLoading = createSelector(
  selectDestinationCountries,
  (destinationCountries) => destinationCountries.isLoading
);
export const selectDestinationCountriesInputData = createSelector(selectDestinationCountriesData, (countries) =>
  countries.map((country): InputDataVM<string, string> => ({ value: country.value, viewValue: country.label }))
);

export const selectPickupCountries = createSelector(selectAllCountries, (countriesState): InputDataVM<string, string>[] =>
  CountryHelper.mapToInputDataVM(countriesState.data)
);

export const selectDeliveryCountries = createSelector(selectDestinationCountriesData, (countries) =>
  CountryHelper.mapToInputDataVM(countries)
);
