import { Injectable } from '@angular/core';
import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { LineItemsState } from '@global/modules/common-quote/enums/line-items-state.enum';
import { CountryService } from '@modules/country/services/country.service';
import { LocalVatRegistrationService } from '@modules/local-vat-registration/services/local-vat-registration.service';
import { Store } from '@ngrx/store';
import isNil from 'lodash/isNil';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';
import * as fromNewQuote from '../../reducers';
import { NewQuotePageVM } from './new-quote-page.vm';

@Injectable()
export class NewQuotePageService {
  constructor(
    private readonly store$: Store<fromNewQuote.AppState>,
    private readonly localVatRegistrationService: LocalVatRegistrationService,
    private readonly countryService: CountryService
  ) {}

  public getVM$(): Observable<NewQuotePageVM> {
    return combineLatest([
      this.store$.select(fromNewQuote.selectNewQuoteBasicsState),
      this.store$.select(fromNewQuote.selectNewQuoteLineItemsState),
      this.store$.select(fromNewQuote.selectNewQuoteShipmentMethodState),
      this.store$.select(fromNewQuote.selectNewQuoteFinalCostsState),
      this.hasLocalVatRegistration$(),
      this.isVatRegistrationRequired$(),
    ]).pipe(
      map(
        ([
          { id, quoteReference, values },
          { state: lineItemsState, lineItems },
          { state: shipmentMethodState },
          { state: finalCostsState },
          hasLocalVatRegistration,
          isVatRegistrationRequired,
        ]) => ({
          id,
          quoteReference,
          to: values.data.to,
          showAcceptButton: [FinalCostsState.Ready, FinalCostsState.ReadyProForma].includes(finalCostsState),
          hasLocalVatRegistration,
          hasLineItems: lineItems.length > 0,
          lineItemsState,
          shipmentMethodState,
          finalCostsState,
          canSave: lineItemsState === LineItemsState.Completed,
          isVatRegistrationRequired,
          clientReferenceValues: values.data.clientReferenceValues,
        })
      )
    );
  }

  public hasLocalVatRegistration$(): Observable<boolean> {
    return this.store$.select(fromNewQuote.selectNewQuoteBasicsState).pipe(
      map(({ values }) => values.data.to),
      distinctUntilChanged(),
      switchMap((to) => {
        if (isNil(to)) {
          return of(false);
        }

        return this.localVatRegistrationService
          .getCachedVatRegistrationForCountry$(to)
          .pipe(map((localVatRegistration) => !isNil(localVatRegistration)));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  public isVatRegistrationRequired$(): Observable<boolean> {
    return this.store$.select(fromNewQuote.selectNewQuoteBasicsState).pipe(
      map(({ values }) => values.data.to),
      distinctUntilChanged(),
      switchMap((to) => this.countryService.isVatRegistrationRequiredForDestinationCountry$(to)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
