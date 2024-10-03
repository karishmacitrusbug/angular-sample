import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { CurrencyCode } from '@global/enums/currency-code.enum';
import { LineItemsColumn } from '@global/enums/line-items-column.enum';
import { mapFromLongCurrencyCode } from '@global/helpers/map-country-validation-currency.helper';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { QuoteLineItemsComponent } from '@global/modules/common-quote/components/quote-line-items/quote-line-items.component';
import { LineItemsStatus } from '@global/modules/common-quote/enums/line-items-status.enum';
import { NewQuoteLineItemsPageVM } from '@modules/new-quote/pages/new-quote-line-items-page/new-quote-line-items-page.vm';
import { FormControl } from '@ngneat/reactive-forms';
import { Store } from '@ngrx/store';
import * as fromCountryValidation from '@shared/modules/country-validation/reducers';
import { ValuationMethod } from '@CitT/data';
import isNil from 'lodash/isNil';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as NewQuoteLineItemsActions from '../../actions/new-quote-line-items.actions';
import * as fromNewQuote from '../../reducers';
import { selectNewQuoteLineItemsPage } from './new-quote-line-items-page.selectors';

@Component({
  templateUrl: './new-quote-line-items-page.component.html',
  styleUrls: ['./new-quote-line-items-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewQuoteLineItemsPageComponent implements OnInit {
  @ViewChild(QuoteLineItemsComponent) public quoteLineItemsComponent: QuoteLineItemsComponent;

  public readonly LineItemsStatus = LineItemsStatus;
  public readonly ValuationMethod = ValuationMethod;
  public canProceed = false;
  public currencyControl = new FormControl<InputDataVM<CurrencyCode, CurrencyCode>>({
    value: CurrencyCode.USD,
    viewValue: CurrencyCode.USD,
  });
  public storeFeesControl = new FormControl<boolean>(false);
  public swapColumnTranslation: { [key in LineItemsColumn]?: string };

  public vm$: Observable<NewQuoteLineItemsPageVM>;

  constructor(private readonly store$: Store<fromNewQuote.AppState & fromCountryValidation.AppState>) {}

  public ngOnInit(): void {
    this.store$.dispatch(NewQuoteLineItemsActions.enter());

    this.vm$ = this.store$.select(selectNewQuoteLineItemsPage).pipe(
      tap((vm) => {
        const shippingCountryCurrency = mapFromLongCurrencyCode(
          vm.validationRules.find((rule) => rule.shipToCountry === vm.to)?.defaultCurrency
        );
        // eslint-disable-next-line unicorn/no-nested-ternary
        const currencyToUse = vm.currency ? vm.currency : shippingCountryCurrency ? shippingCountryCurrency : CurrencyCode.USD;
        this.currencyControl.patchValue({
          value: currencyToUse,
          viewValue: currencyToUse,
        });
        if (vm.valuationMethod !== ValuationMethod.COST_METHOD) {
          this.storeFeesControl.patchValue(isNil(vm.hasStoreFees) ? true : vm.hasStoreFees);
          this.swapColumnTranslation = { [LineItemsColumn.UnitPrice]: 'QUOTE.LINE_ITEMS.SELLING_PRICE' };
        }
      })
    );
  }

  public onValidityChange(isValid: boolean): void {
    const lineItems = this.quoteLineItemsComponent.getValue();
    this.canProceed = isValid && lineItems.length > 0;
  }

  public onClearTableClick(): void {
    this.quoteLineItemsComponent.clearTable();
  }

  public onSubmitClick(): void {
    const lineItems = this.quoteLineItemsComponent.getValue();
    this.store$.dispatch(
      NewQuoteLineItemsActions.submit({ lineItems, currency: this.currencyControl.value.value, hasStoreFees: this.storeFeesControl.value })
    );
  }
}
