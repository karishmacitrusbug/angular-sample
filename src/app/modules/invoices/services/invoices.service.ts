import { Injectable } from '@angular/core';
import { BaseInvoicesService } from '@global/modules/common-invoices/base-classes/base-invoices.service';
import { InvoiceTypeHelper } from '@shared/helpers/invoice-type.helper';
import { Invoice } from '@CitT/data';

@Injectable()
export class InvoicesService extends BaseInvoicesService {
  protected isOutstandingInvoice(invoice: Invoice): boolean {
    return InvoiceTypeHelper.isOutstandingInvoice(InvoiceTypeHelper.createPayloadFromInvoice(invoice));
  }

  protected isOpenCreditInvoice(invoice: Invoice): boolean {
    return InvoiceTypeHelper.isOpenCreditInvoice(InvoiceTypeHelper.createPayloadFromInvoice(invoice));
  }

  protected isClosedInvoice(invoice: Invoice): boolean {
    return InvoiceTypeHelper.isClosedInvoice(InvoiceTypeHelper.createPayloadFromInvoice(invoice));
  }
}
