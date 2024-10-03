import { SortingDirection } from '@global/enums/sorting-direction.enum';
import { QuoteListSortableColumns } from '@modules/quote-list/enums/quote-list-sortable-columns.enum';

export interface QuoteTableSorting {
  direction?: SortingDirection;
  col: QuoteListSortableColumns;
}
