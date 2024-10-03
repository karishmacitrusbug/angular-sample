import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { QuoteState } from '@global/enums/quote-list/quote-state.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { SortingDirection } from '@global/enums/sorting-direction.enum';
import { QuoteListSortableColumns } from '@modules/quote-list/enums/quote-list-sortable-columns.enum';
import { QuoteListTabIndex } from '@modules/quote-list/enums/quote-list-tab.enum';
import { QuoteTableSorting } from '@modules/quote-list/interfaces/quote-table-sorting.interface';
import { CbQuoteVM } from '@modules/quote-list/interfaces/cb-quote.vm';

let PAGINATION_ID = 0;

@Component({
  selector: 'app-quote-list-table',
  templateUrl: './quote-list-table.component.html',
  styleUrls: ['./quote-list-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteListTableComponent implements OnChanges {
  @Input() public quotes: CbQuoteVM[] = [];
  @Input() public state: QuoteState;
  @Input() public quoteTab: QuoteListTabIndex;
  @Input() public isSearching = false;
  @Input() public isAcceptQuotesDisabled = false;
  @Input() public columnSorted?: QuoteTableSorting;
  @Output() public acceptQuotes = new EventEmitter<string[]>();
  @Output() public downloadClick = new EventEmitter<string>();
  @Output() public messageClick = new EventEmitter<CbQuoteVM>();
  @Output() public reuseClick = new EventEmitter<CbQuoteVM>();
  @Output() public openAccountActivationModal = new EventEmitter<void>();
  @Output() public addLocalVatRegistrationClick = new EventEmitter<string>();
  @Output() public sortDirectionChange: EventEmitter<{
    col: QuoteListSortableColumns;
    direction: SortingDirection;
    state: QuoteState;
  }> = new EventEmitter();

  public currentPage = 1;
  public sortState: { [key in QuoteListSortableColumns]?: SortingDirection } = {};

  public readonly QuoteState = QuoteState;
  public readonly RouteSegment = RouteSegment;
  public readonly QuoteListTabIndex = QuoteListTabIndex;
  public readonly paginationId = `quoteListTablePagination-${PAGINATION_ID++}`;
  public readonly itemsPerPage = 15;

  public readonly quoteIdsSelection: Map<string, boolean> = new Map();

  public readonly quoteListSortableColumns = QuoteListSortableColumns;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.quotes) {
      this.quoteIdsSelection.clear();
      this.currentPage = 1;
    }
  }

  public get selectedQuoteIds(): string[] {
    return [...this.quoteIdsSelection.entries()].filter(([, value]) => value).map(([key]) => key);
  }

  public isSelectedQuote(quote: CbQuoteVM): boolean {
    return this.quoteIdsSelection.get(quote.id) || false;
  }

  public toggleQuoteSelection(quote: CbQuoteVM): void {
    this.quoteIdsSelection.set(quote.id, !this.isSelectedQuote(quote));
  }

  public onAcceptClick(): void {
    this.acceptQuotes.emit(this.selectedQuoteIds);
  }

  public onDownloadClick(quote: CbQuoteVM): void {
    this.downloadClick.emit(quote.id);
  }

  public onMessageClick(quote: CbQuoteVM): void {
    this.messageClick.emit(quote);
  }

  public onReuseQuoteClick(quote: CbQuoteVM): void {
    this.reuseClick.emit(quote);
  }

  public onPageChange(page: number): void {
    this.currentPage = page;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  public onOpenAccountActivationModal(): void {
    this.openAccountActivationModal.emit();
  }

  public onAddLocalVatRegistrationClick(destinationCountry: string): void {
    this.addLocalVatRegistrationClick.emit(destinationCountry);
  }

  public onSortDirectionChange(direction: SortingDirection, state: QuoteState, col: QuoteListSortableColumns): void {
    this.sortState = { [col]: direction };
    this.sortDirectionChange.emit({ direction, state, col });
  }
}
