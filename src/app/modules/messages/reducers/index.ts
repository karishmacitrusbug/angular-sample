import { MessageThreadCategory } from '@global/enums/message-thread-category.enum';
import { mapMessageGroupsByDate, mapMessageGroupsByShipment } from '@global/helpers/messages/map-message-threads.helper';
import { MessagesSortBy } from '@global/modules/common-messages/enums/messages-sort-by.enum';
import { MessagesTab } from '@global/modules/common-messages/enums/messages-tab.enum';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from 'app/reducers';
import { GroupChannel } from 'sendbird';
import * as fromMessages from './messages.reducer';

export const messagesFeatureKey = 'messages';

export interface MessagesState {
  [fromMessages.messagesKey]: fromMessages.State;
}

export interface AppState extends State {
  [messagesFeatureKey]: MessagesState;
}

export const reducers: ActionReducerMap<MessagesState> = {
  [fromMessages.messagesKey]: fromMessages.reducer,
};

export const selectMessagesFeatureState = createFeatureSelector<MessagesState>(messagesFeatureKey);

export const selectMessagesState = createSelector(selectMessagesFeatureState, (state) => state[fromMessages.messagesKey]);

export const selectMessageThreadsLoadingState = createSelector(selectMessagesState, (state) => state.messageThreads.isLoading);

export const selectMessageThreadsDataState = createSelector(selectMessagesState, (state) => state.messageThreads.data);

export const selectSortedMessageThreads = createSelector(selectMessageThreadsDataState, (messageThreads) =>
  [...messageThreads].sort((a, b) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime())
);

export const selectTab = createSelector(selectMessagesState, (state) => state.tab);

export const selectSortBy = createSelector(selectMessagesState, (state) => state.sortBy);

export const selectSortAvailable = createSelector(selectTab, (tab) => tab === MessagesTab.LiveShipments || tab === MessagesTab.Quotes);

export const selectLiveShipmentMessageThreads = createSelector(selectSortedMessageThreads, (messageThreads) =>
  messageThreads.filter((item) => item.category === MessageThreadCategory.LiveShipment)
);

export const selectQuoteMessageThreads = createSelector(selectSortedMessageThreads, (messageThreads) =>
  messageThreads.filter((item) => item.category === MessageThreadCategory.Quote)
);

export const selectGenericSupportMessageThreads = createSelector(selectSortedMessageThreads, (messageThreads) =>
  messageThreads.filter((item) => item.category === MessageThreadCategory.GenericSupport)
);

export const selectArchivedMessageThreads = createSelector(selectSortedMessageThreads, (messageThreads) =>
  messageThreads.filter((item) => item.category === MessageThreadCategory.Archived)
);

export const selectLiveShipmentMessageThreadGroups = createSelector(
  selectLiveShipmentMessageThreads,
  selectSortBy,
  (messageThreads, sortBy) =>
    sortBy === MessagesSortBy.Date ? mapMessageGroupsByDate(messageThreads) : mapMessageGroupsByShipment(messageThreads)
);

export const selectQuoteMessageThreadsGroups = createSelector(selectQuoteMessageThreads, selectSortBy, (messageThreads, sortBy) =>
  sortBy === MessagesSortBy.Date ? mapMessageGroupsByDate(messageThreads) : mapMessageGroupsByShipment(messageThreads)
);

export const selectGenericSupportMessageThreadsGroups = createSelector(selectGenericSupportMessageThreads, (messageThreads) =>
  mapMessageGroupsByDate(messageThreads)
);

export const selectArchivedMessageThreadsGroups = createSelector(selectArchivedMessageThreads, (messageThreads) =>
  mapMessageGroupsByDate(messageThreads)
);

export const selectLiveShipmentsMessageThreadsNumber = createSelector(
  selectLiveShipmentMessageThreads,
  (messageThreads) => messageThreads.length
);
export const selectUnreadLiveShipmentsMessageThreadsNumber = createSelector(
  selectLiveShipmentMessageThreads,
  (messageThreads) => messageThreads.filter((messageThread) => messageThread.isUnread).length
);
export const selectQouteMessageThreadsNumber = createSelector(selectQuoteMessageThreads, (messageThreads) => messageThreads.length);
export const selectUnreadQouteMessageThreadsNumber = createSelector(
  selectQuoteMessageThreads,
  (messageThreads) => messageThreads.filter((messageThread) => messageThread.isUnread).length
);
export const selectGenericSupportMessageThreadsNumber = createSelector(
  selectGenericSupportMessageThreads,
  (messageThreads) => messageThreads.length
);
export const selectUnreadGenericSupportMessageThreadsNumber = createSelector(
  selectGenericSupportMessageThreads,
  (messageThreads) => messageThreads.filter((messageThread) => messageThread.isUnread).length
);
export const selectArchivedMessageThreadsNumber = createSelector(selectArchivedMessageThreads, (messageThreads) => messageThreads.length);

export const selectUnreadArchivedMessageThreadsNumber = createSelector(
  selectArchivedMessageThreads,
  (messageThreads) => messageThreads.filter((messageThread) => messageThread.isUnread).length
);

export const selectMessageThreadLoading = createSelector(
  selectMessagesState,
  (state) => state.messageThread.isLoading || state.teamMembers.isLoading
);

export const selectMessageThreadData = createSelector(selectMessagesState, (state) => state.messageThread.data);

export const selectOpenedMessageThreadId = createSelector(selectMessagesState, (state) => state.openedMessageThreadId);

export const selectSendingMessage = createSelector(selectMessagesState, (state) => state.sendingMessage);

export const selectTeamMembersData = createSelector(selectMessagesState, (state) => state.teamMembers.data);

export const selectShipmentOrderPeopleData = createSelector(selectMessagesState, (state) => state.shipmentOrderPeople.data);

export const selectInitialMessageThreadId = createSelector(selectMessagesState, (state) => state.initialMessageThreadId);

export const selectSendbirdMessages = createSelector(selectMessagesState, (state) => state.messageThread.data?.sendbirdMessages);

export const selectSelectededSendbirdChannel = createSelector(
  selectMessagesState,
  (state): GroupChannel => state.messageThread.data?.sendbirdChannel
);

export const selectSendbirdChannels = createSelector(selectMessagesState, (state) => state.sendbirdChannels.data);

export const selectSelectedSendbirdChannelSubject = createSelector(selectMessagesState, (state) => state.selectedSendbirdChannel);
export const selectSelectedSendbirdChannelid = createSelector(selectMessagesState, (state) => state.selectedSendbirdChannel?.id);

export const selectSendbirdChannelUsers = createSelector(
  selectMessagesState,
  (state): any[] => state.messageThread.data?.channelInfo?.users
);

export const selectSendbirdChannelGuestUserEnabled = createSelector(
  selectMessagesState,
  (state): boolean => state.messageThread.data?.channelInfo?.guestUserEnabled
);

export const selectSendbirdChannelsLoadingState = createSelector(selectMessagesState, (state) => state.sendbirdChannels.isLoading);
