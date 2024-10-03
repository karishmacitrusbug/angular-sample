import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ShipmentStatus } from '@global/enums/shipment-status.enum';
import { TrackingState } from '@global/enums/tracking-state.enum';
import { ShipmentListItemVM } from '@modules/shipments/interfaces/shipment-list-item.vm';
import { InvoiceStatusRollup } from '@CitT/data';

@Component({
  selector: 'app-shipments-table-row',
  templateUrl: './shipments-table-row.component.html',
  styleUrls: ['./shipments-table-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentsTableRowComponent {
  @Input() public shipment: ShipmentListItemVM;
  @Output() public payInvoice = new EventEmitter<void>();

  public readonly ShipmentStatus = ShipmentStatus;
  public readonly TrackingState = TrackingState;
  public readonly InvoiceStatusRollup = InvoiceStatusRollup;

  public onPayInvoiceClick(): void {
    this.payInvoice.emit();
  }
}
