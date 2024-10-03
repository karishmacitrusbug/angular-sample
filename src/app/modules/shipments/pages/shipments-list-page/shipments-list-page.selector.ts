import { ShipmentStatus } from '@global/enums/shipment-status.enum';
import { matchesItemKeys } from '@global/helpers/matches-item-keys.helper';
import { filterShipmentList } from '@modules/shipments/helpers/filter-shipment-list.helper';
import { sortShipmentOrders, sortShipmentOrdersByColumns } from '@modules/shipments/helpers/sort-shipment-orders.helper';
import { createSelector } from '@ngrx/store';
import isEmpty from 'lodash/isEmpty';
import * as fromShipment from '../../reducers';

export const selectShipmentListLoading = createSelector(fromShipment.selectShipmentListState, (shipmentList) => shipmentList.isLoading);

export const selectShipmentListKeyword = createSelector(fromShipment.selectShipmentListState, (shipmentList) => shipmentList.keyword);

export const selectOwnershipFilter = createSelector(fromShipment.selectShipmentListState, (shipmentList) => shipmentList.onlyOwnQuotes);

export const selectSortingPrefrences = createSelector(
  fromShipment.selectShipmentListState,
  (shipmentList) => shipmentList.sortingPreferences
);

export const selectShipmentListAllItems = createSelector(
  fromShipment.selectShipmentListState,
  selectShipmentListKeyword,
  (shipmentList, keyword) => {
    const shipments = shipmentList.data.items.filter((item) => matchesItemKeys(item, keyword, ['shipmentId', 'reference1', 'reference2']));
    return shipments.filter((shipment) => shipment.acceptanceDate).sort((a, b) => sortShipmentOrders(b, a));
  }
);

export const selectShipmentListAllItemsSorted = createSelector(
  selectShipmentListAllItems,
  selectSortingPrefrences,
  (shipments, sortingPrefrences) => sortShipmentOrdersByColumns(shipments, sortingPrefrences.all)
);

export const selectShipmentListShipmentPendingItems = createSelector(
  selectShipmentListAllItems,
  selectSortingPrefrences,
  (shipmentList, sortingPreferences) =>
    sortShipmentOrdersByColumns(
      shipmentList.filter((item) => item.status === ShipmentStatus.CompliancePending),
      sortingPreferences.pending
    )
);

export const selectShipmentListEnRouteItems = createSelector(
  selectShipmentListAllItems,
  selectSortingPrefrences,
  (shipmentList, sortingPreferences) =>
    sortShipmentOrdersByColumns(
      shipmentList.filter((item) => item.status === ShipmentStatus.Tracking),
      sortingPreferences.enroute
    )
);

export const selectShipmentListCompletedItems = createSelector(
  selectShipmentListAllItems,
  selectSortingPrefrences,
  (shipmentList, sortingPreferences) =>
    sortShipmentOrdersByColumns(
      shipmentList
        .filter((item) => item.status === ShipmentStatus.Completed)
        .sort((a, b) => new Date(b.finalDeliveryDate).getTime() - new Date(a.finalDeliveryDate).getTime()),
      sortingPreferences.completed
    )
);

export const selectShipmentListAdvancedFilters = createSelector(fromShipment.selectShipmentListState, (state) => state.advancedFilters);

export const selectShipmentListFilteredItems = createSelector(
  selectShipmentListAllItems,
  selectShipmentListAdvancedFilters,
  selectSortingPrefrences,
  (shipmentList, advancedFilters, sortingPreferences) =>
    sortShipmentOrdersByColumns(filterShipmentList(shipmentList, advancedFilters), sortingPreferences.filtered)
);

export const selectShipmentListNumberOfAdvancedFilters = createSelector(selectShipmentListAdvancedFilters, (advancedFilters) => {
  if (!advancedFilters) {
    return 0;
  }

  return Object.values(advancedFilters).filter((filter) => !isEmpty(filter)).length;
});
