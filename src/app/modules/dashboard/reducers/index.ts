import { matchesItemKeys } from '@global/helpers/matches-item-keys.helper';
import { sortByDate } from '@global/helpers/sort-by-date.helper';
import { DashboardItemType } from '@global/modules/common-dashboard/enums/dashboard-item-type.enum';
import { filterDashboardItems } from '@global/modules/common-dashboard/helpers/filter-dashboard-items.helper';
import { DashboardProgressUpdateVM } from '@global/modules/common-dashboard/interfaces/dashboard-progress-update.vm';
import { DashboardQuoteVM } from '@global/modules/common-dashboard/interfaces/dashboard-quote.vm';
import { DashboardYourTaskVM } from '@global/modules/common-dashboard/interfaces/dashboard-your-task.vm';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from 'app/reducers';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import * as fromDashboard from './dashboard.reducer';

export const dashboardFeatureKey = 'dashboard';

export interface DashboardState {
  [fromDashboard.dashboardKey]: fromDashboard.State;
}

export interface AppState extends State {
  [dashboardFeatureKey]: DashboardState;
}

export const reducers: ActionReducerMap<DashboardState> = {
  [fromDashboard.dashboardKey]: fromDashboard.reducer,
};

export const selectFeatureDashboardState = createFeatureSelector<DashboardState>(dashboardFeatureKey);

export const selectDashboardState = createSelector(selectFeatureDashboardState, (state) => state[dashboardFeatureKey]);

export const selectCompliancePendingShipmentsCount = createSelector(
  selectDashboardState,
  (state) => state.shipmentOrderCounts.data.compliancePending
);
export const selectTrackingShipmentsCount = createSelector(selectDashboardState, (state) => state.shipmentOrderCounts.data.live);

export const selectDeliveredShipmentsCount = createSelector(selectDashboardState, (state) => state.shipmentOrderCounts.data.delivered);

export const selectFilteredTasks = createSelector(selectDashboardState, (state) => {
  if (isEmpty(state.keyword) && isEmpty(state.advancedFilters)) {
    return state.yourTasks;
  }

  let tasks: DashboardYourTaskVM[];

  if (!isEmpty(state.advancedFilters)) {
    tasks = filterDashboardItems(DashboardItemType.Task, state.yourTasks.data, state.advancedFilters) as DashboardYourTaskVM[];
  }

  if (!isEmpty(state.keyword)) {
    tasks = isNil(tasks)
      ? state.yourTasks.data.filter((item) =>
          matchesItemKeys(item, state.keyword, ['id', 'ownerId', 'subject', 'quoteReference', 'clientReference'])
        )
      : tasks.filter((item) => matchesItemKeys(item, state.keyword, ['id', 'ownerId', 'subject', 'quoteReference', 'clientReference']));
  }

  return {
    ...state.yourTasks,
    data: tasks,
  };
});

export const selectYourTasks = createSelector(selectDashboardState, selectFilteredTasks, (state, filteredTasks) =>
  state.showAllData ? filteredTasks : { ...filteredTasks, data: filteredTasks.data.filter((task) => task.isOwned) }
);

export const selectImportantTasksCount = createSelector(selectYourTasks, (tasks) => tasks.data.length);

export const selectFilteredQuoteUpdates = createSelector(selectDashboardState, (state) => {
  if (isEmpty(state.keyword) && isEmpty(state.advancedFilters)) {
    return state.quoteUpdates;
  }

  let quoteUpdates: DashboardQuoteVM[];

  if (!isEmpty(state.advancedFilters)) {
    quoteUpdates = filterDashboardItems(
      DashboardItemType.QuoteUpdate,
      state.quoteUpdates.data,
      state.advancedFilters
    ) as DashboardQuoteVM[];
  }

  if (!isEmpty(state.keyword)) {
    quoteUpdates = isNil(quoteUpdates)
      ? state.quoteUpdates.data.filter((item) =>
          matchesItemKeys(item, state.keyword, ['id', 'ownerId', 'quoteReference', 'clientReference'])
        )
      : quoteUpdates.filter((item) => matchesItemKeys(item, state.keyword, ['id', 'ownerId', 'quoteReference', 'clientReference']));
  }

  return {
    ...state.quoteUpdates,
    data: quoteUpdates,
  };
});

export const selectQuoteUpdates = createSelector(selectDashboardState, selectFilteredQuoteUpdates, (state, filteredQuoteUpdates) =>
  state.showAllData ? filteredQuoteUpdates : { ...filteredQuoteUpdates, data: filteredQuoteUpdates.data.filter((task) => task.isOwned) }
);

export const selectQuoteUpdatesCount = createSelector(selectQuoteUpdates, (quoteUpdates) => quoteUpdates.data.length);

export const selectFilteredProgressUpdates = createSelector(selectDashboardState, (state) => {
  if (isEmpty(state.keyword) && isEmpty(state.advancedFilters)) {
    return state.progressUpdates;
  }

  let progressUpdates: DashboardProgressUpdateVM[];

  if (!isEmpty(state.advancedFilters)) {
    progressUpdates = filterDashboardItems(
      DashboardItemType.QuoteUpdate,
      state.progressUpdates.data,
      state.advancedFilters
    ) as DashboardProgressUpdateVM[];
  }

  if (!isEmpty(state.keyword)) {
    progressUpdates = isNil(progressUpdates)
      ? state.progressUpdates.data.filter((item) =>
          matchesItemKeys(item, state.keyword, ['id', 'ownerId', 'quoteReference', 'clientReference', 'description'])
        )
      : progressUpdates.filter((item) =>
          matchesItemKeys(item, state.keyword, ['id', 'ownerId', 'quoteReference', 'clientReference', 'description'])
        );
  }

  return {
    ...state.progressUpdates,
    data: progressUpdates,
  };
});

export const selectProgressUpdates = createSelector(selectDashboardState, selectFilteredProgressUpdates, (state, filteredProgressUpdates) =>
  state.showAllData
    ? filteredProgressUpdates
    : { ...filteredProgressUpdates, data: filteredProgressUpdates.data.filter((task) => task.isOwned) }
);

export const selectAssignees = createSelector(selectDashboardState, (state) => state.assignees);

export const selectAdvanceFilters = createSelector(selectDashboardState, (state) => state.advancedFilters);
export const selectNumberOfAdvanceFilters = createSelector(selectAdvanceFilters, (advancedFilters) => {
  if (!advancedFilters) {
    return 0;
  }

  return Object.values(advancedFilters).filter((filter) => !isEmpty(filter)).length;
});

export const selectShipmentCountsLoading = createSelector(selectDashboardState, (state) => state.shipmentOrderCounts.isLoading);
export const selectAreYourTasksLoading = createSelector(selectDashboardState, (state) => state.yourTasks.isLoading);
export const selectAreProgressUpdatesLoading = createSelector(selectDashboardState, (state) => state.progressUpdates.isLoading);
export const selectAreQuoteUpdatesLoading = createSelector(selectDashboardState, (state) => state.quoteUpdates.isLoading);
export const selectAreMessagesLoading = createSelector(selectDashboardState, (state) => state.messageThreads.isLoading);
export const selectDashboardHeaderLoading = createSelector(
  selectDashboardState,
  (state) =>
    state.shipmentOrderCounts.isLoading || state.quoteUpdates.isLoading || state.progressUpdates.isLoading || state.yourTasks.isLoading
);

export const selectMessageThreads = createSelector(selectDashboardState, (state) => state.messageThreads.data);
export const selectSortedMessageThreads = createSelector(selectMessageThreads, (messageThreads) =>
  [...messageThreads].sort((a, b) => sortByDate(b.lastMessage, a.lastMessage))
);
export const selectMessageThreadCount = createSelector(selectMessageThreads, (messageThreads) => messageThreads.length);
export const selectSendbirdUnreadChannelsLoadingState = createSelector(
  selectDashboardState,
  (state) => state.SendbirdUnreadChannels.isLoading
);
export const selectSendbirdUnreadChannelsMessagesLoading = createSelector(
  selectDashboardState,
  (state) => state.SendbirdUnreadChannels.isLoading
);

export const selectSendbirdUnreadChannels = createSelector(selectDashboardState, (state) => state.SendbirdUnreadChannels?.data);
