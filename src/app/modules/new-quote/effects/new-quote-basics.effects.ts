import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { CountryHelper } from '@global/helpers/country.helper';
import { mapFromLongCurrencyCode } from '@global/helpers/map-country-validation-currency.helper';
import { NewQuoteDefaults } from '@global/interfaces/new-quote-defaults.interface';
import { User } from '@global/interfaces/user.interface';
import { mapUserDefaults } from '@global/modules/common-quote/helpers/map-user-defaults.helper';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { UserDefaultsService } from '@global/services/user-defaults.service';
import { mapShipmentOrderLineItems } from '@modules/quote-list/helpers/map-shipment-order-line-items.helper';
import { QuoteBasicsDialogService } from '@modules/quote/components/quote-basics-dialog/quote-basics-dialog.service';
import { QuoteBasicsForm } from '@modules/quote/interfaces/quote-basics-form.interface';
import { QuoteService } from '@modules/quote/services/quote.service';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import * as CountryValidationActions from '@shared/modules/country-validation/actions/country-validation.actions';
import * as fromCountryValidation from '@shared/modules/country-validation/reducers';
import { QuoteListService } from '@shared/services/quote-list.service';
import { ShipmentOrderDataService, CbQuoteDataService } from '@CitT/data';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import * as CountryApiActions from '../../country/actions/country-api.actions';
import * as fromCountry from '../../country/reducers';
import * as NewQuoteBasicsActions from '../actions/new-quote-basics.actions';
import * as NewQuoteActions from '../actions/new-quote.actions';
import * as ProfileApiActions from '../actions/profile-api.actions';
import { NewQuoteRouteSegment } from '../enums/new-quote-route-segment.enum';
import { mapQuoteBasicsFormCreatePayload } from '../helpers/map-quote-basics-form-create-payload.helper';
import { mapQuoteBasicsFromShipmentOrderData } from '../helpers/map-quote-basics-from-shipment-order-data.helper';
import * as fromNewQuote from '../reducers';

interface CreateQuoteResult {
  id: string;
  freightId?: string;
  cpaid: string;
  values: QuoteBasicsForm;
  quoteReference: string;
}

@Injectable()
export class NewQuoteBasicsEffects {
  public enter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteBasicsActions.enter),
      switchMap(({ quoteIdToReuse }) => {
        const actionsToDispatch: Action[] = [
          CountryApiActions.loadAll(),
          CountryApiActions.loadDestination(),
          CountryValidationActions.load(),
        ];
        const quoteDataLoadAction = this.getQuoteDataLoadAction(quoteIdToReuse);
        return of(...actionsToDispatch.concat(quoteDataLoadAction));
      })
    );
  });

  public loadDefaultNewQuoteBasicValues$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProfileApiActions.loadNewQuoteDefaults),
      switchMap(() =>
        this.userDefaultsService.getUserDefaults$().pipe(
          map((defaultValues) => ProfileApiActions.loadNewQuoteDefaultsSuccess({ defaults: mapUserDefaults(defaultValues) })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_QUOTE_DEFAULTS');
            return of(ProfileApiActions.loadNewQuoteDefaultsError({ error: error.message }));
          })
        )
      )
    );
  });

  public loadExistingQuoteToReuse$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteActions.loadExistingQuote),
      concatLatestFrom(() => this.authService.getUser$()),
      switchMap(([{ quoteId }, user]) =>
        forkJoin([
          this.shipmentOrderDataService.getShipmentOrder({
            Accesstoken: user.accessToken,
            AccountID: user.accountId,
            ContactID: user.contactId,
            SOID: quoteId,
          }),
          this.shipmentOrderDataService.getShipmentOrderRelations({
            Accesstoken: user.accessToken,
            AccountID: user.accountId,
            SOID: quoteId,
          }),
          this.userDefaultsService.getUserDefaults$(),
        ]).pipe(
          map(([shipmentOrder, shipmentOrderRelations, defaults]) => {
            const lineItems = mapShipmentOrderLineItems(shipmentOrderRelations);
            return NewQuoteActions.loadExistingQuoteSuccess({
              basics: mapQuoteBasicsFromShipmentOrderData(shipmentOrder, shipmentOrderRelations),
              lineItems,
              defaults: mapUserDefaults(defaults),
              hasStoreFees: shipmentOrderRelations.Parts[0].StoreFeesAvailable,
              lineItemsCurrency: mapFromLongCurrencyCode(shipmentOrderRelations.Parts[0].ClientCurrencyInput),
            });
          }),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_QUOTE_DETAILS');
            return of(NewQuoteActions.loadExistingQuoteError({ error: error.message }));
          })
        )
      )
    );
  });

  public submit$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteBasicsActions.submit),
      concatLatestFrom(() => [this.authService.getUser$(), this.store$.select(fromNewQuote.selectNewQuoteDefaults)]),
      switchMap(([{ values }, user, defaults]) => this.createNewQuote$(values, user, defaults)),
      tap(() => this.quoteListService.resetCache()),
      map((response) => NewQuoteBasicsActions.submitSuccess(response)),
      catchError((error) => {
        this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_QUOTE_BASICS');
        return of(NewQuoteBasicsActions.submitError({ error: error.message }));
      })
    );
  });

  public submitSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(NewQuoteBasicsActions.submitSuccess),
        tap(() => this.router.navigate([RouteSegment.NewQuote, NewQuoteRouteSegment.LineItems]))
      );
    },
    { dispatch: false }
  );

  public edit$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteBasicsActions.edit),
      concatLatestFrom(() => [
        this.store$.select(fromNewQuote.selectNewQuoteBasicsState),
        this.store$.select(fromCountry.selectAllCountriesData),
        this.store$.select(fromCountry.selectDestinationCountriesData),
        this.store$.select(fromCountryValidation.selectCountryValidationRulesData),
        this.store$.select(fromNewQuote.selectNewQuoteLineItemsState),
      ]),
      switchMap(
        ([, { id, freightId, values: initialValues, clientContact }, allCountries, destinationCountries, validationRules, lineItems]) =>
          this.quoteBasicsDialogService
            .open({
              initialValues: initialValues.data,
              allCountries: CountryHelper.mapToInputDataVM(allCountries),
              destinationCountries: CountryHelper.mapToInputDataVM(destinationCountries),
              validationRules,
              lineItems: lineItems?.lineItems || [],
            })
            .afterClosed$()
            .pipe(
              withLatestFrom(this.authService.getUser$()),
              switchMap(([values, user]) => {
                if (values === undefined) {
                  return EMPTY;
                }

                this.loadingIndicatorService.open();
                return this.quoteService
                  .editQuote$(
                    {
                      quoteId: id,
                      freightId,
                      packages: initialValues.data.packages,
                      weightUnit: initialValues.data.estimatedWeightUnit,
                      lengthUnit: initialValues.data.lengthUnit,
                      clientContact,
                    },
                    values,
                    user
                  )
                  .pipe(
                    switchMap(() =>
                      forkJoin([
                        this.shipmentOrderDataService.getShipmentOrder({
                          Accesstoken: user.accessToken,
                          AccountID: user.accountId,
                          ContactID: user.contactId,
                          SOID: id,
                        }),
                        this.shipmentOrderDataService.getShipmentOrderRelations({
                          Accesstoken: user.accessToken,
                          AccountID: user.accountId,
                          SOID: id,
                        }),
                      ])
                    ),
                    finalize(() => this.loadingIndicatorService.dispose()),
                    map(([shipmentOrder, shipmentOrderRelations]) =>
                      NewQuoteBasicsActions.editSuccess({
                        values: mapQuoteBasicsFromShipmentOrderData(shipmentOrder, shipmentOrderRelations),
                      })
                    ),
                    catchError((error) => {
                      this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_QUOTE_BASICS');
                      return of(NewQuoteBasicsActions.submitError({ error: error.message }));
                    })
                  );
              })
            )
      )
    );
  });

  public loadUpdate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteBasicsActions.loadUpdate),
      concatLatestFrom(() => [this.store$.select(fromNewQuote.selectNewQuoteBasicsState), this.authService.getUser$()]),
      switchMap(([, basics, user]) =>
        forkJoin([
          this.shipmentOrderDataService.getShipmentOrder({
            Accesstoken: user.accessToken,
            AccountID: user.accountId,
            ContactID: user.contactId,
            SOID: basics.id,
          }),
          this.shipmentOrderDataService.getShipmentOrderRelations({
            Accesstoken: user.accessToken,
            AccountID: user.accountId,
            SOID: basics.id,
          }),
        ]).pipe(
          map(([shipmentOrder, shipmentOrderRelations]) =>
            NewQuoteBasicsActions.update({
              values: mapQuoteBasicsFromShipmentOrderData(shipmentOrder, shipmentOrderRelations),
            })
          ),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_REFRESH_QUOTE_DATA');
            return EMPTY;
          })
        )
      )
    );
  });

  public startNew$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(NewQuoteActions.startNew),
        tap(() => this.router.navigate([RouteSegment.Root, RouteSegment.NewQuote]))
      );
    },
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<fromNewQuote.AppState & fromCountry.AppState & fromCountryValidation.AppState>,
    private readonly router: Router,
    private readonly quoteBasicsDialogService: QuoteBasicsDialogService,
    private readonly quoteService: QuoteService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly userDefaultsService: UserDefaultsService,
    private readonly zeeQuoteDataService: CbQuoteDataService,
    private readonly shipmentOrderDataService: ShipmentOrderDataService,
    private readonly authService: AuthService,
    private readonly loadingIndicatorService: LoadingIndicatorService,
    private readonly quoteListService: QuoteListService
  ) {}

  private getQuoteDataLoadAction(quoteIdToReuse?: string | null): Action {
    if (!isEmpty(quoteIdToReuse)) {
      return NewQuoteActions.loadExistingQuote({ quoteId: quoteIdToReuse });
    }
    return ProfileApiActions.loadNewQuoteDefaults();
  }

  private createNewQuote$(values: QuoteBasicsForm, user: User, defaults: NewQuoteDefaults): Observable<CreateQuoteResult> {
    const quote = mapQuoteBasicsFormCreatePayload(values, defaults);
    return this.zeeQuoteDataService
      .createCbQuote({
        AccessToken: user.accessToken,
        AccountID: user.accountId,
        ContactID: user.contactId,
        UserID: user.id,
        Quotes: [quote],
      })
      .pipe(
        switchMap((response) =>
          forkJoin([
            this.shipmentOrderDataService.getShipmentOrder({
              Accesstoken: user.accessToken,
              AccountID: user.accountId,
              ContactID: user.contactId,
              SOID: response.Success.ShipmentOrderID,
            }),
            this.shipmentOrderDataService.getShipmentOrderRelations({
              Accesstoken: user.accessToken,
              AccountID: user.accountId,
              SOID: response.Success.ShipmentOrderID,
            }),
          ]).pipe(
            map(([shipmentOrder, shipmentOrderRelations]) => ({
              id: response.Success.ShipmentOrderID,
              freightId: get(shipmentOrderRelations.FreightDetails, [0, 'Id']),
              cpaid: shipmentOrder.CPA_v2_0__r.Id,
              quoteReference: shipmentOrder.NCP_Quote_Reference__c,
              values: mapQuoteBasicsFromShipmentOrderData(shipmentOrder, shipmentOrderRelations),
            }))
          )
        )
      );
  }
}
