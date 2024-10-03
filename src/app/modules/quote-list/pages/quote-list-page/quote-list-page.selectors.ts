import { createSelector } from '@ngrx/store';
import * as fromQuoteList from '../../reducers';

export const selectIsQuoteListPageDataLoading = createSelector<fromQuoteList.AppState, [boolean], boolean>(
  fromQuoteList.selectQuoteListLoading,
  (isLoadingQuotes) => isLoadingQuotes
);
