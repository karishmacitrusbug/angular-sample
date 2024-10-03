import { MessageThreadType } from '@global/enums/message-thread-type.enum';
import { AddressCardAddressVM } from '@global/interfaces/address/address.vm';
import { FreightCosts } from '@global/interfaces/freight-costs.interface';
import { ChargeableWeightDialogPackageVM } from '@global/interfaces/package.vm';
import { ShipmentInvoiceVM } from '@global/interfaces/shipments/shipment-invoices.vm';
import { ShipmentDetailsShipmentVM } from '@modules/shipments/interfaces/shipment-details-shipment.vm';
import { createAction, props } from '@ngrx/store';

export const enter = createAction('[Shipment Details] enter', props<{ shipmentId: string }>());

export const loadShipment = createAction('[Shipment Details] loadShipment', props<{ shipmentId: string }>());
export const loadShipmentSuccess = createAction('[Shipment Details] loadShipmentSuccess', props<{ shipment: ShipmentDetailsShipmentVM }>());
export const loadShipmentError = createAction('[Shipment Details] loadShipmentError', props<{ error: string }>());

export const changeOwner = createAction('[Shipment Details] changeOwner', props<{ owner: string }>());

export const reuseData = createAction('[Shipment Details] reuseDate', props<{ shipmentId: string }>());

export const editPickupAddress = createAction('[Shipment Details] editPickupAddress');
export const editPickupAddressSuccess = createAction(
  '[Shipment Details] EditPickupAddressSuccess',
  props<{ addresses: AddressCardAddressVM[] }>()
);
export const editPickupAddressError = createAction('[Shipment Details] EditPickupAddressError', props<{ error: string }>());

export const deletePickupAddress = createAction('[Shipment Details] deletePickupAddress');

export const editDeliveryLocations = createAction('[Shipment Details] editDeliveryLocations');
export const editDeliveryLocationsSuccess = createAction(
  '[Shipment Details] editDeliveryLocationsSuccess',
  props<{ addresses: AddressCardAddressVM[] }>()
);
export const editDeliveryLocationsError = createAction('[Shipment Details] editDeliveryLocationsError', props<{ error: string }>());

export const saveNote = createAction('[Shipment Details] saveNote', props<{ note: string; id: string }>());
export const saveNoteSuccess = createAction('[Shipment Details] saveNoteSuccess', props<{ note: string }>());
export const saveNoteError = createAction('[Shipment Details] saveNoteError', props<{ error: string }>());

export const addPackages = createAction('[Shipment Details] addPackages', props<{ openPackageId?: number }>());
export const addPackagesSuccess = createAction(
  '[Shipment Details] addPackagesSuccess',
  props<{ packages: ChargeableWeightDialogPackageVM[] }>()
);
export const addPackagesError = createAction('[Shipment Details] addPackagesError', props<{ error: string }>());

export const openInvoice = createAction('[Shipment Details] openInvoice', props<{ invoice: ShipmentInvoiceVM }>());
export const sendInvoiceInEmail = createAction('[Shipment Details] sendInvoiceInEmail', props<{ invoiceId: string }>());
export const downloadInvoice = createAction('[Shipment Details] downloadInvoice', props<{ invoiceId: string }>());
export const payInvoice = createAction('[Shipment Details] payInvoice', props<{ invoice: ShipmentInvoiceVM }>());

export const openTask = createAction('[Shipment Details] openTask', props<{ taskId: string }>());

export const openMessage = createAction(
  '[Shipment Details] openMessage',
  props<{ id: string; messageType: MessageThreadType; openRelatedTask?: boolean }>()
);
export const newMessage = createAction('[Shipment Details] newMessage');

export const updateFreightCosts = createAction(
  '[Shipment Details] updateFreightCosts',
  props<{ freightCosts: Record<string, FreightCosts> }>()
);

export const downloadDocument = createAction('[Shipment Details] downloadDocument', props<{ id: string }>());

export const leave = createAction('[Shipment Details] leave');
