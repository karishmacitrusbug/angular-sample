import { createSelector } from '@ngrx/store';
import * as fromNewQuote from '../../reducers';
import { ProgressTrackerVM } from './progress-tracker.vm';

export const selectProgressTracker = createSelector(
  fromNewQuote.selectNewQuoteBasicsState,
  fromNewQuote.selectNewQuoteLineItemsState,
  fromNewQuote.selectNewQuoteShipmentMethodState,
  fromNewQuote.selectNewQuoteFinalCostsState,
  (
    { state: basicsState, values },
    { state: lineItemsState, lineItems },
    { state: shipmentMethodState, selectedShipmentMethodType },
    { state: finalCostsState, finalCosts }
  ): ProgressTrackerVM => ({
    basics: {
      state: basicsState,
      ...values.data,
    },
    lineItems: {
      state: lineItemsState,
      numberOfItems: lineItems.length,
    },
    shipmentMethod: { state: shipmentMethodState, selectedShipmentMethodType },
    finalCosts: {
      state: finalCostsState,
      value: finalCosts.data?.costs.totalInvoiceAmount,
    },
  })
);
