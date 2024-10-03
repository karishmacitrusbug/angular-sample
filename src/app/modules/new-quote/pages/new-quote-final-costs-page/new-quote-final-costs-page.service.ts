import { Injectable } from '@angular/core';
import { LengthUnit } from '@global/enums/length-unit.enum';
import { WeightUnit } from '@global/enums/weight-unit.enum';
import { calculateDaysFromNow } from '@global/helpers/calculate-days-from-now.helper';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { AuthService } from '@global/services/auth.service';
import { Store } from '@ngrx/store';
import { QuoteDataService } from '@CitT/data';
import { combineLatest, Observable } from 'rxjs';
import { finalize, map, mapTo, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import * as fromNewQuote from '../../reducers/index';
import { NewQuotePageService } from '../new-quote-page/new-quote-page.service';
import { NewQuoteFinalCostsPageVM } from './new-quote-final-costs-page.vm';

@Injectable()
export class NewQuoteFinalCostsPageService {
  constructor(
    private readonly store$: Store<fromNewQuote.AppState>,
    private readonly newQuotePageService: NewQuotePageService,
    private readonly authService: AuthService,
    private readonly loadingIndicatorService: LoadingIndicatorService,
    private readonly quoteDataService: QuoteDataService
  ) {}

  public getVM$(): Observable<NewQuoteFinalCostsPageVM> {
    return combineLatest([
      this.store$.select(fromNewQuote.selectNewQuoteBasicsState),
      this.store$.select(fromNewQuote.selectNewQuoteFinalCostsState),
      this.newQuotePageService.hasLocalVatRegistration$(),
      this.newQuotePageService.isVatRegistrationRequired$(),
    ]).pipe(
      map(([{ quoteReference, values }, { finalCosts, state }, hasLocalVatRegistration, isVatRegistrationRequired]) => ({
        quoteReference,
        state,
        hasPackages: values.data?.packages?.length !== 0,
        chargeableWeight: values.data?.estimatedWeight || 0,
        weightUnit: values.data?.estimatedWeightUnit || WeightUnit.Kg,
        lengthUnit: values.data?.lengthUnit || LengthUnit.Cm,
        isLoading: finalCosts.isLoading,
        costs: {
          ...finalCosts.data?.costs,
        },
        timeline: finalCosts.data?.timeline,
        shippingNotes: finalCosts.data?.shippingNotes,
        serviceType: finalCosts.data?.serviceType,
        shipmentValue: finalCosts.data?.shipmentValue,
        etaDisclaimer: finalCosts.data?.etaDisclaimer,
        reasonForProForma: finalCosts.data?.reasonForProForma,
        expirationDays: calculateDaysFromNow(new Date(finalCosts.data?.expiryDate)),
        hasLocalVatRegistration,
        isVatRegistrationRequired,
        liabilityCoverFeeEnabled: finalCosts.data?.liabilityCoverFeeEnabled,
      }))
    );
  }

  public sendFinalCostsEmail$(): Observable<void> {
    return this.authService.getUser$().pipe(
      tap(() => this.loadingIndicatorService.open()),
      withLatestFrom(this.store$.select(fromNewQuote.selectNewQuoteBasicsState)),
      switchMap(([user, basics]) =>
        this.quoteDataService
          .sendFinalQuoteEmail({
            Accesstoken: user.accessToken,
            ID: basics.id,
            Email_Estimate_to: user.email,
            request_EmailEstimate: true,
          })
          .pipe(
            mapTo(undefined),
            finalize(() => this.loadingIndicatorService.dispose())
          )
      )
    );
  }
}
