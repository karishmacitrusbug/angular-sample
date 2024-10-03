import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MessageThreadCategory } from '@global/enums/message-thread-category.enum';
import { MessageThreadType } from '@global/enums/message-thread-type.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { MessageThread } from '@global/interfaces/messages/message-thread.interface';
import { MessagesTab } from '@global/modules/common-messages/enums/messages-tab.enum';
import { mapMessageThreadCategoryToTab } from '@global/modules/common-messages/helpers/map-message-thread-category-to-tab.helper';
import { CommonMessagesService } from '@global/modules/common-messages/services/common-messages.service';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { TeamMemberListType } from '@global/modules/message-thread/enums/team-member-list-type.enum';
import { CaseMessageService } from '@global/modules/message-thread/services/case-message.service';
import { MessageService } from '@global/modules/message-thread/services/message.service';
import { SendbirdService } from '@global/modules/message-thread/services/sendbird-message.service';
import { TaskMessageService } from '@global/modules/message-thread/services/task-message.service';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { TeamMemberService } from '@global/services/team-member.service';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { profilePictureFallback } from '@shared/constants/app.constants';
import { GetFilteredCasesRequestFilterTabNameEnum } from '@CitT/data';
import { EMPTY, forkJoin, from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import * as MessagesActions from '../actions/messages.actions';
import * as fromMessages from '../reducers';

@Injectable()
export class MessagesEffects {
  public enter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MessagesActions.enter),
      switchMap(() => of(MessagesActions.loadMessageThreads(), MessagesActions.startMessageThreadPoll()))
    );
  });

  public loadMessageThreads$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MessagesActions.loadMessageThreads, MessagesActions.openNewMessageThread),
      switchMap((action) =>
        forkJoin([
          from(this.sendbirdServices.getAllChannels()),
          this.commonMessagesService.loadMessageThreadsByTab$(profilePictureFallback),
          this.commonMessagesService.loadMessageThreadsByTab$(
            profilePictureFallback,
            GetFilteredCasesRequestFilterTabNameEnum.LIVE_SHIPMENTS
          ),
          this.commonMessagesService.loadMessageThreadsByTab$(profilePictureFallback, GetFilteredCasesRequestFilterTabNameEnum.QUOTES),
          this.commonMessagesService.loadMessageThreadsByTab$(profilePictureFallback, GetFilteredCasesRequestFilterTabNameEnum.ARCHIVED),
          // this.commonMessagesService.loadTaskMessageThreads$().pipe(
          //   map((taskMessages) => ({
          //     liveShipmentsTM: taskMessages.filter((item) => item.category === MessageThreadCategory.LiveShipment),
          //     quotesTM: taskMessages.filter((item) => item.category === MessageThreadCategory.Quote),
          //     genericSupportTM: taskMessages.filter((item) => item.category === MessageThreadCategory.GenericSupport),
          //     archivedTM: taskMessages.filter((item) => item.category === MessageThreadCategory.Archived),
          //   }))
          // ),
        ]).pipe(
          map(
            ([
              allchannels,
              genericSupport,
              liveShipments,
              quotes,
              archived,
              // { genericSupportTM, liveShipmentsTM, quotesTM, archivedTM }
            ]) =>
              [
                ...genericSupport.filter((item) => item.subject !== '-= DRAFT =-'),
                // ...genericSupportTM.filter((item) => item.subject !== '-= DRAFT =-'),
                ...liveShipments.filter((item) => item.subject !== '-= DRAFT =-'),
                // ...liveShipmentsTM.filter((item) => item.subject !== '-= DRAFT =-'),
                ...quotes.filter((item) => item.subject !== '-= DRAFT =-'),
                // ...quotesTM.filter((item) => item.subject !== '-= DRAFT =-'),
                ...archived.filter((item) => item.subject !== '-= DRAFT =-'),
                // ...archivedTM.filter((item) => item.subject !== '-= DRAFT =-'),
              ].map((data) => {
                allchannels
                  .filter((channel) => channel.url.split('-')[1] === data.id)
                  .map((sendbirdChannel) => {
                    if (sendbirdChannel.lastMessage) {
                      data.lastMessage = new Date(sendbirdChannel.lastMessage.createdAt).toString();
                      data.isUnread = sendbirdChannel.unreadMessageCount > 0 ? true : false;
                    }
                  });
                return data;
              })
          ),
          switchMap((messageThreads) => {
            const actionsToDispatch: Action[] = [MessagesActions.loadMessageThreadsSuccess({ messageThreads })];
            if (action.type === '[Messages] openNewMessageThread') {
              actionsToDispatch.push(MessagesActions.openMessageThread({ payload: action.payload }));
            }
            return of(...actionsToDispatch);
          }),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_YOUR_MESSAGES');
            return of(MessagesActions.loadMessageThreadsError());
          })
        )
      )
    );
  });

  /**
   * Try to show a tab to the user which has message threads.
   */
  public showFirstTabWithMessageThreads$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MessagesActions.loadMessageThreadsSuccess),
      concatLatestFrom(() => [
        this.store$.select(fromMessages.selectLiveShipmentMessageThreads),
        this.store$.select(fromMessages.selectQuoteMessageThreads),
        this.store$.select(fromMessages.selectGenericSupportMessageThreads),
        this.store$.select(fromMessages.selectArchivedMessageThreads),
      ]),
      switchMap(([, liveShipmentMessageThreads, quoteMessageThreads, genericSupportMessageThreads, archivedMessageThreads]) => {
        if (liveShipmentMessageThreads.length > 0) {
          return EMPTY;
        }

        if (quoteMessageThreads.length > 0) {
          return of(MessagesActions.updateTab({ tab: MessagesTab.Quotes }));
        }

        if (genericSupportMessageThreads.length > 0) {
          return of(MessagesActions.updateTab({ tab: MessagesTab.GenericSupport }));
        }

        if (archivedMessageThreads.length > 0) {
          return of(MessagesActions.updateTab({ tab: MessagesTab.Archived }));
        }

        return EMPTY;
      })
    );
  });

  /**
   * Open message thread when message threads are loaded or tab was changed.
   */
  public messageThreadsChange$ = createEffect(() => {
    // eslint-disable-next-line ngrx/avoid-cyclic-effects
    return this.actions$.pipe(
      ofType(MessagesActions.updateTab, MessagesActions.loadMessageThreadsSuccess),
      concatLatestFrom(() => [
        this.store$.select(fromMessages.selectMessagesState),
        this.store$.select(fromMessages.selectLiveShipmentMessageThreads),
        this.store$.select(fromMessages.selectQuoteMessageThreads),
        this.store$.select(fromMessages.selectGenericSupportMessageThreads),
        this.store$.select(fromMessages.selectArchivedMessageThreads),
      ]),
      switchMap(([, state, liveShipmentMessageThreads, quoteMessageThreads, genericSupportMessageThreads, archivedMessageThreads]) => {
        const { tab, initialMessageThreadId, openedMessageThreadId, messageThreads: allMessageThreads } = state;

        // Prevent opening the first message thread after loading the initial thread.
        const isOpenMessageOnCurrentTab =
          tab === mapMessageThreadCategoryToTab(allMessageThreads.data.find((item) => item.id === openedMessageThreadId)?.category);
        if (isOpenMessageOnCurrentTab) {
          return EMPTY;
        }

        // Try to load the initial message thread.
        if (initialMessageThreadId) {
          const messageThread = allMessageThreads.data.find((item) => item.id === initialMessageThreadId);

          if (messageThread) {
            return [
              MessagesActions.openMessageThread({
                payload: {
                  id: messageThread.id,
                  type: messageThread.type,
                  category: messageThread.category,
                  shipmentOrderId: messageThread.shipment?.id,
                  messageThread,
                },
              }),
              MessagesActions.updateTab({ tab: mapMessageThreadCategoryToTab(messageThread.category) }),
            ];
          }
        }

        // Load the first message thread from the current category.
        let messageThreads: MessageThread[];
        switch (tab) {
          case MessagesTab.LiveShipments:
            messageThreads = liveShipmentMessageThreads;
            break;
          case MessagesTab.Quotes:
            messageThreads = quoteMessageThreads;
            break;
          case MessagesTab.GenericSupport:
            messageThreads = genericSupportMessageThreads;
            break;
          case MessagesTab.Archived:
            messageThreads = archivedMessageThreads;
            break;
        }

        if (!messageThreads?.length) {
          return EMPTY;
        }

        return of(
          MessagesActions.openMessageThread({
            payload: {
              id: messageThreads[0].id,
              type: messageThreads[0].type,
              category: messageThreads[0].category,
              shipmentOrderId: messageThreads[0].shipment?.id,
              messageThread: messageThreads[0],
            },
          })
        );
      })
    );
  });

  public openMessageThread$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MessagesActions.openMessageThread),
      concatLatestFrom(() => this.store$.select(fromMessages.selectMessageThreadData)),
      filter(([{ payload }, messageThread]) => payload.id !== messageThread?.id),
      switchMap(([{ payload }]) => {
        const url = this.router.createUrlTree([RouteSegment.Root, RouteSegment.Messages, payload.id]).toString();
        this.location.go(url);

        return [
          MessagesActions.loadMessageThread({ payload }),
          MessagesActions.loadTeamMembers({ payload }),
          MessagesActions.loadShipmentOrderPeople({ payload }),
        ];
      })
    );
  });

  public loadMessageThread$ = createEffect((): any => {
    return this.actions$.pipe(
      ofType(MessagesActions.loadMessageThread),
      switchMap(({ payload }) =>
        from(this.sendbirdServices.getMessagesFromChannelUrlPromise(payload.id)).pipe(
          map((response) => {
            const messageThread = payload.messageThread;
            const sendbirdChannel = response.channel.serialize();
            const sendbirdMessages = response.messages;
            const channelInfo = response.channelInfo;
            const mappedResponse = {
              id: messageThread.id,
              type: messageThread.type,
              subject: messageThread.subject,
              photoUrl: messageThread.photoUrl,
              messages: [],
              participants: [],
              origin: messageThread.origin,
              shipment: messageThread.shipment,
              recordType: messageThread.recordType,
              source: {
                type: messageThread.case?.source?.type,
                recordId: messageThread.case?.source?.recordId,
              },
              description: messageThread.description,
              sendbirdChannel,
              sendbirdMessages,
              channelInfo,
            };
            return MessagesActions.loadMessageThreadSuccess({ messageThread: mappedResponse });
          }),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_MESSAGE_THREAD');
            return of(MessagesActions.loadMessageThreadError({ error: error.message }));
          })
        )
      )
    );
  });

  public loadTeamMembers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MessagesActions.loadTeamMembers),
      switchMap(({ payload }) => {
        const teamMembersListType =
          payload.category === MessageThreadCategory.LiveShipment ? TeamMemberListType.ShipmentOrder : TeamMemberListType.General;

        return this.getMessageService(payload)
          .getTeamMembers$(payload.shipmentOrderId, teamMembersListType)
          .pipe(
            switchMap((loadedTeamMembers) => of(MessagesActions.loadTeamMembersSuccess({ teamMembers: loadedTeamMembers }))),
            catchError((error) => {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_TEAM_MEMBERS');

              return of(MessagesActions.loadMessageThreadError({ error: error.message }));
            })
          );
      })
    );
  });

  public loadShipmentOrderPeople$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MessagesActions.loadShipmentOrderPeople),
      switchMap(({ payload }) => {
        return this.teamMemberService.getShipmentOrderPeople$(payload.shipmentOrderId).pipe(
          switchMap((shipmentOrderPeople) => of(MessagesActions.loadShipmentOrderPeopleSuccess({ shipmentOrderPeople }))),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_SHIPMENT_ORDER_PEOPLE');

            return of(MessagesActions.loadShipmentOrderPeopleError({ error: error.message }));
          })
        );
      })
    );
  });

  private getMessageService(messageThread: { type: MessageThreadType }): MessageService {
    switch (messageThread.type) {
      case MessageThreadType.Case:
        return this.caseMessageService;
      case MessageThreadType.Task:
        return this.taskMessageService;
      default:
        throw new Error('Not supported');
    }
  }

  constructor(
    private readonly actions$: Actions,
    private readonly commonMessagesService: CommonMessagesService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly store$: Store<fromMessages.AppState>,
    private readonly caseMessageService: CaseMessageService,
    private readonly loadingIndicatorService: LoadingIndicatorService,
    private readonly taskMessageService: TaskMessageService,
    private readonly teamMemberService: TeamMemberService,
    private readonly router: Router,
    private readonly location: Location,
    private readonly sendbirdServices: SendbirdService,
    private readonly authService: AuthService
  ) {}
}
