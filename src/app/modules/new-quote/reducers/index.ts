import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from '../../../reducers/index';
import * as fromNewQuoteBasics from './new-quote-basics.reducer';
import * as fromNewQuoteFinalCosts from './new-quote-final-costs.reducer';
import * as fromNewQuoteLineItems from './new-quote-line-items.reducer';
import * as fromNewQuoteShipmentMethod from './new-quote-shipment-method.reducers';

export const newQuoteFeatureKey = 'newQuote';

export interface NewQuoteState {
  [fromNewQuoteBasics.newQuoteBasicsFeatureKey]: fromNewQuoteBasics.State;
  [fromNewQuoteLineItems.newQuoteLineItemsFeatureKey]: fromNewQuoteLineItems.State;
  [fromNewQuoteFinalCosts.newQuoteFinalCostsFeatureKey]: fromNewQuoteFinalCosts.State;
  [fromNewQuoteShipmentMethod.newQuoteShipmentMethodFeatureKey]: fromNewQuoteShipmentMethod.State;
}

export interface AppState extends State {
  [newQuoteFeatureKey]: NewQuoteState;
}

export const reducers: ActionReducerMap<NewQuoteState> = {
  [fromNewQuoteBasics.newQuoteBasicsFeatureKey]: fromNewQuoteBasics.reducer,
  [fromNewQuoteLineItems.newQuoteLineItemsFeatureKey]: fromNewQuoteLineItems.reducer,
  [fromNewQuoteFinalCosts.newQuoteFinalCostsFeatureKey]: fromNewQuoteFinalCosts.reducer,
  [fromNewQuoteShipmentMethod.newQuoteShipmentMethodFeatureKey]: fromNewQuoteShipmentMethod.reducer,
};

export const selectNewQuoteFeatureState = createFeatureSelector<NewQuoteState>(newQuoteFeatureKey);

export const selectNewQuoteBasicsState = createSelector(
  selectNewQuoteFeatureState,
  (state) => state[fromNewQuoteBasics.newQuoteBasicsFeatureKey]
);

export const selectNewQuoteBasicsValuesData = createSelector(selectNewQuoteBasicsState, (state) => state.values.data);
export const selectNewQuoteBasicsShipmentOrderId = createSelector(selectNewQuoteBasicsState, (state) => state.id);
export const selectNewQuoteBasicsValuesLoading = createSelector(
  selectNewQuoteBasicsState,
  (state) => state.values.isLoading || state.defaults.isLoading
);

export const selectNewQuoteBasicsIsReusedQuote = createSelector(selectNewQuoteBasicsState, (state) => state.isReusedQuote);

export const selectNewQuoteDefaults = createSelector(selectNewQuoteBasicsState, (state) => state.defaults.data);
export const selectShipmentOrderId = createSelector(selectNewQuoteBasicsState, (state) => state.id);

export const selectNewQuoteLineItemsState = createSelector(
  selectNewQuoteFeatureState,
  (state) => state[fromNewQuoteLineItems.newQuoteLineItemsFeatureKey]
);
export const selectNewQuoteLineItems = createSelector(selectNewQuoteLineItemsState, (state) => state.lineItems);
export const selectNewQuoteLineItemsHasStoreFees = createSelector(selectNewQuoteLineItemsState, (state) => state.hasStoreFees);
export const selectNewQuoteLineItemsCurrency = createSelector(selectNewQuoteLineItemsState, (state) => state.currency);

export const selectNewQuoteFinalCostsState = createSelector(
  selectNewQuoteFeatureState,
  (state) => state[fromNewQuoteFinalCosts.newQuoteFinalCostsFeatureKey]
);

export const selectNewQuoteShipmentMethodState = createSelector(
  selectNewQuoteFeatureState,
  (state) => state[fromNewQuoteShipmentMethod.newQuoteShipmentMethodFeatureKey]
);
export const selectNewQuoteShipmentMethodLoading = createSelector(
  selectNewQuoteShipmentMethodState,
  (state) => state.shipmentMethods.isLoading || state.freight.isLoading || state.thirdPartyCouriers.isLoading
);
export const selectNewQuoteShipmentMethods = createSelector(selectNewQuoteShipmentMethodState, (state) => state.shipmentMethods.data);
export const selectNewQuoteFreight = createSelector(selectNewQuoteShipmentMethodState, (state) => state.freight.data);
export const selectNewQuoteCbCouriers = createSelector(selectNewQuoteShipmentMethodState, (state) => state.zeeCouriers.data);
export const selectNewQuoteCbCouriersHasError = createSelector(selectNewQuoteShipmentMethodState, (state) => !!state.zeeCouriers.error);
export const selectNewQuoteThirdPartyCouriers = createSelector(selectNewQuoteShipmentMethodState, (state) => state.thirdPartyCouriers.data);
export const selectNewQuoteSelectedShipmentMethodType = createSelector(
  selectNewQuoteShipmentMethodState,
  (state) => state.selectedShipmentMethodType
);
export const selectNewQuoteSelectedCbCourierId = createSelector(selectNewQuoteShipmentMethodState, (state) => state.selectedCbCourierId);
export const selectNewQuoteSelectedShipmentMethod = createSelector(selectNewQuoteShipmentMethodState, (state) =>
  state.shipmentMethods.data.find((shipmentMethod) => shipmentMethod.type === state.selectedShipmentMethodType)
);
