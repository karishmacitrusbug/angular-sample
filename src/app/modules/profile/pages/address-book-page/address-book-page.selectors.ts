import { CountryHelper } from '@global/helpers/country.helper';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { createSelector } from '@ngrx/store';
import * as fromCountry from '../../../country/reducers';

export const selectPickupCountries = createSelector(fromCountry.selectAllCountries, (countriesState): InputDataVM<string, string>[] =>
  CountryHelper.mapToInputDataVM(countriesState.data)
);

export const selectDeliveryCountries = createSelector(fromCountry.selectDestinationCountriesData, (countries) =>
  CountryHelper.mapToInputDataVM(countries)
);
