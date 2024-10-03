import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { InvoiceType } from '@global/enums/invoice-type.enum';
import { ShipmentInvoiceVM } from '@global/interfaces/shipments/shipment-invoices.vm';
import { Store } from '@ngrx/store';
import { InvoiceStatus } from '@CitT/data';
import * as ShipmentDetailsActions from '../../actions/shipment-details.actions';
import * as fromShipments from '../../reducers';

@Component({
  selector: 'app-shipment-invoice-item',
  templateUrl: './shipment-invoice-item.component.html',
  styleUrls: ['./shipment-invoice-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentInvoiceItemComponent {
  @Input() public shipmentInvoice: ShipmentInvoiceVM;

  public readonly InvoiceType = InvoiceType;
  public readonly InvoiceStatus = InvoiceStatus;

  constructor(private readonly store$: Store<fromShipments.AppState>) {}

  public get paymentNeeded(): boolean {
    return (
      this.shipmentInvoice.type === InvoiceType.Outstanding &&
      (this.shipmentInvoice.status === InvoiceStatus.INVOICE_SENT || this.shipmentInvoice.status === InvoiceStatus.PARTIAL_PAYMENT)
    );
  }

  public get isPaid(): boolean {
    return (
      this.shipmentInvoice.status === InvoiceStatus.PAID ||
      this.shipmentInvoice.status === InvoiceStatus.PAID_VIA_STRIPE ||
      this.shipmentInvoice.status === InvoiceStatus.POP_RECEIVED
    );
  }

  public onInvoiceClick(): void {
    this.store$.dispatch(ShipmentDetailsActions.openInvoice({ invoice: this.shipmentInvoice }));
  }

  public onMessageClick(): void {
    this.store$.dispatch(ShipmentDetailsActions.sendInvoiceInEmail({ invoiceId: this.shipmentInvoice.id }));
  }

  public onDownloadClick(): void {
    this.store$.dispatch(ShipmentDetailsActions.downloadInvoice({ invoiceId: this.shipmentInvoice.id }));
  }

  public onPayInvoiceClick(): void {
    this.store$.dispatch(ShipmentDetailsActions.payInvoice({ invoice: this.shipmentInvoice }));
  }
}
