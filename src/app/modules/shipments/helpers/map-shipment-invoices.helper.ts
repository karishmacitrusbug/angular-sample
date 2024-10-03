import { InvoiceType } from '@global/enums/invoice-type.enum';
import { ShipmentInvoiceVM } from '@global/interfaces/shipments/shipment-invoices.vm';
import { InvoiceTypeHelper } from '@shared/helpers/invoice-type.helper';
import { InvoiceStatus, ShipmentOrderRelations, ShipmentOrderRelationsInvoiceDetails } from '@CitT/data';

export const mapShipmentInvoices = (soRelations: ShipmentOrderRelations): ShipmentInvoiceVM[] =>
  soRelations.InvoiceDetails?.filter((invoice) => invoice.InvoiceStatus !== InvoiceStatus._NONE_ && invoice.InvoiceStatus !== null).map(
    (invoice) => ({
      id: invoice.Id,
      name: invoice.Name,
      status: invoice.InvoiceStatus,
      price: invoice.AmountOutstanding,
      type: getInvoiceType(invoice),
      dueDate: invoice.DueDate,
      stripeUrl: invoice.Stripelink,
    })
  );

const getInvoiceType = (invoice: ShipmentOrderRelationsInvoiceDetails): InvoiceType | undefined => {
  const mappedInvoice = InvoiceTypeHelper.createPayloadFromSOInvoiceDetails(invoice);
  if (InvoiceTypeHelper.isOutstandingInvoice(mappedInvoice)) {
    return InvoiceType.Outstanding;
  }

  if (InvoiceTypeHelper.isOpenCreditInvoice(mappedInvoice)) {
    return InvoiceType.OpenCredits;
  }

  if (InvoiceTypeHelper.isClosedInvoice(mappedInvoice)) {
    return InvoiceType.Closed;
  }

  return undefined;
};
