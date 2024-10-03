import { Injectable, Injector } from '@angular/core';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { DialogRef } from '@global/modules/dialog/dialog-ref';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { DialogShowMode } from '@global/modules/dialog/enums/dialog-show-mode.enum';
import { LocalVatRegistrationDialogComponent } from '@modules/local-vat-registration/components/local-vat-registration-dialog/local-vat-registration-dialog.component';
import { LocalVatRegistrationDialogPayload } from '@modules/local-vat-registration/interfaces/local-vat-registration-dialog-payload.interface';

@Injectable()
export class LocalVatRegistrationDialogService {
  constructor(private readonly dialogService: DialogService, private readonly injector: Injector) {}

  public openDialog(payload: LocalVatRegistrationDialogPayload): DialogRef<LocalVatRegistrationVM> {
    return this.dialogService.open<LocalVatRegistrationDialogPayload, LocalVatRegistrationVM>(
      LocalVatRegistrationDialogComponent,
      payload,
      {
        showMode: DialogShowMode.Side,
        width: '800px',
        injector: this.injector,
      }
    );
  }
}
