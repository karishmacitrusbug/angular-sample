import { InputDataVM } from '@global/interfaces/input-data.vm';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';

export interface LocalVatRegistrationDialogPayload {
  toCountry: string;
  allCountries: InputDataVM<string, string>[];
  destinationCountries: InputDataVM<string, string>[];
  formValues?: LocalVatRegistrationVM;
  toCountryDisabled: boolean;
  alreadyRegisteredCountries?: string[];
}
