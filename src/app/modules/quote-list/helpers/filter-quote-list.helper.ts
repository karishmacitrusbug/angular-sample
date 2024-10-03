import { QuoteListSideFilterDialogVM } from '@modules/quote-list/components/quote-list-side-filter-dialog/quote-list-side-filter-dialog.vm';
import { CbQuoteVM } from '@modules/quote-list/interfaces/cb-quote.vm';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';

export const filterQuoteList = (quotes: CbQuoteVM[], filters: QuoteListSideFilterDialogVM): CbQuoteVM[] => {
  if (isEmpty(filters)) {
    return quotes;
  }
  return quotes.filter((quote) =>
    [checkCreatedDateMatch, checkReference1Match, checkCountryMatch].every((matchFunction) => matchFunction(filters, quote))
  );
};

export const checkOwnerMatch = (quote: CbQuoteVM, ownerId: string): boolean => !isNil(quote.owner) && quote.owner.id === ownerId;

const checkCreatedDateMatch = (filters: QuoteListSideFilterDialogVM, quote: CbQuoteVM): boolean => {
  if (isEmpty(filters.createdDateRange)) {
    return true;
  }
  const isAfterStartDate =
    isEmpty(filters.createdDateRange.start) || new Date(quote.createdDate).valueOf() >= new Date(filters.createdDateRange.start).valueOf();
  const isBeforeEndDate =
    isEmpty(filters.createdDateRange.end) || new Date(quote.createdDate).valueOf() <= new Date(filters.createdDateRange.end).valueOf();
  return isAfterStartDate && isBeforeEndDate;
};

const checkCountryMatch = (filters: QuoteListSideFilterDialogVM, quote: CbQuoteVM): boolean =>
  isEmpty(filters.shipToCountry) || filters.shipToCountry.includes(quote.destinationCountry);

const checkReference1Match = (filters: QuoteListSideFilterDialogVM, quote: CbQuoteVM): boolean =>
  isEmpty(filters.clientReference1) ||
  (!isEmpty(quote.reference1) && quote.reference1.toLowerCase().includes(filters.clientReference1.trim().toLowerCase()));
