import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { ShipmentStatus } from '@global/enums/shipment-status.enum';
import { ShipmentListQueryParam } from '@global/enums/shipments/shipment-list-query-param.enum';
import { AuthService } from '@global/services/auth.service';
import { ShipmentDetailsPageParamAction } from '@modules/shipments/enums/shipment-details-page-param-action.enum';
import { ShipmentListTabIndex } from '@modules/shipments/enums/shipment-list-tab-index.enum';
import { ShipmentListTabQuery } from '@modules/shipments/enums/shipment-list-tab-query.enum';
import { checkAssigneeMatch } from '@modules/shipments/helpers/filter-shipment-list.helper';
import { ShipmentListItemVM } from '@modules/shipments/interfaces/shipment-list-item.vm';
import { ShipmentsTableSorting } from '@modules/shipments/interfaces/shipments-table-sorting.interface';
import {
  selectOwnershipFilter,
  selectShipmentListAllItemsSorted,
  selectShipmentListCompletedItems,
  selectShipmentListEnRouteItems,
  selectShipmentListFilteredItems,
  selectShipmentListLoading,
  selectShipmentListNumberOfAdvancedFilters,
  selectShipmentListShipmentPendingItems,
  selectSortingPrefrences,
} from '@modules/shipments/pages/shipments-list-page/shipments-list-page.selector';
import { FormBuilder } from '@ngneat/reactive-forms';
import { Store } from '@ngrx/store';
import { InvoiceDialogService } from '@shared/modules/invoice-dialog/components/invoice-dialog/invoice-dialog.service';
import isNil from 'lodash/isNil';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap, take, takeUntil } from 'rxjs/operators';
import * as ShipmentListActions from '../../actions/shipment-list.actions';
import * as fromShipment from '../../reducers';

@Component({
  templateUrl: './shipments-list-page.component.html',
  styleUrls: ['./shipments-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentsListPageComponent implements OnInit, OnDestroy {
  public readonly ShipmentStatus = ShipmentStatus;
  public readonly ShipmentListTabQuery = ShipmentListTabQuery;

  public shipments$: Observable<ShipmentListItemVM[]>;
  public pendingShipments$: Observable<ShipmentListItemVM[]>;
  public enrouteShipments$: Observable<ShipmentListItemVM[]>;
  public completedShipments$: Observable<ShipmentListItemVM[]>;
  public filteredShipments$: Observable<ShipmentListItemVM[]>;
  public numberOfPendingShipments$: Observable<number>;
  public numberOfCompletedShipments$: Observable<number>;
  public isLoading$: Observable<boolean> = of(false);
  public numberOfAdvancedFilters$: Observable<number>;
  public hasAdvancedFilters$: Observable<boolean>;
  public selectedTabIndex: ShipmentListTabIndex;
  public sortingPreferences$: Observable<{ [key in ShipmentListTabQuery]?: ShipmentsTableSorting }>;

  public ownerSwitchControl = this.formBuilder.control(false);

  private readonly destroyed$ = new Subject<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly store$: Store<fromShipment.AppState>,
    private readonly authService: AuthService,
    private readonly invoiceDialogService: InvoiceDialogService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.isLoading$ = this.store$.select(selectShipmentListLoading);
    this.shipments$ = this.getShipmentsFilteredByOwnership$(this.store$.select(selectShipmentListAllItemsSorted));
    this.pendingShipments$ = this.getShipmentsFilteredByOwnership$(this.store$.select(selectShipmentListShipmentPendingItems));
    this.enrouteShipments$ = this.getShipmentsFilteredByOwnership$(this.store$.select(selectShipmentListEnRouteItems));
    this.completedShipments$ = this.getShipmentsFilteredByOwnership$(this.store$.select(selectShipmentListCompletedItems));
    this.filteredShipments$ = this.store$.select(selectShipmentListFilteredItems);
    this.numberOfPendingShipments$ = this.pendingShipments$.pipe(map((pendingShipments) => pendingShipments.length));
    this.numberOfCompletedShipments$ = this.completedShipments$.pipe(map((completedShipments) => completedShipments.length));
    this.numberOfAdvancedFilters$ = this.numberOfAdvancedFilters$ = this.store$.select(selectShipmentListNumberOfAdvancedFilters);
    this.hasAdvancedFilters$ = this.numberOfAdvancedFilters$.pipe(
      map((numberOfAdvancedFilters) => numberOfAdvancedFilters > 0),
      distinctUntilChanged()
    );
    this.sortingPreferences$ = this.store$.select(selectSortingPrefrences);
  }

  public ngOnInit(): void {
    this.store$.dispatch(ShipmentListActions.enter());

    this.ownerSwitchControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((onlyOwnQuotes) => this.store$.dispatch(ShipmentListActions.updateOwnershipFilter({ onlyOwnQuotes })));

    this.hasAdvancedFilters$.pipe(takeUntil(this.destroyed$)).subscribe((hasAdvancedFilters) => {
      if (hasAdvancedFilters) {
        this.selectedTabIndex = ShipmentListTabIndex.Filtered;
        this.cdr.markForCheck();
      }
    });

    this.route.queryParamMap
      .pipe(
        switchMap((paramMap): Observable<ShipmentListTabIndex> => {
          const tab = paramMap.get(ShipmentListQueryParam.Tab);
          if (isNil(tab)) {
            return this.store$.select(fromShipment.selectLastActivatedTab).pipe(
              take(1),
              map((tabQuery) => this.mapQueryParamToShipmentTabIndex(tabQuery))
            );
          }
          return of(this.mapQueryParamToShipmentTabIndex(tab));
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe((tab) => {
        this.selectedTabIndex = isNil(tab) ? ShipmentListTabIndex.All : tab;

        this.store$.dispatch(
          ShipmentListActions.setLastActivatedTab({
            tab: isNil(tab) ? ShipmentListTabQuery.All : this.mapShipmentTabIndexToQueryParam(tab),
          })
        );
      });
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();

    this.store$.dispatch(ShipmentListActions.leave());
  }

  public onSelectedTabIndexChange(shipmentTab: ShipmentListTabIndex): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ['tab']: this.mapShipmentTabIndexToQueryParam(shipmentTab) },
    });
  }

  private mapShipmentTabIndexToQueryParam(tabIndex: ShipmentListTabIndex): ShipmentListTabQuery {
    switch (tabIndex) {
      case ShipmentListTabIndex.ShipmentPending:
        return ShipmentListTabQuery.ShipmentPending;
      case ShipmentListTabIndex.EnRoute:
        return ShipmentListTabQuery.EnRoute;
      case ShipmentListTabIndex.Completed:
        return ShipmentListTabQuery.Completed;
      case ShipmentListTabIndex.Filtered:
        return ShipmentListTabQuery.Filtered;
      default:
        return ShipmentListTabQuery.All;
    }
  }

  private mapQueryParamToShipmentTabIndex(shipmentTab: ShipmentListTabQuery | string): ShipmentListTabIndex {
    switch (shipmentTab) {
      case ShipmentListTabQuery.ShipmentPending:
        return ShipmentListTabIndex.ShipmentPending;
      case ShipmentListTabQuery.EnRoute:
        return ShipmentListTabIndex.EnRoute;
      case ShipmentListTabQuery.Completed:
        return ShipmentListTabIndex.Completed;
      case ShipmentListTabQuery.Filtered:
        return ShipmentListTabIndex.Filtered;
      default:
        return ShipmentListTabIndex.All;
    }
  }

  private getShipmentsFilteredByOwnership$(shipments$: Observable<ShipmentListItemVM[]>): Observable<ShipmentListItemVM[]> {
    return combineLatest([shipments$, this.store$.select(selectOwnershipFilter), this.authService.getUser$()]).pipe(
      map(([shipments, onlyOwnQuotes, user]) => {
        if (onlyOwnQuotes) {
          return shipments.filter((shipment) => checkAssigneeMatch(shipment, user.contactId));
        }
        return shipments;
      })
    );
  }

  public onKeywordChange(keyword: string): void {
    this.store$.dispatch(ShipmentListActions.updateKeyword({ keyword }));
  }

  public onAdvancedFiltersClick(): void {
    this.store$.dispatch(ShipmentListActions.openAdvancedFilters());
  }

  public onRemoveFiltersClick(): void {
    this.store$.dispatch(ShipmentListActions.clearAdvancedFilters());
    this.selectedTabIndex = ShipmentListTabIndex.All;
  }

  public onPayInvoice(shipment: ShipmentListItemVM): void {
    if (shipment.relatedInvoices.length === 0) {
      return;
    }
    if (shipment.relatedInvoices.length > 1) {
      this.router.navigate([RouteSegment.Root, RouteSegment.ShipmentsList, shipment.id], {
        queryParams: {
          action: ShipmentDetailsPageParamAction.OpenInvoices,
        },
      });
      return;
    }

    const invoice = shipment.relatedInvoices[0];

    this.invoiceDialogService.open({
      id: invoice.id,
      type: invoice.type,
      name: invoice.name,
      orderId: shipment.id,
      amount: invoice.price,
      dueDate: new Date(invoice.dueDate),
      stripeUrl: invoice.stripeUrl,
      needsPayment: true,
      status: invoice.status,
    });
  }

  public onSort(tab: ShipmentListTabQuery, shipmentsTableSorting: ShipmentsTableSorting): void {
    this.store$.dispatch(ShipmentListActions.applySorting({ tab, shipmentsTableSorting }));
  }

  public onClearSortingClick(): void {
    this.store$.dispatch(ShipmentListActions.clearSorting());
  }

  public hasSorting(
    selectedTabIndex: ShipmentListTabIndex,
    sortingPreferences: { [key in ShipmentListTabQuery]?: ShipmentsTableSorting }
  ): boolean {
    switch (selectedTabIndex) {
      case ShipmentListTabIndex.All:
        return !!sortingPreferences.all?.direction;
      case ShipmentListTabIndex.ShipmentPending:
        return !!sortingPreferences.pending?.direction;
      case ShipmentListTabIndex.EnRoute:
        return !!sortingPreferences.enroute?.direction;
      case ShipmentListTabIndex.Completed:
        return !!sortingPreferences.completed?.direction;
      case ShipmentListTabIndex.Filtered:
        return !!sortingPreferences.filtered?.direction;
    }
  }
}
