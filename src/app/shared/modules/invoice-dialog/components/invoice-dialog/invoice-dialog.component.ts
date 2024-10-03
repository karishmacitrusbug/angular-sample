import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { InvoiceDetailsService } from '@global/modules/common-invoices/service/invoice-details.service';
import { DIALOG_DATA } from '@global/modules/dialog/dialog.tokens';
import { DialogData } from '@global/modules/dialog/interfaces/dialog-data.interface';
import { CbInvoiceDialogPayload } from '@shared/interfaces/cb-invoice-dialog-payload.interface';
import { PaymentService } from '@shared/services/payment.service';
import { PayDialogService } from '../pay-dialog/pay-dialog.service';

@Component({
  selector: 'app-invoice-dialog',
  templateUrl: './invoice-dialog.component.html',
  providers: [InvoiceDetailsService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDialogComponent {
  public invoice: CbInvoiceDialogPayload;

  constructor(
    @Inject(DIALOG_DATA) private readonly data: DialogData<{ invoice: CbInvoiceDialogPayload }>,
    private readonly payDialogService: PayDialogService,
    private readonly paymentService: PaymentService
  ) {
    this.invoice = this.data.payload.invoice;
  }

  public onShipmentOrderNameClick(): void {
    this.data.dialogRef.close();
  }

  public onPayWithEFTClick(): void {
    this.payDialogService.open(this.invoice);
  }

  public onPayClick(): void {
    this.paymentService.payInvoice({ invoiceId: this.invoice.id, stripeUrl: this.invoice.stripeUrl });
  }
}
