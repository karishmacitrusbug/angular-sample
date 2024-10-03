import { Injectable, Injector } from '@angular/core';
import { DialogRef } from '@global/modules/dialog/dialog-ref';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { DialogShowMode } from '@global/modules/dialog/enums/dialog-show-mode.enum';
import { TrackingDetailsDialogPayload } from '@modules/tracking/components/tracking-details-dialog/tracking-details-payload.interface';
import { TrackingDetailsDialogComponent } from './tracking-details-dialog.component';

@Injectable()
export class TrackingDetailsDialogService {
  constructor(private readonly dialogService: DialogService, private readonly injector: Injector) {}

  public open(payload: TrackingDetailsDialogPayload): DialogRef<any> {
    return this.dialogService.open(TrackingDetailsDialogComponent, payload, {
      showMode: DialogShowMode.Side,
      width: '500px',
      injector: this.injector,
      closeOnNavigation: true,
    });
  }
}
