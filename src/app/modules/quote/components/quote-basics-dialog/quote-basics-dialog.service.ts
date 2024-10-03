import { Injectable, Injector } from '@angular/core';
import { DialogRef } from '@global/modules/dialog/dialog-ref';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { QuoteBasicsForm } from '../../interfaces/quote-basics-form.interface';
import { QuoteBasicsDialogComponent } from './quote-basics-dialog.component';
import { QuoteBasicsDialogVM } from './quote-basics-dialog.vm';

@Injectable()
export class QuoteBasicsDialogService {
  constructor(private readonly injector: Injector, private readonly dialogService: DialogService) {}

  public open(basics?: QuoteBasicsDialogVM): DialogRef<QuoteBasicsForm> {
    return this.dialogService.open<QuoteBasicsDialogVM, QuoteBasicsForm>(QuoteBasicsDialogComponent, basics, {
      injector: this.injector,
    });
  }
}
