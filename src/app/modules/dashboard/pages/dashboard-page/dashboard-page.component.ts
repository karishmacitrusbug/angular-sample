import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { ShipmentListQueryParam } from '@global/enums/shipments/shipment-list-query-param.enum';
import { Loadable } from '@global/interfaces/loadable.interface';
import { MessageThread } from '@global/interfaces/messages/message-thread.interface';
import { User } from '@global/interfaces/user.interface';
import { DashboardProgressUpdateVM } from '@global/modules/common-dashboard/interfaces/dashboard-progress-update.vm';
import { DashboardQuoteVM } from '@global/modules/common-dashboard/interfaces/dashboard-quote.vm';
import { DashboardYourTaskVM } from '@global/modules/common-dashboard/interfaces/dashboard-your-task.vm';
import { MessageButtonUserVM } from '@global/modules/message-button/user.vm';
import { SendbirdChannelInfo, SendbirdService } from '@global/modules/message-thread/services/sendbird-message.service';
import { AuthService } from '@global/services/auth.service';
import { ShipmentListTabQuery } from '@modules/shipments/enums/shipment-list-tab-query.enum';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as commonMessageActions from '../../../../../../../../common/src/global/modules/message-thread/actions/common-messages.actions';
import * as DashboardActions from '../../actions/dashboard.actions';
import * as fromDashboard from '../../reducers';

@Component({
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  public readonly isLoadingCounts$: Observable<boolean> = this.store$.select(fromDashboard.selectDashboardHeaderLoading);
  public readonly importantTasksCount$: Observable<number> = this.store$.select(fromDashboard.selectImportantTasksCount);
  public readonly quoteUpdatesCount$: Observable<number> = this.store$.select(fromDashboard.selectQuoteUpdatesCount);
  public readonly compliancePendingShipmentsCount$: Observable<number> = this.store$.select(
    fromDashboard.selectCompliancePendingShipmentsCount
  );
  public readonly trackingShipmentsCount$: Observable<number> = this.store$.select(fromDashboard.selectTrackingShipmentsCount);
  public readonly completedShipmentsCount$: Observable<number> = this.store$.select(fromDashboard.selectDeliveredShipmentsCount);

  public readonly messageThreads$: Observable<MessageThread[]> = this.store$.select(fromDashboard.selectSortedMessageThreads);
  public readonly messageThreadCount$: Observable<number> = this.store$.select(fromDashboard.selectMessageThreadCount);
  public readonly areMessagesLoading$: Observable<boolean> = this.store$.select(fromDashboard.selectSendbirdUnreadChannelsMessagesLoading);

  public readonly yourTasks$: Observable<Loadable<DashboardYourTaskVM[]>> = this.store$.select(fromDashboard.selectYourTasks);
  public readonly progressUpdates$: Observable<Loadable<DashboardProgressUpdateVM[]>> = this.store$.select(
    fromDashboard.selectProgressUpdates
  );
  public readonly quoteUpdates$: Observable<Loadable<DashboardQuoteVM[]>> = this.store$.select(fromDashboard.selectQuoteUpdates);

  public readonly numberOfAdvancedFilters$: Observable<number> = this.store$.select(fromDashboard.selectNumberOfAdvanceFilters);
  public sendbirdUnreadChannels$ = this.store$.select(fromDashboard.selectSendbirdUnreadChannels);

  public readonly user$: Observable<User>;

  constructor(
    private readonly store$: Store<fromDashboard.AppState>,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly sendbirdService: SendbirdService
  ) {
    this.user$ = this.authService.getUser$();
  }

  public ngOnInit(): void {
    this.store$.dispatch(DashboardActions.enter());
    this.store$.dispatch(commonMessageActions.loadAwstokens());
    this.store$.dispatch(DashboardActions.loadSendBirdUnreadChannels());
  }

  public onMessageToAccountManagerClick(teamMember: MessageButtonUserVM): void {
    this.store$.dispatch(DashboardActions.messageToAccountManager({ teamMember }));
  }

  public onMessageClick(messageThread: SendbirdChannelInfo): void {
    this.store$.dispatch(DashboardActions.openMessage({ id: messageThread.sendbirdChannelUrl, messageType: undefined }));
    setTimeout(() => {
      this.store$.dispatch(DashboardActions.loadSendBirdUnreadChannels());
    }, 1000);
  }

  public onTaskClick(taskId: string): void {
    this.store$.dispatch(DashboardActions.openTask({ taskId }));
  }

  public onToggleFilter(): void {
    this.store$.dispatch(DashboardActions.toggleFilter());
  }

  public onComplianceClick(): void {
    this.navigateToShipmentList(ShipmentListTabQuery.ShipmentPending);
  }

  public onTrackingClick(): void {
    this.navigateToShipmentList(ShipmentListTabQuery.EnRoute);
  }

  public onCompletedClick(): void {
    this.navigateToShipmentList(ShipmentListTabQuery.Completed);
  }

  public ngOnDestroy(): void {
    this.store$.dispatch(DashboardActions.leave());
  }

  private navigateToShipmentList(tabName: ShipmentListTabQuery): void {
    this.router.navigate([RouteSegment.ShipmentsList], { queryParams: { [ShipmentListQueryParam.Tab]: tabName } });
  }

  public onSearch(keyword: string): void {
    this.store$.dispatch(DashboardActions.updateKeyword({ keyword }));
  }

  public onOpenAdvancedFilters(): void {
    this.store$.dispatch(DashboardActions.openAdvancedFilters());
  }

  public onRemoveFilters(): void {
    this.store$.dispatch(DashboardActions.clearAdvancedFilters());
  }
}
