import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NewQuoteQueryParam } from '@global/enums/new-quote/new-quote-query-param.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { CountryHelper } from '@global/helpers/country.helper';
import { GetFreightPayload } from '@global/interfaces/get-freight-payload.interface';
import { CancelQuoteDialogService } from '@global/modules/cancel-quote-dialog/cancel-quote-dialog.service';
import { CountryValidationService } from '@global/modules/common-country-validation/services/country-validation.service';
import { mapContacts } from '@global/modules/common-profile/helpers/map-contacts.helper';
import { QuoteLineItemsDialogPayload } from '@global/modules/common-quote/components/quote-line-items-dialog/quote-line-items-dialog-payload.interface';
import { CommonQuoteDetailsService } from '@global/modules/common-quote/services/common-quote-details.service';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { SendbirdService } from '@global/modules/message-thread/services/sendbird-message.service';
import { ToastMessageType } from '@global/modules/toast-message/toast-message-type.enum';
import { ToastMessageService } from '@global/modules/toast-message/toast-message.service';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { FreightService } from '@global/services/freight.service';
import { TeamMemberService } from '@global/services/team-member.service';
import { AddressService } from '@modules/address/services/address.service';
import * as fromCountry from '@modules/country/reducers';
import { LocalVatRegistrationService } from '@modules/local-vat-registration/services/local-vat-registration.service';
import { QuoteAcceptDialogService } from '@modules/quote/components/quote-accept-dialog/quote-accept-dialog.service';
import { QuoteBasicsDialogService } from '@modules/quote/components/quote-basics-dialog/quote-basics-dialog.service';
import { ShipmentMethodDialogService } from '@modules/quote/components/shipment-method-dialog/shipment-method-dialog.service';
import { mapThirdPartyCouriers } from '@modules/quote/helpers/map-third-party-couriers.helper';
import { mapCbCouriers } from '@modules/quote/helpers/map-cb-couriers.helper';
import { ThirdPartyCourier } from '@modules/quote/interfaces/third-party-courier.interface';
import { QuoteService } from '@modules/quote/services/quote.service';
import { ShipmentMethodService } from '@modules/quote/services/shipment-method.service';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as CountryValidationActions from '@shared/modules/country-validation/actions/country-validation.actions';
import * as fromCountryValidation from '@shared/modules/country-validation/reducers';
import { CostEstimateService } from '@shared/services/cost-estimate.service';
import {
  CasesDataService,
  CourierRate,
  CourierRateStatus,
  ProfileDataService,
  QuoteDataService,
  ShipmentOrderDataService,
  SimplifiedQuoteAndShipmentStatus,
  CbQuoteDataService,
} from '@CitT/data';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import { asyncScheduler, combineLatest, EMPTY, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, first, map, observeOn, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import * as CountryApiActions from '../../country/actions/country-api.actions';
import * as QuoteDetailsActions from '../actions/quote-details.actions';
import { mapQuoteDetails } from '../helpers/map-quote-details.helper';
import * as fromQuoteDetails from '../reducers';

@Injectable()
export class QuoteDetailsEffects {
  public enter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.enter),
      switchMap(() =>
        of(
          CountryApiActions.loadAll(),
          CountryApiActions.loadDestination(),
          CountryValidationActions.load(),
          QuoteDetailsActions.loadContacts()
        )
      )
    );
  });

  public loadContacts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.loadContacts),
      switchMap(() =>
        this.authService.getUser$().pipe(
          switchMap((user) => this.profileDataService.getContacts({ Accesstoken: user.accessToken, AccountID: user.accountId })),
          map((contacts) => QuoteDetailsActions.loadContactsSuccess({ contacts: mapContacts(contacts) })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_CONTACTS');
            return of(QuoteDetailsActions.loadSingleQuoteError({ error: error.message }));
          })
        )
      )
    );
  });

  public loadNewQuote$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.loadNewQuote),
      switchMap(({ quoteId }) => of(QuoteDetailsActions.loadSingleQuote({ quoteId })))
    );
  });

  public loadQuote$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.loadQuote),
      switchMap(({ quoteId, reload }) => of(QuoteDetailsActions.loadSingleQuote({ quoteId, reload })))
    );
  });

  public loadSingleQuote$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.loadSingleQuote),
      concatLatestFrom(() => this.authService.getUser$()),
      switchMap(([{ quoteId, reload }, user]) => {
        if (reload) {
          this.loadingIndicatorService.open();
        }

        return forkJoin([
          this.shipmentOrderDataService
            .getShipmentOrder({
              Accesstoken: user.accessToken,
              AccountID: user.accountId,
              ContactID: user.contactId,
              SOID: quoteId,
            })
            .pipe(
              switchMap((shipmentOrder) =>
                this.zeeQuoteDataService
                  .getPreferredFreightMethodForCb({
                    Accesstoken: user.accessToken,
                    ShipFromcountry: shipmentOrder.Ship_From_Country__c,
                    ShipTocountry: shipmentOrder.Destination__c,
                  })
                  .pipe(map((shipmentMethods) => ({ shipmentOrder, shipmentMethods })))
              )
            ),
          this.shipmentOrderDataService.getShipmentOrderRelations({
            Accesstoken: user.accessToken,
            AccountID: user.accountId,
            SOID: quoteId,
          }),
          // this.casesDataService.getSOCases({ Accesstoken: user.accessToken, ContactID: user.contactId, SOID: quoteId }),
          this.sendbirdService.getspecificChannels$({ orgId: user.orgId, shipmentOrderId: quoteId }),
          this.teamMemberService.getDefaultTeamMember$(),
          this.sendbirdService.getMyGroupChannels(),
        ]).pipe(
          switchMap(
            ([{ shipmentOrder, shipmentMethods }, shipmentOrderRelations, sendbirdChannels, defaultTeamMember, sendbirdChannelsObject]) => {
              if (
                ![
                  SimplifiedQuoteAndShipmentStatus.QUOTE___COMPLETE_OR_INCOMPLETE,
                  SimplifiedQuoteAndShipmentStatus.QUOTE___EXPIRED,
                ].includes(shipmentOrder.NCP_Shipping_Status__c)
              ) {
                this.router.navigate([RouteSegment.Root, RouteSegment.ShipmentsList, shipmentOrder.Id]);
                return EMPTY;
              }

              return of(
                QuoteDetailsActions.loadSingleQuoteSuccess({
                  quote: mapQuoteDetails(
                    shipmentOrder,
                    shipmentOrderRelations,
                    sendbirdChannels,
                    defaultTeamMember,
                    shipmentMethods,
                    sendbirdChannelsObject
                  ),
                })
              );
            }
          ),
          finalize(() => {
            if (reload) {
              this.loadingIndicatorService.dispose();
            }
          }),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_QUOTE_DETAILS');
            return of(QuoteDetailsActions.loadSingleQuoteError({ error: error.message }));
          })
        );
      })
    );
  });

  public changeOwner$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.changeOwner),
      concatLatestFrom(() => this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote)),
      switchMap(([{ owner }, quote]) =>
        this.commonQuoteDetailsService.saveOwner$(quote.id, owner).pipe(
          map(() => QuoteDetailsActions.loadQuote({ quoteId: quote.id, reload: true })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_UPDATE_CONTACT');
            return EMPTY;
          })
        )
      )
    );
  });

  public editBasics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.editBasics),
      concatLatestFrom(() => [
        this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote),
        this.store$.select(fromCountry.selectAllCountriesData),
        this.store$.select(fromCountry.selectDestinationCountriesData),
        this.store$.select(fromCountryValidation.selectCountryValidationRulesData),
      ]),
      switchMap(([, quote, allCountries, destinationCountries, validationRules]) =>
        this.quoteBasicsDialogService
          .open({
            initialValues: {
              ...quote,
              projectReferences: [quote.projectReference1, quote.projectReference2].filter(
                (projectReference) => !isEmpty(projectReference)
              ),
            },
            allCountries: CountryHelper.mapToInputDataVM(allCountries),
            destinationCountries: CountryHelper.mapToInputDataVM(destinationCountries),
            validationRules,
            lineItems: quote.lineItems || [],
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
                    quoteId: quote.id,
                    freightId: quote.freightId,
                    weightUnit: quote.estimatedWeightUnit,
                    lengthUnit: quote.lengthUnit,
                    packages: quote.packages,
                    clientContact: quote.owner,
                  },
                  values,
                  user
                )
                .pipe(
                  finalize(() => this.loadingIndicatorService.dispose()),
                  map(() => QuoteDetailsActions.loadQuote({ quoteId: quote.id, reload: true })),
                  catchError((error) => {
                    this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_QUOTE_BASICS');
                    return EMPTY;
                  })
                );
            })
          )
      )
    );
  });

  public editLineItems$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.editLineItems),
      switchMap(() =>
        forkJoin([this.getLineItemsDialogPayload$(), this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote).pipe(first())])
      ),
      switchMap(([lineItemsDialogPayload, quote]) =>
        this.commonQuoteDetailsService
          .updateLineItems$(quote.id, quote.lineItems, lineItemsDialogPayload, this.getServiceTypeNotes$())
          .pipe(
            switchMap((updateData) => of(QuoteDetailsActions.editLineItemsSuccess({ updateData }))),
            map(() => QuoteDetailsActions.loadQuote({ quoteId: quote.id, reload: true })),
            catchError((error) => {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_UPDATE_LINE_ITEMS');
              return of(QuoteDetailsActions.editLineItemsError({ error: error.message }));
            })
          )
      )
    );
  });

  public editPackages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.editPackages),
      switchMap(({ quote }) =>
        this.commonQuoteDetailsService.updatePackages$(quote.id, quote.packages, quote.estimatedWeightUnit, quote.lengthUnit).pipe(
          map(() => QuoteDetailsActions.loadQuote({ quoteId: quote.id, reload: true })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_UPDATE_PACKAGES');
            return EMPTY;
          })
        )
      )
    );
  });

  public editPickupAddress$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.editPickupAddress),
      concatLatestFrom(() => [
        this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote),
        this.store$.select(fromCountry.selectAllCountriesInputData),
      ]),
      switchMap(([, quote, countries]) =>
        this.addressService.selectPickupAddresses$({ country: quote.from, countries, selectedAddresses: quote.pickUpAddress }).pipe(
          switchMap((addresses) =>
            this.commonQuoteDetailsService.savePickupAddress$(quote.freightId, addresses).pipe(
              map(() => QuoteDetailsActions.loadQuote({ quoteId: quote.id, reload: true })),
              catchError((error) => {
                this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_PICKUP_ADDRESSES');
                return EMPTY;
              })
            )
          )
        )
      )
    );
  });

  public deletePickupAddress$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.deletePickupAddress),
      concatLatestFrom(() => this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote)),
      switchMap(([, quote]) =>
        this.commonQuoteDetailsService.deletePickupAddress$(quote.freightId).pipe(
          map(() => QuoteDetailsActions.loadQuote({ quoteId: quote.id, reload: true })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_PICKUP_ADDRESSES');
            return EMPTY;
          })
        )
      )
    );
  });

  public editShipToLocations$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.editShipToLocations),
      concatLatestFrom(() => [
        this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote),
        this.store$.select(fromCountry.selectDestinationCountriesInputData),
      ]),
      switchMap(([, quote, countries]) =>
        this.addressService
          .selectShipToAddresses$({
            country: quote.to,
            countries,
            selectedAddresses: quote.locationAddresses,
          })
          .pipe(
            switchMap((addresses) =>
              this.commonQuoteDetailsService.saveShipToLocations$(quote.id, addresses).pipe(
                map(() => QuoteDetailsActions.loadQuote({ quoteId: quote.id, reload: true })),
                catchError((error) => {
                  this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_DELIVERY_ADDRESSES');
                  return EMPTY;
                })
              )
            )
          )
      )
    );
  });

  public cancelQuote$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(QuoteDetailsActions.cancelQuote),
        switchMap(({ id }) =>
          this.cancelQuoteDialogService.cancelQuote$(id).pipe(
            tap(() => {
              this.toastMessageService.open(this.translateService.instant('SUCCESS.QUOTE_CANCEL'), {
                type: ToastMessageType.Success,
              });
              this.router.navigate([RouteSegment.Root, RouteSegment.QuoteList], { replaceUrl: true });
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

  public acceptQuote$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(QuoteDetailsActions.acceptQuote),
        switchMap(({ quoteId }) =>
          this.commonQuoteDetailsService.acceptQuote$(quoteId).pipe(
            switchMap((shipmentDetails) =>
              this.quoteAcceptDialogService
                .open([shipmentDetails], 'QUOTE_LIST.ACCEPT_QUOTES_DIALOG.BACK_TO_QUOTE_LIST')
                .afterClosed$()
                .pipe(
                  tap((result) => {
                    if (!isBoolean(result)) {
                      // eslint-disable-next-line unicorn/no-useless-undefined
                      return undefined;
                    }

                    return result
                      ? this.router.navigate([RouteSegment.Root, RouteSegment.ShipmentsList, shipmentDetails.quoteId])
                      : this.router.navigate([RouteSegment.Root, RouteSegment.QuoteList]);
                  })
                )
            ),
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

  public downloadQuote$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(QuoteDetailsActions.downloadQuote),
        switchMap(({ quoteId }) =>
          this.costEstimateService.downloadCostEstimate$(quoteId).pipe(
            catchError((error) => {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_DOWNLOAD_QUOTE');
              return EMPTY;
            })
          )
        )
      );
    },
    { dispatch: false }
  );

  public sendQuoteEmail$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(QuoteDetailsActions.sendQuoteEmail),
        concatLatestFrom(() => this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote)),
        switchMap(([{ quoteId }, quote]) =>
          this.commonQuoteDetailsService.sendQuoteEmail$(quoteId, quote.shipmentValue).pipe(
            switchMap(() => {
              this.toastMessageService.open(this.translateService.instant('QUOTE_DETAILS.EMAIL_SENT_SUCCESSFULLY'), {
                type: ToastMessageType.Success,
              });
              return EMPTY;
            }),
            catchError((error) => {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SEND_QUOTE_EMAIL');
              return EMPTY;
            })
          )
        )
      );
    },
    { dispatch: false }
  );

  public saveNote$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.saveNote),
      switchMap(({ note, id }) =>
        this.commonQuoteDetailsService.saveNote$(id, note).pipe(
          map(() => QuoteDetailsActions.saveNoteSuccess({ note })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_NOTE');
            return of(QuoteDetailsActions.saveNoteError({ error: error.message }));
          })
        )
      )
    );
  });

  public reuseQuote$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(QuoteDetailsActions.reuseQuote),
        tap(({ id }) =>
          this.router.navigate([RouteSegment.Root, RouteSegment.NewQuote], {
            queryParams: { [NewQuoteQueryParam.QuoteIdToReuse]: id },
          })
        )
      );
    },
    { dispatch: false }
  );

  public createMessage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.createMessage),
      concatLatestFrom(() => this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote)),
      switchMap(([_, quote]) =>
        this.commonQuoteDetailsService
          .createMessage$(quote.id, quote.name, quote.projectReference1, quote.defaultTeamMember)
          .pipe(switchMap(() => of(QuoteDetailsActions.loadQuote({ quoteId: quote.id, reload: true }))))
      )
    );
  });

  public openMessage$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(QuoteDetailsActions.openMessage),
        concatLatestFrom(() => this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote)),
        switchMap(([{ messageId }, quote]) => this.commonQuoteDetailsService.openMessage$(messageId, quote.id))
      );
    },
    { dispatch: false }
  );

  public openMessageDeeplink$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.enter),
      map(() => window.location.hash.match(/^#message\/(.*)$/)),
      observeOn(asyncScheduler),
      switchMap((matches) => {
        if (!matches) {
          return EMPTY;
        }

        return of(QuoteDetailsActions.openMessage({ messageId: matches[1] }));
      })
    );
  });

  public changeShipmentMethod$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.changeShipmentMethod),
      concatLatestFrom(() => this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote)),
      switchMap(([, quote]) => {
        const courierRates$ = this.getCourierRates$(quote.id).pipe(shareReplay({ bufferSize: 1, refCount: true }));

        return this.loadingIndicatorService.withFullscreen$(forkJoin([this.getThirdPartyCouriers$(), courierRates$.pipe(first())])).pipe(
          switchMap(([thirdPartyCouriers]) =>
            this.shipmentMethodDialogSevice
              .open({
                freight$: this.store$.select(fromQuoteDetails.selectQuoteFreight),
                zeeCouriers$: courierRates$.pipe(map((courierRates) => mapCbCouriers(courierRates))),
                selectedCbCourierId$: courierRates$.pipe(
                  map((courierRates) => courierRates.find((courier) => courier.Status__c === CourierRateStatus.SELECTED)?.Id)
                ),
                shipmentMethods: quote.shipmentMethods,
                thirdPartyCouriers,
                selectedShipmentMethodType: quote.selectedShipmentMethod,
              })
              .afterClosed$()
          ),
          switchMap((result) => {
            if (!result) {
              return EMPTY;
            }

            const shipmentMethod = quote.shipmentMethods.find(
              (currentShipmentMethod) => currentShipmentMethod.type === result.selectedShipmentMethodType
            );

            return this.shipmentMethodService.saveShipmentMethod$(quote.id, shipmentMethod, result.selectedCbCourierId);
          }),
          map(() => QuoteDetailsActions.loadQuote({ quoteId: quote.id, reload: true }))
        );
      })
    );
  });

  public addLocalVatRegistration$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(QuoteDetailsActions.addLocalVatRegistration),
        concatLatestFrom(() => [
          this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote),
          this.store$.select(fromCountry.selectDestinationCountriesInputData),
          this.store$.select(fromCountry.selectAllCountriesInputData),
        ]),
        switchMap(([, quote, destinationCountries, allCountries]) =>
          this.localVatRegistrationService.createThroughDialog$(quote.to, allCountries, destinationCountries).pipe(
            map(() => QuoteDetailsActions.addLocalVatRegistrationSuccess()),
            catchError(() => of(QuoteDetailsActions.addLocalVatRegistrationError()))
          )
        )
      );
    },
    { dispatch: false }
  );

  public pollFreight$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.enter),
      switchMap(() =>
        this.actions$.pipe(
          ofType(QuoteDetailsActions.loadSingleQuoteSuccess, QuoteDetailsActions.editLineItemsSuccess),
          concatLatestFrom(() => this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote)),
          switchMap(([, quote]) => {
            const getFreightPayload = [quote].map<GetFreightPayload>((item) => ({
              shipmentOrderId: item.id,
              citrShippingServiceFeeEnabled: item.citrShippingServiceFeeEnabled,
              isShipment: false,
            }));

            return this.freightService.getFreight$(getFreightPayload);
          }),
          takeUntil(this.actions$.pipe(ofType(QuoteDetailsActions.leave)))
        )
      ),
      map((freightCosts) => QuoteDetailsActions.updateFreightCosts({ freightCosts }))
    );
  });

  public toggleLiabilityCoverFee$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteDetailsActions.toggleLiabilityCoverFee),
      concatLatestFrom(() => [this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote), this.authService.getUser$()]),
      switchMap(([{ quoteId, isEnabled }, quote, user]) => {
        this.loadingIndicatorService.open();
        return this.quoteDataService
          .updateShippingFees({
            Accesstoken: user.accessToken,
            SOID: quoteId,
            liabilitycoverfee: isEnabled,
          })
          .pipe(
            map(() => QuoteDetailsActions.loadQuote({ quoteId: quote.id, reload: true })),
            finalize(() => this.loadingIndicatorService.dispose()),
            catchError((error) => {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_UPDATE_LIABILITY_COVER_FEE');
              return EMPTY;
            })
          );
      })
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<fromQuoteDetails.AppState & fromCountry.AppState & fromCountryValidation.AppState>,
    private readonly shipmentOrderDataService: ShipmentOrderDataService,
    private readonly quoteDataService: QuoteDataService,
    private readonly quoteBasicsDialogService: QuoteBasicsDialogService,
    private readonly authService: AuthService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly quoteService: QuoteService,
    private readonly addressService: AddressService,
    private readonly profileDataService: ProfileDataService,
    private readonly router: Router,
    private readonly loadingIndicatorService: LoadingIndicatorService,
    private readonly toastMessageService: ToastMessageService,
    private readonly translateService: TranslateService,
    private readonly quoteAcceptDialogService: QuoteAcceptDialogService,
    private readonly casesDataService: CasesDataService,
    private readonly teamMemberService: TeamMemberService,
    private readonly costEstimateService: CostEstimateService,
    private readonly cancelQuoteDialogService: CancelQuoteDialogService,
    private readonly countryValidationService: CountryValidationService,
    private readonly localVatRegistrationService: LocalVatRegistrationService,
    private readonly shipmentMethodDialogSevice: ShipmentMethodDialogService,
    private readonly zeeQuoteDataService: CbQuoteDataService,
    private readonly freightService: FreightService,
    private readonly shipmentMethodService: ShipmentMethodService,
    private readonly commonQuoteDetailsService: CommonQuoteDetailsService,
    private readonly sendbirdService: SendbirdService
  ) {}

  private getServiceTypeNotes$(): Observable<string[]> {
    return combineLatest([
      this.store$.select(fromCountryValidation.selectCountryValidationRulesData),
      this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote),
    ]).pipe(
      first(),
      map(([validationRules, quote]) => this.countryValidationService.getCbNotes(validationRules, [quote.to]))
    );
  }

  private getLineItemsDialogPayload$(): Observable<
    Pick<QuoteLineItemsDialogPayload, 'validationRules' | 'from' | 'to' | 'serviceType' | 'currency' | 'valuationMethod' | 'hasStoreFees'>
  > {
    return combineLatest([
      this.store$.select(fromCountryValidation.selectCountryValidationRulesData),
      this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote),
    ]).pipe(
      first(),
      map(([validationRules, quote]) => ({
        validationRules,
        from: quote.from,
        to: [quote.to],
        serviceType: quote.serviceType,
        valuationMethod: quote.valuationMethod,
        currency: quote.clientCurrencyInput,
        hasStoreFees: quote.storeFeesAvailable,
      }))
    );
  }

  private getThirdPartyCouriers$(): Observable<ThirdPartyCourier[]> {
    return this.authService.getUser$().pipe(
      withLatestFrom(this.store$.select(fromQuoteDetails.selectQuoteDetailsQuote)),
      switchMap(([user, { cpaId }]) => this.zeeQuoteDataService.getThirdPartyCouriers({ Accesstoken: user.accessToken, CPAID: cpaId })),
      map((response) => mapThirdPartyCouriers(response.ServiceProviders)),
      catchError((error) => {
        if (error.error.Message.Response === 'Suggested Providers are not availble') {
          return of([]);
        }

        return throwError(error);
      })
    );
  }

  private getCourierRates$(shipmentOrderId: string): Observable<CourierRate[]> {
    return combineLatest([this.authService.getUser$(), this.store$.select(fromQuoteDetails.selectQuoteFreight)]).pipe(
      switchMap(([user, freight]) =>
        this.quoteDataService
          .getCourierRates({
            Accesstoken: user.accessToken,
            SOID: shipmentOrderId,
            FRID: freight.id,
          })
          .pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.status !== HttpStatusCode.BadRequest && error.error?.Success?.Response !== 'Courier rates are not available') {
                this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_SHIPMENT_PROVIDERS');
              }
              return of([]);
            })
          )
      )
    );
  }
}
