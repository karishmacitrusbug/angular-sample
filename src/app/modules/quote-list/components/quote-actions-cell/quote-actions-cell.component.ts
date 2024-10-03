import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { QuoteState } from '@global/enums/quote-list/quote-state.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { CbQuoteVM } from '@modules/quote-list/interfaces/cb-quote.vm';

@Component({
  selector: 'app-quote-actions-cell',
  templateUrl: './quote-actions-cell.component.html',
  styleUrls: ['./quote-actions-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteActionsCellComponent {
  @Input() public quoteState: QuoteState;
  @Input() public quote: CbQuoteVM;
  @Input() public isSelected: boolean;
  @Input() public isQuoteSelectionDisabled = false;
  @Output() public checkboxChange = new EventEmitter<void>();
  @Output() public downloadClick = new EventEmitter<void>();
  @Output() public messageClick = new EventEmitter<void>();
  @Output() public reuseClick = new EventEmitter<void>();
  public readonly QuoteState = QuoteState;
  public readonly RouteSegment = RouteSegment;

  public onMessageIconClick(): void {
    this.messageClick.emit();
  }

  public onDownloadIconClick(): void {
    this.downloadClick.emit();
  }

  public onReuseQuoteDetailsClick(): void {
    this.reuseClick.emit();
  }

  public onCheckboxChange(): void {
    this.checkboxChange.emit();
  }
}
