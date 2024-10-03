import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Loadable } from '@global/interfaces/loadable.interface';
import { ShipmentDetailsShipmentVM } from '@modules/shipments/interfaces/shipment-details-shipment.vm';
import { createReducer, on } from '@ngrx/store';
import * as ShipmentDetailsActions from '../actions/shipment-details.actions';

export const shipmentDetailsKey = 'shipmentDetails';

export interface State {
  shipment: Loadable<ShipmentDetailsShipmentVM>;
}

export const initialState: State = {
  shipment: {
    isLoading: false,
    data: undefined,
  },
};

export const reducer = createReducer<State>(
  initialState,
  on(ShipmentDetailsActions.enter, (state) => ({
    ...state,
    shipment: LoadableStateReducerHelper.startLoad(state.shipment),
  })),

  on(ShipmentDetailsActions.loadShipmentSuccess, (state, { shipment }) => ({
    ...state,
    shipment: LoadableStateReducerHelper.loadSuccess(shipment),
  })),

  on(ShipmentDetailsActions.loadShipmentError, (state, { error }) => ({
    ...state,
    shipment: LoadableStateReducerHelper.loadError(state.shipment, error),
  })),

  on(ShipmentDetailsActions.editPickupAddressSuccess, (state, { addresses }) => ({
    ...state,
    shipment: LoadableStateReducerHelper.loadSuccess({ ...state.shipment.data, pickUpAddress: addresses }),
  })),

  on(ShipmentDetailsActions.editPickupAddressError, (state, { error }) => ({
    ...state,
    shipment: LoadableStateReducerHelper.loadError(state.shipment, error),
  })),

  on(ShipmentDetailsActions.editDeliveryLocationsSuccess, (state, { addresses }) => ({
    ...state,
    shipment: LoadableStateReducerHelper.loadSuccess({ ...state.shipment.data, locationAddresses: addresses }),
  })),

  on(ShipmentDetailsActions.editDeliveryLocationsError, (state, { error }) => ({
    ...state,
    shipment: LoadableStateReducerHelper.loadError(state.shipment, error),
  })),

  on(ShipmentDetailsActions.addPackagesSuccess, (state, { packages }) => ({
    ...state,
    shipment: LoadableStateReducerHelper.loadSuccess({ ...state.shipment.data, packages }),
  })),

  on(ShipmentDetailsActions.saveNoteSuccess, (state, { note }) => ({
    ...state,
    shipment: LoadableStateReducerHelper.loadSuccess({ ...state.shipment.data, note }),
  })),

  on(ShipmentDetailsActions.saveNoteError, (state, { error }) => ({
    ...state,
    shipment: LoadableStateReducerHelper.loadError(state.shipment, error),
  }))
);
