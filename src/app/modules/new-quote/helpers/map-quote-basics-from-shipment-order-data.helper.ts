import { CurrencyCode } from '@global/enums/currency-code.enum';
import { mapShortLengthUnit } from '@global/helpers/map-length-unit.helper';
import { mapShipmentOrderPackages } from '@global/helpers/map-shipment-order-packages.helper';
import { mapWeightUnit } from '@global/helpers/map-weight-unit.helper';
import { mapShipmentOrderPickupAddresses } from '@global/modules/common-quote/helpers/map-shipment-order-pickup-addresses.helper';
import { mapShipmentOrderShipToAddresses } from '@global/modules/common-quote/helpers/map-shipment-order-ship-to-addresses.helper';
import { QuoteBasicsForm } from '@modules/quote/interfaces/quote-basics-form.interface';
import { ShipmentOrder, ShipmentOrderRelations } from '@CitT/data';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

export const mapQuoteBasicsFromShipmentOrderData = (
  shipmentOrder: ShipmentOrder,
  shipmentOrderRelations: ShipmentOrderRelations
): QuoteBasicsForm => ({
  from: shipmentOrder.Ship_From_Country__c,
  to: shipmentOrder.Destination__c,
  typeOfGoods: shipmentOrder.Type_of_Goods__c,
  shipmentValueCurrency: CurrencyCode.USD,
  estimatedWeight: shipmentOrder.Chargeable_Weight__c,
  estimatedWeightUnit: mapWeightUnit(shipmentOrderRelations?.ShipmentOrderPackages?.[0]?.WeightUnit),
  lengthUnit: mapShortLengthUnit(shipmentOrderRelations?.ShipmentOrderPackages?.[0]?.DimensionUnit),
  valuationMethod: shipmentOrder.CPA_v2_0__r.Valuation_Method__c,
  projectReferences: [get(shipmentOrder, 'Client_Reference__c', ''), get(shipmentOrder, 'Client_Reference_2__c', '')].filter(
    (projectReference) => !isEmpty(projectReference)
  ),
  ...(shipmentOrderRelations && {
    pickUpAddress: mapShipmentOrderPickupAddresses(shipmentOrderRelations),
    packages: mapShipmentOrderPackages(shipmentOrderRelations),
    locationAddresses: mapShipmentOrderShipToAddresses(shipmentOrderRelations),
  }),
  clientReferenceValues: shipmentOrder.Client_Reference__c ? `${shipmentOrder.Client_Reference__c}` : null,
});
