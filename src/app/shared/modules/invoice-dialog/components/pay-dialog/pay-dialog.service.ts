import { Injectable, Injector } from '@angular/core';
import { DialogRef } from '@global/modules/dialog/dialog-ref';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { DialogShowMode } from '@global/modules/dialog/enums/dialog-show-mode.enum';
import { CbInvoiceDialogPayload } from '@shared/interfaces/cb-invoice-dialog-payload.interface';
import { PayDialogComponent } from './pay-dialog.component';

@Injectable()
export class PayDialogService {
  constructor(private readonly dialogService: DialogService, private readonly injector: Injector) {}

  public open(invoice: CbInvoiceDialogPayload): DialogRef<void> {
    return this.dialogService.open(
      PayDialogComponent,
      { invoice },
      {
        showMode: DialogShowMode.Side,
        width: '800px',
        injector: this.injector,
      }
    );
  }
}
