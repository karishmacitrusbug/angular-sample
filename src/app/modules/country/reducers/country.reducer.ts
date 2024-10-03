import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Loadable } from '@global/interfaces/loadable.interface';
import { createReducer, on } from '@ngrx/store';
import { Country } from '@CitT/data';
import * as CountryApiActions from '../actions/country-api.actions';

export const countryFeatureKey = 'country';

export interface State {
  all: Loadable<Country[]>;
  destination: Loadable<Country[]>;
}

export const initialState: State = {
  all: { data: [], isLoading: false },
  destination: { data: [], isLoading: false },
};

export const reducer = createReducer<State>(
  initialState,

  on(CountryApiActions.loadAll, (state) => ({
    ...state,
    all: LoadableStateReducerHelper.startLoad(state.all),
  })),

  on(CountryApiActions.loadAllSuccess, (state, { data }) => ({
    ...state,
    all: LoadableStateReducerHelper.loadSuccess(data),
  })),

  on(CountryApiActions.loadAllError, (state, { error }) => ({
    ...state,
    all: LoadableStateReducerHelper.loadError(state.all, error),
  })),

  on(CountryApiActions.loadDestination, (state) => ({
    ...state,
    destination: LoadableStateReducerHelper.startLoad(state.destination),
  })),

  on(CountryApiActions.loadDestinationSuccess, (state, { data }) => ({
    ...state,
    destination: LoadableStateReducerHelper.loadSuccess(data),
  })),

  on(CountryApiActions.loadDestinationError, (state, { error }) => ({
    ...state,
    destination: LoadableStateReducerHelper.loadError(state.destination, error),
  }))
);
