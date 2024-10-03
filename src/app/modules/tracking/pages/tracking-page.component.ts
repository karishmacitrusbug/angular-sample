import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { toggleAnimation, toggleOpacityAnimation } from '@global/animations/toggle-open-close.animation';
import { trackingStateIcons } from '@global/constants/tracking-state-icons.constants';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { TrackingState } from '@global/enums/tracking-state.enum';
import { TrackingItemType } from '@global/enums/tracking/tracking-item-type.enum';
import { mapTrackerTitle } from '@global/helpers/map-tracker-title.helper';
import { RolloutTrackingItemVM } from '@global/interfaces/tracking/rollout-tracking-item.vm';
import { TrackingDetailsVM } from '@global/interfaces/tracking/tracking-details.vm';
import { TrackingItemVM } from '@global/interfaces/tracking/tracking-item.vm';
import { CaseMessageDialogService } from '@global/modules/message-dialog/services/case-message-dialog.service';
import { TeamMemberListType } from '@global/modules/message-thread/enums/team-member-list-type.enum';
import { TrackingNumberDialogService } from '@global/modules/tracking-number/components/tracking-number-dialog/tracking-number-dialog.service';
import { TrackingDetailsDialogService } from '@modules/tracking/components/tracking-details-dialog/tracking-details-dialog.service';
import * as fromTracking from '@modules/tracking/reducers';
import { Store } from '@ngrx/store';
import { CaseSource } from '@CitT/data';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as TrackingActions from '../actions/tracking.actions';

const LOG_HEADER_HEIGHT = 0;
const DESKTOP_WIDTH = 960;

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking-page.component.html',
  styleUrls: ['./tracking-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [toggleAnimation(LOG_HEADER_HEIGHT), toggleOpacityAnimation],
})
export class TrackingPageComponent implements OnInit, OnDestroy {
  public readonly TrackingItemType = TrackingItemType;
  public readonly TrackingState = TrackingState;

  private readonly destroyed$ = new Subject<void>();
  public isLoading$: Observable<boolean> = this.store$.select(fromTracking.selectTrackingItemsLoading);
  public trackingItems$: Observable<(TrackingItemVM | RolloutTrackingItemVM)[]> = this.store$.select(fromTracking.selectTrackingItems);
  public isDetailsLoading$: Observable<boolean> = this.store$.select(fromTracking.selectTrackingItemDetailsLoading);

  public selectedItem: TrackingItemVM;
  public selectedItemDetails: TrackingDetailsVM;
  public trackerStatusTitle: string;
  public estimatedFinalDelivery: Date;
  public isFullHistoryShown = false;
  public stateIcons = trackingStateIcons;
  public filterText = '';
  public hasOpenDialog = false;
  private screenWidth: number;

  public get shipmentDetailsRouterLink(): (RouteSegment | string)[] {
    return [RouteSegment.Root, RouteSegment.ShipmentsList, this.selectedItem.shippingId];
  }

  constructor(
    private readonly caseMessageDialogService: CaseMessageDialogService,
    private readonly trackingDetailsDialogService: TrackingDetailsDialogService,
    private readonly store$: Store<fromTracking.AppState>,
    private readonly trackingNumberDialogService: TrackingNumberDialogService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.screenWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  public onWindowResize(): void {
    this.screenWidth = window.innerWidth;
  }

  private openDrawer(hasDetails: boolean): void {
    if (this.screenWidth < DESKTOP_WIDTH && hasDetails && !this.hasOpenDialog) {
      this.trackingDetailsDialogService.open({
        selectedItem: this.selectedItem,
        selectedItemDetails: this.selectedItemDetails,
        stateIcons: this.stateIcons,
        isDetailsLoading$: this.isDetailsLoading$,
        shipmentDetailsRouterLink: this.shipmentDetailsRouterLink,
        trackerStatusTitle: this.trackerStatusTitle,
        isFullHistoryShown: this.isFullHistoryShown,
        onReuseDataClick: () => this.onReuseDataClick(),
        toggleTrackingHistory: this.toggleTrackingHistory,
        TrackingState: this.TrackingState,
      });
      this.hasOpenDialog = true;
    }
  }

  public ngOnInit(): void {
    this.store$.dispatch(TrackingActions.enter());

    this.store$
      .select(fromTracking.selectSelectedItem)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((selectedItem) => {
        this.selectedItem = selectedItem;
      });

    this.store$
      .select(fromTracking.selectTrackingItemDetails)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((itemDetails) => {
        this.selectedItemDetails = itemDetails;
        this.mapTrackingData();
        this.cdr.markForCheck();
      });
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public onTrackingItemSelect(trackingItemId: string): void {
    this.store$.dispatch(TrackingActions.selectItem({ id: trackingItemId }));
    this.hasOpenDialog = false;
    this.openDrawer(!!this.selectedItem);
  }

  public onMessageClick(): void {
    this.caseMessageDialogService.open({
      teamMemberListType: TeamMemberListType.ShipmentOrder,
      shipment: this.selectedItem && {
        id: this.selectedItem.shippingId,
        reference: this.selectedItem.reference,
        title: this.selectedItem.name,
      },
      messageTo: this.selectedItemDetails.defaultTeamMember,
      source: {
        type: CaseSource.NCP_ORDER,
        recordId: this.selectedItem.shippingId,
      },
    });
  }

  public toggleTrackingHistory(): void {
    this.isFullHistoryShown = !this.isFullHistoryShown;
  }

  private mapTrackingData(): void {
    if (!this.selectedItem || !this.selectedItemDetails) {
      return;
    }

    this.trackerStatusTitle = mapTrackerTitle(this.selectedItem.state);
    this.isFullHistoryShown = false;
  }

  public onSearch(keyword: string): void {
    this.store$.dispatch(TrackingActions.updateKeyword({ keyword }));
    this.hasOpenDialog = false;
  }

  public onShowTrackingNumberClick(): void {
    this.trackingNumberDialogService.open({
      trackingNumber: this.selectedItemDetails.trackingNumber,
      shipmentOrderId: this.selectedItem.shippingId,
    });
  }

  public onReuseDataClick(): void {
    this.store$.dispatch(TrackingActions.reuseData({ shipmentId: this.selectedItem.shippingId }));
  }
}
