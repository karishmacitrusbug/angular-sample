import { CbInvoiceHelperPayload } from '@shared/interfaces/cb-invoice-helper-payload.interface';
import { Invoice, InvoiceStatus, InvoiceType } from '@CitT/data';
import { ShipmentOrderRelationsInvoiceDetails } from '@CitT/data/model/shipmentOrderRelationsInvoiceDetails';

const invoiceRecordTypeName = 'Client (Cb)';

/**
 * InvoiceTypeHelper
 *
 * This class provides utility methods to determine the status of invoices and
 * to create payloads for invoice data. It primarily focuses on invoices related
 * to cross-border transactions and categorizes them based on their status and type.
 */
export class InvoiceTypeHelper {
  /**
   * Checks if the given invoice is an outstanding invoice.
   *
   * An outstanding invoice is defined as one that has a non-zero outstanding amount,
   * is of type 'Client (Cb)', is not a credit note, and has a status of either
   * INVOICE_SENT or PARTIAL_PAYMENT.
   *
   * @param {CbInvoiceHelperPayload} invoice - The invoice to check.
   * @returns {boolean} - Returns true if the invoice is outstanding, otherwise false.
   */
  public static isOutstandingInvoice(invoice: CbInvoiceHelperPayload): boolean {
    return (
      invoice.outstandingAmount !== 0 &&
      invoice.name === invoiceRecordTypeName &&
      invoice.type !== InvoiceType.CREDIT_NOTE &&
      (invoice.status === InvoiceStatus.INVOICE_SENT ||
        invoice.status === InvoiceStatus.PARTIAL_PAYMENT)
    );
  }

  /**
   * Checks if the given invoice is an open credit invoice.
   *
   * An open credit invoice is defined as one that has a negative outstanding amount,
   * is of type 'Client (Cb)', is a credit note, and its status is not '_NONE_'.
   *
   * @param {CbInvoiceHelperPayload} invoice - The invoice to check.
   * @returns {boolean} - Returns true if the invoice is an open credit invoice, otherwise false.
   */
  public static isOpenCreditInvoice(invoice: CbInvoiceHelperPayload): boolean {
    return (
      invoice.outstandingAmount < 0 &&
      invoice.name === invoiceRecordTypeName &&
      invoice.type === InvoiceType.CREDIT_NOTE &&
      invoice.status !== InvoiceStatus._NONE_
    );
  }

  /**
   * Checks if the given invoice is a closed invoice.
   *
   * A closed invoice is defined as one that is of type 'Client (Cb)' and has a status
   * of either PAID, PAID_VIA_STRIPE, or POP_RECEIVED.
   *
   * @param {CbInvoiceHelperPayload} invoice - The invoice to check.
   * @returns {boolean} - Returns true if the invoice is closed, otherwise false.
   */
  public static isClosedInvoice(invoice: CbInvoiceHelperPayload): boolean {
    return (
      invoice.name === invoiceRecordTypeName &&
      [
        InvoiceStatus.PAID,
        InvoiceStatus.PAID_VIA_STRIPE,
        InvoiceStatus.POP_RECEIVED,
      ].includes(invoice.status)
    );
  }

  /**
   * Creates a payload from an Invoice object.
   *
   * This method extracts relevant properties from the Invoice object and constructs
   * a CbInvoiceHelperPayload.
   *
   * @param {Invoice} invoice - The invoice object to convert.
   * @returns {CbInvoiceHelperPayload} - The constructed payload containing the invoice details.
   */
  public static createPayloadFromInvoice(
    invoice: Invoice
  ): CbInvoiceHelperPayload {
    return {
      outstandingAmount: invoice.Amount_Outstanding__c,
      name: invoice.RecordType.Name,
      type: invoice.Invoice_Type__c,
      status: invoice.Invoice_Status__c,
    };
  }

  /**
   * Creates a payload from ShipmentOrderRelationsInvoiceDetails object.
   *
   * This method constructs a CbInvoiceHelperPayload from the details of a shipment order's invoice.
   * It assumes that the record type name is 'Client (Cb)' for all such invoices.
   *
   * @param {ShipmentOrderRelationsInvoiceDetails} invoice - The invoice details from the shipment order.
   * @returns {CbInvoiceHelperPayload} - The constructed payload containing the invoice details.
   */
  public static createPayloadFromSOInvoiceDetails(
    invoice: ShipmentOrderRelationsInvoiceDetails
  ): CbInvoiceHelperPayload {
    return {
      outstandingAmount: invoice.AmountOutstanding,
      // We don't get this field from SOAllRelatedInfo,
      // but above methods rely on it, so we just use this value for every once.
      // And hopefully there won't be any invoices that don't belong to Cb.
      name: invoiceRecordTypeName,
      type: invoice.InvoiceType,
      status: invoice.InvoiceStatus,
    };
  }
}
