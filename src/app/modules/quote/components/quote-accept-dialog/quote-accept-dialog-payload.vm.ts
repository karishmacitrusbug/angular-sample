import { QuoteAcceptDialogQuoteDataVM as QuoteDataVM } from '@global/modules/common-quote/interfaces/quote-data.vm';

export interface QuoteAcceptDialogPayload {
  quotes: QuoteDataVM[];
  buttonText: string;
}
