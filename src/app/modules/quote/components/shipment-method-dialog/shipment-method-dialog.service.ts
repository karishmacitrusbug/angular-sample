import { Injectable, Injector } from '@angular/core';
import { DialogRef } from '@global/modules/dialog/dialog-ref';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { ShipmentMethodDialogPayload } from './shipment-method-dialog-payload.interface';
import { ShipmentMethodDialogResult } from './shipment-method-dialog-result.interface';
import { ShipmentMethodDialogComponent } from './shipment-method-dialog.component';

@Injectable()
export class ShipmentMethodDialogService {
  constructor(private readonly dialogService: DialogService, private readonly injector: Injector) {}

  public open(payload: ShipmentMethodDialogPayload): DialogRef<ShipmentMethodDialogResult> {
    return this.dialogService.open(ShipmentMethodDialogComponent, payload, { injector: this.injector });
  }
}
