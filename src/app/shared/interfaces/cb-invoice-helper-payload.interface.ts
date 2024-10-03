import { InvoiceStatus } from '@CitT/data/model/invoiceStatus';
import { InvoiceType } from '@CitT/data/model/invoiceType';

export interface CbInvoiceHelperPayload {
  outstandingAmount: number;
  name: string;
  type: InvoiceType;
  status: InvoiceStatus;
}
