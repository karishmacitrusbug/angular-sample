import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteState } from '@global/enums/quote-list/quote-state.enum';
import { SortingDirection } from '@global/enums/sorting-direction.enum';
import { User } from '@global/interfaces/user.interface';
import { ActivateAccountService } from '@global/modules/activate-account/activate-account.service';
import { ToastMessageService } from '@global/modules/toast-message/toast-message.service';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import * as fromCountry from '@modules/country/reducers';
import { LocalVatRegistrationService } from '@modules/local-vat-registration/services/local-vat-registration.service';
import * as QuoteListActions from '@modules/quote-list/actions/quote-list.actions';
import { QuoteListSideFilterDialogService } from '@modules/quote-list/components/quote-list-side-filter-dialog/quote-list-side-filter-dialog.service';
import { QuoteListSideFilterDialogVM } from '@modules/quote-list/components/quote-list-side-filter-dialog/quote-list-side-filter-dialog.vm';
import { QuoteListQueryParam } from '@modules/quote-list/enums/quote-list-query-param.enum';
import { QuoteListSortableColumns } from '@modules/quote-list/enums/quote-list-sortable-columns.enum';
import { checkOwnerMatch } from '@modules/quote-list/helpers/filter-quote-list.helper';
import { QuoteTableSorting } from '@modules/quote-list/interfaces/quote-table-sorting.interface';
import { CbQuoteVM } from '@modules/quote-list/interfaces/cb-quote.vm';
import { selectIsQuoteListPageDataLoading } from '@modules/quote-list/pages/quote-list-page/quote-list-page.selectors';
import { QuoteListPageService } from '@modules/quote-list/pages/quote-list-page/quote-list-page.service';
import * as fromQuoteList from '@modules/quote-list/reducers';
import { FormBuilder } from '@ngneat/reactive-forms';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { CostEstimateService } from '@shared/services/cost-estimate.service';
import isNil from 'lodash/isNil';
import { combineLatest, forkJoin, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, first, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { QuoteListTabQuery } from '../../enums/quote-list-tab-query.enum';
import { QuoteListTabIndex } from '../../enums/quote-list-tab.enum';

@Component({
  selector: 'app-quote-list-page',
  templateUrl: './quote-list-page.component.html',
  styleUrls: ['./quote-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QuoteListPageService],
})
export class QuoteListPageComponent implements OnInit, OnDestroy {
  public completedTableData$: Observable<CbQuoteVM[]> = this.getQuotesFilteredByOwnership$(
    this.store$.select(fromQuoteList.selectCompleteQuotes)
  );
  public expiredTableData$: Observable<CbQuoteVM[]> = this.getQuotesFilteredByOwnership$(
    this.store$.select(fromQuoteList.selectExpiredQuotes)
  );
  public filteredTableData$: Observable<CbQuoteVM[]> = this.store$.select(fromQuoteList.selectFilteredQuotes);
  public isLoading$: Observable<boolean> = this.store$.select(selectIsQuoteListPageDataLoading);
  public numberOfFilters$: Observable<number> = this.store$.select(fromQuoteList.selectNumberOfAppliedFilters);
  public hasAdvancedFilters$ = this.numberOfFilters$.pipe(
    map((numberOfAdvancedFilters) => numberOfAdvancedFilters > 0),
    distinctUntilChanged()
  );
  public sortingPreferences$: Observable<{ [key in QuoteState]?: QuoteTableSorting }> = this.store$.select(
    fromQuoteList.selectSortingPreferences
  );
  public filterText = '';

  public readonly QuoteState = QuoteState;
  public selectedTabIndex: QuoteListTabIndex;

  public ownerSwitchControl = this.formBuilder.control(false);

  public user$: Observable<User>;

  private readonly destroyed$ = new Subject<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    private readonly store$: Store<fromQuoteList.AppState & fromCountry.AppState>,
    private readonly quoteListSideFilterDialogService: QuoteListSideFilterDialogService,
    private readonly costEstimateService: CostEstimateService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly quoteListPageService: QuoteListPageService,
    private readonly toastMessageService: ToastMessageService,
    private readonly translateService: TranslateService,
    private readonly localVatRegistrationService: LocalVatRegistrationService,
    private readonly activateAccountService: ActivateAccountService
  ) {}

  public ngOnInit(): void {
    this.user$ = this.authService.getUser$();
    this.store$.dispatch(QuoteListActions.enter());
    this.ownerSwitchControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((onlyOwnQuotes) => this.store$.dispatch(QuoteListActions.updateOwnershipFilter({ onlyOwnQuotes })));

    this.hasAdvancedFilters$.pipe(takeUntil(this.destroyed$)).subscribe((hasAdvancedFilters) => {
      if (hasAdvancedFilters) {
        this.onSelectedTabIndexChange(QuoteListTabIndex.Filtered);
        this.cdr.markForCheck();
      }
    });

    this.route.queryParamMap
      .pipe(
        switchMap((paramMap): Observable<QuoteListTabIndex> => {
          const tab = paramMap.get(QuoteListQueryParam.Tab);
          if (isNil(tab)) {
            return this.store$.select(fromQuoteList.selectLastActivatedTab).pipe(
              take(1),
              map((tabQuery) => this.mapQueryParamToQuoteTabIndex(tabQuery))
            );
          }
          return of(this.mapQueryParamToQuoteTabIndex(tab));
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe((tab) => {
        this.selectedTabIndex = isNil(tab) ? QuoteListTabIndex.Complete : tab;
        this.store$.dispatch(
          QuoteListActions.setLastActivatedTab({ tab: isNil(tab) ? QuoteListTabQuery.Complete : this.mapQuoteTabIndexToQueryParam(tab) })
        );
      });
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.store$.dispatch(QuoteListActions.leave());
  }

  public onAdvancedFiltersClick(): void {
    forkJoin([
      this.store$.select(fromCountry.selectDestinationCountriesInputData).pipe(first()),
      this.store$.select(fromQuoteList.selectAppliedFilters).pipe(first()),
    ])
      .pipe(
        switchMap(([countries, filters]) => this.quoteListSideFilterDialogService.open(countries, filters).afterClosed$()),
        takeUntil(this.destroyed$)
      )
      .subscribe((filters: QuoteListSideFilterDialogVM) => {
        if (!filters) {
          return;
        }

        this.store$.dispatch(QuoteListActions.updateFilters({ filters }));
      });
  }

  public onRemoveFiltersClick(): void {
    const filters: QuoteListSideFilterDialogVM = undefined;
    this.store$.dispatch(QuoteListActions.updateFilters({ filters }));
    this.onSelectedTabIndexChange(QuoteListTabIndex.Complete);
  }

  public onSearch(keyword: string): void {
    this.store$.dispatch(QuoteListActions.updateKeyword({ keyword }));
  }

  public onAcceptQuotes(selectedQuoteIds: string[]): void {
    this.store$.dispatch(QuoteListActions.accept({ ids: selectedQuoteIds }));
  }

  public downloadQuote(id: string): void {
    this.costEstimateService.downloadCostEstimate$(id).subscribe({
      error: (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_DOWNLOAD_QUOTE'),
    });
  }

  public sendMessage(quote: CbQuoteVM): void {
    this.quoteListPageService
      .sendFinalCostsEmail$(quote)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () => this.toastMessageService.open(this.translateService.instant('QUOTE_LIST.EMAIL_SENT_SUCCESSFULLY')),
        (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SEND_QUOTE_EMAIL')
      );
  }

  public reuseClick(quote: CbQuoteVM): void {
    this.store$.dispatch(QuoteListActions.reuseQuote({ id: quote.id }));
  }

  public onSelectedTabIndexChange(quoteTab: QuoteListTabIndex): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [QuoteListQueryParam.Tab]: this.mapQuoteTabIndexToQueryParam(quoteTab) },
    });
  }

  public onOpenAccountActivationModal(): void {
    this.activateAccountService.openVerifyAccountModal$().pipe(takeUntil(this.destroyed$)).subscribe();
  }

  private mapQuoteTabIndexToQueryParam(tabIndex: QuoteListTabIndex): QuoteListTabQuery {
    switch (tabIndex) {
      case QuoteListTabIndex.Expired:
        return QuoteListTabQuery.Expired;
      case QuoteListTabIndex.Filtered:
        return QuoteListTabQuery.Filtered;
      default:
        return QuoteListTabQuery.Complete;
    }
  }

  private mapQueryParamToQuoteTabIndex(quoteTab: QuoteListTabQuery | string): QuoteListTabIndex {
    switch (quoteTab) {
      case QuoteListTabQuery.Expired:
        return QuoteListTabIndex.Expired;
      case QuoteListTabQuery.Filtered:
        return QuoteListTabIndex.Filtered;
      default:
        return QuoteListTabIndex.Complete;
    }
  }

  private getQuotesFilteredByOwnership$(quotes$: Observable<CbQuoteVM[]>): Observable<CbQuoteVM[]> {
    return combineLatest([quotes$, this.store$.select(fromQuoteList.selectOnlyOwnQuotes), this.authService.getUser$()]).pipe(
      map(([quotes, onlyOwnQuotes, user]) => {
        if (onlyOwnQuotes) {
          return quotes.filter((quote) => checkOwnerMatch(quote, user.contactId));
        }
        return quotes;
      })
    );
  }

  public onAddLocalVatRegistrationClick(destinationCountry: string): void {
    forkJoin([
      this.store$.select(fromCountry.selectAllCountriesInputData).pipe(first()),
      this.store$.select(fromCountry.selectDestinationCountriesInputData).pipe(first()),
    ])
      .pipe(
        switchMap(([allCountries, destinationCountries]) =>
          this.localVatRegistrationService.createThroughDialog$(destinationCountry, allCountries, destinationCountries)
        ),
        take(1)
      )
      .subscribe(() => this.store$.dispatch(QuoteListActions.load()));
  }

  public onSortDirectionChange({
    direction,
    state,
    col,
  }: {
    direction: SortingDirection;
    state: QuoteState;
    col: QuoteListSortableColumns;
  }): void {
    this.store$.dispatch(QuoteListActions.changeSorting({ [state]: { col, direction } }));
  }

  public hasSorting(selectedTabIndex: QuoteListTabIndex, sortingPreferences: { [key in QuoteState]?: QuoteTableSorting }): boolean {
    switch (selectedTabIndex) {
      case QuoteListTabIndex.Complete:
        return !!sortingPreferences.complete?.direction;
      case QuoteListTabIndex.Expired:
        return !!sortingPreferences.expired?.direction;
      case QuoteListTabIndex.Filtered:
        return !!sortingPreferences.mixed?.direction;
    }
  }

  public onClearSortingClick(): void {
    this.store$.dispatch(QuoteListActions.clearSorting());
  }
}
