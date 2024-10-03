import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import * as CountryActions from '@modules/country/actions/country.actions';
import * as fromCountry from '@modules/country/reducers';
import { LocalVatRegistrationService } from '@modules/local-vat-registration/services/local-vat-registration.service';
import * as fromLocalVatRegistrations from '@modules/profile/reducers';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { mapVatRegistration } from '@shared/helpers/map-vat-registration.helper';
import { VatRegistrationDataService } from '@CitT/data';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as LocalVatRegistrationsActions from '../actions/local-vat-registrations.actions';

@Injectable()
export class LocalVatRegistrationsEffects {
  public enter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LocalVatRegistrationsActions.enter),
      switchMap(() => of(LocalVatRegistrationsActions.load(), CountryActions.getDestination(), CountryActions.getAll()))
    );
  });

  public load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LocalVatRegistrationsActions.load),
      switchMap(() => this.authService.getUser$()),
      switchMap((user) =>
        this.vatRegistrationDataService.getRegistration({ Accesstoken: user.accessToken, AccountID: user.accountId }).pipe(
          map((response) => response.map((element) => mapVatRegistration(element))),
          map((data) => LocalVatRegistrationsActions.loadSuccess({ data })),
          catchError((error: HttpErrorResponse) => {
            if (error.status !== HttpStatusCode.BadRequest) {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_LOCAL_VAT_REGISTRATION_LIST');
              return of(LocalVatRegistrationsActions.loadError({ error: error.message }));
            }
            return of(LocalVatRegistrationsActions.loadSuccess({ data: [] }));
          })
        )
      )
    );
  });

  public create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LocalVatRegistrationsActions.create),
      concatLatestFrom(() => [
        this.store$.select(fromCountry.selectAllCountriesInputData),
        this.store$.select(fromCountry.selectDestinationCountriesInputData),
        this.store$.select(fromLocalVatRegistrations.selectRegisteredCountries),
      ]),
      switchMap(([, allCountries, destinationCountries, alreadyRegisteredCountries]) =>
        this.localVatRegistrationService
          .createThroughDialog$(undefined, allCountries, destinationCountries, alreadyRegisteredCountries)
          .pipe(switchMap(() => of(LocalVatRegistrationsActions.load())))
      )
    );
  });

  public edit$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LocalVatRegistrationsActions.edit),
      concatLatestFrom(() => [
        this.store$.select(fromCountry.selectAllCountriesInputData),
        this.store$.select(fromCountry.selectDestinationCountriesInputData),
        this.store$.select(fromLocalVatRegistrations.selectRegisteredCountries),
      ]),
      switchMap(([{ vatRegistrationData }, allCountries, destinationCountries, alreadyRegisteredCountries]) =>
        this.localVatRegistrationService
          .editThroughDialog$(
            vatRegistrationData.toCountry,
            allCountries,
            destinationCountries,
            vatRegistrationData,
            false,
            alreadyRegisteredCountries.filter((country) => country !== vatRegistrationData.toCountry)
          )
          .pipe(switchMap(() => of(LocalVatRegistrationsActions.load())))
      )
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService,
    private readonly vatRegistrationDataService: VatRegistrationDataService,
    private readonly localVatRegistrationService: LocalVatRegistrationService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly store$: Store
  ) {}
}
