import { ShipmentStatus } from '@global/enums/shipment-status.enum';
import { TaskState } from '@global/enums/task-state.enum';
import { TrackingState } from '@global/enums/tracking-state.enum';
import { ShipmentInvoiceVM } from '@global/interfaces/shipments/shipment-invoices.vm';
import { InvoiceStatusRollup } from '@CitT/data';

export interface ShipmentListItemVM {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  reference1: string;
  reference2: string;
  invoiceStatusRollup?: InvoiceStatusRollup;
  relatedInvoices: ShipmentInvoiceVM[];
  assignedTo?: { id: string; name: string };
  complianceState: {
    customsCompliance: TaskState;
    shippingDocuments: TaskState;
    pickUpCoordination: TaskState;
    invoicePayment: TaskState;
  };
  trackingState: TrackingState;
  eta: {
    days: number;
    blocked: boolean;
  };
  finalDeliveryDate: string;
  hasPendingClientTask: boolean;
  statusUpdates: string;
  numberOfTasks: number;
  numberOfMessages: number;
  createdDate: string;
  shipFrom: string;
  shipTo: string;
  acceptanceDate: string;
  subStatusUpdate: string;
  totalOutstandingTasks?: number;
}
