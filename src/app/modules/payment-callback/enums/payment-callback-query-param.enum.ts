/**
 * PaymentCallbackQueryParam
 * 
 * This enum defines the query parameters that are expected in the callback URL
 * after a payment transaction is completed. These parameters provide information
 * about the payment result, such as the invoice ID and payment status.
 * 
 * Enum values:
 * - `InvoiceId`: The unique identifier for the invoice associated with the payment.
 * - `Status`: The status of the payment transaction (e.g., success, canceled).
 */
export enum PaymentCallbackQueryParam {
  /** Query parameter for the unique invoice identifier. */
  InvoiceId = 'invoiceId',

  /** Query parameter for the status of the payment transaction. */
  Status = 'status',
}
