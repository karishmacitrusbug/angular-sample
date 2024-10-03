import { Freight } from '@global/interfaces/freight.interface';
import { ShipmentMethod } from '@modules/quote/interfaces/shipment-method.interface';
import { ThirdPartyCourier } from '@modules/quote/interfaces/third-party-courier.interface';
import { CbCourier } from '@modules/quote/interfaces/cb-courier.interface';
import { FreightType } from '@CitT/data';
import { Observable } from 'rxjs';

export interface ShipmentMethodDialogPayload {
  shipmentMethods: ShipmentMethod[];
  thirdPartyCouriers: ThirdPartyCourier[];
  selectedShipmentMethodType: FreightType;
  freight$: Observable<Freight>;
  zeeCouriers$: Observable<CbCourier[]>;
  selectedCbCourierId$: Observable<string | undefined>;
}
