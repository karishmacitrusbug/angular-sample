import { Injectable } from '@angular/core';
import { Contact } from '@global/interfaces/contact.interface';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { SendbirdService } from '@global/modules/message-thread/services/sendbird-message.service';
import { AuthService } from '@global/services/auth.service';
import { CountryService } from '@modules/country/services/country.service';
import { LocalVatRegistrationService } from '@modules/local-vat-registration/services/local-vat-registration.service';
import { QuoteDetailsPageVM } from '@modules/quote-list/pages/quote-details-page/quote-details-page.vm';
import { Store } from '@ngrx/store';
import * as fromCountryValidation from '@shared/modules/country-validation/reducers';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';
import * as fromQuoteDetails from '../../reducers';

@Injectable()
export class QuoteDetailsPageService {
  constructor(
    private readonly store$: Store<fromQuoteDetails.AppState & fromCountryValidation.AppState>,
    private readonly localVatRegistrationService: LocalVatRegistrationService,
    private readonly authService: AuthService,
    private readonly countryService: CountryService,
    private readonly sendbirdService: SendbirdService
  ) {}

  public getVM$(): Observable<QuoteDetailsPageVM> {
    return combineLatest([
      this.store$.select(fromQuoteDetails.selectQuoteDetailsLoading),
      this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote),
      this.store$.select(fromQuoteDetails.selectQuoteDetailsContacts),
      this.store$.select(fromQuoteDetails.selectQuoteOwner),
      this.authService.getUser$(),
      combineLatest([this.getLocalVatRegistration$(), this.isVatRegistrationRequired$()]),
    ]).pipe(
      map(([isLoading, quote, contacts, owner, user, [localVatRegistration, isVatRegistrationRequired]]) => ({
        isLoading,
        quote,
        contacts: (contacts as Contact[]).map((contact) => ({ value: contact.id, viewValue: contact.name })),
        owner,
        user,
        localVatRegistration,
        isVatRegistrationRequired,
      })),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  public getLocalVatRegistration$(): Observable<LocalVatRegistrationVM | undefined> {
    const quote$ = this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote);
    const to$ = quote$.pipe(
      map((quote) => quote?.to),
      distinctUntilChanged()
    );

    return to$.pipe(
      switchMap((to) => {
        if (!to) {
          return of();
        }

        return this.localVatRegistrationService.getCachedVatRegistrationForCountry$(to);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  public isVatRegistrationRequired$(): Observable<boolean> {
    return this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote).pipe(
      map((quote) => quote?.to),
      distinctUntilChanged(),
      switchMap((to) => this.countryService.isVatRegistrationRequiredForDestinationCountry$(to)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
