import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { toggleAnimation, toggleOpacityAnimation } from '@global/animations/toggle-open-close.animation';
import { DIALOG_DATA } from '@global/modules/dialog/dialog.tokens';
import { DialogData } from '@global/modules/dialog/interfaces/dialog-data.interface';
import { TrackingDetailsDialogPayload } from './tracking-details-payload.interface';

const LOG_HEADER_HEIGHT = 0;

@Component({
  templateUrl: './tracking-details-dialog.component.html',
  styleUrls: ['./tracking-details-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [toggleAnimation(LOG_HEADER_HEIGHT), toggleOpacityAnimation],
})
export class TrackingDetailsDialogComponent {
  constructor(@Inject(DIALOG_DATA) public readonly data: DialogData<TrackingDetailsDialogPayload>) {}

  public toggleTrackingHistory(): void {
    this.data.payload.toggleTrackingHistory();
  }

  public onReuseDataClick(): void {
    this.data.payload.onReuseDataClick();
  }
}
