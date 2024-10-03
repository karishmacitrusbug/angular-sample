import { Injectable, Injector } from '@angular/core';
import { Costs } from '@global/interfaces/costs.interface';
import { DialogRef } from '@global/modules/dialog/dialog-ref';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { CostExplanationDialogComponent } from './cost-explanation-dialog.component';

@Injectable()
export class CostExplanationDialogService {
  constructor(private readonly dialogService: DialogService, private readonly injector: Injector) {}

  public open(costs: Costs): DialogRef<void> {
    return this.dialogService.open(CostExplanationDialogComponent, costs, {
      width: '960px',
      injector: this.injector,
    });
  }
}
