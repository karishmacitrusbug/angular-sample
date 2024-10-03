import { Injectable, Injector } from '@angular/core';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { DialogRef } from '@global/modules/dialog/dialog-ref';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { DialogShowMode } from '@global/modules/dialog/enums/dialog-show-mode.enum';
import { QuoteListSideFilterDialogPayload } from '@modules/quote-list/components/quote-list-side-filter-dialog/quote-list-side-filter-dialog-payload.interface';
import { QuoteListSideFilterDialogComponent } from '@modules/quote-list/components/quote-list-side-filter-dialog/quote-list-side-filter-dialog.component';
import { QuoteListSideFilterDialogVM } from '@modules/quote-list/components/quote-list-side-filter-dialog/quote-list-side-filter-dialog.vm';

@Injectable()
export class QuoteListSideFilterDialogService {
  constructor(private readonly dialogService: DialogService, private readonly injector: Injector) {}

  public open(countries: InputDataVM<string, string>[], filters?: QuoteListSideFilterDialogVM): DialogRef<QuoteListSideFilterDialogVM> {
    return this.dialogService.open<QuoteListSideFilterDialogPayload, QuoteListSideFilterDialogVM>(
      QuoteListSideFilterDialogComponent,
      { countries, filters },
      { showMode: DialogShowMode.Side, width: '400px', injector: this.injector }
    );
  }
}
