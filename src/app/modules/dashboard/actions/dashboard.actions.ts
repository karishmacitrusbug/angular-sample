import { MessageThreadType } from '@global/enums/message-thread-type.enum';
import { MessageThread } from '@global/interfaces/messages/message-thread.interface';
import { DashboardSideFilterDialogResult } from '@global/modules/common-dashboard/components/dashboard-side-filter-dialog/dashboard-side-filter-dialog-result.interface';
import { DashboardProgressUpdateVM } from '@global/modules/common-dashboard/interfaces/dashboard-progress-update.vm';
import { DashboardQuoteVM } from '@global/modules/common-dashboard/interfaces/dashboard-quote.vm';
import { DashboardYourTaskVM } from '@global/modules/common-dashboard/interfaces/dashboard-your-task.vm';
import { ShipmentOrderCounts } from '@global/modules/common-dashboard/interfaces/shipment-order-counts.interface';
import { MessageButtonUserVM } from '@global/modules/message-button/user.vm';
import { createAction, props } from '@ngrx/store';

export const enter = createAction('[Dashboard] enter');

export const getYourTasks = createAction('[Dashboard] getYourTasks');
export const getYourTasksSuccess = createAction('[Dashboard] getYourTasksSuccess', props<{ tasks: DashboardYourTaskVM[] }>());
export const getYourTasksError = createAction('[Dashboard] getYourTasksError', props<{ error: string }>());

export const getProgressUpdates = createAction('[Dashboard] getProgressUpdates');
export const getProgressUpdatesSuccess = createAction(
  '[Dashboard] getProgressUpdatesSuccess',
  props<{ progressUpdates: DashboardProgressUpdateVM[] }>()
);
export const getProgressUpdatesError = createAction('[Dashboard] getProgressUpdatesError', props<{ error: string }>());

export const getShipmentOrders = createAction('[Dashboard] getShipmentOrders');
export const getShipmentOrdersSuccess = createAction(
  '[Dashboard] getShipmentOrdersSuccess',
  props<{ shipmentOrderCounts: ShipmentOrderCounts; quoteUpdates: DashboardQuoteVM[]; assignees: { id: string; name: string }[] }>()
);
export const getShipmentOrdersError = createAction('[Dashboard] getShipmentOrdersError', props<{ error: string }>());

export const getMessageThreads = createAction('[Dashboard] getMessageThreads');
export const getMessageThreadsSuccess = createAction('[Dashboard] getMessageThreadsSuccess', props<{ messageThreads: MessageThread[] }>());
export const getMessageThreadsError = createAction('[Dashboard] getMessageThreadsError', props<{ error: string }>());

export const removeMessage = createAction('[Dashboard] removeMessage', props<{ messageId: string }>());

export const openMessage = createAction('[Dashboard] openMessage', props<{ id: string; messageType: MessageThreadType }>());

export const messageToAccountManager = createAction('[Dashboard] messageToAccountManager', props<{ teamMember: MessageButtonUserVM }>());

export const openTask = createAction('[Dashboard] openTask', props<{ taskId: string }>());

export const toggleFilter = createAction('[Dashboard] toggleFilter');

export const updateKeyword = createAction('[Dashboard] updateKeyword', props<{ keyword: string }>());

export const openAdvancedFilters = createAction('[Dashboard] openAdvancedFilters');

export const setAdvanceFilters = createAction(
  '[Dashboard] setAdvancedFilters',
  props<{ advancedFilters: DashboardSideFilterDialogResult }>()
);

export const clearAdvancedFilters = createAction('[Dashboard] clearAdvancedFilters');

export const loadSendBirdUnreadChannels = createAction('[Dashboard] loadSendBirdUnreadChannels');
export const loadSendBirdUnreadChannelsSuccess = createAction(
  '[Dashboard] loadSendBirdUnreadChannelsSuccess',
  props<{ unreadChannels: any }>()
);

export const leave = createAction('[Dashboard] leave');
