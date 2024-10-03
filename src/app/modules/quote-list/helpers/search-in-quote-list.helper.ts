import { CbQuoteVM } from '@modules/quote-list/interfaces/cb-quote.vm';

export const searchInQuoteList = (items: CbQuoteVM[], keyword: string): CbQuoteVM[] =>
  items.reduce<CbQuoteVM[]>((result, item) => {
    if (matchKeyword(item, keyword)) {
      return result.concat(item);
    }

    return result;
  }, []);
const matchKeyword = (item: CbQuoteVM, keyword: string): boolean =>
  item.name.toLowerCase().includes(keyword.trim().toLowerCase()) || item.reference1?.toLowerCase().includes(keyword.trim().toLowerCase());
