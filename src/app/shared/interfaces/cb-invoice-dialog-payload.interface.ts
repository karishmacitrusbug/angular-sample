import { InvoiceDialogPayload } from '@global/modules/common-invoices/interfaces/invoice-dialog-payload.interface';

export interface CbInvoiceDialogPayload extends InvoiceDialogPayload {
  needsPayment: boolean;
  stripeUrl?: string;
}
