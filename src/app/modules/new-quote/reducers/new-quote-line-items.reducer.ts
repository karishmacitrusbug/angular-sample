import { CurrencyCode } from '@global/enums/currency-code.enum';
import { LineItemsState } from '@global/modules/common-quote/enums/line-items-state.enum';
import { LineItem } from '@global/modules/common-quote/interfaces/line-item.interface';
import { createReducer, on } from '@ngrx/store';
import * as NewQuoteLineItemsActions from '../actions/new-quote-line-items.actions';
import * as NewQuoteActions from '../actions/new-quote.actions';

export const newQuoteLineItemsFeatureKey = 'newQuoteLineItems';

export interface State {
  state: LineItemsState;
  lineItems: LineItem[];
  currency?: CurrencyCode;
  hasStoreFees?: boolean;
  isLoading: boolean;
}

export const initialState: State = {
  state: LineItemsState.NotCompleted,
  lineItems: [],
  isLoading: false,
};

export const reducer = createReducer<State>(
  initialState,
  on(NewQuoteLineItemsActions.enter, (state): State => ({ ...state, state: LineItemsState.InProgress })),
  on(
    NewQuoteActions.loadExistingQuoteSuccess,
    (state, { lineItems, lineItemsCurrency, hasStoreFees }): State => ({
      ...state,
      lineItems,
      currency: lineItemsCurrency,
      hasStoreFees,
    })
  ),
  on(NewQuoteLineItemsActions.submit, (state): State => ({ ...state, isLoading: true })),
  on(
    NewQuoteLineItemsActions.submitSuccess,
    (state, { lineItems, currency, hasStoreFees }): State => ({
      ...state,
      state: LineItemsState.Completed,
      lineItems,
      currency,
      hasStoreFees,
      isLoading: false,
    })
  ),
  on(NewQuoteLineItemsActions.submitError, (state): State => ({ ...state, isLoading: false })),
  on(
    NewQuoteLineItemsActions.editSuccess,
    (state, { lineItems, currency, hasStoreFees }): State => ({
      ...state,
      state: LineItemsState.Completed,
      lineItems,
      currency,
      hasStoreFees,
    })
  ),
  on(NewQuoteActions.leave, NewQuoteActions.startNew, NewQuoteActions.reuseQuote, (): State => initialState)
);
