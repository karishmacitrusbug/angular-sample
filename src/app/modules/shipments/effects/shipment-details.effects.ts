import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { InvoiceType } from '@global/enums/invoice-type.enum';
import { LengthUnit } from '@global/enums/length-unit.enum';
import { MessageThreadType } from '@global/enums/message-thread-type.enum';
import { NewQuoteQueryParam } from '@global/enums/new-quote/new-quote-query-param.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { FileHelper } from '@global/helpers/file.helper';
import { ChargeableWeightDialogResult } from '@global/interfaces/chargeable-weight-dialog.vm';
import { ChargeableWeightDialogComponent } from '@global/modules/chargeable-weight-dialog/components/chargeable-weight-dialog.component';
import { UpdateQuoteService } from '@global/modules/common-quote/services/update-quote.service';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { CaseMessageDialogService } from '@global/modules/message-dialog/services/case-message-dialog.service';
import { TasksMessageDialogService } from '@global/modules/message-dialog/services/tasks-message-dialog.service';
import { MessageDialogPayload } from '@global/modules/message-dialog/types/message-dialog-payload.interface';
import { MessageEnvelopeMessageVM } from '@global/modules/message-envelope/message.vm';
import { TeamMemberListType } from '@global/modules/message-thread/enums/team-member-list-type.enum';
import { SendbirdService } from '@global/modules/message-thread/services/sendbird-message.service';
import { PackageService } from '@global/modules/packages/package.service';
import { TasksService } from '@global/modules/tasks/services/tasks.service';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { TeamMemberService } from '@global/services/team-member.service';
import { AddressService } from '@modules/address/services/address.service';
import * as fromCountry from '@modules/country/reducers';
import { mapShipmentOrderResponse } from '@modules/shipments/helpers/map-shipment-order-response.helper';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { InvoiceDialogService } from '@shared/modules/invoice-dialog/components/invoice-dialog/invoice-dialog.service';
import { PaymentService } from '@shared/services/payment.service';
import {
  CasesDataService,
  CaseSource,
  DocumentsDataService,
  InvoiceDataService,
  ProfileDataService,
  QuoteDataService,
  ShipmentOrderDataService,
  SimplifiedQuoteAndShipmentStatus,
} from '@CitT/data';
import isNil from 'lodash/isNil';
import { asyncScheduler, EMPTY, forkJoin, of, throwError } from 'rxjs';
import { catchError, finalize, first, map, observeOn, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import * as ShipmentDetailsActions from '../actions/shipment-details.actions';
import * as fromShipmentDetails from '../reducers';

@Injectable()
export class ShipmentDetailsEffects {
  public enter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentDetailsActions.enter),
      switchMap(({ shipmentId }) => of(ShipmentDetailsActions.loadShipment({ shipmentId })))
    );
  });

  public loadShipment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentDetailsActions.loadShipment),
      concatLatestFrom(() => this.authService.getUser$()),
      switchMap(([{ shipmentId }, user]) => {
        const request = {
          Accesstoken: user.accessToken,
          AccountID: user.accountId,
          SOID: shipmentId,
        };
        return forkJoin([
          this.shipmentOrderDataService.getShipmentOrder(request),
          this.shipmentOrderDataService.getShipmentOrderRelations(request),
          this.profileDataService.getContacts({ Accesstoken: user.accessToken, AccountID: user.accountId }),
          this.sendbirdService.getspecificChannels$({ orgId: user.orgId, shipmentOrderId: shipmentId }),
          this.teamMemberService.getDefaultTeamMember$(shipmentId, TeamMemberListType.ShipmentOrder),
          this.sendbirdService.getMyGroupChannels(),
        ]).pipe(
          switchMap(([shipmentOrder, soAllRealtedInfoResponse, contacts, sendbirdChannels, defaultTeamMember, sendbirdChannelsObject]) => {
            if (
              [SimplifiedQuoteAndShipmentStatus.QUOTE___COMPLETE_OR_INCOMPLETE, SimplifiedQuoteAndShipmentStatus.QUOTE___EXPIRED].includes(
                shipmentOrder.NCP_Shipping_Status__c
              )
            ) {
              this.router.navigate([RouteSegment.Root, RouteSegment.QuoteList, shipmentOrder.Id]);
              return EMPTY;
            }

            return of(
              ShipmentDetailsActions.loadShipmentSuccess({
                shipment: mapShipmentOrderResponse(
                  shipmentOrder,
                  soAllRealtedInfoResponse,
                  contacts,
                  sendbirdChannels,
                  this.translateService.instant('SHIPMENTS.SHIPMENT_DETAILS.POD'),
                  this.translateService.instant('SHIPMENTS.SHIPMENT_DETAILS.POD_AVAILABLE_SOON'),
                  defaultTeamMember,
                  this.translateService.instant('SHIPMENTS.SHIPMENT_DETAILS.CLEARANCE_LETTER'),
                  this.translateService.instant('SHIPMENTS.SHIPMENT_DETAILS.CUSTOMS_CLEARANCE_LETTER'),
                  sendbirdChannelsObject
                ),
              })
            );
          }),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_SHIPMENT_DETAILS');
            return of(ShipmentDetailsActions.loadShipmentError({ error: error.message }));
          })
        );
      })
    );
  });

  public reuseData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ShipmentDetailsActions.reuseData),
        tap((data) =>
          this.router.navigate([RouteSegment.Root, RouteSegment.NewQuote], {
            queryParams: { [NewQuoteQueryParam.QuoteIdToReuse]: data.shipmentId },
          })
        )
      );
    },
    {
      dispatch: false,
    }
  );

  public editPickupAddress$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentDetailsActions.editPickupAddress),
      concatLatestFrom(() => [
        this.store$.select(fromShipmentDetails.selectShipmentDetailsShipment),
        this.store$.select(fromCountry.selectAllCountriesInputData),
      ]),
      switchMap(([, currentShipment, countries]) =>
        this.addressService
          .selectPickupAddresses$({ country: currentShipment.from, countries, selectedAddresses: currentShipment.pickUpAddress })
          .pipe(
            withLatestFrom(this.authService.getUser$()),
            switchMap(([addresses, user]) => {
              if (addresses === undefined) {
                return EMPTY;
              }
              this.loadingIndicatorService.open();
              return this.quoteDataService
                .updateFreightAddress({
                  Accesstoken: user.accessToken,
                  FRID: currentShipment.freightId,
                  PickupaddressID: addresses[0] ? addresses[0].id : undefined,
                })
                .pipe(
                  finalize(() => this.loadingIndicatorService.dispose()),
                  map(() => ShipmentDetailsActions.loadShipment({ shipmentId: currentShipment.id })),
                  catchError((error) => {
                    this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_PICKUP_ADDRESSES');
                    return EMPTY;
                  })
                );
            })
          )
      )
    );
  });

  public deletePickupAddress$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentDetailsActions.deletePickupAddress),
      concatLatestFrom(() => [this.store$.select(fromShipmentDetails.selectShipmentDetailsShipment), this.authService.getUser$()]),
      switchMap(([, currentShipment, user]) => {
        this.loadingIndicatorService.open();

        return this.quoteDataService
          .updateFreightAddress({
            Accesstoken: user.accessToken,
            FRID: currentShipment.freightId,
            PickupaddressID: undefined,
          })
          .pipe(
            finalize(() => this.loadingIndicatorService.dispose()),
            map(() => ShipmentDetailsActions.loadShipment({ shipmentId: currentShipment.id })),
            catchError((error) => {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_PICKUP_ADDRESSES');
              return EMPTY;
            })
          );
      })
    );
  });

  public editDeliveryLocations$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentDetailsActions.editDeliveryLocations),
      concatLatestFrom(() => [
        this.store$.select(fromShipmentDetails.selectShipmentDetailsShipment),
        this.store$.select(fromCountry.selectDestinationCountriesInputData),
      ]),
      switchMap(([, currentShipment, countries]) => {
        const country =
          currentShipment.deliveryAddresses.length > 0 ? currentShipment.deliveryAddresses[0].country : currentShipment.destination;

        return this.addressService
          .selectShipToAddresses$({ country, countries, selectedAddresses: currentShipment.deliveryAddresses })
          .pipe(
            withLatestFrom(this.authService.getUser$()),
            switchMap(([addresses, user]) => {
              if (!addresses) {
                return EMPTY;
              }
              this.loadingIndicatorService.open();
              return this.quoteDataService
                .updateFinalDeliveryAddresses({
                  Accesstoken: user.accessToken,
                  SOID: currentShipment.id,
                  Final_Delivery: addresses.map((address) => ({
                    Name: address.tag,
                    FinalDestinationAddressID: address.id,
                  })),
                })
                .pipe(
                  finalize(() => this.loadingIndicatorService.dispose()),
                  map(() => ShipmentDetailsActions.loadShipment({ shipmentId: currentShipment.id })),
                  catchError((error) => {
                    this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_DELIVERY_ADDRESSES');
                    return EMPTY;
                  })
                );
            })
          );
      })
    );
  });

  public saveNote$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentDetailsActions.saveNote),
      switchMap(({ note, id }) =>
        this.updateQuoteService.updateQuote$(id, { clientNote: note }).pipe(
          switchMap(() => of(ShipmentDetailsActions.saveNoteSuccess({ note }))),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SAVE_NOTE');
            return of(ShipmentDetailsActions.saveNoteError({ error: error.message }));
          })
        )
      )
    );
  });

  public changeOwner$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentDetailsActions.changeOwner),
      concatLatestFrom(() => [this.store$.select(fromShipmentDetails.selectShipmentDetailsShipment)]),
      switchMap(([{ owner }, currentShipment]) =>
        this.updateQuoteService
          .updateQuote$(currentShipment.id, {
            clientContactForShipment: owner,
          })
          .pipe(
            map(() => ShipmentDetailsActions.loadShipment({ shipmentId: currentShipment.id })),
            catchError((error) => {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_UPDATE_CONTACT');
              return EMPTY;
            })
          )
      )
    );
  });

  public openTask$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentDetailsActions.openTask),
      switchMap(({ taskId }) => {
        window.location.hash = `#task/${taskId}`;
        return this.tasksService.open$(taskId, false).pipe(tap(() => (window.location.hash = '')));
      }),
      concatLatestFrom(() => this.store$.select(fromShipmentDetails.selectShipmentDetailsShipment)),
      switchMap(([submitted, currentShipment]) => {
        if (!submitted) {
          return EMPTY;
        }

        return of(ShipmentDetailsActions.loadShipment({ shipmentId: currentShipment.id }));
      })
    );
  });

  public newMessage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentDetailsActions.newMessage),
      concatLatestFrom(() => this.store$.select(fromShipmentDetails.selectShipmentDetailsShipment)),
      switchMap(([_, shipment]) =>
        this.caseMessageDialogService
          .open({
            origin: 'Shipment Order page',
            teamMemberListType: TeamMemberListType.ShipmentOrder,
            shipment: {
              id: shipment.id,
              title: shipment.name,
              reference: shipment.references ? shipment.references[0] : '',
              name: shipment.shipmentName,
            },
            messageTo: shipment.defaultTeamMember,
            source: {
              type: CaseSource.NCP_ORDER,
              recordId: shipment.id,
            },
          })
          .afterClosed$()
          .pipe(switchMap(() => of(ShipmentDetailsActions.loadShipment({ shipmentId: shipment.id }))))
      )
    );
  });

  public openMessage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentDetailsActions.openMessage),
      concatLatestFrom(() => this.store$.select(fromShipmentDetails.selectShipmentDetailsShipment)),
      switchMap(([{ id, messageType, openRelatedTask }, shipment]) => {
        const payload: MessageDialogPayload = {
          id,
          teamMemberListType: TeamMemberListType.ShipmentOrder,
          shipment: {
            id: shipment.id,
            reference: shipment.references ? shipment.references[0] : '',
            title: shipment.name,
            name: shipment.shipmentName,
          },
        };

        window.location.hash = `#${openRelatedTask ? 'taskmessage' : 'message'}/${id}`;

        switch (messageType) {
          case MessageThreadType.Case:
            return this.caseMessageDialogService
              .open(payload)
              .afterClosed$()
              .pipe(
                tap(() => (window.location.hash = '')),
                map(() => (openRelatedTask ? id : undefined))
              );
          case MessageThreadType.Task:
            return this.taskMessageDialogService
              .open(payload)
              .afterClosed$()
              .pipe(
                tap(() => (window.location.hash = '')),
                map(() => (openRelatedTask ? id : undefined))
              );
        }
      }),
      switchMap((taskId) =>
        this.store$.select(fromShipmentDetails.selectShipmentDetails).pipe(
          first(),
          map(({ shipment }) => ({ taskId, shipment }))
        )
      ),
      switchMap(({ taskId, shipment }) =>
        taskId ? of(ShipmentDetailsActions.openTask({ taskId })) : of(ShipmentDetailsActions.loadShipment({ shipmentId: shipment.data.id }))
      )
    );
  });

  public openInvoice$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ShipmentDetailsActions.openInvoice),
        concatLatestFrom(() => this.store$.select(fromShipmentDetails.selectShipmentDetailsShipment)),
        switchMap(([{ invoice }, currentShipment]) => {
          this.invoiceDialogService.open({
            id: invoice.id,
            type: invoice.type,
            name: invoice.name,
            orderId: currentShipment.id,
            amount: invoice.price,
            needsPayment: invoice.type === InvoiceType.Outstanding,
            dueDate: new Date(invoice.dueDate),
            stripeUrl: invoice.stripeUrl,
            status: invoice.status,
          });

          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  public sendInvoiceInEmail$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ShipmentDetailsActions.sendInvoiceInEmail),
        switchMap(({ invoiceId }) =>
          this.authService.getUser$().pipe(
            tap(() => this.loadingIndicatorService.open()),
            switchMap((user) =>
              this.invoiceDataService.sendInvoice({ Accesstoken: user.accessToken, InvoiceID: invoiceId, toEmailID: user.email }).pipe(
                finalize(() => this.loadingIndicatorService.dispose()),
                catchError((error) => {
                  this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SEND_INVOICE_EMAIL');
                  return EMPTY;
                })
              )
            )
          )
        )
      );
    },
    { dispatch: false }
  );

  public downloadInvoice$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ShipmentDetailsActions.downloadInvoice),
        switchMap(({ invoiceId }) =>
          this.authService.getUser$().pipe(
            tap(() => this.loadingIndicatorService.open()),
            switchMap((user) =>
              this.invoiceDataService.downloadInvoice({ Accesstoken: user.accessToken, InvoiceID: invoiceId }).pipe(
                switchMap((attachments) =>
                  attachments.length === 0 ? throwError(new Error('Expected at least one attachment')) : of(attachments[0])
                ),
                tap((attachment) => FileHelper.downloadDataFile(attachment)),
                finalize(() => this.loadingIndicatorService.dispose()),
                catchError((error) => {
                  this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_DOWNLOAD_INVOICE');
                  return EMPTY;
                })
              )
            )
          )
        )
      );
    },
    { dispatch: false }
  );

  public addPackages$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ShipmentDetailsActions.addPackages),
        concatLatestFrom(() => [this.store$.select(fromShipmentDetails.selectShipmentDetailsShipment), this.authService.getUser$()]),
        switchMap(([{ openPackageId }, shipment, user]) =>
          this.profileDataService.getUserDefaults(user.accountId).pipe(
            switchMap((userDefaults) => {
              // eslint-disable-next-line unicorn/explicit-length-check
              const lengthUnit = userDefaults.ClientDefaultvalues.length || LengthUnit.Cm;
              return this.dialogService
                .open(ChargeableWeightDialogComponent, {
                  packages: shipment.packages,
                  openPackageId,
                })
                .afterClosed$()
                .pipe(
                  switchMap((result: ChargeableWeightDialogResult) => {
                    if (!result) {
                      return EMPTY;
                    }
                    this.loadingIndicatorService.open();

                    if (!isNil(openPackageId)) {
                      const data = {
                        quoteId: shipment.id,
                        lengthUnit,
                        weightUnit: shipment.estimatedWeightUnit,
                        packages: shipment.packages,
                      };

                      return this.packageService.updateQuotePackages$(data, result, user).pipe(
                        map(() => ShipmentDetailsActions.loadShipment({ shipmentId: shipment.id })),
                        finalize(() => this.loadingIndicatorService.dispose()),
                        catchError((error) => {
                          this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_UPDATE_PACKAGES');
                          return EMPTY;
                        })
                      );
                    }

                    const quoteData = {
                      quoteId: shipment.id,
                      lengthUnit,
                      weightUnit: shipment.estimatedWeightUnit,
                      packages: result.packages,
                    };

                    return this.packageService.createQuotePackages$(quoteData, result, user).pipe(
                      map(() => ShipmentDetailsActions.loadShipment({ shipmentId: shipment.id })),
                      finalize(() => this.loadingIndicatorService.dispose()),
                      catchError((error) => {
                        this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_CREATE_PACKAGES');
                        return EMPTY;
                      })
                    );
                  }),
                  catchError((error) => {
                    this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_SHIPMENT_DETAILS');
                    return of(ShipmentDetailsActions.loadShipmentError({ error: error.message }));
                  })
                );
            })
          )
        )
      );
    },
    { dispatch: false }
  );

  public openMessageDeeplink$ = createEffect(() => {
    // @ts-ignore
    return this.actions$.pipe(
      ofType(ShipmentDetailsActions.enter),
      // eslint-disable-next-line ngrx/avoid-cyclic-effects
      switchMap(() => this.actions$.pipe(ofType(ShipmentDetailsActions.loadShipmentSuccess), take(1))),
      concatLatestFrom(() => this.store$.select(fromShipmentDetails.selectMessages)),
      switchMap(([, messages]) => {
        const messageMatches = window.location.hash.match(/^#message\/(.*)$/);
        const taskMessageMatches = window.location.hash.match(/^#taskmessage\/(.*)$/);

        if (!messageMatches && !taskMessageMatches) {
          return EMPTY;
        }

        const [, messageId] = messageMatches || taskMessageMatches;
        const isTaskMessage = !!(!messageMatches && taskMessageMatches);

        const message = messages.find((item) => item.id === messageId);
        if (!message) {
          return EMPTY;
        }

        return of([message, isTaskMessage]);
      }),
      observeOn(asyncScheduler),
      // @ts-ignore
      switchMap((data) => {
        const [message, isTaskMessage] = data as [MessageEnvelopeMessageVM, boolean];
        if (message.type === MessageThreadType.Case) {
          return of(ShipmentDetailsActions.openMessage({ id: message.id, messageType: MessageThreadType.Case }));
        } else if (MessageThreadType.Task) {
          return of(
            ShipmentDetailsActions.openMessage({ id: message.id, messageType: MessageThreadType.Task, openRelatedTask: isTaskMessage })
          );
        }
      })
    );
  });

  public openTaskDeeplink$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentDetailsActions.enter),
      map(() => window.location.hash.match(/^#task\/(.*)$/)),
      observeOn(asyncScheduler),
      switchMap((matches) => {
        if (!matches) {
          return EMPTY;
        }

        return of(ShipmentDetailsActions.openTask({ taskId: matches[1] }));
      })
    );
  });

  public payInvoice$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ShipmentDetailsActions.payInvoice),
        concatLatestFrom(() => this.store$.select(fromShipmentDetails.selectShipmentDetailsShipment)),
        tap(([{ invoice }, shipment]) => {
          if (isNil(invoice.stripeUrl)) {
            this.invoiceDialogService.open({
              id: invoice.id,
              type: invoice.type,
              name: invoice.id,
              orderId: shipment.id,
              amount: invoice.price,
              dueDate: new Date(invoice.dueDate),
              stripeUrl: invoice.stripeUrl,
              needsPayment: true,
              status: invoice.status,
            });
          } else {
            this.paymentService.payInvoice({ invoiceId: invoice.id, stripeUrl: invoice.stripeUrl });
          }
        })
      );
    },
    { dispatch: false }
  );

  public downloadDocument$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ShipmentDetailsActions.downloadDocument),
        concatLatestFrom(() => this.authService.getUser$()),
        switchMap(([{ id }, user]) =>
          this.loadingIndicatorService
            .withFullscreen$(
              this.documentsDataService.getPublicPDFUrl({
                Accesstoken: user.accessToken,
                recordId: id,
              })
            )
            .pipe(
              tap((response) => {
                if (isNil(response?.Success?.PdfDownloadUrl)) {
                  throw new Error('Empty response while trying to get document URL');
                }

                window.location.href = response.Success.PdfDownloadUrl;
              }),
              catchError((error) => {
                this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_DOWNLOAD_DOCUMENT');
                return EMPTY;
              })
            )
        )
      );
    },
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly router: Router,
    private readonly store$: Store<fromShipmentDetails.AppState & fromCountry.AppState>,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly authService: AuthService,
    private readonly translateService: TranslateService,
    private readonly shipmentOrderDataService: ShipmentOrderDataService,
    private readonly profileDataService: ProfileDataService,
    private readonly casesDataService: CasesDataService,
    private readonly teamMemberService: TeamMemberService,
    private readonly loadingIndicatorService: LoadingIndicatorService,
    private readonly quoteDataService: QuoteDataService,
    private readonly addressService: AddressService,
    private readonly tasksService: TasksService,
    private readonly caseMessageDialogService: CaseMessageDialogService,
    private readonly taskMessageDialogService: TasksMessageDialogService,
    private readonly invoiceDataService: InvoiceDataService,
    private readonly invoiceDialogService: InvoiceDialogService,
    private readonly dialogService: DialogService,
    private readonly packageService: PackageService,
    private readonly paymentService: PaymentService,
    private readonly documentsDataService: DocumentsDataService,
    private readonly updateQuoteService: UpdateQuoteService,
    private readonly sendbirdService: SendbirdService
  ) {}
}
