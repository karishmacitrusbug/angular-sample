import { Injectable } from '@angular/core';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { CountriesDataService } from '@CitT/data';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import * as CountryApiActions from '../actions/country-api.actions';
import * as CountryActions from '../actions/country.actions';
import * as fromCountry from '../reducers';

@Injectable()
export class CountryEffects {
  public getAll$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CountryActions.getAll),
      concatLatestFrom(() => this.store$.select(fromCountry.selectAllCountriesData)),
      filter(([, allCountries]) => allCountries.length === 0),
      map(() => CountryApiActions.loadAll())
    );
  });

  public loadAll$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CountryApiActions.loadAll),
      switchMap(() =>
        this.countriesDataService.getAllCountries().pipe(
          map((data) => CountryApiActions.loadAllSuccess({ data })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_ALL_COUNTRIES');
            return of(CountryApiActions.loadAllError({ error: error.message }));
          })
        )
      )
    );
  });

  public getDestination$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CountryActions.getDestination),
      concatLatestFrom(() => this.store$.select(fromCountry.selectDestinationCountriesData)),
      filter(([, allCountries]) => allCountries.length === 0),
      map(() => CountryApiActions.loadDestination())
    );
  });

  public loadDestination$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CountryApiActions.loadDestination),
      switchMap(() =>
        this.countriesDataService.getCbDestinationsList().pipe(
          map((data) => CountryApiActions.loadDestinationSuccess({ data })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_DESTINATION_COUNTRIES');
            return of(CountryApiActions.loadDestinationError({ error: error.message }));
          })
        )
      )
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<fromCountry.AppState>,
    private readonly countriesDataService: CountriesDataService,
    private readonly errorNotificationService: ErrorNotificationService
  ) {}
}
