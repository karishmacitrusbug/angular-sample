import { LongCurrencyCode } from '@CitT/data';

/**
 * Interface representing options for mapping line items in a quote or invoice.
 *
 * This interface provides configuration options that influence how line items
 * are processed, specifically regarding currency, store fee calculations, and
 * the presence of store fees.
 */
export interface LineItemsMappingOptions {
  currency: LongCurrencyCode; // The currency code used for pricing, following the LongCurrencyCode format.
  calculateStoreFee: boolean; // Indicates whether to calculate store fees for the line items.
  hasStoreFees: boolean; // Indicates if the line items have associated store fees.
}
