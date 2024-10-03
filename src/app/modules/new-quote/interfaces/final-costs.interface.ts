import { ServiceType } from '@global/enums/service-type.enum';
import { Costs } from '@global/interfaces/costs.interface';
import { QuoteTimeline } from '@global/modules/common-quote/interfaces/quote-timeline.interface';

export interface FinalCosts {
  costs: Costs;
  timeline: QuoteTimeline;
  shippingNotes: string;
  serviceType: ServiceType;
  shipmentValue: number;
  etaDisclaimer?: string;
  reasonForProForma: string;
  expiryDate: string;
  liabilityCoverFeeEnabled: boolean;
}
