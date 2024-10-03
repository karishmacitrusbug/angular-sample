import { CountryHelper } from '@global/helpers/country.helper';
import { CountryValidationRule } from '@global/modules/common-country-validation/types/country-validation-rule.interface';
import { QuoteBasicsForm } from '@modules/quote/interfaces/quote-basics-form.interface';
import { createSelector } from '@ngrx/store';
import * as fromCountryValidation from '@shared/modules/country-validation/reducers';
import { Country } from '@CitT/data';
import * as fromCountry from '../../../country/reducers/index';
import * as fromNewQuote from '../../reducers';
import { NewQuoteBasicsPageVM } from './new-quote-basics-page.vm';

export const selectNewQuoteBasicsPage = createSelector<
  fromCountry.AppState & fromNewQuote.AppState & fromCountryValidation.AppState,
  [QuoteBasicsForm, Country[], Country[], CountryValidationRule[]],
  NewQuoteBasicsPageVM
>(
  fromNewQuote.selectNewQuoteBasicsValuesData,
  fromCountry.selectAllCountriesData,
  fromCountry.selectDestinationCountriesData,
  fromCountryValidation.selectCountryValidationRulesData,
  (values, allCountries, destinationCountries, validationRules): NewQuoteBasicsPageVM => ({
    initialValues: values,
    allCountries: CountryHelper.mapToInputDataVM(allCountries),
    destinationCountries: CountryHelper.mapToInputDataVM(destinationCountries),
    validationRules,
  })
);

export const selectNewQuoteLoadingState = createSelector<
  fromCountry.AppState & fromNewQuote.AppState & fromCountryValidation.AppState,
  [boolean, boolean, boolean, boolean],
  boolean
>(
  fromCountry.selectAllCountriesLoading,
  fromCountry.selectDestinationCountriesLoading,
  fromNewQuote.selectNewQuoteBasicsValuesLoading,
  fromCountryValidation.selectCountryValidationRulesLoading,
  (allCountriesLoadingState, destinationCountriesLoading, newQuoteBasicsDefaultsLoading, countryValidationRulesLoading) =>
    allCountriesLoadingState || destinationCountriesLoading || newQuoteBasicsDefaultsLoading || countryValidationRulesLoading
);
