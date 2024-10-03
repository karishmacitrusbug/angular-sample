import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Contact } from '@global/interfaces/contact.interface';
import { Loadable } from '@global/interfaces/loadable.interface';
import { createReducer, on } from '@ngrx/store';
import * as QuoteDetailsActions from '../actions/quote-details.actions';
import { QuoteDetailsQuote } from '../interfaces/quote.interface';

export const quoteDetailsKey = 'quoteDetails';

export interface State {
  quote: Loadable<QuoteDetailsQuote>;
  contacts: Loadable<Contact[]>;
}

export const initialState: State = {
  quote: {
    isLoading: true,
    data: undefined,
  },
  contacts: {
    isLoading: false,
    data: [],
  },
};

export const reducer = createReducer<State>(
  initialState,
  on(QuoteDetailsActions.loadContacts, (state) => ({
    ...state,
    contacts: LoadableStateReducerHelper.startLoad(state.contacts),
  })),
  on(QuoteDetailsActions.loadContactsSuccess, (state, { contacts }) => ({
    ...state,
    contacts: LoadableStateReducerHelper.loadSuccess(contacts),
  })),
  on(QuoteDetailsActions.loadContactsError, (state, { error }) => ({
    ...state,
    contacts: LoadableStateReducerHelper.loadError(state.contacts, error),
  })),

  on(QuoteDetailsActions.loadSingleQuote, (state, { reload }) => ({
    ...state,
    quote: reload ? state.quote : LoadableStateReducerHelper.startLoad(state.quote),
  })),
  on(QuoteDetailsActions.loadSingleQuoteSuccess, (state, { quote }) => ({
    ...state,
    quote: LoadableStateReducerHelper.loadSuccess({ ...state.quote.data, ...quote }),
  })),
  on(QuoteDetailsActions.loadSingleQuoteError, (state, { error }) => ({
    ...state,
    quote: LoadableStateReducerHelper.loadError(state.quote, error),
  })),
  on(QuoteDetailsActions.editLineItemsSuccess, (state, { updateData }) => ({
    ...state,
    quote: LoadableStateReducerHelper.loadSuccess({
      ...state.quote.data,
      lineItems: updateData.lineItems,
      clientCurrencyInput: updateData.customCurrency,
      storeFeesAvailable: updateData.storeFeesAvailable,
    }),
  })),
  on(QuoteDetailsActions.editLineItemsError, (state, { error }) => ({
    ...state,
    values: LoadableStateReducerHelper.loadError(state.quote, error),
  })),
  on(QuoteDetailsActions.saveNoteSuccess, (state, { note }) => ({
    ...state,
    quote: LoadableStateReducerHelper.loadSuccess({ ...state.quote.data, clientNote: note }),
  })),
  on(QuoteDetailsActions.saveNoteError, (state, { error }) => ({
    ...state,
    values: LoadableStateReducerHelper.loadError(state.quote, error),
  })),
  on(
    QuoteDetailsActions.updateFreightCosts,
    (state, { freightCosts }): State => ({
      ...state,
      quote: {
        ...state.quote,
        data: {
          ...state.quote.data,
          freight: freightCosts[state.quote.data.id].freight,
          costs: {
            ...state.quote.data.costs,
            ...freightCosts[state.quote.data.id].costs,
          },
        },
      },
    })
  )
);
