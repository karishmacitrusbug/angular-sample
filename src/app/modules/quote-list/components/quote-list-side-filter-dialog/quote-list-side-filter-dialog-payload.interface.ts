import { InputDataVM } from '@global/interfaces/input-data.vm';
import { QuoteListSideFilterDialogVM } from '@modules/quote-list/components/quote-list-side-filter-dialog/quote-list-side-filter-dialog.vm';

export interface QuoteListSideFilterDialogPayload {
  countries: InputDataVM<string, string>[];
  filters?: QuoteListSideFilterDialogVM;
}
