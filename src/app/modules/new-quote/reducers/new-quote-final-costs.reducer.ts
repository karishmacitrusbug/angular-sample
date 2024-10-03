import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Loadable } from '@global/interfaces/loadable.interface';
import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { createReducer, on } from '@ngrx/store';
import * as NewQuoteFinalCostsActions from '../actions/new-quote-final-costs.actions';
import * as NewQuoteActions from '../actions/new-quote.actions';
import { FinalCosts } from '../interfaces/final-costs.interface';

export const newQuoteFinalCostsFeatureKey = 'newQuoteFinalCosts';

export interface State {
  state: FinalCostsState;
  finalCosts: Loadable<FinalCosts | undefined>;
}

export const initialState: State = {
  state: FinalCostsState.NotCompleted,
  finalCosts: { isLoading: false, data: undefined },
};

export const reducer = createReducer<State>(
  initialState,

  on(NewQuoteFinalCostsActions.loadFinalCosts, (state) => ({
    ...state,
    finalCosts: LoadableStateReducerHelper.startLoad(state.finalCosts),
  })),
  on(NewQuoteFinalCostsActions.loadFinalCostsSuccess, (state, { finalCosts, state: finalCostsState }) => ({
    ...state,
    finalCosts: LoadableStateReducerHelper.loadSuccess(finalCosts),
    state: finalCostsState,
  })),
  on(NewQuoteFinalCostsActions.loadFinalCostsError, (state, { error }) => ({
    ...state,
    finalCosts: LoadableStateReducerHelper.loadError(state.finalCosts, error),
  })),

  on(
    NewQuoteFinalCostsActions.updateFinalCostsState,
    (state, { state: newState }): State => ({
      ...state,
      state: newState,
    })
  ),

  on(NewQuoteActions.leave, NewQuoteActions.startNew, NewQuoteActions.reuseQuote, (): State => initialState)
);
