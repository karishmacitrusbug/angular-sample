import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import { DIALOG_DATA } from '@global/modules/dialog/dialog.tokens';
import { DialogData } from '@global/modules/dialog/interfaces/dialog-data.interface';
import { QuoteBasicsForm } from '../../interfaces/quote-basics-form.interface';
import { QuoteBasicsComponent } from '../quote-basics/quote-basics.component';
import { QuoteBasicsDialogVM } from './quote-basics-dialog.vm';

@Component({
  selector: 'app-quote-basics-dialog',
  templateUrl: './quote-basics-dialog.component.html',
  styleUrls: ['./quote-basics-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteBasicsDialogComponent {
  @ViewChild(QuoteBasicsComponent) public quoteBasicsComponent: QuoteBasicsComponent;

  public isValid = true;
  public vm: QuoteBasicsDialogVM;

  constructor(@Inject(DIALOG_DATA) private readonly data: DialogData<QuoteBasicsDialogVM, QuoteBasicsForm>) {
    const basicsData = this.data.payload;
    this.vm = basicsData;
  }

  public onValidityChange(isValid: boolean): void {
    this.isValid = isValid;
  }

  public onDiscardClick(): void {
    this.data.dialogRef.close();
  }

  public onSaveClick(): void {
    this.data.dialogRef.close(this.quoteBasicsComponent.getValue());
  }
}
