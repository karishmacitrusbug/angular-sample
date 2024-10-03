/**
 * Interface representing the payload for an invoice payment request.
 *
 * This interface defines the structure of the data needed to process a payment
 * for an invoice, including the unique identifier of the invoice and
 * the URL for the Stripe payment page.
 */
export interface InvoicePaymentPayload {
  invoiceId: string; // The unique identifier of the invoice to be paid.
  stripeUrl: string; // The URL for the Stripe payment page associated with the invoice.
}
