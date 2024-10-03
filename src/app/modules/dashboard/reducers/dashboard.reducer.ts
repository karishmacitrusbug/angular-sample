import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Loadable } from '@global/interfaces/loadable.interface';
import { MessageThread } from '@global/interfaces/messages/message-thread.interface';
import { DashboardSideFilterDialogResult } from '@global/modules/common-dashboard/components/dashboard-side-filter-dialog/dashboard-side-filter-dialog-result.interface';
import { DashboardProgressUpdateVM } from '@global/modules/common-dashboard/interfaces/dashboard-progress-update.vm';
import { DashboardQuoteVM } from '@global/modules/common-dashboard/interfaces/dashboard-quote.vm';
import { DashboardYourTaskVM } from '@global/modules/common-dashboard/interfaces/dashboard-your-task.vm';
import { ShipmentOrderCounts } from '@global/modules/common-dashboard/interfaces/shipment-order-counts.interface';
import { SendbirdChannelInfo } from '@global/modules/message-thread/services/sendbird-message.service';
import { createReducer, on } from '@ngrx/store';
import * as DashboardActions from '../actions/dashboard.actions';

export const dashboardKey = 'dashboard';

export interface State {
  yourTasks: Loadable<DashboardYourTaskVM[]>;
  progressUpdates: Loadable<DashboardProgressUpdateVM[]>;
  quoteUpdates: Loadable<DashboardQuoteVM[]>;
  messageThreads: Loadable<MessageThread[]>;
  showAllData: boolean;
  shipmentOrderCounts: Loadable<ShipmentOrderCounts>;
  advancedFilters?: DashboardSideFilterDialogResult;
  keyword?: string;
  assignees?: { id: string; name: string }[];
  SendbirdUnreadChannels: Loadable<SendbirdChannelInfo[]>;
}

export const initialState: State = {
  yourTasks: {
    isLoading: true,
    data: [],
  },
  progressUpdates: {
    isLoading: true,
    data: [],
  },
  quoteUpdates: {
    isLoading: true,
    data: [],
  },
  messageThreads: {
    isLoading: true,
    data: [],
  },
  showAllData: true,
  shipmentOrderCounts: {
    data: {
      compliancePending: undefined,
      live: undefined,
      delivered: undefined,
    },
    isLoading: true,
  },
  SendbirdUnreadChannels: {
    data: [],
    isLoading: false,
  },
};

export const reducer = createReducer(
  initialState,

  on(DashboardActions.getShipmentOrders, (state) => ({
    ...state,
    shipmentOrderCounts: LoadableStateReducerHelper.startLoad(state.shipmentOrderCounts),
    quoteUpdates: LoadableStateReducerHelper.startLoad(state.quoteUpdates),
  })),

  on(DashboardActions.getShipmentOrdersSuccess, (state, { shipmentOrderCounts, quoteUpdates, assignees }) => ({
    ...state,
    shipmentOrderCounts: LoadableStateReducerHelper.loadSuccess(shipmentOrderCounts),
    quoteUpdates: LoadableStateReducerHelper.loadSuccess(quoteUpdates),
    assignees,
  })),

  on(DashboardActions.getShipmentOrdersError, (state, { error }) => ({
    ...state,
    shipmentOrderCounts: LoadableStateReducerHelper.loadError(state.shipmentOrderCounts, error),
    quoteUpdates: LoadableStateReducerHelper.loadError(state.quoteUpdates, error),
  })),

  on(DashboardActions.getYourTasks, (state) => ({
    ...state,
    yourTasks: LoadableStateReducerHelper.startLoad(state.yourTasks),
  })),

  on(DashboardActions.getYourTasksSuccess, (state, { tasks }) => ({
    ...state,
    yourTasks: LoadableStateReducerHelper.loadSuccess(tasks),
  })),

  on(DashboardActions.getYourTasksError, (state, { error }) => ({
    ...state,
    yourTasks: LoadableStateReducerHelper.loadError(state.yourTasks, error),
  })),

  on(DashboardActions.getProgressUpdates, (state) => ({
    ...state,
    progressUpdates: LoadableStateReducerHelper.startLoad(state.progressUpdates),
  })),

  on(DashboardActions.getProgressUpdatesSuccess, (state, { progressUpdates }) => ({
    ...state,
    progressUpdates: LoadableStateReducerHelper.loadSuccess(progressUpdates),
  })),

  on(DashboardActions.getProgressUpdatesError, (state, { error }) => ({
    ...state,
    progressUpdates: LoadableStateReducerHelper.loadError(state.progressUpdates, error),
  })),

  on(DashboardActions.getMessageThreads, (state) => ({
    ...state,
    messageThreads: LoadableStateReducerHelper.startLoad(state.messageThreads),
  })),

  on(DashboardActions.getMessageThreadsSuccess, (state, { messageThreads }) => ({
    ...state,
    messageThreads: LoadableStateReducerHelper.loadSuccess(messageThreads),
  })),

  on(DashboardActions.getMessageThreadsError, (state, { error }) => ({
    ...state,
    messageThreads: LoadableStateReducerHelper.loadError(state.messageThreads, error),
  })),

  on(DashboardActions.removeMessage, (state, { messageId }) => ({
    ...state,
    messageThreads: {
      ...state.messageThreads,
      data: state.messageThreads.data.filter((item) => item.id !== messageId),
    },
  })),

  on(
    DashboardActions.toggleFilter,
    (state): State => ({
      ...state,
      showAllData: !state.showAllData,
    })
  ),

  on(
    DashboardActions.updateKeyword,
    (state, { keyword }): State => ({
      ...state,
      keyword,
    })
  ),

  on(
    DashboardActions.setAdvanceFilters,
    (state, { advancedFilters }): State => ({
      ...state,
      advancedFilters,
    })
  ),

  on(
    DashboardActions.clearAdvancedFilters,
    (state): State => ({
      ...state,
      advancedFilters: undefined,
    })
  ),
  on(DashboardActions.loadSendBirdUnreadChannels, (state) => ({
    ...state,
    SendbirdUnreadChannels: LoadableStateReducerHelper.startLoad(state.SendbirdUnreadChannels),
  })),

  on(DashboardActions.loadSendBirdUnreadChannelsSuccess, (state, { unreadChannels }) => ({
    ...state,
    SendbirdUnreadChannels: LoadableStateReducerHelper.loadSuccess(unreadChannels),
  })),

  on(DashboardActions.leave, (): State => initialState)
);
