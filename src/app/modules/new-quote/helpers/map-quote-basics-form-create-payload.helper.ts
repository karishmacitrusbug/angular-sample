import { ServiceType } from '@global/enums/service-type.enum';
import { mapDimensionsUnitPayload } from '@global/helpers/map-dimensions-unit-payload.helper';
import { mapWeightUnitPayload } from '@global/helpers/map-weight-unit-payload.helper';
import { roundDecimal } from '@global/helpers/utils.helper';
import { NewQuoteDefaults } from '@global/interfaces/new-quote-defaults.interface';
import { ChargeableWeightDialogPackageVM } from '@global/interfaces/package.vm';
import { mapEstimatedWeight } from '@global/modules/common-quote/helpers/map-estimated-weight.helper';
import { QuoteBasicsForm } from '@modules/quote/interfaces/quote-basics-form.interface';
import { CourierResponsibility, CreateShipmentOrderPackage, LithiumBatteryTypes, YesNo, CbCreateQuoteRequest } from '@CitT/data';
import get from 'lodash/get';

export const mapQuoteBasicsFormCreatePayload = (
  values: QuoteBasicsForm,
  defaults: NewQuoteDefaults
): CbCreateQuoteRequest['Quotes'][0] => {
  const pickUpAddress = values.pickUpAddress[0];
  const hasBatteries = values.packages.some((shipmentPackage) => shipmentPackage.hasBatteries);
  return {
    estimatedChargableweight: roundDecimal(mapEstimatedWeight(values.estimatedWeight, values.estimatedWeightUnit)),
    ServiceType: ServiceType.IOR,
    Courier_responsibility: defaults.citrToHandleFreight === false ? CourierResponsibility.CLIENT : CourierResponsibility.TEC_EX,
    Reference1: get(values.projectReferences, [0]),
    Reference2: get(values.projectReferences, [1]),
    ShipFrom: values.from,
    ShipTo: values.to,
    ShipmentvalueinUSD: 0,
    Type_of_Goods: values.typeOfGoods,
    Li_ion_Batteries: hasBatteries ? YesNo.YES : YesNo.NO,
    Li_ion_BatteryTypes: hasBatteries ? LithiumBatteryTypes.ION_BATTERIES : undefined,
    PickUpAddressId: pickUpAddress?.id || null,
    FinalDelivieries: [],
    ShipmentOrder_Packages: values.packages.map((shipmentPackage) => mapShipmentPackage(values, shipmentPackage)),
  };
};

const mapShipmentPackage = (values: QuoteBasicsForm, shipmentPackage: ChargeableWeightDialogPackageVM): CreateShipmentOrderPackage => ({
  Actual_Weight: roundDecimal(shipmentPackage.weight),
  Packages_of_Same_Weight: shipmentPackage.packageCount,
  Height: roundDecimal(shipmentPackage.height),
  Length: roundDecimal(shipmentPackage.length),
  Breadth: roundDecimal(shipmentPackage.breadth),
  Dimension_Unit: mapDimensionsUnitPayload(shipmentPackage.lengthUnit),
  Weight_Unit: mapWeightUnitPayload(shipmentPackage.weightUnit),
  LithiumBatteries: shipmentPackage.hasBatteries,
  DangerousGoods: shipmentPackage.hasDangerousGoods,
});
