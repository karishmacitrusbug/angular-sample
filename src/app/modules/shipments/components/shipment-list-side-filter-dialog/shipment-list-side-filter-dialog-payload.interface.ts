import { InputDataVM } from '@global/interfaces/input-data.vm';
import { ShipmentListSideFilterDialogResult } from '@modules/shipments/components/shipment-list-side-filter-dialog/shipment-list-side-filter-dialog-result.interface';

export interface ShipmentListSideFilterDialogPayload {
  filters?: ShipmentListSideFilterDialogResult;
  countries: InputDataVM<string, string>[];
}
