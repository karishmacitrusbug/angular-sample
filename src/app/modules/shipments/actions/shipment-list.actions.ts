import { ShipmentListSideFilterDialogResult } from '@modules/shipments/components/shipment-list-side-filter-dialog/shipment-list-side-filter-dialog-result.interface';
import { ShipmentListTabQuery } from '@modules/shipments/enums/shipment-list-tab-query.enum';
import { ShipmentListItemVM } from '@modules/shipments/interfaces/shipment-list-item.vm';
import { ShipmentsTableSorting } from '@modules/shipments/interfaces/shipments-table-sorting.interface';
import { createAction, props } from '@ngrx/store';

export const enter = createAction('[Shipment List] enter');

export const load = createAction('[Shipment List] load');
export const loadSuccess = createAction('[Shipment List] loadSuccess', props<{ items: ShipmentListItemVM[] }>());

export const loadError = createAction('[Shipment List] loadError', props<{ error: string }>());

export const updateKeyword = createAction('[Shipment List] updateKeyword', props<{ keyword: string }>());
export const updateOwnershipFilter = createAction('[Shipment List] updateOwnershipFilter', props<{ onlyOwnQuotes: boolean }>());
export const openAdvancedFilters = createAction('[Shipment List] openAdvancedFilters');

export const setAdvancedFilters = createAction(
  '[Shipment List] setAdvancedFilters',
  props<{ advancedFilters: ShipmentListSideFilterDialogResult }>()
);
export const clearAdvancedFilters = createAction('[Shipment List] clearAdvancedFilters');

export const setLastActivatedTab = createAction('[Shipment List] setLastActivatedTab', props<{ tab: ShipmentListTabQuery }>());

export const applySorting = createAction(
  '[Shipment List] applySorting',
  props<{ tab: ShipmentListTabQuery; shipmentsTableSorting: ShipmentsTableSorting }>()
);

export const clearSorting = createAction('[Shipment List] clearSorting');

export const leave = createAction('[Shipment List] leave');
