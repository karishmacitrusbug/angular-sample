import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { mapCreatePackagesPayload } from '@global/helpers/map-create-packages-payload.helper';
import { mapCreatePackagesResponse } from '@global/helpers/map-create-packages-response.helper';
import { mapServiceType } from '@global/helpers/map-service-type.helper';
import { CancelQuoteDialogService } from '@global/modules/cancel-quote-dialog/cancel-quote-dialog.service';
import { ChargeableWeightDialogService } from '@global/modules/chargeable-weight-dialog/services/chargeable-weight-dialog.service';
import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { mapQuoteAcceptDialogData } from '@global/modules/common-quote/helpers/map-quote-accept-dialog-data.helper';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { ToastMessageType } from '@global/modules/toast-message/toast-message-type.enum';
import { ToastMessageService } from '@global/modules/toast-message/toast-message.service';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { QuoteAcceptDialogService } from '@modules/quote/components/quote-accept-dialog/quote-accept-dialog.service';
import { ShipmentMethodDialogService } from '@modules/quote/components/shipment-method-dialog/shipment-method-dialog.service';
import { mapQuoteTimeline } from '@modules/quote/helpers/map-quote-timeline.helper';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { mapCosts } from '@shared/helpers/map-costs.helper';
import { CostEstimateService } from '@shared/services/cost-estimate.service';
import { QuoteDataService, ShipmentOrderDataService, ShipmentOrderPackageDataService, YesNo } from '@CitT/data';
import isBoolean from 'lodash/isBoolean';
import isNil from 'lodash/isNil';
import { EMPTY, forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import * as NewQuoteBasicsActions from '../actions/new-quote-basics.actions';
import * as NewQuoteFinalCostsActions from '../actions/new-quote-final-costs.actions';
import * as NewQuoteShipmentMethodActions from '../actions/new-quote-shipment-method.actions';
import { mapQuoteBasicsFromShipmentOrderData } from '../helpers/map-quote-basics-from-shipment-order-data.helper';
import { mapFinalCostsState } from '../helpers/map-quote-final-costs-state.helper';
import * as fromNewQuote from '../reducers';

@Injectable()
export class NewQuoteFinalCostsEffects {
  public enter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteFinalCostsActions.enter),
      switchMap(() => of(NewQuoteFinalCostsActions.loadFinalCosts()))
    );
  });

  public loadFinalCosts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteFinalCostsActions.loadFinalCosts),
      concatLatestFrom(() => [this.store$.select(fromNewQuote.selectNewQuoteBasicsState), this.authService.getUser$()]),
      switchMap(([, basics, user]) => {
        if (isNil(basics.id)) {
          return EMPTY;
        }

        return forkJoin([
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
          switchMap(([shipmentOrder, shipmentOrderRelations]) => [
            NewQuoteFinalCostsActions.loadFinalCostsSuccess({
              finalCosts: {
                costs: mapCosts(shipmentOrder),
                timeline: mapQuoteTimeline(shipmentOrder),
                shippingNotes: shipmentOrder.Shipping_Notes_New__c,
                serviceType: mapServiceType(shipmentOrder.Service_Type__c),
                shipmentValue: shipmentOrder.Shipment_Value_USD__c,
                etaDisclaimer: shipmentOrder.CPA_v2_0__r?.ETA_Disclaimer__c,
                reasonForProForma: shipmentOrder.Reason_for_Pro_forma_quote__c,
                expiryDate: shipmentOrder.Expiry_Date__c,
                liabilityCoverFeeEnabled: shipmentOrder.Client_Taking_Liability_Cover__c === YesNo.YES,
              },
              state: mapFinalCostsState(shipmentOrder),
            }),

            NewQuoteBasicsActions.update({
              values: mapQuoteBasicsFromShipmentOrderData(shipmentOrder, shipmentOrderRelations),
            }),
          ]),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_FINAL_COSTS');
            return of(NewQuoteFinalCostsActions.loadFinalCostsError({ error: error.message }));
          })
        );
      })
    );
  });

  public editPackages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteFinalCostsActions.addPackages),
      concatLatestFrom(() => this.store$.select(fromNewQuote.selectNewQuoteBasicsState)),
      switchMap(([_, basics]) =>
        this.chargeableWeightDialogService
          .open({
            isInOverview: true,
          })
          .afterClosed$()
          .pipe(
            switchMap((dialogData) => {
              if (!dialogData?.packages?.length || !basics.id) {
                return EMPTY;
              }
              this.loadingIndicatorService.open();

              const payload = mapCreatePackagesPayload(basics.id, dialogData);

              return this.authService.getUser$().pipe(
                switchMap((user) =>
                  this.shipmentOrderPackageDataService
                    .createShipmentOrderPackages({
                      Accesstoken: user.accessToken,
                      AccountID: user.accountId,
                      ShipmentOrder_Packages: payload,
                    })
                    .pipe(
                      switchMap((response) =>
                        of(
                          NewQuoteFinalCostsActions.addPackagesSuccess({ packages: mapCreatePackagesResponse(response) }),
                          NewQuoteFinalCostsActions.loadFinalCosts()
                        )
                      ),
                      finalize(() => this.loadingIndicatorService.dispose()),
                      catchError((error) => {
                        this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_CREATE_PACKAGES');
                        return of(NewQuoteFinalCostsActions.addPackagesError(error.message));
                      })
                    )
                )
              );
            })
          )
      )
    );
  });

  public acceptQuote$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(NewQuoteFinalCostsActions.acceptQuote),
        concatLatestFrom(() => [this.store$.select(fromNewQuote.selectNewQuoteBasicsState), this.authService.getUser$()]),
        tap(() => this.loadingIndicatorService.open()),
        switchMap(([, { id }, user]) =>
          this.quoteDataService
            .acceptQuote({
              Accesstoken: user.accessToken,
              AccountID: user.accountId,
              SO: [{ SOID: id }],
            })
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
              switchMap(([shipmentOrder, shipmentOrderRelations]) => {
                const shipmentDetails = mapQuoteAcceptDialogData(shipmentOrder, shipmentOrderRelations);
                return this.quoteAcceptDialogService
                  .open([shipmentDetails], 'NEW_QUOTE.FINAL_COSTS.ACCEPT_QUOTES_DIALOG.BACK_TO_DASHBOARD')
                  .afterClosed$()
                  .pipe(
                    tap((result) => {
                      if (!isBoolean(result)) {
                        return undefined;
                      }
                      return result
                        ? this.router.navigate([RouteSegment.Root, RouteSegment.ShipmentsList, shipmentDetails.quoteId])
                        : this.router.navigate([RouteSegment.Root, RouteSegment.Dashboard]);
                    })
                  );
              }),
              catchError((error) => {
                this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_ACCEPT_QUOTE');
                return EMPTY;
              })
            )
        )
      );
    },
    { dispatch: false }
  );

  public editBasicsSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteBasicsActions.editSuccess),
      concatLatestFrom(() => this.store$.select(fromNewQuote.selectNewQuoteFinalCostsState)),
      switchMap(([, { state }]) => {
        if (![FinalCostsState.Ready, FinalCostsState.ReadyProForma, FinalCostsState.ReadyRange].includes(state)) {
          return EMPTY;
        }

        return of(NewQuoteFinalCostsActions.loadFinalCosts());
      })
    );
  });

  public downloadCostEstimate$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(NewQuoteFinalCostsActions.downloadCostEstimate),
        concatLatestFrom(() => this.store$.select(fromNewQuote.selectNewQuoteBasicsState)),
        switchMap(([, { id }]) =>
          this.costEstimateService
            .downloadCostEstimate$(id)
            .pipe(
              catchError((error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_DOWNLOAD_FINAL_COSTS_ESTIMATE'))
            )
        )
      );
    },
    { dispatch: false }
  );

  public cancelQuote$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(NewQuoteFinalCostsActions.cancelQuote),
        concatLatestFrom(() => this.store$.select(fromNewQuote.selectNewQuoteBasicsState)),
        switchMap(([, { id }]) =>
          this.cancelQuoteDialogService.cancelQuote$(id).pipe(
            tap(() => {
              this.toastMessageService.open(this.translateService.instant('SUCCESS.QUOTE_CANCEL'), {
                type: ToastMessageType.Success,
              });
              this.router.navigate([RouteSegment.Root], { replaceUrl: true });
            }),
            catchError((error) => {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_CANCEL_QUOTE');
              return EMPTY;
            })
          )
        )
      );
    },
    { dispatch: false }
  );

  public changeShipmentMethod$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteFinalCostsActions.changeShipmentMethod),
      concatLatestFrom(() => [
        this.store$.select(fromNewQuote.selectNewQuoteShipmentMethods),
        this.store$.select(fromNewQuote.selectNewQuoteThirdPartyCouriers),
        this.store$.select(fromNewQuote.selectNewQuoteSelectedShipmentMethodType),
      ]),
      switchMap(([, shipmentMethods, thirdPartyCouriers, selectedShipmentMethodType]) =>
        this.shipmentMethodDialogService
          .open({
            freight$: this.store$.select(fromNewQuote.selectNewQuoteFreight),
            zeeCouriers$: this.store$.select(fromNewQuote.selectNewQuoteCbCouriers),
            selectedCbCourierId$: this.store$.select(fromNewQuote.selectNewQuoteSelectedCbCourierId),
            shipmentMethods,
            thirdPartyCouriers,
            selectedShipmentMethodType,
          })
          .afterClosed$()
          .pipe(
            switchMap((result) => {
              if (!result) {
                return EMPTY;
              }

              return of(
                NewQuoteShipmentMethodActions.changeShipmentProvider({
                  selectedShipmentMethodType: result.selectedShipmentMethodType,
                  selectedCbCourierId: result.selectedCbCourierId,
                })
              );
            })
          )
      )
    );
  });

  public toggleLiabilityCoverFee$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteFinalCostsActions.toggleLiabilityCoverFee),
      concatLatestFrom(() => [this.store$.select(fromNewQuote.selectNewQuoteBasicsState), this.authService.getUser$()]),
      switchMap(([payload, basics, user]) => {
        this.loadingIndicatorService.open();

        return this.quoteDataService
          .updateShippingFees({
            Accesstoken: user.accessToken,
            SOID: basics.id,
            liabilitycoverfee: payload.isEnabled,
          })
          .pipe(
            map(() => NewQuoteFinalCostsActions.loadFinalCosts()),
            finalize(() => this.loadingIndicatorService.dispose()),
            catchError((error) => {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_UPDATE_SHIPPING_FEES');
              return EMPTY;
            })
          );
      })
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<fromNewQuote.AppState>,
    private readonly shipmentOrderPackageDataService: ShipmentOrderPackageDataService,
    private readonly quoteDataService: QuoteDataService,
    private readonly shipmentOrderDataService: ShipmentOrderDataService,
    private readonly quoteAcceptDialogService: QuoteAcceptDialogService,
    private readonly loadingIndicatorService: LoadingIndicatorService,
    private readonly chargeableWeightDialogService: ChargeableWeightDialogService,
    private readonly toastMessageService: ToastMessageService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly translateService: TranslateService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly costEstimateService: CostEstimateService,
    private readonly cancelQuoteDialogService: CancelQuoteDialogService,
    private readonly shipmentMethodDialogService: ShipmentMethodDialogService
  ) {}
}
