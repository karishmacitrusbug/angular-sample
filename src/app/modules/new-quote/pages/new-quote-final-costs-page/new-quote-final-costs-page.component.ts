import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { User } from '@global/interfaces/user.interface';
import { ActivateAccountService } from '@global/modules/activate-account/activate-account.service';
import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { ToastMessageService } from '@global/modules/toast-message/toast-message.service';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { OnboardingService, OnboardingStatus } from '@global/services/onboarding.service';
import { NewQuoteFinalCostsPageVM } from '@modules/new-quote/pages/new-quote-final-costs-page/new-quote-final-costs-page.vm';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyCode } from '@CitT/data';
import { Observable, Subject } from 'rxjs';
import { first, takeUntil, tap } from 'rxjs/operators';
import * as NewQuoteFinalCostsActions from '../../actions/new-quote-final-costs.actions';
import * as NewQuoteActions from '../../actions/new-quote.actions';
import * as fromNewQuote from '../../reducers/index';
import { NewQuoteFinalCostsPageService } from './new-quote-final-costs-page.service';

@Component({
  selector: 'app-new-quote-final-costs-page',
  templateUrl: './new-quote-final-costs-page.component.html',
  styleUrls: ['./new-quote-final-costs-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NewQuoteFinalCostsPageService],
})
export class NewQuoteFinalCostsPageComponent implements OnInit, OnDestroy {
  public readonly FinalCostsState = FinalCostsState;
  public readonly CurrencyCode = CurrencyCode;
  public readonly RouteSegment = RouteSegment;
  public vm$ = this.newQuoteFinalCostsPageService.getVM$();
  public user: User;

  public isOnboardingVisible = this.onboardingService.isOnboardingVisible$.pipe(
    tap((isOnboardingVisible) => {
      this.isOnboarding = isOnboardingVisible;
      this.cdr.detectChanges();
    })
  );
  public onboardingStatus$: Observable<OnboardingStatus> = this.onboardingService.currentOnboardingStatus$;
  public isOnboarding = false;

  private readonly destroyed$ = new Subject<void>();

  public referralProgramLink = 'https://dash.partnerstack.com/application?company=cb&group=affiliate';

  constructor(
    private readonly store$: Store<fromNewQuote.AppState>,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly newQuoteFinalCostsPageService: NewQuoteFinalCostsPageService,
    private readonly translateService: TranslateService,
    private readonly toastMessageService: ToastMessageService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly activateAccountService: ActivateAccountService,
    private readonly onboardingService: OnboardingService
  ) {}

  public ngOnInit(): void {
    this.store$.dispatch(NewQuoteFinalCostsActions.enter());

    this.authService
      .getUser$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((user) => {
        this.user = user;
        this.cdr.markForCheck();
      });
  }

  public ngOnDestroy(): void {
    this.store$.dispatch(NewQuoteFinalCostsActions.leave());
  }

  public onReuseDataClick(): void {
    this.store$
      .select(fromNewQuote.selectShipmentOrderId)
      .pipe(first())
      .subscribe((id) => {
        this.store$.dispatch(NewQuoteActions.reuseQuote({ id }));
      });
  }

  public onCancelOrderClick(): void {
    this.store$.dispatch(NewQuoteFinalCostsActions.cancelQuote());
  }

  public onAddPackages(): void {
    this.store$.dispatch(NewQuoteFinalCostsActions.addPackages());
  }

  public onSendEmailClick(): void {
    this.newQuoteFinalCostsPageService
      .sendFinalCostsEmail$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () => this.toastMessageService.open(this.translateService.instant('NEW_QUOTE.FINAL_COSTS.EMAIL_SENT_SUCCESSFULLY')),
        (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SEND_FINAL_COSTS_EMAIL')
      );
  }

  public onDownloadClick(): void {
    this.store$.dispatch(NewQuoteFinalCostsActions.downloadCostEstimate());
  }

  public onChangeShipmentMethod(): void {
    this.store$.dispatch(NewQuoteFinalCostsActions.changeShipmentMethod());
  }

  public onOpenAccountActivationModal(): void {
    this.activateAccountService.openVerifyAccountModal$().pipe(takeUntil(this.destroyed$)).subscribe();
  }

  public onAddLocalVatRegistrationClick(): void {
    this.store$.dispatch(NewQuoteActions.addLocalVatRegistration());
  }

  public isQuoteAcceptanceDisabled(vm: NewQuoteFinalCostsPageVM): boolean {
    return (vm.isVatRegistrationRequired && !vm.hasLocalVatRegistration) || !this.user.isVetted;
  }

  public onAcceptQuoteClick(): void {
    this.store$.dispatch(NewQuoteFinalCostsActions.acceptQuote());
  }

  public onLiabilityCoverFeeToggle(isEnabled: boolean): void {
    this.store$.dispatch(NewQuoteFinalCostsActions.toggleLiabilityCoverFee({ isEnabled }));
  }
}
