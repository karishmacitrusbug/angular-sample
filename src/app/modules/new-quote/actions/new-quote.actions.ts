import { CurrencyCode } from '@global/enums/currency-code.enum';
import { NewQuoteDefaults } from '@global/interfaces/new-quote-defaults.interface';
import { LineItem } from '@global/modules/common-quote/interfaces/line-item.interface';
import { MessageButtonUserVM } from '@global/modules/message-button/user.vm';
import { QuoteBasicsForm } from '@modules/quote/interfaces/quote-basics-form.interface';
import { createAction, props } from '@ngrx/store';

export const loadExistingQuote = createAction('[New Quote] LoadExistingQuote', props<{ quoteId: string }>());
export const loadExistingQuoteSuccess = createAction(
  '[New Quote] LoadExistingQuoteSuccess',
  props<{
    basics: QuoteBasicsForm;
    lineItems: LineItem[];
    defaults: Partial<NewQuoteDefaults>;
    lineItemsCurrency: CurrencyCode;
    hasStoreFees: boolean;
  }>()
);
export const loadExistingQuoteError = createAction('[New Quote] LoadExistingQuoteError', props<{ error: string }>());

export const leave = createAction('[New Quote] Leave');

export const startNew = createAction('[New Quote] startNew');
export const reuseQuote = createAction('[New Quote] reuseQuote', props<{ id: string }>());

export const newMessage = createAction(
  '[New Quote] NewMessage',
  props<{ teamMember: MessageButtonUserVM; omitSOId: boolean; shipmentDetail?: any }>()
);

export const addLocalVatRegistration = createAction('[New Quote] Add Local VAT registration');
export const addLocalVatRegistrationSuccess = createAction('[New Quote] Add Local VAT registration success');
export const addLocalVatRegistrationError = createAction('[New Quote] Add Local VAT registration error');
