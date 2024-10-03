import { Injectable, Injector } from '@angular/core';
import { QuoteAcceptDialogQuoteDataVM } from '@global/modules/common-quote/interfaces/quote-data.vm';
import { DialogRef } from '@global/modules/dialog/dialog-ref';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { QuoteAcceptDialogComponent } from './quote-accept-dialog.component';

@Injectable()
export class QuoteAcceptDialogService {
  constructor(private readonly dialogService: DialogService, private readonly injector: Injector) {}

  public open(quotes: QuoteAcceptDialogQuoteDataVM[], buttonText: string): DialogRef<any> {
    return this.dialogService.open(
      QuoteAcceptDialogComponent,
      { quotes, buttonText },
      { closeButton: false, closeOnBackdropClick: false, width: '960px', injector: this.injector }
    );
  }
}
