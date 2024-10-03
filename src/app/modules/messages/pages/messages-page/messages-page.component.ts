import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessagePayload } from '@global/interfaces/messages/message-payload.interface';
import { MessageThread } from '@global/interfaces/messages/message-thread.interface';
import { SendbirdMessagePayload } from '@global/interfaces/messages/sendbird-message-payload.interface';
import { MessagesRouteParam } from '@global/modules/common-messages/enums/messages-route-param.enum';
import { MessagesSortBy } from '@global/modules/common-messages/enums/messages-sort-by.enum';
import { MessagesTab } from '@global/modules/common-messages/enums/messages-tab.enum';
import { CaseMessageDialogService } from '@global/modules/message-dialog/services/case-message-dialog.service';
import { SendbirdService } from '@global/modules/message-thread/services/sendbird-message.service';
import { FormControl } from '@ngneat/reactive-forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import SendBird from 'sendbird';
import * as MessagesActions from '../../actions/messages.actions';
import * as fromMessages from '../../reducers';

@Component({
  templateUrl: './messages-page.component.html',
  styleUrls: ['./messages-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesPageComponent implements OnInit, OnDestroy {
  public readonly areMessageThreadsLoading$ = this.store$.select(fromMessages.selectMessageThreadsLoadingState);
  public readonly liveShipmentMessageThreadGroups$ = this.store$.select(fromMessages.selectLiveShipmentMessageThreadGroups);
  public readonly qouteMessageThreadGroups$ = this.store$.select(fromMessages.selectQuoteMessageThreadsGroups);
  public readonly genericSupportMessageThreadGroups$ = this.store$.select(fromMessages.selectGenericSupportMessageThreadsGroups);
  public readonly archivedMessageThreadGroups$ = this.store$.select(fromMessages.selectArchivedMessageThreadsGroups);
  public readonly liveShipmentsMessageThreadsNumber$ = this.store$.select(fromMessages.selectLiveShipmentsMessageThreadsNumber);
  public readonly unreadLiveShipmentsMessageThreadsNumber$ = this.store$.select(fromMessages.selectUnreadLiveShipmentsMessageThreadsNumber);
  public readonly qouteMessageThreadsNumber$ = this.store$.select(fromMessages.selectQouteMessageThreadsNumber);
  public readonly unreadQouteMessageThreadsNumber$ = this.store$.select(fromMessages.selectUnreadQouteMessageThreadsNumber);
  public readonly genericSupportMessageThreadsNumber$ = this.store$.select(fromMessages.selectGenericSupportMessageThreadsNumber);
  public readonly unreadGenericSupportMessageThreadsNumber$ = this.store$.select(
    fromMessages.selectUnreadGenericSupportMessageThreadsNumber
  );
  public readonly unreadArchivedMessageThreadsNumber$ = this.store$.select(fromMessages.selectUnreadArchivedMessageThreadsNumber);
  public readonly archivedMessageThreadsNumber$ = this.store$.select(fromMessages.selectArchivedMessageThreadsNumber);
  public readonly selectedTabIndex$ = this.store$.select(fromMessages.selectTab);
  public readonly isSortAvailable$ = this.store$.select(fromMessages.selectSortAvailable);
  public readonly isMessageThreadLoading$ = this.store$.select(fromMessages.selectMessageThreadLoading);
  public readonly messageThread$ = this.store$.select(fromMessages.selectMessageThreadData);
  public readonly openedMessageThreadId$ = this.store$.select(fromMessages.selectOpenedMessageThreadId);
  public readonly sendingMessage$ = this.store$.select(fromMessages.selectSendingMessage);
  public readonly teamMembers$ = this.store$.select(fromMessages.selectTeamMembersData);
  public readonly shipmentOrderPeople$ = this.store$.select(fromMessages.selectShipmentOrderPeopleData);

  public readonly sortByFormControl = new FormControl(MessagesSortBy.Shipments);
  public readonly MessagesSortBy = MessagesSortBy;

  private readonly destroyed$ = new Subject<void>();

  //  Neeed to refactor dont push
  public textMessage: any;
  public readonly specificChannelsId$ = this.store$.select(fromMessages.selectSelectedSendbirdChannelid);
  public selectedChannel: SendBird.GroupChannel | undefined | any;

  public messages: Array<any> = [];
  public readonly SendbirdMessages$ = this.store$.select(fromMessages.selectSendbirdMessages);
  public readonly selectedSendbirdChannel$ = this.store$.select(fromMessages.selectSelectededSendbirdChannel);
  public readonly guestUserEnabled$ = this.store$.select(fromMessages.selectSendbirdChannelGuestUserEnabled);
  public participantonsendbird$ = this.store$.select(fromMessages.selectSendbirdChannelUsers);

  constructor(
    private readonly store$: Store<fromMessages.AppState>,
    private readonly activatedRoute: ActivatedRoute,
    private readonly caseMessageDialogService: CaseMessageDialogService,
    private readonly SendbirdServiceService: SendbirdService,
    private readonly cd: ChangeDetectorRef
  ) {
    this.activatedRoute.params
      .pipe(
        tap((params) => this.store$.dispatch(MessagesActions.enter({ initialMessageThreadId: params[MessagesRouteParam.Id] }))),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  public ngOnInit(): void {
    this.sortByFormControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((sortBy) => this.store$.dispatch(MessagesActions.updateSortBy({ sortBy })));
  }

  public onTabSelectionChange(tab: MessagesTab): void {
    this.store$.dispatch(MessagesActions.updateTab({ tab }));
  }

  public onMessageThreadClick(messageThread: MessageThread): void {
    this.store$.dispatch(
      MessagesActions.openMessageThread({
        payload: {
          id: messageThread.id,
          type: messageThread.type,
          category: messageThread.category,
          shipmentOrderId: messageThread.shipment?.id,
          messageThread,
        },
      })
    );
  }

  public onMessageSend(message: MessagePayload): void {
    this.store$.dispatch(MessagesActions.sendMessage({ message }));
  }

  public ngOnDestroy(): void {
    this.store$.dispatch(MessagesActions.leave());
  }

  //  can keep
  public downloadS3Message(event: { objectKey: string }): void {
    this.SendbirdServiceService.downloadS3Message(event);
  }

  //  Need refactor
  public onMessageSendSendbird(message: SendbirdMessagePayload): void {
    this.textMessage = message;
    this.sendMessage(message.channelUrl);
    this.cd.markForCheck();
  }

  // need refactor
  public sendMessage(channelUrl?: string): any {
    if (channelUrl) {
      this.selectedChannel = channelUrl;
    }

    this.specificChannelsId$.subscribe((id) => (this.selectedChannel = id));
    this.SendbirdServiceService.getChannel(this.selectedChannel).then((channel: any) => {
      this.SendbirdServiceService.sendMessage(
        channel,
        this.textMessage,
        (error: SendBird.SendBirdError, userMessage: SendBird.UserMessage | SendBird.FileMessage) => {
          if (!error) {
            this.getMessages(channel);
          }
        }
      );
    });

    this.cd.markForCheck();
  }

  //  need to check
  public getMessages(channel: SendBird.GroupChannel): void {
    this.selectedChannel = channel;
    this.SendbirdServiceService.getMessagesFromChannel(
      channel,
      (error: SendBird.SendBirdError, messages: Array<SendBird.UserMessage | SendBird.FileMessage | SendBird.AdminMessage>) => {
        if (!error) {
          this.messages = messages;
          this.cd.markForCheck();
        }
      }
    );
  }
  //  this will be used for acc
  public onNewMessageClick(): void {
    this.caseMessageDialogService.open({ createMessageThread: true, nextButtonClickFromMessageFlag: true }).afterClosed$();
  }
}
