import { CurrencyCode } from '@global/enums/currency-code.enum';
import { WeightUnit } from '@global/enums/weight-unit.enum';
import { ChargeableWeightDialogPackageVM } from '@global/interfaces/package.vm';
import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { LineItemsState } from '@global/modules/common-quote/enums/line-items-state.enum';
import { ShipmentMethodState } from '@modules/new-quote/enums/shipment-method-state.enum';
import { FreightType } from '@CitT/data';

export interface ProgressTrackerVM {
  basics: {
    state: 'in-progress' | 'completed';
    from: string;
    to: string;
    shipmentValue?: number;
    shipmentValueCurrency: CurrencyCode;
    estimatedWeight?: number;
    estimatedWeightUnit: WeightUnit;
    packages: ChargeableWeightDialogPackageVM[];
  };

  lineItems: {
    state: LineItemsState;
    numberOfItems: number;
  };

  shipmentMethod: {
    state: ShipmentMethodState;
    selectedShipmentMethodType?: FreightType;
  };

  finalCosts: {
    state: FinalCostsState;
    value: number;
  };
}
