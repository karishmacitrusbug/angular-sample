import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Freight } from '@global/interfaces/freight.interface';
import { Loadable } from '@global/interfaces/loadable.interface';
import { ShipmentMethod } from '@modules/quote/interfaces/shipment-method.interface';
import { ThirdPartyCourier } from '@modules/quote/interfaces/third-party-courier.interface';
import { CbCourier } from '@modules/quote/interfaces/cb-courier.interface';
import { createReducer, on } from '@ngrx/store';
import { FreightType } from '@CitT/data';
import isNil from 'lodash/isNil';
import * as NewQuoteShipmentMethodActions from '../actions/new-quote-shipment-method.actions';
import * as NewQuoteActions from '../actions/new-quote.actions';
import { ShipmentMethodState } from '../enums/shipment-method-state.enum';

export const newQuoteShipmentMethodFeatureKey = 'newQuoteShipmentMethod';

export interface State {
  state: ShipmentMethodState;
  shipmentMethods: Loadable<ShipmentMethod[]>;
  selectedShipmentMethodType?: FreightType;
  freight: Loadable<Freight | undefined>;
  zeeCouriers: Loadable<CbCourier[]>;
  thirdPartyCouriers: Loadable<ThirdPartyCourier[]>;
  selectedCbCourierId?: string;
}

export const initialState: State = {
  state: ShipmentMethodState.NotCompleted,
  shipmentMethods: { isLoading: false, data: [] },
  freight: { isLoading: false, data: undefined },
  zeeCouriers: { isLoading: false, data: [] },
  thirdPartyCouriers: { isLoading: false, data: [] },
};

export const reducer = createReducer<State>(
  initialState,
  on(NewQuoteShipmentMethodActions.enter, (state): State => ({ ...state, state: ShipmentMethodState.InProgress })),
  on(NewQuoteShipmentMethodActions.loadShipmentMethods, (state) => ({
    ...state,
    shipmentMethods: LoadableStateReducerHelper.startLoad(state.shipmentMethods),
  })),
  on(NewQuoteShipmentMethodActions.loadShipmentMethodsSuccess, (state, { shipmentMethods, selectedShipmentMethodType }) => ({
    ...state,
    shipmentMethods: LoadableStateReducerHelper.loadSuccess(shipmentMethods),
    selectedShipmentMethodType,
  })),
  on(NewQuoteShipmentMethodActions.loadShipmentMethodsError, (state, { error }) => ({
    ...state,
    shipmentMethods: LoadableStateReducerHelper.loadError(state.shipmentMethods, error),
  })),
  on(NewQuoteShipmentMethodActions.startPollFreight, (state) => ({
    ...state,
    freight: LoadableStateReducerHelper.startLoad(state.freight),
  })),
  on(NewQuoteShipmentMethodActions.updateFreight, (state, { freight }) => ({
    ...state,
    freight: LoadableStateReducerHelper.loadSuccess(freight),
    shipmentMethods: {
      ...state.shipmentMethods,
      data: state.shipmentMethods.data.map((shipmentMethod) =>
        shipmentMethod.isHandledByCb ? { ...shipmentMethod, freightAmount: freight.fee } : shipmentMethod
      ),
    },
  })),
  on(NewQuoteShipmentMethodActions.loadCbCouriers, (state) => ({
    ...state,
    zeeCouriers: LoadableStateReducerHelper.startLoad(state.zeeCouriers),
  })),
  on(NewQuoteShipmentMethodActions.loadCbCouriersSuccess, (state, { zeeCouriers, selectedCbCourierId }) => ({
    ...state,
    zeeCouriers: LoadableStateReducerHelper.loadSuccess(zeeCouriers),
    selectedCbCourierId,
  })),
  on(NewQuoteShipmentMethodActions.loadCbCouriersError, (state, { error }) => ({
    ...state,
    zeeCouriers: LoadableStateReducerHelper.loadError(state.zeeCouriers, error),
  })),
  on(NewQuoteShipmentMethodActions.loadThirdPartyCouriers, (state) => ({
    ...state,
    thirdPartyCouriers: LoadableStateReducerHelper.startLoad(state.thirdPartyCouriers),
  })),
  on(NewQuoteShipmentMethodActions.loadThirdPartyCouriersSuccess, (state, { thirdPartyCouriers }) => ({
    ...state,
    thirdPartyCouriers: LoadableStateReducerHelper.loadSuccess(thirdPartyCouriers),
  })),
  on(NewQuoteShipmentMethodActions.loadThirdPartyCouriersError, (state, { error }) => ({
    ...state,
    thirdPartyCouriers: LoadableStateReducerHelper.loadError(state.thirdPartyCouriers, error),
  })),
  on(
    NewQuoteShipmentMethodActions.selectShipmentMethod,
    (state, { shipmentMethod }): State => ({
      ...state,
      selectedShipmentMethodType: shipmentMethod.type,
    })
  ),
  on(NewQuoteShipmentMethodActions.selectCbCourierId, (state, { zeeCourierId }) => {
    const selectedCbCourier = state.zeeCouriers.data.find((courier) => courier.id === zeeCourierId);
    if (isNil(selectedCbCourier)) {
      return state;
    }

    return {
      ...state,
      selectedCbCourierId: zeeCourierId,
      shipmentMethods: {
        ...state.shipmentMethods,
        data: state.shipmentMethods.data.map((shipmentMethod) =>
          shipmentMethod.isHandledByCb ? { ...shipmentMethod, freightAmount: selectedCbCourier.fee } : shipmentMethod
        ),
      },
    };
  }),
  on(NewQuoteShipmentMethodActions.submitSuccess, (state): State => ({ ...state, state: ShipmentMethodState.Completed })),
  on(NewQuoteShipmentMethodActions.changeShipmentProviderSuccess, (state, { selectedShipmentMethodType, selectedCbCourierId }) => ({
    ...state,
    selectedShipmentMethodType,
    selectedCbCourierId: isNil(selectedCbCourierId) ? state.selectedCbCourierId : selectedCbCourierId,
  })),
  on(NewQuoteActions.leave, NewQuoteActions.startNew, NewQuoteActions.reuseQuote, (): State => initialState)
);
