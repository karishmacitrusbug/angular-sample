import { InputDataVM } from '@global/interfaces/input-data.vm';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { User } from '@global/interfaces/user.interface';
import { QuoteDetailsQuote } from '@modules/quote-list/interfaces/quote.interface';

export interface QuoteDetailsPageVM {
  isLoading: boolean;
  quote: QuoteDetailsQuote;
  contacts: InputDataVM<string, string>[];
  owner: string;
  user: User;
  localVatRegistration?: LocalVatRegistrationVM;
  isVatRegistrationRequired?: boolean;
}
