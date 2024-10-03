import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { BaseQuoteVM } from '@global/interfaces/quote-list/base-quote.vm';

export interface CbQuoteVM extends BaseQuoteVM {
  estimatedTotalCost?: number;
  localVatRegistration?: LocalVatRegistrationVM;
  isLocalVatRequired?: boolean;
}
