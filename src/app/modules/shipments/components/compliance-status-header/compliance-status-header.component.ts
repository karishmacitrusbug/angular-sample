import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { toggleAnimation, toggleOpacityAnimation } from '@global/animations/toggle-open-close.animation';
import { trackingStateIcons } from '@global/constants/tracking-state-icons.constants';
import { ShipmentStatus } from '@global/enums/shipment-status.enum';
import { TrackingState } from '@global/enums/tracking-state.enum';
import { ShipmentTaskStates } from '@global/interfaces/shipment-task-states.vm';
import { TrackingItemLogVM } from '@global/interfaces/tracking/tracking-item-log.vm';
import { TrackingNumberDialogService } from '@global/modules/tracking-number/components/tracking-number-dialog/tracking-number-dialog.service';
import { ShipmentStatusUpdates } from '@modules/shipments/interfaces/shipment-status-updates.vm';
import { InvoiceStatusRollup } from '@CitT/data';

const COMPLIANCE_HEADER_HEIGHT = 280;

@Component({
  selector: 'app-compliance-status-header',
  templateUrl: './compliance-status-header.component.html',
  styleUrls: ['./compliance-status-header.component.scss'],
  animations: [toggleAnimation(COMPLIANCE_HEADER_HEIGHT), toggleOpacityAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplianceStatusHeaderComponent implements OnChanges {
  private _statusTitle: string;

  @Input() public shipmentOrderId: string;
  @Input() public shipmentStatus: ShipmentStatus;
  @Input() public shipmentSubStatus?: string;
  @Input() public shipmentTaskStates: ShipmentTaskStates;
  @Input() public statusUpdates: ShipmentStatusUpdates;
  @Input() public trackingState: TrackingState;
  @Input() public shipmentLogs: TrackingItemLogVM[];
  @Input() public trackingNumber: string;
  @Input() public newStatusDate?: string;
  @Input() public invoiceStatusRollup: InvoiceStatusRollup;

  @Input()
  public set statusTitle(value: string) {
    this._statusTitle = value === 'Compliance Pending' ? 'SHIPMENTS.SHIPMENTS_LIST.SHIPMENT_PENDING' : value;
  }

  public get statusTitle(): string {
    return this._statusTitle;
  }

  public readonly stateIcons = trackingStateIcons;

  public readonly TrackingState = TrackingState;
  public ShipmentStatus = ShipmentStatus;
  public estimationText: string;
  public completedLogs: TrackingItemLogVM[];
  public isOpen = false;

  constructor(private readonly trackingNumberDialogService: TrackingNumberDialogService) {}

  public get isPaymentPending(): boolean {
    return this.invoiceStatusRollup === InvoiceStatusRollup.INVOICE_SENT_OR_PARTIAL_PAYMENT;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.trackingState) {
      this.completedLogs = this.mapCompletedLogs();
    }
  }

  public onArrowClick(): void {
    this.isOpen = !this.isOpen;
  }

  public onShowTrackingNumberClick(): void {
    this.trackingNumberDialogService.open({ trackingNumber: this.trackingNumber, shipmentOrderId: this.shipmentOrderId });
  }

  private mapCompletedLogs(): TrackingItemLogVM[] {
    return this.shipmentLogs?.filter((log) => log.isCompleted);
  }
}
