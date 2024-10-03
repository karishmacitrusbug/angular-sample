import { QuoteState } from '@global/enums/quote-list/quote-state.enum';
import { filterQuoteList } from '@modules/quote-list/helpers/filter-quote-list.helper';
import { searchInQuoteList } from '@modules/quote-list/helpers/search-in-quote-list.helper';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCountryValidation from '@shared/modules/country-validation/reducers';
import isEmpty from 'lodash/isEmpty';
import { State } from '../../../reducers';
import { handleQuoteSorting } from '../helpers/quote-list-sorting.helper';
import * as fromQuoteDetails from './quote-details.reducer';
import * as fromQuoteList from './quote-list.reducer';

export const quoteListFeatureKey = 'quoteList';

export interface QuoteListState {
  [fromQuoteList.quoteListFeatureKey]: fromQuoteList.State;
  [fromQuoteDetails.quoteDetailsKey]: fromQuoteDetails.State;
}

export interface AppState extends State {
  [quoteListFeatureKey]: QuoteListState;
}

export const reducers: ActionReducerMap<QuoteListState> = {
  [fromQuoteList.quoteListFeatureKey]: fromQuoteList.reducer,
  [fromQuoteDetails.quoteDetailsKey]: fromQuoteDetails.reducer,
};

export const selectQuoteListFeatureState = createFeatureSelector<QuoteListState>(quoteListFeatureKey);

export const selectQuoteListState = createSelector(selectQuoteListFeatureState, (state) => state[fromQuoteList.quoteListFeatureKey]);

export const selectSortingPreferences = createSelector(selectQuoteListState, (state) => state.sortingPreferences);

export const selectQuoteList = createSelector(selectQuoteListState, (state) => state.quotes);
export const selectQuoteListData = createSelector(selectQuoteList, (quotes) => quotes.data);

export const selectOnlyOwnQuotes = createSelector(selectQuoteListState, (state) => state.onlyOwnQuotes);
export const selectKeyword = createSelector(selectQuoteListState, (state) => state.keyword);

export const selectFilteredQuoteItems = createSelector(selectQuoteListData, selectKeyword, (quotes, keyword) =>
  isEmpty(keyword) ? quotes : searchInQuoteList(quotes, keyword)
);

export const selectCompleteQuotes = createSelector(selectFilteredQuoteItems, selectSortingPreferences, (items, sortingPreferences) => {
  const completeQuotes = items.filter((quote) => quote.state === QuoteState.Complete);
  return handleQuoteSorting([...completeQuotes], sortingPreferences.complete);
});

export const selectExpiredQuotes = createSelector(selectFilteredQuoteItems, selectSortingPreferences, (items, sortingPreferences) => {
  const expiredQuotes = items.filter((quote) => quote.state === QuoteState.Expired);
  return handleQuoteSorting([...expiredQuotes], sortingPreferences.expired);
});

export const selectFilteredQuotes = createSelector(selectQuoteListState, (state) => {
  if (!state.filters) {
    return state.quotes.data;
  }
  const filteredQuotes = filterQuoteList(state.quotes.data, state.filters);
  return handleQuoteSorting([...filteredQuotes], state.sortingPreferences.mixed);
});

export const selectAppliedFilters = createSelector(selectQuoteListState, (state) => state.filters);
export const selectNumberOfAppliedFilters = createSelector(selectQuoteListState, (state) => {
  if (!state.filters) {
    return 0;
  }
  return Object.values(state.filters).filter((filter) => !isEmpty(filter)).length;
});

export const selectQuoteListLoading = createSelector(selectQuoteListState, (state) => state.quotes.isLoading);

export const selectLastActivatedTab = createSelector(selectQuoteListState, (state) => state.lastActivatedTab);

// QUOTE DETAILS SELECTORS

export const selectQuoteDetailsFeatureState = createFeatureSelector<QuoteListState>(quoteListFeatureKey);

export const selectQuoteDetails = createSelector(selectQuoteDetailsFeatureState, (state) => state[fromQuoteDetails.quoteDetailsKey]);
export const selectQuoteDetailsLoading = createSelector<
  AppState & fromCountryValidation.AppState,
  [fromQuoteDetails.State, boolean],
  boolean
>(
  selectQuoteDetails,
  fromCountryValidation.selectCountryValidationRulesLoading,
  (state, countryValidationsLoading) => state.quote.isLoading || state.contacts.isLoading || countryValidationsLoading
);
export const selectQuoteDetailsContacts = createSelector(selectQuoteDetails, (state) => state.contacts.data);
export const selectQuoteDetailsQuote = createSelector(selectQuoteDetails, (state) => state.quote.data);
export const selectQuoteOwner = createSelector(selectQuoteDetails, (state) => state.quote.data?.owner);
export const selectQuoteFreight = createSelector(selectQuoteDetails, (state) => state.quote.data.freight);
