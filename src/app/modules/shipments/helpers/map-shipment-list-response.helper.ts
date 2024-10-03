import { InvoiceType } from '@global/enums/invoice-type.enum';
import { ShipmentStatus } from '@global/enums/shipment-status.enum';
import { mapEtaDays } from '@global/helpers/map-eta-days.helper';
import { mapShipmentStatus } from '@global/helpers/map-shipment-status.helper';
import { mapTaskStates } from '@global/helpers/map-task-states.helper';
import { mapTrackingState } from '@global/helpers/map-tracking-state.helper';
import { mapDeliveryDate } from '@global/helpers/shipments/map-delivery-date.helper';
import { ShipmentInvoiceVM } from '@global/interfaces/shipments/shipment-invoices.vm';
import { ShipmentListItemVM } from '@modules/shipments/interfaces/shipment-list-item.vm';
import { InvoiceTypeHelper } from '@shared/helpers/invoice-type.helper';
import { Invoice, RobotStatus, ShipmentOrderBase, SimplifiedQuoteAndShipmentStatus } from '@CitT/data';
import isNil from 'lodash/isNil';

const notVisibleStates: Set<SimplifiedQuoteAndShipmentStatus> = new Set([
  SimplifiedQuoteAndShipmentStatus.DONOT_SHOW,
  SimplifiedQuoteAndShipmentStatus.QUOTE___EXPIRED,
  SimplifiedQuoteAndShipmentStatus.QUOTE___COMPLETE_OR_INCOMPLETE,
]);

export const mapShipmentListResponse = (items: ShipmentOrderBase[], invoices: Invoice[]): ShipmentListItemVM[] => {
  const shipmentMap = items.reduce<Map<string, ShipmentListItemVM>>((shipments, item) => {
    if (notVisibleStates.has(item.NCP_Shipping_Status__c)) {
      return shipments;
    }
    const status = mapShipmentStatus(item.NCP_Shipping_Status__c);
    if (isNil(status)) {
      return shipments;
    }

    return shipments.set(item.Id, mapShipmentListItem(item, status, invoices));
  }, new Map<string, ShipmentListItemVM>());
  return [...shipmentMap.values()].sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());
};

const mapShipmentListItem = (item: ShipmentOrderBase, status: ShipmentStatus, invoices: Invoice[]): ShipmentListItemVM => {
  const relatedInvoices = invoices.filter((invoice) => invoice.Shipment_Order__c === item.Id);

  return {
    id: item.Id,
    shipmentId: item.NCP_Quote_Reference__c,
    status,
    reference1: item.Client_Reference__c,
    reference2: item.Client_Reference_2__c,
    assignedTo: isNil(item.Client_Contact_for_this_Shipment__r)
      ? undefined
      : { id: item.Client_Contact_for_this_Shipment__r.Id, name: item.Client_Contact_for_this_Shipment__r.Name },
    relatedInvoices: relatedInvoices.reduce((mappedRelatedInvoices, invoice) => {
      const mappedInvoice = mapInvoice(invoice);
      return isNil(mappedInvoice) ? mappedRelatedInvoices : mappedRelatedInvoices.concat(mappedInvoice);
    }, []),
    invoiceStatusRollup: item.Client_Invoice_Status_Roll_up__c,
    complianceState: {
      customsCompliance: mapTaskStates(item.Customs_Compliance__c),
      shippingDocuments: mapTaskStates(item.Shipping_Documents__c),
      pickUpCoordination: mapTaskStates(item.Pick_up_Coordination__c),
      invoicePayment: mapTaskStates(item.Invoice_Payment__c),
    },
    trackingState: mapTrackingState(item.Shipping_Status__c),
    eta: mapEtaDays(item),
    finalDeliveryDate: mapDeliveryDate(item),
    hasPendingClientTask: [
      item.Customs_Compliance__c || RobotStatus.RED,
      item.Shipping_Documents__c || RobotStatus.RED,
      item.Pick_up_Coordination__c || RobotStatus.RED,
      item.Invoice_Payment__c || RobotStatus.RED,
    ].includes(RobotStatus.RED),
    statusUpdates: item.Banner_Feed__c,
    numberOfTasks: item.Client_Task__c,
    numberOfMessages: item.Client_Cases__c,
    createdDate: item.CreatedDate,
    shipFrom: item.Ship_From_Country__c,
    shipTo: item.Destination__c,
    acceptanceDate: item.Cost_Estimate_Acceptance_Date__c,
    subStatusUpdate: item.Sub_Status_Update__c === 'NONE' ? undefined : item.Sub_Status_Update__c,
    totalOutstandingTasks: item.Total_Outstanding_Tasks__c,
  };
};

export const mapInvoice = (invoice: Invoice): ShipmentInvoiceVM | undefined => {
  const invoiceType = getInvoiceType(invoice);
  if (isNil(invoiceType)) {
    return undefined;
  }
  return {
    id: invoice.Id,
    name: invoice.Name,
    status: invoice.Invoice_Status__c,
    price: invoice.Amount_Outstanding__c,
    type: invoiceType,
    dueDate: invoice.Due_Date__c,
    stripeUrl: invoice.Stripe_Link__c,
  };
};

const getInvoiceType = (invoice: Invoice): InvoiceType | undefined => {
  if (InvoiceTypeHelper.isOutstandingInvoice(InvoiceTypeHelper.createPayloadFromInvoice(invoice))) {
    return InvoiceType.Outstanding;
  }

  if (InvoiceTypeHelper.isOpenCreditInvoice(InvoiceTypeHelper.createPayloadFromInvoice(invoice))) {
    return InvoiceType.OpenCredits;
  }

  if (InvoiceTypeHelper.isClosedInvoice(InvoiceTypeHelper.createPayloadFromInvoice(invoice))) {
    return InvoiceType.Closed;
  }

  return undefined;
};
