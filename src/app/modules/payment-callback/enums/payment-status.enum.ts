/**
 * PaymentStatus
 * 
 * This enum defines the possible statuses for a payment transaction.
 * It is used to indicate whether a payment was successfully processed or if it was canceled.
 * 
 * Enum values:
 * - `Success`: Indicates that the payment was successfully completed.
 * - `Canceled`: Indicates that the payment process was canceled by the user or due to an issue.
 */
export enum PaymentStatus {
  /** The payment was completed successfully. */
  Success = 'SUCCESS',

  /** The payment was canceled by the user or failed to process. */
  Canceled = 'CANCELED',
}
