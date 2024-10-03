import { CurrencyCode } from '@global/enums/currency-code.enum';
import { LineItem } from '@global/modules/common-quote/interfaces/line-item.interface';
import { createAction, props } from '@ngrx/store';

export const enter = createAction('[New Quote Line Items] Enter');

export const submit = createAction(
  '[New Quote Line Items] Submit',
  props<{ lineItems: LineItem[]; currency: CurrencyCode; hasStoreFees: boolean }>()
);
export const submitSuccess = createAction(
  '[New Quote Line Items] SubmitSuccess',
  props<{ lineItems: LineItem[]; currency: CurrencyCode; hasStoreFees: boolean }>()
);
export const submitError = createAction('[New Quote Line Items] SubmitError', props<{ error: string }>());

export const edit = createAction('[New Quote Line Items] Edit');
export const editSuccess = createAction(
  '[New Quote Line Items] EditSuccess',
  props<{ lineItems: LineItem[]; currency: CurrencyCode; hasStoreFees: boolean }>()
);
export const editError = createAction('[New Quote Line Items] EditError', props<{ error: string }>());
