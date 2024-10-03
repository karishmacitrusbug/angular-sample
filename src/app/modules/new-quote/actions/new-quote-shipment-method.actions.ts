import { Freight } from '@global/interfaces/freight.interface';
import { ShipmentMethod } from '@modules/quote/interfaces/shipment-method.interface';
import { ThirdPartyCourier } from '@modules/quote/interfaces/third-party-courier.interface';
import { CbCourier } from '@modules/quote/interfaces/cb-courier.interface';
import { createAction, props } from '@ngrx/store';
import { FreightType } from '@CitT/data';

export const enter = createAction('[New Quote Shipment Method] Enter');

export const loadShipmentMethods = createAction('[New Quote Shipment Method] Load Shipment Methods');
export const loadShipmentMethodsSuccess = createAction(
  '[New Quote Shipment Method] Load Shipment Methods Success',
  props<{ shipmentMethods: ShipmentMethod[]; selectedShipmentMethodType: FreightType }>()
);
export const loadShipmentMethodsError = createAction('[New Quote Shipment Method] Load Shipment Methods Error', props<{ error: string }>());

export const loadCbCouriers = createAction('[New Quote Shipment Method] Load Cb Couriers');
export const loadCbCouriersSuccess = createAction(
  '[New Quote Shipment Method] Load Cb Couriers Success',
  props<{ zeeCouriers: CbCourier[]; selectedCbCourierId: string }>()
);
export const loadCbCouriersError = createAction('[New Quote Shipment Method] Load Cb Couriers Error', props<{ error: string }>());

export const loadThirdPartyCouriers = createAction('[New Quote Shipment Method] Load Third Party Couriers');
export const loadThirdPartyCouriersSuccess = createAction(
  '[New Quote Shipment Method] Load Third Party Couriers Success',
  props<{ thirdPartyCouriers: ThirdPartyCourier[] }>()
);
export const loadThirdPartyCouriersError = createAction(
  '[New Quote Shipment Method] Load Third Party Couriers Error',
  props<{ error: string }>()
);

export const startPollFreight = createAction('[New Quote Shipment Method] Start Poll Freight');
export const restartPollFreight = createAction('[New Quote Shipment Method] Restart Poll Freight');
export const updateFreight = createAction('[New Quote Shipment Method] Update Freight', props<{ freight: Freight }>());

export const selectShipmentMethod = createAction(
  '[New Quote Shipment Method] Select Shipment Method',
  props<{ shipmentMethod: ShipmentMethod }>()
);
export const selectCbCourierId = createAction('[New Quote Shipment Method] Select Cb Courier Id', props<{ zeeCourierId: string }>());

export const submit = createAction('[New Quote Shipment Method] Submit');
export const submitSuccess = createAction('[New Quote Shipment Method] SubmitSuccess');

export const changeShipmentProvider = createAction(
  '[New Quote Shipment Method] ChangeShipmentProvider',
  props<{ selectedShipmentMethodType: FreightType; selectedCbCourierId?: string }>()
);
export const changeShipmentProviderSuccess = createAction(
  '[New Quote Shipment Method] ChangeShipmentProviderSuccess',
  props<{ selectedShipmentMethodType: FreightType; selectedCbCourierId?: string }>()
);
