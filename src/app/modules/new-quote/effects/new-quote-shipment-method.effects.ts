import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { FreightService } from '@global/services/freight.service';
import { mapShipmentMethods } from '@modules/quote/helpers/map-shipment-methods.helper';
import { mapThirdPartyCouriers } from '@modules/quote/helpers/map-third-party-couriers.helper';
import { mapCbCouriers } from '@modules/quote/helpers/map-cb-couriers.helper';
import { ShipmentMethod } from '@modules/quote/interfaces/shipment-method.interface';
import { ShipmentMethodService } from '@modules/quote/services/shipment-method.service';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import * as fromCountryValidation from '@shared/modules/country-validation/reducers';
import {
  CourierRateStatus,
  FreightStatus,
  FreightType,
  QuoteDataService,
  ShipmentOrderDataService,
  Success,
  CbQuoteDataService,
} from '@CitT/data';
import isNil from 'lodash/isNil';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import { catchError, filter, first, map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import * as NewQuoteFinalCostsActions from '../actions/new-quote-final-costs.actions';
import * as NewQuoteShipmentMethodActions from '../actions/new-quote-shipment-method.actions';
import * as NewQuoteActions from '../actions/new-quote.actions';
import { NewQuoteRouteSegment } from '../enums/new-quote-route-segment.enum';
import * as fromNewQuote from '../reducers';

@Injectable()
export class NewQuoteShipmentMethodEffects {
  public enter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteShipmentMethodActions.enter),
      switchMap(() => of(NewQuoteShipmentMethodActions.loadShipmentMethods(), NewQuoteShipmentMethodActions.loadThirdPartyCouriers()))
    );
  });

  public loadShipmentMethods$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteShipmentMethodActions.loadShipmentMethods),
      concatLatestFrom(() => [
        this.store$.select(fromNewQuote.selectNewQuoteBasicsShipmentOrderId),
        this.store$.select(fromNewQuote.selectNewQuoteBasicsValuesData),
        this.authService.getUser$(),
      ]),
      switchMap(([, id, { from, to }, user]) =>
        forkJoin([
          this.zeeQuoteDataService.getPreferredFreightMethodForCb({
            Accesstoken: user.accessToken,
            ShipFromcountry: from,
            ShipTocountry: to,
          }),
          this.shipmentOrderDataService.getShipmentOrder({
            Accesstoken: user.accessToken,
            AccountID: user.accountId,
            ContactID: user.contactId,
            SOID: id,
          }),
        ]).pipe(
          switchMap(([shipmentMethodsResponse, soResponse]) =>
            of(
              NewQuoteShipmentMethodActions.loadShipmentMethodsSuccess({
                shipmentMethods: mapShipmentMethods(shipmentMethodsResponse, soResponse),
                selectedShipmentMethodType: soResponse.Preferred_Freight_method__c ?? FreightType.AIR,
              }),
              NewQuoteShipmentMethodActions.startPollFreight()
            )
          ),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_SHIPMENT_METHODS');
            return of(NewQuoteShipmentMethodActions.loadShipmentMethodsError({ error: error.message }));
          })
        )
      )
    );
  });

  public pollFreight$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteShipmentMethodActions.startPollFreight, NewQuoteShipmentMethodActions.restartPollFreight),
      concatLatestFrom(() => [
        this.store$.select(fromNewQuote.selectNewQuoteBasicsState),
        this.store$.select(fromNewQuote.selectNewQuoteSelectedShipmentMethod),
      ]),
      // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
      filter(([, , selectedShipmentMethod]) => !isNil(selectedShipmentMethod)),
      switchMap(([, basics, selectedShipmentMethod]) => {
        const shipmentOrderId = basics.id;

        return this.freightService
          .getFreight$([{ shipmentOrderId, citShippingServiceFeeEnabled: selectedShipmentMethod.isHandledByCb, isShipment: false }])
          .pipe(
            takeUntil(this.actions$.pipe(ofType(NewQuoteActions.leave))),
            map((freights) => freights[shipmentOrderId]),
            withLatestFrom(this.store$.select(fromNewQuote.selectNewQuoteCbCouriersHasError))
          );
      }),
      switchMap(([freightCosts, zeeCouriersHasError]) => {
        const actionsToDispatch: Action[] = [NewQuoteShipmentMethodActions.updateFreight({ freight: freightCosts.freight })];
        if (freightCosts.freight.status !== FreightStatus.SEARCHING && !zeeCouriersHasError) {
          actionsToDispatch.push(NewQuoteShipmentMethodActions.loadCbCouriers());
        }
        return of(...actionsToDispatch);
      })
    );
  });

  public loadCbCouriers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteShipmentMethodActions.loadCbCouriers),
      concatLatestFrom(() => [
        this.authService.getUser$(),
        this.store$.select(fromNewQuote.selectNewQuoteBasicsState),
        this.store$.select(fromNewQuote.selectNewQuoteSelectedShipmentMethod),
      ]),
      switchMap(([, user, { id, freightId }]) =>
        this.quoteDataService
          .getCourierRates({
            Accesstoken: user.accessToken,
            SOID: id,
            FRID: freightId,
          })
          .pipe(
            map((couriers) =>
              NewQuoteShipmentMethodActions.loadCbCouriersSuccess({
                zeeCouriers: mapCbCouriers(couriers),
                selectedCbCourierId: couriers.find((courier) => courier.Status__c === CourierRateStatus.SELECTED).Id,
              })
            ),
            catchError((error: HttpErrorResponse) => {
              if (error.status !== HttpStatusCode.BadRequest && error.error?.Success?.Response !== 'Courier rates are not available') {
                this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_SHIPMENT_PROVIDERS');
              }
              return of(NewQuoteShipmentMethodActions.loadCbCouriersError({ error: error.message }));
            })
          )
      )
    );
  });

  public loadThirdPartyCouriers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteShipmentMethodActions.loadThirdPartyCouriers),
      concatLatestFrom(() => [this.authService.getUser$(), this.store$.select(fromNewQuote.selectNewQuoteBasicsState)]),
      switchMap(([, user, { cpaid }]) =>
        this.zeeQuoteDataService.getThirdPartyCouriers({ Accesstoken: user.accessToken, CPAID: cpaid }).pipe(
          map((response) =>
            NewQuoteShipmentMethodActions.loadThirdPartyCouriersSuccess({
              thirdPartyCouriers: mapThirdPartyCouriers(response.ServiceProviders),
            })
          ),
          catchError((error) => {
            if (
              error instanceof HttpErrorResponse &&
              error.status === HttpStatusCode.BadRequest &&
              error.error.Message.Response === 'Suggested Providers are not availble'
            ) {
              return of(
                NewQuoteShipmentMethodActions.loadThirdPartyCouriersSuccess({
                  thirdPartyCouriers: mapThirdPartyCouriers([]),
                })
              );
            }
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_SHIPMENT_PROVIDERS');
            return of(NewQuoteShipmentMethodActions.loadThirdPartyCouriersError({ error: error.message }));
          })
        )
      )
    );
  });

  public submit$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteShipmentMethodActions.submit),
      concatLatestFrom(() => [
        this.store$.select(fromNewQuote.selectNewQuoteSelectedShipmentMethod),
        this.store$.select(fromNewQuote.selectNewQuoteSelectedCbCourierId),
      ]),
      switchMap(([, selectedShipmentMethod, selectedCbCourierId]) =>
        this.changeShipmentMethod$(selectedShipmentMethod, selectedCbCourierId).pipe(
          switchMap(() => of(NewQuoteShipmentMethodActions.restartPollFreight(), NewQuoteShipmentMethodActions.submitSuccess())),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_SHIPMENT_METHOD');
            return EMPTY;
          })
        )
      )
    );
  });

  public changeShipmentProvider$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteShipmentMethodActions.changeShipmentProvider),
      switchMap(({ selectedShipmentMethodType, selectedCbCourierId }) =>
        this.store$.select(fromNewQuote.selectNewQuoteShipmentMethods).pipe(
          first(),
          switchMap((shipmentMethods) => {
            const selectedShipmentMethod = shipmentMethods.find((shipmentMethod) => shipmentMethod.type === selectedShipmentMethodType);
            if (isNil(selectedShipmentMethod)) {
              return EMPTY;
            }
            return this.changeShipmentMethod$(selectedShipmentMethod, selectedCbCourierId).pipe(
              withLatestFrom(this.store$.select(fromNewQuote.selectNewQuoteFinalCostsState)),
              switchMap(([, { state: finalCostsState }]) => {
                const actionsToDispatch: Action[] = [
                  NewQuoteShipmentMethodActions.changeShipmentProviderSuccess({ selectedShipmentMethodType, selectedCbCourierId }),
                  NewQuoteShipmentMethodActions.restartPollFreight(),
                ];
                if (finalCostsState !== FinalCostsState.NotCompleted) {
                  actionsToDispatch.push(NewQuoteFinalCostsActions.loadFinalCosts());
                }
                return of(...actionsToDispatch);
              }),
              catchError((error) => {
                this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_SHIPMENT_METHOD');
                return EMPTY;
              })
            );
          })
        )
      )
    );
  });

  public submitSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(NewQuoteShipmentMethodActions.submitSuccess),
        tap(() => this.router.navigate([RouteSegment.Root, RouteSegment.NewQuote, NewQuoteRouteSegment.FinalCosts]))
      );
    },
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<fromNewQuote.AppState & fromCountryValidation.AppState>,
    private readonly shipmentOrderDataService: ShipmentOrderDataService,
    private readonly zeeQuoteDataService: CbQuoteDataService,
    private readonly quoteDataService: QuoteDataService,
    private readonly authService: AuthService,
    private readonly freightService: FreightService,
    private readonly router: Router,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly shipmentMethodService: ShipmentMethodService
  ) {}

  private changeShipmentMethod$(selectedShipmentMethod: ShipmentMethod, selectedCbCourierId?: string): Observable<Success> {
    return this.store$.select(fromNewQuote.selectShipmentOrderId).pipe(
      first(),
      switchMap((shipmentOrderId) =>
        this.shipmentMethodService.saveShipmentMethod$(shipmentOrderId, selectedShipmentMethod, selectedCbCourierId)
      )
    );
  }
}
