import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NewQuoteQueryParam } from '@global/enums/new-quote/new-quote-query-param.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { mapQuoteAcceptDialogShipmentList } from '@global/modules/common-quote/helpers/map-quote-accept-dialog-shipment-list.helper';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import * as CountryActions from '@modules/country/actions/country.actions';
import { mapQuoteList } from '@modules/quote-list/helpers/map-quote-list.helper';
import { QuoteAcceptDialogService } from '@modules/quote/components/quote-accept-dialog/quote-accept-dialog.service';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { mapVatRegistration } from '@shared/helpers/map-vat-registration.helper';
import { QuoteDataService, ShipmentOrderDataService, VatRegistrationDataService } from '@CitT/data';
import { EMPTY, forkJoin, of } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, tap } from 'rxjs/operators';
import * as fromCountries from '../../country/reducers/index';
import * as QuoteListActions from '../actions/quote-list.actions';
import * as fromQuoteList from '../reducers/index';

@Injectable()
export class QuoteListEffects {
  public enter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteListActions.enter),
      switchMap(() => of(QuoteListActions.load(), CountryActions.getDestination(), CountryActions.getAll()))
    );
  });

  public load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteListActions.load),
      switchMap(() => this.store$.select(fromCountries.selectDestinationCountriesData)),
      filter((c) => !!c?.length),
      concatLatestFrom(() => this.authService.getUser$()),
      switchMap(([destinationCountries, user]) =>
        forkJoin([
          this.shipmentOrderDataService.getShipmentOrders({
            Accesstoken: user.accessToken,
            AccountID: user.accountId,
            ContactID: user.contactId,
          }),
          this.vatRegistrationDataService.getRegistration({ Accesstoken: user.accessToken, AccountID: user.accountId }).pipe(
            map((res) => res.map((element) => mapVatRegistration(element))),
            catchError((error: HttpErrorResponse) => {
              if (error.status !== HttpStatusCode.BadRequest) {
                this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_LOCAL_VAT_REGISTRATION_LIST');
              }
              return of([]);
            })
          ),
          of(destinationCountries),
        ]).pipe(
          map(([res, vatRegistrations, countries]) => mapQuoteList(res, vatRegistrations, countries)),
          map((quotes) => QuoteListActions.loadSuccess({ data: quotes })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_QUOTE_LIST');
            return of(QuoteListActions.loadError({ error: error.message }));
          })
        )
      )
    );
  });

  public reuseQuote$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(QuoteListActions.reuseQuote),
        tap(({ id }) =>
          this.router.navigate([RouteSegment.Root, RouteSegment.NewQuote], {
            queryParams: { [NewQuoteQueryParam.QuoteIdToReuse]: id },
          })
        )
      );
    },
    { dispatch: false }
  );

  public accept$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QuoteListActions.accept),
      concatLatestFrom(() => this.authService.getUser$()),
      tap(() => this.loadingIndicatorService.open()),
      switchMap(([{ ids }, user]) =>
        this.quoteDataService
          .acceptQuote({
            Accesstoken: user.accessToken,
            AccountID: user.accountId,
            SO: ids.map((id) => ({ SOID: id })),
          })
          .pipe(
            switchMap(() =>
              this.shipmentOrderDataService.getShipmentOrders({
                Accesstoken: user.accessToken,
                AccountID: user.accountId,
                ContactID: user.contactId,
              })
            ),
            finalize(() => this.loadingIndicatorService.dispose()),
            switchMap((shipmentOrders) => {
              const shipments = mapQuoteAcceptDialogShipmentList(shipmentOrders.filter((shipmentOrder) => ids.includes(shipmentOrder.Id)));
              return this.quoteAcceptDialogService
                .open(shipments, 'QUOTE_LIST.ACCEPT_QUOTES_DIALOG.BACK_TO_QUOTE_LIST')
                .afterClosed$()
                .pipe(
                  switchMap((result) => {
                    if (result === true) {
                      this.router.navigate([RouteSegment.Root, RouteSegment.ShipmentsList, shipments[0].quoteId]);
                      return EMPTY;
                    }
                    return of(QuoteListActions.load());
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
  });

  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly shipmentOrderDataService: ShipmentOrderDataService,
    private readonly quoteDataService: QuoteDataService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly vatRegistrationDataService: VatRegistrationDataService,
    private readonly loadingIndicatorService: LoadingIndicatorService,
    private readonly quoteAcceptDialogService: QuoteAcceptDialogService,
    private readonly store$: Store<fromQuoteList.AppState & fromCountries.AppState>
  ) {}
}
