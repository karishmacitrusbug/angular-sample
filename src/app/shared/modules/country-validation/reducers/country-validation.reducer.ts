import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Loadable } from '@global/interfaces/loadable.interface';
import { CountryValidationRule } from '@global/modules/common-country-validation/types/country-validation-rule.interface';
import { createReducer, on } from '@ngrx/store';
import * as CountryValidationApiActions from '../actions/country-validation-api.actions';

export const countryValidationFeatureKey = 'countryValidation';

export interface State {
  rules: Loadable<CountryValidationRule[]>;
}

export const initialState: State = {
  rules: {
    data: [],
    isLoading: false,
  },
};

export const reducer = createReducer<State>(
  initialState,

  on(CountryValidationApiActions.load, (state) => ({
    ...state,
    rules: LoadableStateReducerHelper.startLoad(state.rules),
  })),

  on(CountryValidationApiActions.loadSuccess, (state, { rules }) => ({
    ...state,
    rules: LoadableStateReducerHelper.loadSuccess(rules),
  })),

  on(CountryValidationApiActions.loadError, (state, { error }) => ({
    ...state,
    rules: LoadableStateReducerHelper.loadError(state.rules, error),
  }))
);
