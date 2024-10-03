/**
 * NewQuoteRouteSegment
 * 
 * This enum defines the route segments used for the "New Quote" feature in the application.
 * Each segment corresponds to a specific step or page in the quote creation process, represented as URL path fragments.
 * 
 * Enum values:
 * - `Basics`: Represents the route segment for entering basic quote details.
 * - `LineItems`: Represents the route segment for adding or editing line items.
 * - `ShipmentMethod`: Represents the route segment for selecting the shipment method.
 * - `FinalCosts`: Represents the route segment for reviewing and finalizing the costs of the quote.
 */
export enum NewQuoteRouteSegment {
  /** Route segment for the basics step of the quote process. */
  Basics = 'basics',

  /** Route segment for managing line items in the quote. */
  LineItems = 'line-items',

  /** Route segment for selecting the shipment method in the quote process. */
  ShipmentMethod = 'shipment-method',

  /** Route segment for reviewing and finalizing the quote's costs. */
  FinalCosts = 'final-costs',
}
