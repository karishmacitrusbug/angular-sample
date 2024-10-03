import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Loadable } from '@global/interfaces/loadable.interface';
import { ShipmentListSideFilterDialogResult } from '@modules/shipments/components/shipment-list-side-filter-dialog/shipment-list-side-filter-dialog-result.interface';
import { ShipmentListTabQuery } from '@modules/shipments/enums/shipment-list-tab-query.enum';
import { ShipmentListItemVM } from '@modules/shipments/interfaces/shipment-list-item.vm';
import { ShipmentsTableSorting } from '@modules/shipments/interfaces/shipments-table-sorting.interface';
import { createReducer, on } from '@ngrx/store';
import * as ShipmentListActions from '../actions/shipment-list.actions';

export const shipmentListFeatureKey = 'shipmentList';

export interface State
  extends Loadable<{
    items: ShipmentListItemVM[];
  }> {
  keyword: string;
  onlyOwnQuotes: boolean;
  advancedFilters: ShipmentListSideFilterDialogResult | undefined;
  lastActivatedTab: ShipmentListTabQuery;
  sortingPreferences: {
    [key in ShipmentListTabQuery]?: ShipmentsTableSorting;
  };
}

export const initialState: State = {
  data: {
    items: [],
  },
  isLoading: false,
  keyword: '',
  onlyOwnQuotes: false,
  advancedFilters: undefined,
  lastActivatedTab: undefined,
  sortingPreferences: {},
};

export const reducer = createReducer<State>(
  initialState,
  on(ShipmentListActions.enter, (state) => ({
    ...state,
    ...LoadableStateReducerHelper.startLoad(state),
  })),
  on(ShipmentListActions.loadSuccess, (state, { items }) => ({
    ...state,
    ...LoadableStateReducerHelper.loadSuccess({ items }),
  })),
  on(ShipmentListActions.loadError, (state, { error }) => ({
    ...state,
    ...LoadableStateReducerHelper.loadError(state, error),
  })),
  on(
    ShipmentListActions.updateKeyword,
    (state, { keyword }): State => ({
      ...state,
      keyword,
    })
  ),
  on(ShipmentListActions.updateOwnershipFilter, (state, { onlyOwnQuotes }): State => ({ ...state, onlyOwnQuotes })),
  on(
    ShipmentListActions.setAdvancedFilters,
    (state, { advancedFilters }): State => ({
      ...state,
      advancedFilters,
    })
  ),
  on(
    ShipmentListActions.clearAdvancedFilters,
    (state): State => ({
      ...state,
      advancedFilters: undefined,
    })
  ),
  on(ShipmentListActions.setLastActivatedTab, (state, { tab }): State => ({ ...state, lastActivatedTab: tab })),
  on(
    ShipmentListActions.applySorting,
    (state, { tab, shipmentsTableSorting }): State => ({
      ...state,
      sortingPreferences: {
        ...state.sortingPreferences,
        [tab]: shipmentsTableSorting,
      },
    })
  ),
  on(
    ShipmentListActions.clearSorting,
    (state): State => ({
      ...state,
      sortingPreferences: {},
    })
  ),
  on(ShipmentListActions.leave, (state): State => ({ ...initialState, lastActivatedTab: state.lastActivatedTab }))
);
