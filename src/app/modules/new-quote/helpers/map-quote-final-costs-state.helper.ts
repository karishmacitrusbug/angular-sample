import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { OrderType, ShipmentOrder } from '@CitT/data';

export const mapFinalCostsState = (shipmentOrder: ShipmentOrder): FinalCostsState => {
  if (shipmentOrder.Quote_type__c === OrderType.PRO_FORMA_QUOTE) {
    return FinalCostsState.ReadyProForma;
  }

  return FinalCostsState.Ready;
};
