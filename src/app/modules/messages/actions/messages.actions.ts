import { MessageThreadType } from '@global/enums/message-thread-type.enum';
import { MessagePayload } from '@global/interfaces/messages/message-payload.interface';
import { MessageThreadDetails } from '@global/interfaces/messages/message-thread-details.interface';
import { MessageThread } from '@global/interfaces/messages/message-thread.interface';
import { OpenMessagePayload } from '@global/interfaces/messages/open-message-payload.interface';
import { SendbirdChannelsList } from '@global/interfaces/messages/sendbird-channel-list.interface';
import { Participant } from '@global/interfaces/participant.interface';
import { ShipmentOrderPerson } from '@global/interfaces/shipment-order-person.interface';
import { TeamMemberLists } from '@global/interfaces/team-member-lists.interface';
import { MessagesSortBy } from '@global/modules/common-messages/enums/messages-sort-by.enum';
import { MessagesTab } from '@global/modules/common-messages/enums/messages-tab.enum';
import { createAction, props } from '@ngrx/store';

export const enter = createAction('[Messages] enter', props<{ initialMessageThreadId?: string }>());

export const startMessageThreadPoll = createAction('[Messages] startMessageThreadPoll');

export const loadMessageThreads = createAction('[Messages] loadMessageThreads');
export const loadMessageThreadsSuccess = createAction('[Messages] loadMessageThreadsSuccess', props<{ messageThreads: MessageThread[] }>());
export const loadMessageThreadsError = createAction('[Messages] loadMessageThreadsError');

export const updateSortBy = createAction('[Messages] updateSortBy', props<{ sortBy: MessagesSortBy }>());
export const updateTab = createAction('[Messages] updateTab', props<{ tab: MessagesTab }>());

export const openMessageThread = createAction('[Messages] openMessageThread', props<{ payload: OpenMessagePayload }>());
export const loadMessageThread = createAction(
  '[Messages] loadMessageThread',
  props<{ payload: { id: string; type: MessageThreadType; messageThread?: any } }>()
);
export const loadMessageThreadSuccess = createAction(
  '[Messages] loadMessageThreadSuccess',
  props<{ messageThread: MessageThreadDetails }>()
);
export const loadMessageThreadError = createAction('[Messages] loadMessageThreadError', props<{ error: string }>());

export const loadTeamMembers = createAction('[Messages] loadTeamMembers', props<{ payload: OpenMessagePayload }>());
export const loadTeamMembersSuccess = createAction('[Messages] loadTeamMembersSuccess', props<{ teamMembers: TeamMemberLists }>());
export const loadTeamMembersError = createAction('[Messages] loadTeamMembersError', props<{ error: string }>());

export const loadShipmentOrderPeople = createAction('[Messages] loadShipmentOrderPeople', props<{ payload: OpenMessagePayload }>());
export const loadShipmentOrderPeopleSuccess = createAction(
  '[Messages] loadShipmentOrderPeopleSuccess',
  props<{ shipmentOrderPeople: ShipmentOrderPerson[] }>()
);
export const loadShipmentOrderPeopleError = createAction('[Messages] loadShipmentOrderPeopleError', props<{ error: string }>());

export const sendMessage = createAction('[Messages] sendMessage', props<{ message: MessagePayload }>());
export const sendMessageSuccess = createAction('[Messages] sendMessageSuccess');
export const sendMessageError = createAction('[Messages] sendMessageError');

export const addParticipant = createAction('[Messages] addParticipant', props<{ participant: Participant }>());

export const openNewMessageThread = createAction('[Messages] openNewMessageThread', props<{ payload: OpenMessagePayload }>());

export const leave = createAction('[Messages] leave');

export const loadSendbirdChannels = createAction('[Messages] loadSendbirdChannels');
export const loadSendbirdChannelsSuccess = createAction(
  '[Messages] loadSendbirdChannelsSuccess',
  props<{ sendbirdChannels: SendbirdChannelsList[] }>()
);
export const loadSendbirdChannelsError = createAction('[Messages] loadSendbirdChannelsError', props<{ error: string }>());

export const loadSendBirdChannelMessages = createAction('[Messages] loadSendBirdChannelMessages');
export const loadSendBirdChannelMessagesSuccess = createAction(
  '[Messages] SendBirdChannelMessagesSuccess',
  props<{ sendBirdChannelMessages: any }>()
);
export const loadSendBirdChannelMessagesError = createAction('[Messages] loadSendBirdChannelMessagesError', props<{ error: string }>());

export const loadSendBirdChannelUsers = createAction('[Messages] loadSendBirdChannelUsers');
export const loadSendBirdChannelUsersSuccess = createAction(
  '[Messages] loadSendBirdChannelUsersSuccess',
  props<{ sendBirdChannelUsers: any }>()
);

export const sendbirdSelectedUser = createAction('[Messages] sendbirdSelectedUser', props<{ user: string }>());

export const updateSendbirdChannel = createAction(
  '[Messages] updateSendbirdChannel',
  props<{ sendbirdchannelObject: SendbirdChannelsList }>()
);

export const getSendbirdMessages = createAction('[Messages] getSendbirdMessages');
