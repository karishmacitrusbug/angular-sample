import { ServiceType } from '@global/enums/service-type.enum';
import { Costs } from '@global/interfaces/costs.interface';
import { ChargeableWeightDialogPackageVM } from '@global/interfaces/package.vm';
import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { QuoteTimeline } from '@global/modules/common-quote/interfaces/quote-timeline.interface';
import { createAction, props } from '@ngrx/store';

export const enter = createAction('[New Quote Final Costs] enter');

export const loadFinalCosts = createAction('[New Quote Final Costs] loadFinalCosts');
export const loadFinalCostsSuccess = createAction(
  '[New Quote Final Costs] loadFinalCostsSuccess',
  props<{
    finalCosts: {
      costs: Costs;
      timeline: QuoteTimeline;
      shippingNotes: string;
      serviceType: ServiceType;
      shipmentValue: number;
      etaDisclaimer: string;
      reasonForProForma: string;
      expiryDate: string;
      liabilityCoverFeeEnabled: boolean;
    };
    state: FinalCostsState;
  }>()
);
export const loadFinalCostsError = createAction('[New Quote Final Costs] loadFinalCostsError', props<{ error: string }>());

export const updateFinalCostsState = createAction('[New Quote Final Costs] updateFinalCostsState', props<{ state: FinalCostsState }>());

export const addPackages = createAction('[New Quote Final Costs] addPackages');
export const addPackagesSuccess = createAction(
  '[New Quote Final Costs] addPackagesSuccess',
  props<{ packages: ChargeableWeightDialogPackageVM[] }>()
);
export const addPackagesError = createAction('[New Quote Final Costs] addPackagesError', props<{ error: string }>());
export const acceptQuote = createAction('[New Quote Final Costs] acceptQuote');

export const downloadCostEstimate = createAction('[New Quote Final Costs] downloadCostEstimate');

export const cancelQuote = createAction('[New Quote Final Cost] cancelQuote');

export const changeShipmentMethod = createAction('[New Quote Final Cost] changeShipmentMethod');

export const toggleLiabilityCoverFee = createAction('[New Quote Final Costs] toggleLiabilityCoverFee', props<{ isEnabled: boolean }>());

export const leave = createAction('[New Quote Final Costs] leave');
