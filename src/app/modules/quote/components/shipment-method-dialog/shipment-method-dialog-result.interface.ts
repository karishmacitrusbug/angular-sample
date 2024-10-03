import { FreightType } from '@CitT/data';

export interface ShipmentMethodDialogResult {
  selectedShipmentMethodType: FreightType;
  selectedCbCourierId?: string;
}
