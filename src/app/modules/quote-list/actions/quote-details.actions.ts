import { Contact } from '@global/interfaces/contact.interface';
import { FreightCosts } from '@global/interfaces/freight-costs.interface';
import { UpdatedLineItemsData } from '@global/modules/common-quote/interfaces/updated-line-items-data.interface';
import { createAction, props } from '@ngrx/store';
import { QuoteDetailsQuote } from '../interfaces/quote.interface';

export const enter = createAction('[Quote Details] enter');
export const loadQuote = createAction('[Quote Details] LoadQuote', props<{ quoteId: string; reload?: boolean }>());
export const loadNewQuote = createAction('[Quote Details] LoadNewQuote', props<{ quoteId: string }>());

export const loadSingleQuote = createAction('[Quote Details] LoadSingleQuote', props<{ quoteId: string; reload?: boolean }>());
export const loadSingleQuoteSuccess = createAction('[Quote Details] LoadSingleQuoteSuccess', props<{ quote: QuoteDetailsQuote }>());
export const loadSingleQuoteError = createAction('[Quote Details] LoadSingleQuoteError', props<{ error: string }>());

export const loadContacts = createAction('[Quote Details] LoadContacts');
export const loadContactsSuccess = createAction('[Quote Details] LoadContactsSuccess', props<{ contacts: Contact[] }>());
export const loadContactsError = createAction('[Quote Details] LoadContactsError', props<{ error: string }>());

export const editBasics = createAction('[Quote Details] EditBasics');

export const editLineItems = createAction('[Quote Details] EditLineItems');
export const editLineItemsSuccess = createAction('[Quote Details] EditLineItemsSuccess', props<{ updateData: UpdatedLineItemsData }>());
export const editLineItemsError = createAction('[Quote Details] EditLineItemsError', props<{ error: string }>());

export const editPackages = createAction('[Quote Details] EditPackages', props<{ quote: QuoteDetailsQuote }>());

export const editPickupAddress = createAction('[Quote Details] EditPickupAddress');

export const deletePickupAddress = createAction('[Quote Details] deletePickupAddress');

export const editShipToLocations = createAction('[Quote Details] EditShipToLocations');

export const reuseQuote = createAction('[Quote Details] ReuseQuote', props<{ id: string }>());

export const cancelQuote = createAction('[Quote Details] CancelQuote', props<{ id: string }>());

export const acceptQuote = createAction('[Quote Details] AcceptQuote', props<{ quoteId: string }>());

export const downloadQuote = createAction('[Quote Details] DownloadQuote', props<{ quoteId: string }>());

export const sendQuoteEmail = createAction('[Quote Details] SendQuoteEmail', props<{ quoteId: string }>());

export const toggleLiabilityCoverFee = createAction(
  '[Quote Details] ToggleLiabilityCoverFee',
  props<{ isEnabled: boolean; quoteId: string }>()
);

export const updateShippingFees = createAction(
  '[Quote Details] UpdateShippingFees',
  props<{ quoteId: string; citrShippingServiceFeeEnabled: boolean; liabilityCoverFeeEnabled: boolean }>()
);

export const changeOwner = createAction('[Quote Details] ChangeOwner', props<{ owner: string }>());

export const saveNote = createAction('[Quote Details] SaveNote', props<{ note: string; id: string }>());
export const saveNoteSuccess = createAction('[Quote Details] SaveNoteSuccess', props<{ note: string }>());
export const saveNoteError = createAction('[Quote Details] SaveNoteError', props<{ error: string }>());
export const createMessage = createAction('[Quote Details] CreateMessage');
export const openMessage = createAction('[Quote Details] OpenMessage', props<{ messageId: string }>());

export const updateFreightCosts = createAction(
  '[Quote Details] UpdateFreightCosts',
  props<{ freightCosts: Record<string, FreightCosts> }>()
);

export const changeShipmentMethod = createAction('[Quote Details] ChangeShipmentMethod');

export const addLocalVatRegistration = createAction('[Quote Details] AddLocalVatRegistration');
export const addLocalVatRegistrationSuccess = createAction('[Quote Details] AddLocalVatRegistrationSuccess');
export const addLocalVatRegistrationError = createAction('[Quote Details] AddLocalVatRegistrationError');

export const leave = createAction('[Quote Details] Leave');
