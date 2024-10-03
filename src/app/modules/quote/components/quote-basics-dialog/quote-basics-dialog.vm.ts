import { InputDataVM } from '@global/interfaces/input-data.vm';
import { CountryValidationRule } from '@global/modules/common-country-validation/types/country-validation-rule.interface';
import { LineItem } from '@global/modules/common-quote/interfaces/line-item.interface';
import { QuoteBasicsForm } from '../../interfaces/quote-basics-form.interface';

export interface QuoteBasicsDialogVM {
  initialValues: QuoteBasicsForm;
  allCountries: InputDataVM<string, string>[];
  destinationCountries: InputDataVM<string, string>[];
  validationRules: CountryValidationRule[];
  lineItems?: LineItem[];
}
