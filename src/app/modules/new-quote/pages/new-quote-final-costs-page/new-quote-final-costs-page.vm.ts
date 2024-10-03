import { LengthUnit } from '@global/enums/length-unit.enum';
import { ServiceType } from '@global/enums/service-type.enum';
import { WeightUnit } from '@global/enums/weight-unit.enum';
import { Costs } from '@global/interfaces/costs.interface';
import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { QuoteTimeline } from '@global/modules/common-quote/interfaces/quote-timeline.interface';

export interface NewQuoteFinalCostsPageVM {
  quoteReference: string;
  state: FinalCostsState;
  chargeableWeight: number;
  weightUnit: WeightUnit;
  lengthUnit: LengthUnit;
  hasPackages: boolean;
  isLoading: boolean;
  costs: Costs;
  timeline: QuoteTimeline;
  shippingNotes: string;
  serviceType: ServiceType;
  shipmentValue: number;
  etaDisclaimer?: string;
  reasonForProForma: string;
  expirationDays: number;
  hasLocalVatRegistration: boolean;
  isVatRegistrationRequired?: boolean;
  liabilityCoverFeeEnabled: boolean;
}
