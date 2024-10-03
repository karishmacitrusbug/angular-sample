import { ShipmentListSideFilterDialogResult } from '@modules/shipments/components/shipment-list-side-filter-dialog/shipment-list-side-filter-dialog-result.interface';
import { ShipmentListItemVM } from '@modules/shipments/interfaces/shipment-list-item.vm';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';

export const filterShipmentList = (
  shipmentList: ShipmentListItemVM[],
  filters: ShipmentListSideFilterDialogResult
): ShipmentListItemVM[] => {
  if (isEmpty(filters)) {
    return shipmentList;
  }
  return shipmentList.filter((shipment) =>
    [checkCreatedDateMatch, checkFinalDeliveryDateMatch, checkReference1Match, checkCountryMatch].every((matchFunction) =>
      matchFunction(filters, shipment)
    )
  );
};

export const checkAssigneeMatch = (shipment: ShipmentListItemVM, assigneeId: string): boolean =>
  !isNil(shipment.assignedTo) && shipment.assignedTo.id === assigneeId;

const checkCreatedDateMatch = (filters: ShipmentListSideFilterDialogResult, shipment: ShipmentListItemVM): boolean => {
  if (isEmpty(filters.createdDateRange)) {
    return true;
  }
  const isAfterStartDate =
    isEmpty(filters.createdDateRange.start) ||
    new Date(shipment.createdDate).valueOf() >= new Date(filters.createdDateRange.start).valueOf();
  const isBeforeEndDate =
    isEmpty(filters.createdDateRange.end) || new Date(shipment.createdDate).valueOf() <= new Date(filters.createdDateRange.end).valueOf();
  return isAfterStartDate && isBeforeEndDate;
};
const checkFinalDeliveryDateMatch = (filters: ShipmentListSideFilterDialogResult, shipment: ShipmentListItemVM): boolean => {
  if (isEmpty(filters.finalDeliveryDateRange)) {
    return true;
  }
  const isAfterStartDate =
    isEmpty(filters.finalDeliveryDateRange.start1) ||
    new Date(shipment.finalDeliveryDate).toLocaleDateString() >= new Date(filters.finalDeliveryDateRange.start1).toLocaleDateString();
  const isBeforeEndDate =
    isEmpty(filters.finalDeliveryDateRange.end1) ||
    new Date(shipment.finalDeliveryDate).toLocaleDateString() <= new Date(filters.finalDeliveryDateRange.end1).toLocaleDateString();
  return isAfterStartDate && isBeforeEndDate;
};
const checkReference1Match = (filters: ShipmentListSideFilterDialogResult, shipment: ShipmentListItemVM): boolean =>
  isEmpty(filters.clientReference1) ||
  (!isEmpty(shipment.reference1) && shipment.reference1.toLowerCase().includes(filters.clientReference1.trim().toLowerCase()));
const checkCountryMatch = (filters: ShipmentListSideFilterDialogResult, shipment: ShipmentListItemVM): boolean =>
  isEmpty(filters.shipToCountry) || filters.shipToCountry.includes(shipment.shipTo);
