import { ShipmentDocumentType } from '@global/enums/shipments/shipment-document-type.enum';
import { ShipmentDocumentVM } from '@global/interfaces/shipments/shipment-document.vm';

export interface CbShipmentDocumentVM extends ShipmentDocumentVM {
  type: ShipmentDocumentType;
}
