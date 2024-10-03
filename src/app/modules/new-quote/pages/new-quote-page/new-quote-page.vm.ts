import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { LineItemsState } from '@global/modules/common-quote/enums/line-items-state.enum';
import { ShipmentMethodState } from '@modules/new-quote/enums/shipment-method-state.enum';
import { FreightStatus } from '@CitT/data';

export interface NewQuotePageVM {
  quoteReference?: string;
  id?: string;
  to?: string;
  showAcceptButton: boolean;
  hasLocalVatRegistration: boolean;
  freightStatus?: FreightStatus;
  lineItemsState: LineItemsState;
  shipmentMethodState: ShipmentMethodState;
  finalCostsState: FinalCostsState;
  canSave: boolean;
  isVatRegistrationRequired?: boolean;
  clientReferenceValues?: string;
}
