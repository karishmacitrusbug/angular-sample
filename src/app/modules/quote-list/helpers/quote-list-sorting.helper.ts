import { SortingDirection } from '@global/enums/sorting-direction.enum';
import { sortByDate } from '@global/helpers/sort-by-date.helper';
import { QuoteTableSorting } from '@modules/quote-list/interfaces/quote-table-sorting.interface';
import { QuoteListSortableColumns } from '../enums/quote-list-sortable-columns.enum';
import { CbQuoteVM } from '../interfaces/cb-quote.vm';

export const handleQuoteSorting = (quotes: CbQuoteVM[], quoteTableSorting?: QuoteTableSorting): CbQuoteVM[] => {
  const { col, direction } = quoteTableSorting || {};
  if (col && direction !== undefined) {
    switch (col) {
      case QuoteListSortableColumns.ExpiryDate:
        return quotes.sort((a, b) => sortByDate(b.expiryDate, a.expiryDate, direction === SortingDirection.Ascending));
      case QuoteListSortableColumns.FixTotalCost:
        return quotes.sort((a, b) => sortByCost(a, b, direction));
    }
  } else {
    return quotes.sort((a, b) => sortByDate(b.createdDate, a.createdDate));
  }
};

const sortByCost = (quoteA: CbQuoteVM, quoteB: CbQuoteVM, direction: SortingDirection) => {
  const quoteACost = quoteA.fixTotalCost;
  const quoteBCost = quoteB.fixTotalCost;

  return direction === SortingDirection.Descending ? quoteBCost - quoteACost : quoteACost - quoteBCost;
};
