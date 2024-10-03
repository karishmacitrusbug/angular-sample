import { LoadableStateReducerHelper } from '@global/helpers/loadable-state-reducer.helper';
import { Loadable } from '@global/interfaces/loadable.interface';
import { MessageThreadDetails } from '@global/interfaces/messages/message-thread-details.interface';
import { MessageThread } from '@global/interfaces/messages/message-thread.interface';
import { SendbirdChannelsList } from '@global/interfaces/messages/sendbird-channel-list.interface';
import { ShipmentOrderPerson } from '@global/interfaces/shipment-order-person.interface';
import { TeamMemberLists } from '@global/interfaces/team-member-lists.interface';
import { MessagesSortBy } from '@global/modules/common-messages/enums/messages-sort-by.enum';
import { MessagesTab } from '@global/modules/common-messages/enums/messages-tab.enum';
import { createReducer, on } from '@ngrx/store';
import { FileMessage, UserMessage } from 'sendbird';
import * as MessagesActions from '../actions/messages.actions';

export const messagesKey = 'messages';

export interface State {
  initialMessageThreadId?: string;
  messageThreads: Loadable<MessageThread[]>;
  tab: MessagesTab;
  sortBy: MessagesSortBy;
  openedMessageThreadId: string | undefined;
  messageThread: Loadable<MessageThreadDetails>;
  teamMembers: Loadable<TeamMemberLists>;
  shipmentOrderPeople: Loadable<ShipmentOrderPerson[]>;
  sendingMessage: boolean;
  sendbirdChannels: Loadable<SendbirdChannelsList[]>;
  selectedSendbirdChannel: SendbirdChannelsList;
  SendBirdChannelMessages: Loadable<UserMessage[] | FileMessage[]>;
  SendBirdChannelUsers: Loadable<[]>;
  SendbirdSelectedUser: string;
}

export const initialState: State = {
  messageThreads: {
    data: [],
    isLoading: false,
  },
  tab: MessagesTab.LiveShipments,
  sortBy: MessagesSortBy.Shipments,
  openedMessageThreadId: undefined,
  messageThread: {
    data: undefined,
    isLoading: false,
  },
  teamMembers: {
    data: undefined,
    isLoading: false,
  },
  shipmentOrderPeople: {
    data: undefined,
    isLoading: false,
  },
  sendingMessage: false,
  sendbirdChannels: {
    data: [],
    isLoading: false,
  },
  selectedSendbirdChannel: undefined,
  SendBirdChannelMessages: {
    data: [],
    isLoading: false,
  },
  SendBirdChannelUsers: {
    data: [],
    isLoading: false,
  },
  SendbirdSelectedUser: undefined,
};

export const reducer = createReducer<State>(
  initialState,
  on(
    MessagesActions.enter,
    (state, { initialMessageThreadId }): State => ({
      ...state,
      initialMessageThreadId,
    })
  ),
  on(MessagesActions.loadMessageThreads, (state) => ({
    ...state,
    messageThreads: LoadableStateReducerHelper.startLoad(state.messageThreads),
    messageThread: LoadableStateReducerHelper.startLoad(state.messageThread),
  })),

  on(MessagesActions.loadMessageThreadsSuccess, (state, { messageThreads }) => ({
    ...state,
    messageThreads: LoadableStateReducerHelper.loadSuccess(messageThreads),
    messageThread: {
      ...state.messageThread,
      isLoading: messageThreads.length === 0 ? false : state.messageThread.isLoading,
    },
  })),

  on(MessagesActions.loadMessageThreadError, (state) => ({
    ...state,
    messageThreads: LoadableStateReducerHelper.loadError(state.messageThreads),
  })),

  on(
    MessagesActions.updateSortBy,
    (state, { sortBy }): State => ({
      ...state,
      sortBy,
    })
  ),

  on(
    MessagesActions.updateTab,
    (state, { tab }): State => ({
      ...state,
      tab,
    })
  ),

  on(
    MessagesActions.openMessageThread,
    (state, { payload: { id } }): State => ({
      ...state,
      initialMessageThreadId: undefined,
      openedMessageThreadId: id,
    })
  ),

  on(MessagesActions.loadMessageThread, (state) => ({
    ...state,
    messageThread: LoadableStateReducerHelper.startLoad(state.messageThread),
  })),

  on(MessagesActions.loadMessageThreadSuccess, (state, { messageThread }) => ({
    ...state,
    // eslint-disable-next-line unicorn/no-useless-undefined
    messageThread: LoadableStateReducerHelper.loadSuccess(messageThread),
    // Update participants and read on case reload.
    messageThreads: {
      ...state.messageThreads,
      data: state.messageThreads.data.map((item) => {
        if (item.id !== messageThread.id) {
          return item;
        }

        return {
          ...item,
          isUnread: false,
        };
      }),
    },
  })),

  on(MessagesActions.loadMessageThreadError, (state, { error }) => ({
    ...state,
    messageThread: LoadableStateReducerHelper.loadError(state.messageThread, error),
  })),

  on(MessagesActions.loadTeamMembers, (state) => ({
    ...state,
    teamMembers: LoadableStateReducerHelper.startLoad(state.teamMembers),
  })),

  on(MessagesActions.loadTeamMembersSuccess, (state, { teamMembers }) => ({
    ...state,
    teamMembers: LoadableStateReducerHelper.loadSuccess(teamMembers),
  })),

  on(MessagesActions.loadTeamMembersError, (state, { error }) => ({
    ...state,
    teamMembers: LoadableStateReducerHelper.loadError(state.teamMembers, error),
  })),

  on(MessagesActions.loadShipmentOrderPeople, (state) => ({
    ...state,
    shipmentOrderPeople: LoadableStateReducerHelper.startLoad(state.shipmentOrderPeople),
  })),

  on(MessagesActions.loadShipmentOrderPeopleSuccess, (state, { shipmentOrderPeople }) => ({
    ...state,
    shipmentOrderPeople: LoadableStateReducerHelper.loadSuccess(shipmentOrderPeople),
  })),

  on(MessagesActions.loadShipmentOrderPeopleError, (state, { error }) => ({
    ...state,
    shipmentOrderPeople: LoadableStateReducerHelper.loadError(state.shipmentOrderPeople, error),
  })),

  on(
    MessagesActions.sendMessage,
    (state): State => ({
      ...state,
      sendingMessage: true,
    })
  ),

  on(
    MessagesActions.sendMessageSuccess,
    (state): State => ({
      ...state,
      sendingMessage: false,
    })
  ),

  on(
    MessagesActions.sendMessageError,
    (state): State => ({
      ...state,
      sendingMessage: false,
    })
  ),
  on(MessagesActions.loadSendbirdChannels, (state) => ({
    ...state,
    sendbirdChannels: LoadableStateReducerHelper.startLoad(state.sendbirdChannels),
  })),

  on(MessagesActions.loadSendbirdChannelsSuccess, (state, { sendbirdChannels }) => ({
    ...state,
    sendbirdChannels: LoadableStateReducerHelper.loadSuccess(sendbirdChannels),
  })),

  on(MessagesActions.loadSendBirdChannelMessages, (state) => ({
    ...state,
    SendBirdChannelMessages: LoadableStateReducerHelper.startLoad(state.SendBirdChannelMessages),
  })),

  on(MessagesActions.loadSendBirdChannelMessagesSuccess, (state, { sendBirdChannelMessages }) => {
    const tempMessages = state.messageThread.data.sendbirdMessages;
    const newArray = [...tempMessages, sendBirdChannelMessages];
    const newData = {
      id: state.messageThread.data.id,
      type: state.messageThread.data.type,
      subject: state.messageThread.data.subject,
      photoUrl: state.messageThread.data.photoUrl,
      messages: state.messageThread.data.messages,
      participants: state.messageThread.data.participants,
      origin: state.messageThread.data.origin,
      shipment: state.messageThread.data.shipment,
      recordType: state.messageThread.data.recordType,
      source: state.messageThread.data.source,
      description: state.messageThread.data.description,
      sendbirdChannel: state.messageThread.data.sendbirdChannel,
      sendbirdMessages: newArray,
      channelInfo: state.messageThread.data.channelInfo,
    };
    return {
      ...state,
      messageThread: LoadableStateReducerHelper.loadSuccess(newData),
    };
  }),

  on(MessagesActions.loadSendBirdChannelUsers, (state) => ({
    ...state,
    SendBirdChannelUsers: LoadableStateReducerHelper.startLoad(state.SendBirdChannelUsers),
  })),

  on(MessagesActions.loadSendBirdChannelUsersSuccess, (state, { sendBirdChannelUsers }) => ({
    ...state,
    SendBirdChannelUsers: LoadableStateReducerHelper.loadSuccess(sendBirdChannelUsers),
  })),

  on(
    MessagesActions.sendbirdSelectedUser,
    (state, { user }): State => ({
      ...state,
      SendbirdSelectedUser: user,
    })
  ),

  on(
    MessagesActions.updateSendbirdChannel,
    (state, { sendbirdchannelObject }): State => ({
      ...state,
      selectedSendbirdChannel: sendbirdchannelObject,
    })
  ),

  on(MessagesActions.leave, (): State => initialState)
);
