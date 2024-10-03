import { CurrencyCode } from '@global/enums/currency-code.enum';
import { LengthUnit } from '@global/enums/length-unit.enum';
import { WeightUnit } from '@global/enums/weight-unit.enum';
import { AddressCardAddressVM } from '@global/interfaces/address/address.vm';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { ChargeableWeightDialogPackageVM } from '@global/interfaces/package.vm';
import { TypeOfGoods, ValuationMethod } from '@CitT/data';

export interface QuoteBasicsForm {
  from: string;
  to: string;
  pickUpAddress?: AddressCardAddressVM[];
  localVatRegistration?: LocalVatRegistrationVM;
  typeOfGoods?: TypeOfGoods;
  shipmentValueCurrency: CurrencyCode;
  estimatedWeight: number;
  estimatedWeightUnit: WeightUnit;
  lengthUnit: LengthUnit;
  packages: ChargeableWeightDialogPackageVM[];
  projectReferences: string[];
  valuationMethod?: ValuationMethod;
  clientReferenceValues?: string;
}
