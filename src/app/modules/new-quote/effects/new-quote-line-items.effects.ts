import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { ServiceType } from '@global/enums/service-type.enum';
import { CountryValidationService } from '@global/modules/common-country-validation/services/country-validation.service';
import { QuoteLineItemsDialogType } from '@global/modules/common-quote/components/quote-line-items-dialog/quote-line-items-dialog-type.enum';
import { QuoteLineItemsDialogService } from '@global/modules/common-quote/components/quote-line-items-dialog/quote-line-items-dialog.service';
import { TaxCalculationDialogService } from '@global/modules/common-quote/components/tax-calculation-dialog/tax-calculation-dialog.service';
import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { LineItemsService } from '@global/modules/common-quote/services/line-items.service';
import { DialogRef } from '@global/modules/dialog/dialog-ref';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import * as fromCountryValidation from '@shared/modules/country-validation/reducers';
import isEmpty from 'lodash/isEmpty';
import { of } from 'rxjs';
import { catchError, filter, finalize, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import * as NewQuoteBasicsActions from '../actions/new-quote-basics.actions';
import * as NewQuoteFinalCostsActions from '../actions/new-quote-final-costs.actions';
import * as NewQuoteLineItemsActions from '../actions/new-quote-line-items.actions';
import { NewQuoteRouteSegment } from '../enums/new-quote-route-segment.enum';
import * as fromNewQuote from '../reducers';

@Injectable()
export class NewQuoteLineItemsEffects {
  public submit$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteLineItemsActions.submit),
      concatLatestFrom(() => [
        this.store$.select(fromNewQuote.selectNewQuoteBasicsState),
        this.authService.getUser$(),
        this.store$.select(fromCountryValidation.selectCountryValidationRulesData),
      ]),
      switchMap(([{ lineItems, currency, hasStoreFees }, basics, user, validationRules]) => {
        const serviceTypeNotes = this.countryValidationService.getCbNotes(validationRules, [basics.values.data.to]);
        return this.lineItemsService
          .saveLineItems$(
            {
              shipmentOrderIds: [basics.id],
              lineItems,
              user,
              valuationMethod: basics.values.data.valuationMethod,
              currency,
              hasStoreFees,
            },
            serviceTypeNotes
          )
          .pipe(
            switchMap(() =>
              of(NewQuoteLineItemsActions.submitSuccess({ lineItems, currency, hasStoreFees }), NewQuoteBasicsActions.loadUpdate())
            ),
            catchError((error) => {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_ADD_LINE_ITEMS');
              return of(NewQuoteLineItemsActions.submitError({ error: error.message }));
            })
          );
      })
    );
  });

  public submitSkipSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(NewQuoteLineItemsActions.submitSuccess),
        tap(() => {
          this.router.navigate([RouteSegment.NewQuote, NewQuoteRouteSegment.ShipmentMethod]);
        })
      );
    },
    { dispatch: false }
  );

  public edit$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteLineItemsActions.edit),
      concatLatestFrom(() => [
        this.store$.select(fromNewQuote.selectNewQuoteLineItemsState),
        this.store$.select(fromNewQuote.selectNewQuoteBasicsState),
        this.store$.select(fromCountryValidation.selectCountryValidationRulesData),
      ]),
      switchMap(([, { lineItems, currency, hasStoreFees }, basics, validationRules]) =>
        this.quoteLineItemsDialogService
          .open({
            type: QuoteLineItemsDialogType.Edit,
            lineItems,
            currency,
            hasStoreFees,
            validationRules,
            from: basics.values.data.from,
            to: [basics.values.data.to],
            serviceType: ServiceType.IOR,
          })
          .afterClosed$()
      ),
      filter((dialogResult) => !isEmpty(dialogResult.lineItems)),
      concatLatestFrom(() => [
        this.store$.select(fromNewQuote.selectNewQuoteBasicsState),
        this.authService.getUser$(),
        this.store$.select(fromCountryValidation.selectCountryValidationRulesData),
      ]),
      switchMap(([{ lineItems, customCurrency, hasStoreFees }, basics, user, validationRules]) => {
        const serviceTypeNotes = this.countryValidationService.getCbNotes(validationRules, [basics.values.data.to]);

        const dialogRef: DialogRef = this.taxCalculationDialogService.open(serviceTypeNotes);

        return this.lineItemsService
          .editLineItems$(
            {
              shipmentOrderIds: [basics.id],
              lineItems,
              user,
              valuationMethod: basics.values.data.valuationMethod,
              currency: customCurrency,
              hasStoreFees,
            },
            serviceTypeNotes
          )
          .pipe(
            finalize(() => dialogRef.close()),
            withLatestFrom(this.store$.select(fromNewQuote.selectNewQuoteFinalCostsState)),
            switchMap(([savedLineItems, { state: finalCostsState }]) => {
              const actions: Action[] = [
                NewQuoteLineItemsActions.editSuccess({
                  lineItems: savedLineItems,
                  currency: customCurrency,
                  hasStoreFees,
                }),
              ];
              if (finalCostsState !== FinalCostsState.NotCompleted) {
                actions.push(NewQuoteFinalCostsActions.loadFinalCosts());
              }
              return of(...actions);
            }),
            catchError((error) => {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_UPDATE_LINE_ITEMS');
              return of(NewQuoteLineItemsActions.editError({ error: error.message }));
            })
          );
      })
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<fromNewQuote.AppState & fromCountryValidation.AppState>,
    private readonly router: Router,
    private readonly quoteLineItemsDialogService: QuoteLineItemsDialogService,
    private readonly lineItemsService: LineItemsService,
    private readonly authService: AuthService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly countryValidationService: CountryValidationService,
    private readonly taxCalculationDialogService: TaxCalculationDialogService
  ) {}
}
