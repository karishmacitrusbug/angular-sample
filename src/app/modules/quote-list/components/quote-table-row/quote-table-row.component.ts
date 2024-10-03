import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { QuoteState } from '@global/enums/quote-list/quote-state.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { CbQuoteVM } from '@modules/quote-list/interfaces/cb-quote.vm';

@Component({
  selector: 'app-quote-table-row',
  templateUrl: './quote-table-row.component.html',
  styleUrls: ['./quote-table-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteTableRowComponent {
  @Input() public quote: CbQuoteVM;
  @Input() public quoteIdsSelection: ReadonlyMap<string, boolean>;
  @Input() public tableState: QuoteState;
  @Input() public isQuoteSelectionDisabled = false;
  @Output() public selectQuoteToggle = new EventEmitter<CbQuoteVM>();
  @Output() public downloadClick = new EventEmitter<CbQuoteVM>();
  @Output() public messageClick = new EventEmitter<CbQuoteVM>();
  @Output() public reuseClick = new EventEmitter<CbQuoteVM>();
  @Output() public addLocalVatRegistrationClick = new EventEmitter<string>();
  public isOpen = false;

  public readonly QuoteState = QuoteState;

  public get quoteRouterLink(): (RouteSegment | string)[] {
    return [RouteSegment.Root, RouteSegment.QuoteList, this.quote.id];
  }

  public get disableSelection(): boolean {
    return this.isQuoteSelectionDisabled || (this.quote.isLocalVatRequired && !this.quote.localVatRegistration);
  }

  public isSelectedQuote(quote: CbQuoteVM): boolean {
    return this.quoteIdsSelection.get(quote.id) || false;
  }

  public onArrowClick(): void {
    this.isOpen = !this.isOpen;
  }

  public onMainQuoteCheckboxChange(): void {
    this.selectQuoteToggle.emit(this.quote);
  }

  public onCheckboxChange(quote: CbQuoteVM): void {
    this.selectQuoteToggle.emit(quote);
  }

  public onDownloadClick(quote: CbQuoteVM): void {
    this.downloadClick.emit(quote);
  }

  public onMessageClick(quote: CbQuoteVM): void {
    this.messageClick.emit(quote);
  }

  public onReuseClick(quote: CbQuoteVM): void {
    this.reuseClick.emit(quote);
  }

  public onAddLocalVatRegistrationClick(destinationCountry: string): void {
    this.addLocalVatRegistrationClick.emit(destinationCountry);
  }
}
