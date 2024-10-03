import { CurrencyCode } from '@global/enums/currency-code.enum';
import { LengthUnit } from '@global/enums/length-unit.enum';
import { WeightUnit } from '@global/enums/weight-unit.enum';
import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Loadable } from '@global/interfaces/loadable.interface';
import { NewQuoteDefaults } from '@global/interfaces/new-quote-defaults.interface';
import { createReducer, on } from '@ngrx/store';
import { QuoteBasicsForm } from '../../quote/interfaces/quote-basics-form.interface';
import * as NewQuoteBasicsActions from '../actions/new-quote-basics.actions';
import * as NewQuoteActions from '../actions/new-quote.actions';
import * as ProfileApiActions from '../actions/profile-api.actions';

export const newQuoteBasicsFeatureKey = 'newQuoteBasics';

export interface State {
  state: 'in-progress' | 'completed';
  id?: string;
  /**
   * Id of freight request related to quote
   * It is only relevant for single quotes
   */
  freightId?: string;
  cpaid?: string;
  quoteReference?: string;
  defaults: Loadable<NewQuoteDefaults>;
  values: Loadable<QuoteBasicsForm>;
  clientContact?: string;
  isReusedQuote: boolean;
}

export const initialState: State = {
  state: 'in-progress',
  isReusedQuote: false,
  defaults: {
    isLoading: false,
    data: undefined,
  },
  values: {
    data: {
      from: undefined,
      to: undefined,
      pickUpAddress: [],
      localVatRegistration: undefined,
      typeOfGoods: undefined,
      shipmentValueCurrency: CurrencyCode.USD,
      estimatedWeight: undefined,
      estimatedWeightUnit: WeightUnit.Kg,
      lengthUnit: LengthUnit.Cm,
      packages: [],
      projectReferences: [''],
      clientReferenceValues: undefined,
    },
    isLoading: false,
  },
};

export const reducer = createReducer<State>(
  initialState,
  on(ProfileApiActions.loadNewQuoteDefaults, NewQuoteActions.loadExistingQuote, (state) => ({
    ...state,
    defaults: LoadableStateReducerHelper.startLoad(state.defaults),
  })),
  on(ProfileApiActions.loadNewQuoteDefaultsSuccess, (state, { defaults }) => {
    const { citrToHandleFreight, ...values } = defaults;

    return {
      ...state,
      defaults: LoadableStateReducerHelper.loadSuccess({ ...state.defaults.data, ...defaults }),
      values: LoadableStateReducerHelper.loadSuccess({ ...state.values.data, ...values }),
    };
  }),
  on(NewQuoteActions.loadExistingQuoteSuccess, (state, { basics, defaults }) => ({
    ...state,
    isReusedQuote: true,
    values: LoadableStateReducerHelper.loadSuccess({ ...state.values.data, ...basics }),
    defaults: LoadableStateReducerHelper.loadSuccess({ ...state.defaults.data, ...defaults }),
  })),
  on(ProfileApiActions.loadNewQuoteDefaultsError, (state, { error }) => ({
    ...state,
    defaults: LoadableStateReducerHelper.loadError(state.defaults, error),
  })),
  on(NewQuoteActions.loadExistingQuoteError, (state, { error }) => ({
    ...state,
    values: LoadableStateReducerHelper.loadError(state.values, error),
  })),

  on(NewQuoteBasicsActions.submit, (state, { values }) => ({
    ...state,
    values: LoadableStateReducerHelper.startLoad({ data: values, isLoading: state.values.isLoading }),
  })),
  on(NewQuoteBasicsActions.submitSuccess, (state, { id, freightId, cpaid, quoteReference, values, clientContact }) => ({
    ...state,
    state: 'completed',
    id,
    freightId,
    cpaid,
    quoteReference,
    clientContact,
    values: LoadableStateReducerHelper.loadSuccess(values),
  })),
  on(NewQuoteBasicsActions.submitError, (state, { error }) => ({
    ...state,
    values: LoadableStateReducerHelper.loadError(state.values, error),
  })),
  on(NewQuoteBasicsActions.editSuccess, NewQuoteBasicsActions.update, (state, { values }) => ({
    ...state,
    values: LoadableStateReducerHelper.loadSuccess({ ...state.values.data, ...values }),
  })),

  on(NewQuoteActions.leave, NewQuoteActions.startNew, NewQuoteActions.reuseQuote, (): State => initialState)
);
