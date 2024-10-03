import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Loadable } from '@global/interfaces/loadable.interface';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { createReducer, on } from '@ngrx/store';
import * as LocalVatRegistrationsActions from '../actions/local-vat-registrations.actions';

export const localVatRegistrationsFeatureKey = 'localVatRegistrations';

export interface State {
  keyword: string;
  items: Loadable<LocalVatRegistrationVM[]>;
}

export const initialState: State = {
  keyword: '',
  items: { data: [], isLoading: false },
};

export const reducer = createReducer<State>(
  initialState,
  on(LocalVatRegistrationsActions.enter, LocalVatRegistrationsActions.load, (state) => ({
    ...state,
    items: LoadableStateReducerHelper.startLoad(state.items),
  })),
  on(LocalVatRegistrationsActions.loadSuccess, (state, { data }) => ({
    ...state,
    items: LoadableStateReducerHelper.loadSuccess(data),
  })),
  on(LocalVatRegistrationsActions.loadError, (state, { error }) => ({
    ...state,
    item: LoadableStateReducerHelper.loadError(state.items, error),
  })),
  on(
    LocalVatRegistrationsActions.updateKeyword,
    (state, { keyword }): State => ({
      ...state,
      keyword,
    })
  ),
  on(LocalVatRegistrationsActions.leave, (): State => ({ ...initialState }))
);
