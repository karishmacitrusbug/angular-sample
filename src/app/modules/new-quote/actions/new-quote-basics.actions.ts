import { createAction, props } from '@ngrx/store';
import { QuoteBasicsForm } from '../../quote/interfaces/quote-basics-form.interface';

export const enter = createAction('[New Quote Basics] Enter', props<{ quoteIdToReuse?: string | null }>());

export const submit = createAction('[New Quote Basics] Submit', props<{ values: QuoteBasicsForm }>());

export const submitSuccess = createAction(
  '[New Quote Basics] SubmitSuccess',
  props<{
    values: QuoteBasicsForm;
    id: string;
    freightId?: string;
    cpaid: string;
    quoteReference: string;
    clientContact?: string;
  }>()
);
export const submitError = createAction('[New Quote Basics] SubmitError', props<{ error: string }>());

export const edit = createAction('[New Quote Basics] Edit');
export const editSuccess = createAction('[New Quote Basics] EditSuccess', props<{ values: QuoteBasicsForm }>());
export const editError = createAction('[New Quote Basics] EditError', props<{ error: string }>());

export const startNew = createAction('[New Quote Basics] startNew');

export const loadUpdate = createAction('[New Quote Basics] loadUpdate');
export const update = createAction('[New Quote Basics] update', props<{ values: QuoteBasicsForm }>());
