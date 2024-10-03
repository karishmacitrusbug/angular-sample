import { Injectable } from '@angular/core';
import { mapCountryValidationRule } from '@global/modules/common-country-validation/helpers/map-country-validation-rule.helper';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { MiscDataService } from '@CitT/data';
import { EMPTY, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as CountryValidationApiActions from '../actions/country-validation-api.actions';
import * as CountryValidationActions from '../actions/country-validation.actions';
import * as fromCountryValidation from '../reducers';

/**
 * NgRx Effects class responsible for handling country validation-related actions.
 *
 * This class listens for specific actions related to loading country validation rules
 * and interacts with the MiscDataService to fetch data from an API. It also manages
 * error notifications using the ErrorNotificationService.
 */
@Injectable()
export class CountryValidationEffects {
  // Effect to load country validation rules if they are not already loaded or being loaded.
  public load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CountryValidationActions.load), // Listen for the load action.
      concatLatestFrom(() => [
        this.store$.select(
          fromCountryValidation.selectCountryValidationRulesData
        ), // Get current validation rules.
        this.store$.select(
          fromCountryValidation.selectCountryValidationRulesLoading
        ), // Check if loading is in progress.
      ]),
      switchMap(([, rules, loading]) => {
        // If rules are already loaded or still loading, do nothing.
        if (rules.length > 0 || loading) {
          return EMPTY;
        }

        // Dispatch the load action to fetch rules from the API.
        return of(CountryValidationApiActions.load());
      })
    );
  });

  // Effect to load country validation rules from the API.
  public loadApi$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CountryValidationApiActions.load), // Listen for the load action from the API.
      switchMap(() =>
        this.miscDataService.getValidations().pipe(
          map((response) => {
            // Map the response to the required format.
            const rules =
              response?.CountyValidations?.map(mapCountryValidationRule) || [];

            // Dispatch success action with the loaded rules.
            return CountryValidationApiActions.loadSuccess({ rules });
          }),
          catchError((error) => {
            // Notify about the error and dispatch error action.
            this.errorNotificationService.notifyAboutError(
              error,
              'ERROR.FAILED_TO_LOAD_VALIDATION_ERRORS'
            );
            return of(
              CountryValidationApiActions.loadError({ error: error.message })
            );
          })
        )
      )
    );
  });

  constructor(
    private readonly actions$: Actions, // Stream of dispatched actions.
    private readonly store$: Store<fromCountryValidation.AppState>, // Store for accessing state.
    private readonly miscDataService: MiscDataService, // Service for fetching validation data.
    private readonly errorNotificationService: ErrorNotificationService // Service for error notifications.
  ) {}
}
