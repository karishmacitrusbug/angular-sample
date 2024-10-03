/**
 * ShipmentMethodState
 * 
 * This enum represents the various states that a shipment method selection process can be in
 * during the quote or shipment creation workflow. It tracks the progress of selecting a shipment method.
 * 
 * Enum values:
 * - `NotCompleted`: The shipment method selection has not been started or is incomplete.
 * - `InProgress`: The shipment method selection is currently in progress.
 * - `Completed`: The shipment method has been successfully selected and the process is complete.
 */
export enum ShipmentMethodState {
  /** The shipment method selection has not been completed or initiated. */
  NotCompleted,

  /** The shipment method selection is currently in progress. */
  InProgress,

  /** The shipment method selection has been completed successfully. */
  Completed,
}
