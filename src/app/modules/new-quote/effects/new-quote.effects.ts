import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NewQuoteQueryParam } from '@global/enums/new-quote/new-quote-query-param.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { CountryHelper } from '@global/helpers/country.helper';
import { CaseMessageDialogService } from '@global/modules/message-dialog/services/case-message-dialog.service';
import { LocalVatRegistrationService } from '@modules/local-vat-registration/services/local-vat-registration.service';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { CaseSource } from '@CitT/data';
import isNil from 'lodash/isNil';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromCountry from '../../country/reducers';
import * as NewQuoteActions from '../actions/new-quote.actions';
import * as fromNewQuote from '../reducers';

@Injectable()
export class NewQuoteEffects {
  public sendMessage$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(NewQuoteActions.newMessage),
        concatLatestFrom(() => this.store$.select(fromNewQuote.selectNewQuoteBasicsState)),
        switchMap(([{ teamMember, omitSOId, shipmentDetail }, { id, quoteReference }]) => {
          const source =
            isNil(id) || omitSOId
              ? undefined
              : {
                  recordId: id,
                  type: CaseSource.NCP_ORDER,
                };

          // const shipment =
          //   isNil(id) || omitSOId
          //     ? undefined
          //     : {
          //         id,
          //         reference: '',
          //         title: quoteReference,
          //       };

          const shipment = isNil(id)
            ? undefined
            : {
                id,
                reference: shipmentDetail && shipmentDetail.clientReferenceValues ? shipmentDetail.clientReferenceValues : '',
                title: quoteReference,
              };

          return this.caseMessageDialogService
            .open({
              messageTo: teamMember,
              source,
              shipment,
            })
            .afterClosed$();
        })
      );
    },
    { dispatch: false }
  );

  public reuseQuote$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(NewQuoteActions.reuseQuote),
        tap(({ id }) =>
          // we don't need to worry about rollouts as they are handled on a different screen
          this.router.navigate([RouteSegment.Root, RouteSegment.NewQuote], {
            queryParams: { [NewQuoteQueryParam.QuoteIdToReuse]: id },
          })
        )
      );
    },
    { dispatch: false }
  );

  public addLocalVatRegistration$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(NewQuoteActions.addLocalVatRegistration),
      concatLatestFrom(() => [
        this.store$.select(fromNewQuote.selectNewQuoteBasicsState),
        this.store$.select(fromCountry.selectAllCountriesData),
        this.store$.select(fromCountry.selectDestinationCountriesData),
      ]),
      switchMap(([, basics, allCountries, destinationCountries]) =>
        this.localVatRegistrationService
          .createThroughDialog$(
            basics.values.data.to,
            CountryHelper.mapToInputDataVM(allCountries),
            CountryHelper.mapToInputDataVM(destinationCountries)
          )
          .pipe(
            map(() => NewQuoteActions.addLocalVatRegistrationSuccess()),
            catchError(() => of(NewQuoteActions.addLocalVatRegistrationError()))
          )
      )
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly caseMessageDialogService: CaseMessageDialogService,
    private readonly store$: Store<fromNewQuote.AppState & fromCountry.AppState>,
    private readonly router: Router,
    private readonly localVatRegistrationService: LocalVatRegistrationService
  ) {}
}
