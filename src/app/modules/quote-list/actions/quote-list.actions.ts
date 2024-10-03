import { QuoteState } from '@global/enums/quote-list/quote-state.enum';
import { QuoteListSideFilterDialogVM } from '@modules/quote-list/components/quote-list-side-filter-dialog/quote-list-side-filter-dialog.vm';
import { QuoteListTabQuery } from '@modules/quote-list/enums/quote-list-tab-query.enum';
import { QuoteTableSorting } from '@modules/quote-list/interfaces/quote-table-sorting.interface';
import { CbQuoteVM } from '@modules/quote-list/interfaces/cb-quote.vm';
import { createAction, props } from '@ngrx/store';

export const enter = createAction('[Quote List] enter');
export const leave = createAction('[Quote List] leave');

export const load = createAction('[Quote List] load');
export const loadSuccess = createAction('[Quote List] loadSuccess', props<{ data: CbQuoteVM[] }>());
export const loadError = createAction('[Quote List] loadError', props<{ error: string }>());

export const updateFilters = createAction('[Quote List] updateFilters', props<{ filters: QuoteListSideFilterDialogVM }>());
export const updateKeyword = createAction('[Quote List] updateKeyword', props<{ keyword: string }>());
export const updateOwnershipFilter = createAction('[Quote List] updateOwnershipFilter', props<{ onlyOwnQuotes: boolean }>());

export const reuseQuote = createAction('[Quote List] reuseQuote', props<{ id: string }>());

export const accept = createAction('[Quote List] accept', props<{ ids: string[] }>());

export const setLastActivatedTab = createAction('[Quote List] setLastActivatedTab', props<{ tab: QuoteListTabQuery }>());

export const changeSorting = createAction('[Quote List] changeSorting', props<{ [key in QuoteState]?: QuoteTableSorting }>());
export const clearSorting = createAction('[Quote List] clearSorting');
