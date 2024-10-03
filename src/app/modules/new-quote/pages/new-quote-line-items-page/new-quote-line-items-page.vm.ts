import { CurrencyCode } from '@global/enums/currency-code.enum';
import { ServiceType } from '@global/enums/service-type.enum';
import { CountryValidationRule } from '@global/modules/common-country-validation/types/country-validation-rule.interface';
import { LineItem } from '@global/modules/common-quote/interfaces/line-item.interface';
import { ValuationMethod } from '@CitT/data';

export interface NewQuoteLineItemsPageVM {
  lineItems: LineItem[];
  validationRules: CountryValidationRule[];
  from: string;
  to: string;
  serviceType: ServiceType;
  valuationMethod: ValuationMethod;
  currency?: CurrencyCode;
  hasStoreFees?: boolean;
  isReusedQuote: boolean;
}
