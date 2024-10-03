import { roundDecimal } from '@global/helpers/utils.helper';
import { mapEstimatedWeight } from '@global/modules/common-quote/helpers/map-estimated-weight.helper';
import { LithiumBatteryTypes, ServiceType, TypeOfGoods, UpdateShipmentOrderRequest, YesNo } from '@CitT/data';
import get from 'lodash/get';
import { QuoteBasicsForm } from '../interfaces/quote-basics-form.interface';

export const mapUpdateQuoteBasicsPayload = (values: QuoteBasicsForm): UpdateShipmentOrderRequest => {
  const hasBatteries = values.packages.some((shipmentPackage) => shipmentPackage.hasBatteries);
  return {
    Reference1: get(values.projectReferences, [0]),
    Reference2: get(values.projectReferences, [1]),
    LionBatteries: hasBatteries ? YesNo.Yes : YesNo.No,
    LionBatteriestype: hasBatteries ? LithiumBatteryTypes.IONBatteries : undefined,
    TypeOfGoods: values.typeOfGoods || TypeOfGoods.New,
    ServiceType: ServiceType.IOR,
    ShipFromCountry: values.from,
    ChargeableWeight: roundDecimal(mapEstimatedWeight(values.estimatedWeight, values.estimatedWeightUnit)),
  };
};
