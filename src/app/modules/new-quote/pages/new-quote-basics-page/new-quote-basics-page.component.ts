import { ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewQuoteQueryParam } from '@global/enums/new-quote/new-quote-query-param.enum';
import { scrollToError } from '@global/helpers/scroll-to-error.helper';
import * as fromNewQuote from '@modules/new-quote/reducers';
import { Store } from '@ngrx/store';
import * as fromCountryValidation from '@shared/modules/country-validation/reducers';
import isNil from 'lodash/isNil';
import { Observable, Subject } from 'rxjs';
import * as fromCountry from '../../../country/reducers/index';
import { QuoteBasicsComponent } from '../../../quote/components/quote-basics/quote-basics.component';
import * as NewQuoteBasicsActions from '../../actions/new-quote-basics.actions';
import { selectNewQuoteBasicsPage, selectNewQuoteLoadingState } from './new-quote-basics-page.selectors';
import { NewQuoteBasicsPageVM } from './new-quote-basics-page.vm';

@Component({
  templateUrl: './new-quote-basics-page.component.html',
  styleUrls: ['./new-quote-basics-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewQuoteBasicsPageComponent implements OnInit, OnDestroy {
  private _quoteBasicsComponent: QuoteBasicsComponent;
  @ViewChild(QuoteBasicsComponent) public set quoteBasicsComponent(quoteBasicsComponent: QuoteBasicsComponent) {
    this._quoteBasicsComponent = quoteBasicsComponent;
    if (!isNil(quoteBasicsComponent) && this.isReusing) {
      quoteBasicsComponent.formGroup.markAllAsTouched();
    }
  }
  public get quoteBasicsComponent(): QuoteBasicsComponent {
    return this._quoteBasicsComponent;
  }

  public isValid = false;
  public readonly vm$: Observable<NewQuoteBasicsPageVM>;
  public readonly isLoading$ = this.store$.select(selectNewQuoteLoadingState);

  private isReusing = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly store$: Store<fromNewQuote.AppState & fromCountry.AppState & fromCountryValidation.AppState>,
    private readonly route: ActivatedRoute,
    private readonly zone: NgZone
  ) {
    this.vm$ = this.store$.select(selectNewQuoteBasicsPage);
  }

  public ngOnInit(): void {
    const quoteIdToReuse = this.route.snapshot.queryParamMap.get(NewQuoteQueryParam.QuoteIdToReuse);
    this.store$.dispatch(
      NewQuoteBasicsActions.enter({
        quoteIdToReuse,
      })
    );

    this.isReusing = !isNil(quoteIdToReuse);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onValidityChange(isValid: boolean): void {
    this.isValid = isValid;
  }

  public onSubmit(): void {
    this.quoteBasicsComponent.formGroup.markAllAsTouched();
    if (!this.isValid) {
      this.zone.runOutsideAngular(() => {
        Promise.resolve().then(() => scrollToError());
      });
      return;
    }
    const values = this.quoteBasicsComponent.getValue();

    this.store$.dispatch(NewQuoteBasicsActions.submit({ values }));
  }
}
