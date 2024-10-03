import { createSelector } from '@ngrx/store';
import { FreightStatus } from '@CitT/data';
import isNil from 'lodash/isNil';
import * as fromNewQuote from '../../reducers';

export const selectCanProceed = createSelector(fromNewQuote.selectNewQuoteShipmentMethodState, (state) => {
  const selectedShipmentMethod = state.shipmentMethods.data.find(
    (shipmentMethod) => shipmentMethod.type === state.selectedShipmentMethodType
  );

  if (isNil(selectedShipmentMethod)) {
    return false;
  }

  if (!selectedShipmentMethod.isHandledByCb) {
    return true;
  }

  return !isNil(state.freight.data?.status) && state.freight.data?.status !== FreightStatus.SEARCHING;
});
