import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toggleAnimation, toggleOpacityAnimation } from '@global/animations/toggle-open-close.animation';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { ShipmentStatus } from '@global/enums/shipment-status.enum';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { ShipmentDocumentVM } from '@global/interfaces/shipments/shipment-document.vm';
import { ShipmentHistory } from '@global/interfaces/shipments/shipment-history.vm';
import { ShipmentTaskDataVM } from '@global/interfaces/shipments/shipment-task-data.vm';
import { MessageEnvelopeMessageVM } from '@global/modules/message-envelope/message.vm';
import * as fromCountry from '@modules/country/reducers';
import { ShipmentDetailsPageParamAction } from '@modules/shipments/enums/shipment-details-page-param-action.enum';
import { ShipmentsListParam } from '@modules/shipments/enums/shipments-list-param.enum';
import { ShipmentDetailsShipmentVM } from '@modules/shipments/interfaces/shipment-details-shipment.vm';
import { ShipmentsDetailsPageService } from '@modules/shipments/pages/shipments-details-page/shipments-details-page.service';
import { FormControl } from '@ngneat/reactive-forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { delay, filter, map, take, takeUntil } from 'rxjs/operators';
import * as ShipmentDetailsActions from '../../actions/shipment-details.actions';
import * as fromShipmentDetails from '../../reducers';

const COLLAPSABLE_TITLE_HEIGHT = 36;

@Component({
  selector: 'app-shipments-details-page',
  templateUrl: './shipments-details-page.component.html',
  styleUrls: ['./shipments-details-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [toggleAnimation(COLLAPSABLE_TITLE_HEIGHT), toggleOpacityAnimation],
  providers: [ShipmentsDetailsPageService],
})
export class ShipmentsDetailsPageComponent implements OnDestroy {
  @ViewChild('invoicesAccordion') public invoicesAccordion: ElementRef<HTMLDivElement>;

  public shipment$: Observable<ShipmentDetailsShipmentVM> = this.store$.select(fromShipmentDetails.selectShipmentDetailsShipment);
  public contacts$: Observable<InputDataVM[]>;

  private readonly shipmentId: string;
  public ShipmentStatus = ShipmentStatus;
  public isInvoicesOpen = false;
  public isTotalCostsOpen = false;
  public isShipmentHistoryOpen = false;
  public isNoteInEdit = false;

  public destroyed$ = new Subject<void>();

  public isLoading$: Observable<boolean> = this.store$.select(fromShipmentDetails.selectShipmentDetailsisLoading);

  // TASKS
  public openTasks$: Observable<ShipmentTaskDataVM[]> = this.store$.select(fromShipmentDetails.selectOpenTasks);
  public openTasksNumber$: Observable<number> = this.store$.select(fromShipmentDetails.selectOpenTasksNumber);
  public clientPendingTasksNumber$: Observable<number> = this.store$.select(fromShipmentDetails.selectClientPendingTasksNumber);
  public underReviewTasks$: Observable<ShipmentTaskDataVM[]> = this.store$.select(fromShipmentDetails.selectUnderReviewTasks);
  public underReviewTasksNumber$: Observable<number> = this.store$.select(fromShipmentDetails.selectUnderReviewTasksNumber);
  public closedTasks$: Observable<ShipmentTaskDataVM[]> = this.store$.select(fromShipmentDetails.selectClosedTasks);
  public closedTasksNumber$: Observable<number> = this.store$.select(fromShipmentDetails.selectClosedTasksNumber);

  // MESSAGES
  public openMessages$: Observable<MessageEnvelopeMessageVM[]> = this.store$.select(fromShipmentDetails.selectOpenMessages);
  public closedMessages$: Observable<MessageEnvelopeMessageVM[]> = this.store$.select(fromShipmentDetails.selectClosedMessages);
  public openMessagesNumber$: Observable<number> = this.store$.select(fromShipmentDetails.selectOpenMessagesNumber);
  public closedMessagesNumber$: Observable<number> = this.store$.select(fromShipmentDetails.selectClosedMessagesNumber);

  // DOCUMENTS
  public proofOfDeliveries$: Observable<ShipmentDocumentVM[]> = this.store$.select(fromShipmentDetails.selectPodDocuments);
  public podDocNumber$: Observable<number> = this.store$.select(fromShipmentDetails.selectPodDocumentsNumber);
  public customsClearances$: Observable<ShipmentDocumentVM[]> = this.store$.select(fromShipmentDetails.selectCcdDocuments);
  public ccdNumber$: Observable<number> = this.store$.select(fromShipmentDetails.selectCcdDocumentsNumber);
  public clearanceLetters$: Observable<ShipmentDocumentVM[]> = this.store$.select(fromShipmentDetails.selectClearanceLetterDocuments);
  public clearanceLetterNumber$: Observable<number> = this.store$.select(fromShipmentDetails.selectClearanceLetterDocumentsNumber);

  public localVatRegistration$: Observable<LocalVatRegistrationVM | undefined>;

  public noteControl = new FormControl('');
  public clientControl = new FormControl('');

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly store$: Store<fromShipmentDetails.AppState & fromCountry.AppState>,
    private readonly shipmentsDetailsPageService: ShipmentsDetailsPageService
  ) {
    this.shipmentId = this.activatedRoute.snapshot.params[ShipmentsListParam.ShipmentId];
    this.contacts$ = this.shipment$.pipe(
      map((shipment) => shipment.contacts.map((contact) => ({ value: contact.id, viewValue: contact.name })))
    );

    this.store$.dispatch(ShipmentDetailsActions.enter({ shipmentId: this.shipmentId }));

    this.store$
      .select(fromShipmentDetails.selectShipmentOwner)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((owner) => {
        this.clientControl.setValue(owner, { emitEvent: false });
      });

    this.clientControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((newClient) => {
      this.store$.dispatch(ShipmentDetailsActions.changeOwner({ owner: newClient }));
    });

    this.store$
      .select(fromShipmentDetails.selectShipmentNote)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((note) => {
        if (note) {
          this.noteControl.setValue(note);
        }
      });

    this.localVatRegistration$ = this.shipmentsDetailsPageService.getLocalVatRegistration$();

    this.isLoading$
      .pipe(
        filter((isLoading) => !isLoading),
        take(1),
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        delay(500) // Added delay for smooth animation
      )
      .subscribe(() => {
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        if (queryParamMap.has('action') && queryParamMap.get('action') === ShipmentDetailsPageParamAction.OpenInvoices) {
          this.isInvoicesOpen = true;
          this.invoicesAccordion?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }
      });
  }

  public ngOnDestroy(): void {
    this.store$.dispatch(ShipmentDetailsActions.leave());

    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public get shipmentsListRouterLink(): RouteSegment[] {
    return [RouteSegment.Root, RouteSegment.ShipmentsList];
  }

  public onReuseDataClick(): void {
    this.store$.dispatch(ShipmentDetailsActions.reuseData({ shipmentId: this.shipmentId }));
  }

  public onTaskClick(task: ShipmentTaskDataVM): void {
    this.store$.dispatch(ShipmentDetailsActions.openTask({ taskId: task.id }));
  }

  public onNewMessageClick(): void {
    this.store$.dispatch(ShipmentDetailsActions.newMessage());
  }

  public onMessageEnvelopeClick(message: MessageEnvelopeMessageVM): void {
    this.store$.dispatch(ShipmentDetailsActions.openMessage({ id: message.id, messageType: message.type }));
  }

  public onInvoicesToggleClick(): void {
    this.isInvoicesOpen = !this.isInvoicesOpen;
  }

  public onTotalCostsToggleClick(): void {
    this.isTotalCostsOpen = !this.isTotalCostsOpen;
  }

  public onShipmentHistoryToggleClick(): void {
    this.isShipmentHistoryOpen = !this.isShipmentHistoryOpen;
  }

  public getShipmetnHistoryCount(history: ShipmentHistory[]): number {
    return history.reduce((count, historyItem) => count + historyItem.items.length, 0);
  }

  public onNoteEditClick(): void {
    this.isNoteInEdit = true;
  }

  public onCancelNoteEdit(): void {
    this.isNoteInEdit = false;
  }

  public onSaveNote(): void {
    this.isNoteInEdit = false;
    this.store$.dispatch(ShipmentDetailsActions.saveNote({ note: this.noteControl.value, id: this.shipmentId }));
  }

  public onDocumentDownload(id: string): void {
    this.store$.dispatch(ShipmentDetailsActions.downloadDocument({ id }));
  }

  public hideClearanceLetters(ccdNumber: number, clNumber: number): boolean {
    if (ccdNumber === 0) {
      return true;
    }

    return clNumber === 0;
  }
}
