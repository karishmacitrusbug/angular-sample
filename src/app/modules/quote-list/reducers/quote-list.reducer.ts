import { QuoteState } from '@global/enums/quote-list/quote-state.enum';
import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Loadable } from '@global/interfaces/loadable.interface';
import { QuoteListSideFilterDialogVM } from '@modules/quote-list/components/quote-list-side-filter-dialog/quote-list-side-filter-dialog.vm';
import { QuoteListTabQuery } from '@modules/quote-list/enums/quote-list-tab-query.enum';
import { QuoteTableSorting } from '@modules/quote-list/interfaces/quote-table-sorting.interface';
import { CbQuoteVM } from '@modules/quote-list/interfaces/cb-quote.vm';
import { createReducer, on } from '@ngrx/store';
import * as QuoteListActions from '../actions/quote-list.actions';

export const quoteListFeatureKey = 'quoteList';

export interface State {
  keyword: string;
  onlyOwnQuotes: boolean;
  lastActivatedTab: QuoteListTabQuery;
  quotes: Loadable<CbQuoteVM[]>;
  filters?: QuoteListSideFilterDialogVM;
  sortingPreferences: {
    [key in QuoteState]?: QuoteTableSorting;
  };
}

export const initialState: State = {
  quotes: { data: [], isLoading: false },
  keyword: '',
  onlyOwnQuotes: false,
  lastActivatedTab: undefined,
  filters: {
    createdDateRange: undefined,
    endDate: undefined,
    clientReference1: undefined,
    shipToCountry: [],
  },
  sortingPreferences: {},
};

export const reducer = createReducer<State>(
  initialState,
  on(QuoteListActions.enter, QuoteListActions.load, (state) => ({
    ...state,
    quotes: LoadableStateReducerHelper.startLoad(state.quotes),
  })),
  on(QuoteListActions.loadSuccess, (state, { data }) => ({
    ...state,
    quotes: LoadableStateReducerHelper.loadSuccess(data),
  })),
  on(QuoteListActions.loadError, (state, { error }) => ({
    ...state,
    quotes: LoadableStateReducerHelper.loadError(state.quotes, error),
  })),
  on(QuoteListActions.updateFilters, (state, { filters }): State => ({ ...state, filters })),
  on(QuoteListActions.updateKeyword, (state, { keyword }): State => ({ ...state, keyword })),
  on(QuoteListActions.updateOwnershipFilter, (state, { onlyOwnQuotes }): State => ({ ...state, onlyOwnQuotes })),
  on(QuoteListActions.leave, (state): State => ({ ...initialState, lastActivatedTab: state.lastActivatedTab })),
  on(
    QuoteListActions.changeSorting,
    (state, action): State => ({
      ...state,
      sortingPreferences: {
        ...state.sortingPreferences,
        ...action,
      },
    })
  ),
  on(QuoteListActions.clearSorting, (state): State => ({ ...state, sortingPreferences: {} }))
);
