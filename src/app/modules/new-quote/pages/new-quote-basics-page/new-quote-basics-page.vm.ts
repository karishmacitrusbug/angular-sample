import { InputDataVM } from '@global/interfaces/input-data.vm';
import { CountryValidationRule } from '@global/modules/common-country-validation/types/country-validation-rule.interface';
import { QuoteBasicsForm } from '@modules/quote/interfaces/quote-basics-form.interface';

export interface NewQuoteBasicsPageVM {
  initialValues: QuoteBasicsForm;
  allCountries: InputDataVM<string, string>[];
  destinationCountries: InputDataVM<string, string>[];
  validationRules: CountryValidationRule[];
}
