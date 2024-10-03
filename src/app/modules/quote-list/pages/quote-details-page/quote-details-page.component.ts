import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrencyCode } from '@global/enums/currency-code.enum';
import { QuoteState } from '@global/enums/quote-list/quote-state.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { calculateDaysFromNow } from '@global/helpers/calculate-days-from-now.helper';
import { ActivateAccountService } from '@global/modules/activate-account/activate-account.service';
import { MessageEnvelopeMessageVM } from '@global/modules/message-envelope/message.vm';
import { OnboardingService, OnboardingStatus } from '@global/services/onboarding.service';
import * as fromCountry from '@modules/country/reducers';
import { QuoteListRouteParam } from '@modules/quote-list/enums/quote-list-route-param.enum';
import { QuoteDetailsQuote } from '@modules/quote-list/interfaces/quote.interface';
import { QuoteDetailsPageVM } from '@modules/quote-list/pages/quote-details-page/quote-details-page.vm';
import { FormControl } from '@ngneat/reactive-forms';
import { Store } from '@ngrx/store';
import * as fromCountryValidation from '@shared/modules/country-validation/reducers';
import { ClientVettingStatus, OrderType, ServiceType } from '@CitT/data';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
import * as QuoteDetailsActions from '../../actions/quote-details.actions';
import * as fromQuoteDetails from '../../reducers';
import { QuoteDetailsPageService } from './quote-details-page.service';

@Component({
  selector: 'app-quote-details-page',
  templateUrl: './quote-details-page.component.html',
  styleUrls: ['./quote-details-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QuoteDetailsPageService],
})
export class QuoteDetailsPageComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  public readonly QuoteState = QuoteState;
  public readonly OrderType = OrderType;

  public readonly vm$: Observable<QuoteDetailsPageVM> = this.quoteDetailsPageService.getVM$();

  public currency = CurrencyCode.USD;
  public isNoteInEdit = false;

  public noteControl = new FormControl('');
  public clientControl = new FormControl('');

  public readonly RouteSegment = RouteSegment;
  public readonly ClientVettingStatus = ClientVettingStatus;
  public isOnboarding = false;
  public isOnBoardingVisible = this.onboardingService.isOnboardingVisible$.pipe(
    tap((isOnboardingVisible) => {
      this.isOnboarding = isOnboardingVisible;
      this.cdr.detectChanges();
    })
  );
  public onboardingStatus$: Observable<OnboardingStatus> = this.onboardingService.currentOnboardingStatus$;
  public referralProgramLink = 'https://dash.partnerstack.com/application?company=cb&group=affiliate';

  constructor(
    private readonly store$: Store<fromQuoteDetails.AppState & fromCountry.AppState & fromCountryValidation.AppState>,
    private readonly activatedRoute: ActivatedRoute,
    private readonly activateAccountService: ActivateAccountService,
    private readonly quoteDetailsPageService: QuoteDetailsPageService,
    private readonly onboardingService: OnboardingService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.onboardingService.refreshOnboardingStatus();
  }

  public ngOnInit(): void {
    this.store$.dispatch(QuoteDetailsActions.enter());

    this.activatedRoute.params.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      const quoteId = params[QuoteListRouteParam.QuoteId];

      this.store$.dispatch(QuoteDetailsActions.loadNewQuote({ quoteId }));
    });

    this.vm$
      .pipe(
        map((vm) => vm.owner),
        distinctUntilChanged()
      )
      .subscribe((owner) => this.clientControl.setValue(owner, { emitEvent: false }));

    this.clientControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((newClient) => {
      this.store$.dispatch(QuoteDetailsActions.changeOwner({ owner: newClient }));
    });
  }

  public ngOnDestroy(): void {
    this.store$.dispatch(QuoteDetailsActions.leave());

    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public get quoteListRouterLink(): RouteSegment[] {
    return [RouteSegment.Root, RouteSegment.QuoteList];
  }

  public showCostRanges(quote: QuoteDetailsQuote): boolean {
    return quote.lineItems.length === 0 && quote.serviceType !== ServiceType.EOR && quote.costs.estimatedTaxDutyCost !== 0;
  }

  public remainingDays(quote: QuoteDetailsQuote): number {
    return calculateDaysFromNow(new Date(quote.expiryDate));
  }

  public onAcceptClick(quote: QuoteDetailsQuote): void {
    this.store$.dispatch(QuoteDetailsActions.acceptQuote({ quoteId: quote.id }));
  }

  public onMessageClick(quote: QuoteDetailsQuote): void {
    this.store$.dispatch(QuoteDetailsActions.sendQuoteEmail({ quoteId: quote.id }));
  }

  public onMessageManager(): void {
    this.store$.dispatch(QuoteDetailsActions.createMessage());
  }

  public onMessageEnvelopeClick(message: MessageEnvelopeMessageVM): void {
    this.store$.dispatch(QuoteDetailsActions.openMessage({ messageId: message.id }));
    this.vm$.pipe(
      map((data) => {
        data.quote.messages.find((e) => e.id === message.id).isUnread = false;
      })
    );
    this.cdr.markForCheck();
  }

  public onDownloadClick(quote: QuoteDetailsQuote): void {
    this.store$.dispatch(QuoteDetailsActions.downloadQuote({ quoteId: quote.id }));
  }

  public onNoteEditClick(quote: QuoteDetailsQuote): void {
    this.noteControl.setValue(quote.clientNote);
    this.isNoteInEdit = true;
  }

  public onCancelNoteEdit(): void {
    this.isNoteInEdit = false;
  }
  public onSaveNote(quote: QuoteDetailsQuote): void {
    this.isNoteInEdit = false;
    this.store$.dispatch(QuoteDetailsActions.saveNote({ note: this.noteControl.value, id: quote.id }));
  }

  public onAddPackages(quote: QuoteDetailsQuote): void {
    this.store$.dispatch(QuoteDetailsActions.editPackages({ quote }));
  }

  public onAddVatRegistrationClick(): void {
    this.store$.dispatch(QuoteDetailsActions.addLocalVatRegistration());
  }

  public onReuseDataClick(quote: QuoteDetailsQuote): void {
    this.store$.dispatch(QuoteDetailsActions.reuseQuote({ id: quote.id }));
  }

  public onCancelOrderClick(quote: QuoteDetailsQuote): void {
    this.store$.dispatch(QuoteDetailsActions.cancelQuote({ id: quote.id }));
  }

  public onChangeShipmentMethod(): void {
    this.store$.dispatch(QuoteDetailsActions.changeShipmentMethod());
  }

  public onOpenAccountActivationModal(): void {
    this.activateAccountService.openVerifyAccountModal$().pipe(takeUntil(this.destroyed$)).subscribe();
  }

  public isQuoteAcceptanceDisabled(vm: QuoteDetailsPageVM): boolean {
    return (vm.isVatRegistrationRequired && !vm.localVatRegistration) || this.isOnboarding;
  }

  public onLiabilityCoverFeeToggle(data: { isEnabled: boolean; quoteId: string }): void {
    this.store$.dispatch(QuoteDetailsActions.toggleLiabilityCoverFee(data));
  }
}
