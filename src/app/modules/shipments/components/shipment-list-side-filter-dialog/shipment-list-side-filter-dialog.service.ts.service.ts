import { Injectable, Injector } from '@angular/core';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { DialogRef } from '@global/modules/dialog/dialog-ref';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { DialogShowMode } from '@global/modules/dialog/enums/dialog-show-mode.enum';
import { ShipmentListSideFilterDialogPayload } from '@modules/shipments/components/shipment-list-side-filter-dialog/shipment-list-side-filter-dialog-payload.interface';
import { ShipmentListSideFilterDialogResult } from '@modules/shipments/components/shipment-list-side-filter-dialog/shipment-list-side-filter-dialog-result.interface';
import { ShipmentListSideFilterDialogComponent } from '@modules/shipments/components/shipment-list-side-filter-dialog/shipment-list-side-filter-dialog.component';

@Injectable()
export class ShipmentListSideFilterDialogService {
  constructor(private readonly dialogService: DialogService, private readonly injector: Injector) {}

  public open(
    filters: ShipmentListSideFilterDialogResult,
    countries: InputDataVM<string, string>[]
  ): DialogRef<ShipmentListSideFilterDialogResult> {
    return this.dialogService.open<ShipmentListSideFilterDialogPayload, ShipmentListSideFilterDialogResult>(
      ShipmentListSideFilterDialogComponent,
      {
        filters,
        countries,
      },
      { showMode: DialogShowMode.Side, width: '500px', injector: this.injector }
    );
  }
}
