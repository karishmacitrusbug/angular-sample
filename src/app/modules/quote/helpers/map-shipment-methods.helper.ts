import { FreightType, ShipmentOrder } from '@CitT/data';
import { ShipmentMethod } from '../interfaces/shipment-method.interface';

const typesHandledByCb = new Set([FreightType.AIR]);

export const mapShipmentMethods = (shipmentMethodTypes: FreightType[], soResponse: ShipmentOrder): ShipmentMethod[] =>
  shipmentMethodTypes.map((type) => ({
    type,
    isHandledByCb: typesHandledByCb.has(type),
    freightAmount: typesHandledByCb.has(type) ? soResponse.International_Delivery_Fee__c : 0,
    transitTime: mapShipmentMethodTransitType(type, soResponse),
  }));

const mapShipmentMethodTransitType = (type: FreightType, soResponse: ShipmentOrder): string => {
  switch (type) {
    case FreightType.AIR:
      return soResponse.CPA_v2_0__r.Estimated_Transit_Time__c;
    case FreightType.SEA:
      return soResponse.CPA_v2_0__r.Estimate_Sea_Transit_Time__c;
    case FreightType.ROAD:
      return soResponse.CPA_v2_0__r.Estimate_Road_Transit_Time__c;
    default:
      return '';
  }
};
