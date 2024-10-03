import { Injectable } from '@angular/core';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import * as fromCountry from '@modules/country/reducers';
import { ShipmentListSideFilterDialogService } from '@modules/shipments/components/shipment-list-side-filter-dialog/shipment-list-side-filter-dialog.service.ts.service';
import { mapShipmentListResponse } from '@modules/shipments/helpers/map-shipment-list-response.helper';
import { selectShipmentListAdvancedFilters } from '@modules/shipments/pages/shipments-list-page/shipments-list-page.selector';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { InvoiceDataService, ShipmentOrderDataService } from '@CitT/data';
import { EMPTY, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as CountryActions from '../../country/actions/country.actions';
import * as ShipmentListActions from '../actions/shipment-list.actions';
import * as fromShipment from '../reducers';

@Injectable()
export class ShipmentListEffects {
  public enter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentListActions.enter),
      switchMap(() => of(ShipmentListActions.load(), CountryActions.getDestination()))
    );
  });

  public load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentListActions.enter),
      switchMap(() => this.authService.getUser$()),
      switchMap((user) =>
        forkJoin([
          this.shipmentOrderDataService.getShipmentOrders({
            Accesstoken: user.accessToken,
            AccountID: user.accountId,
            ContactID: user.contactId,
          }),
          this.invoiceDataService.getInvoices({ AccountID: user.accountId, Accesstoken: user.accessToken }),
        ]).pipe(
          map(([shipmentOrders, invoices]) => mapShipmentListResponse(shipmentOrders, invoices)),
          map((items) => ShipmentListActions.loadSuccess({ items })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_SHIPMENT_LIST');

            return of(ShipmentListActions.loadError({ error: error.message }));
          })
        )
      )
    );
  });

  public openAdvancedFilters$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShipmentListActions.openAdvancedFilters),
      concatLatestFrom(() => [
        this.store$.select(selectShipmentListAdvancedFilters),
        this.store$.select(fromCountry.selectDestinationCountriesInputData),
      ]),
      switchMap(([, advancedFilters, countries]) =>
        this.shipmentListSideFilterDialogService.open(advancedFilters, countries).afterClosed$()
      ),
      switchMap((advancedFilters) => {
        if (!advancedFilters) {
          return EMPTY;
        }

        return of(ShipmentListActions.setAdvancedFilters({ advancedFilters }));
      })
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly shipmentOrderDataService: ShipmentOrderDataService,
    private readonly invoiceDataService: InvoiceDataService,
    private readonly shipmentListSideFilterDialogService: ShipmentListSideFilterDialogService,
    private readonly store$: Store<fromShipment.AppState & fromCountry.AppState>
  ) {}
}
