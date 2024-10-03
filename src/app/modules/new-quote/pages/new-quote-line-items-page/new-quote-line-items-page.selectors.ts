import { CurrencyCode } from '@global/enums/currency-code.enum';
import { ServiceType } from '@global/enums/service-type.enum';
import { CountryValidationRule } from '@global/modules/common-country-validation/types/country-validation-rule.interface';
import { LineItem } from '@global/modules/common-quote/interfaces/line-item.interface';
import { QuoteBasicsForm } from '@modules/quote/interfaces/quote-basics-form.interface';
import { createSelector } from '@ngrx/store';
import * as fromCountryValidation from '@shared/modules/country-validation/reducers';
import * as fromNewQuote from '../../reducers';
import { NewQuoteLineItemsPageVM } from './new-quote-line-items-page.vm';

export const selectNewQuoteLineItemsPage = createSelector<
  fromNewQuote.AppState & fromCountryValidation.AppState,
  [QuoteBasicsForm, LineItem[], CurrencyCode, boolean, boolean, CountryValidationRule[]],
  NewQuoteLineItemsPageVM
>(
  fromNewQuote.selectNewQuoteBasicsValuesData,
  fromNewQuote.selectNewQuoteLineItems,
  fromNewQuote.selectNewQuoteLineItemsCurrency,
  fromNewQuote.selectNewQuoteLineItemsHasStoreFees,
  fromNewQuote.selectNewQuoteBasicsIsReusedQuote,
  fromCountryValidation.selectCountryValidationRulesData,
  (basics, lineItems, currency, hasStoreFees, isReusedQuote, validationRules): NewQuoteLineItemsPageVM => ({
    lineItems,
    validationRules,
    from: basics.from,
    to: basics.to,
    serviceType: ServiceType.IOR,
    valuationMethod: basics.valuationMethod,
    currency,
    hasStoreFees,
    isReusedQuote,
  })
);
