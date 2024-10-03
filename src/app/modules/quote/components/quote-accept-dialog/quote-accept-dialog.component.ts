import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { QuoteAcceptDialogQuoteDataVM as QuoteDataVM } from '@global/modules/common-quote/interfaces/quote-data.vm';
import { DIALOG_DATA } from '@global/modules/dialog/dialog.tokens';
import { DialogData } from '@global/modules/dialog/interfaces/dialog-data.interface';
import { QuoteAcceptDialogPayload } from './quote-accept-dialog-payload.vm';

@Component({
  selector: 'app-quote-accept-dialog',
  templateUrl: './quote-accept-dialog.component.html',
  styleUrls: ['./quote-accept-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteAcceptDialogComponent {
  public readonly shipmentList = [RouteSegment.Root, RouteSegment.ShipmentsList];
  public acceptedQuotes: QuoteDataVM[] = [];

  constructor(
    @Inject(DIALOG_DATA)
    private readonly data: DialogData<QuoteAcceptDialogPayload, boolean>,
    private readonly router: Router
  ) {
    this.acceptedQuotes = this.data.payload.quotes;
  }

  public get buttonText(): string {
    return this.data.payload.buttonText;
  }

  public onGoToShipmentListClick(): void {
    this.data.dialogRef.close();
    this.router.navigate([...this.shipmentList]);
  }

  public onGoShipmentTasksClick(): void {
    this.data.dialogRef.close(true);
  }

  public onBackToRolloutClick(): void {
    this.data.dialogRef.close(false);
  }
}
