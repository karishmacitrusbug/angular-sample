import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { User } from '@global/interfaces/user.interface';
import { ActivateAccountService } from '@global/modules/activate-account/activate-account.service';
import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { LineItemsState } from '@global/modules/common-quote/enums/line-items-state.enum';
import { MessageButtonUserVM as UserVM } from '@global/modules/message-button/user.vm';
import { AuthService } from '@global/services/auth.service';
import { OnboardingService, OnboardingStatus } from '@global/services/onboarding.service';
import { TeamMemberService } from '@global/services/team-member.service';
import { NewQuoteRouteSegment } from '@modules/new-quote/enums/new-quote-route-segment.enum';
import { ShipmentMethodState } from '@modules/new-quote/enums/shipment-method-state.enum';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import * as NewQuoteFinalCostsActions from '../../actions/new-quote-final-costs.actions';
import * as NewQuoteActions from '../../actions/new-quote.actions';
import * as fromNewQuote from '../../reducers';
import { NewQuotePageService } from './new-quote-page.service';
import { NewQuotePageVM } from './new-quote-page.vm';

@Component({
  templateUrl: './new-quote-page.component.html',
  styleUrls: ['./new-quote-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NewQuotePageService],
})
export class NewQuotePageComponent implements OnDestroy {
  public teamMember: UserVM;
  public user: User;
  public readonly RouteSegment = RouteSegment;

  public readonly vm$ = this.newQuotePageService.getVM$();
  public readonly to$: Observable<string>;
  public readonly headerMessage$: Observable<string>;

  private readonly destroyed$ = new Subject<void>();

  public isOnboardingVisible = this.onboardingService.isOnboardingVisible$.pipe(
    tap((isOnboardingVisible) => {
      this.isOnboarding = isOnboardingVisible;
      this.cdr.detectChanges();
    })
  );
  public onboardingStatus$: Observable<OnboardingStatus> = this.onboardingService.currentOnboardingStatus$;
  public isOnboarding = false;

  constructor(
    private readonly store$: Store<fromNewQuote.AppState>,
    private readonly translateService: TranslateService,
    private readonly teamMemberService: TeamMemberService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly newQuotePageService: NewQuotePageService,
    private readonly activateAccountService: ActivateAccountService,
    private readonly router: Router,
    private readonly onboardingService: OnboardingService
  ) {
    this.onboardingService.refreshOnboardingStatus();
    this.to$ = this.vm$.pipe(
      switchMap(({ to }) => {
        if (to.length === 1) {
          return of(to);
        }

        return this.translateService.get('COMMON.N_COUNTRIES', { n: to.length });
      })
    );

    this.headerMessage$ = this.vm$.pipe(
      map(({ lineItemsState, shipmentMethodState, finalCostsState }) => {
        if (lineItemsState === LineItemsState.NotCompleted) {
          return 'NEW_QUOTE.HEADER_BASICS';
        } else if (shipmentMethodState === ShipmentMethodState.NotCompleted) {
          return 'NEW_QUOTE.HEADER_LINE_ITEMS';
        } else if (finalCostsState === FinalCostsState.NotCompleted) {
          return 'NEW_QUOTE.HEADER_SHIPMENT_METHOD';
        } else {
          return 'NEW_QUOTE.HEADER_QUOTE_IS_READY';
        }
      })
    );

    this.teamMemberService
      .getDefaultTeamMember$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((teamMember) => {
        this.teamMember = teamMember;
        this.cdr.markForCheck();
      });

    this.authService
      .getUser$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((user) => {
        this.user = user;
        this.cdr.markForCheck();
      });
  }

  public isQuoteAcceptanceDisabled(vm: NewQuotePageVM): boolean {
    return (vm.isVatRegistrationRequired && !vm.hasLocalVatRegistration) || this.isOnboarding;
  }

  public onOpenAccountActivationModal(): void {
    this.activateAccountService.openVerifyAccountModal$().pipe(takeUntil(this.destroyed$)).subscribe();
  }

  public onAcceptQuoteClick(): void {
    this.store$.dispatch(NewQuoteFinalCostsActions.acceptQuote());
  }

  public onAddLocalVatRegistrationClick(): void {
    this.store$.dispatch(NewQuoteActions.addLocalVatRegistration());
  }

  public ngOnDestroy(): void {
    this.store$.dispatch(NewQuoteActions.leave());

    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public onMessageClick(shipmentDetails?: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    shipmentDetails
      ? this.store$.dispatch(
          NewQuoteActions.newMessage({ teamMember: this.teamMember, omitSOId: this.isLineItemsPage, shipmentDetail: shipmentDetails })
        )
      : this.store$.dispatch(NewQuoteActions.newMessage({ teamMember: this.teamMember, omitSOId: this.isLineItemsPage }));
  }

  private get isLineItemsPage(): boolean {
    const urlSegments = this.router.url.split('/');
    return urlSegments[urlSegments.length - 1] === NewQuoteRouteSegment.LineItems.toString();
  }
}
