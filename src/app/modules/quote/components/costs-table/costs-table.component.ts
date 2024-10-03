import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CurrencyCode } from '@global/enums/currency-code.enum';
import { Costs } from '@global/interfaces/costs.interface';
import { CostTableVM } from '@global/modules/common-quote/interfaces/cost-table.vm';
import { FormControl } from '@ngneat/reactive-forms';
import { TranslateService } from '@ngx-translate/core';
import { CostExplanationDialogService } from '@shared/modules/cost-explanation-dialog/cost-explanation-dialog.service';
import { FreightType } from '@CitT/data';
import isNil from 'lodash/isNil';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-costs-table',
  templateUrl: './costs-table.component.html',
  styleUrls: ['./costs-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostsTableComponent implements OnInit, OnDestroy {
  @Input() public set costs(costs: Costs) {
    this._costs$.next(costs);
  }
  public get costs(): Costs {
    return this._costs$.getValue();
  }
  @Input() public set liabilityCoverFeeEnabled(liabilityCoverFeeEnabled: boolean) {
    this.liabilityCoverFeeControl.setValue(liabilityCoverFeeEnabled, { emitEvent: false });
  }
  @Output() public changeShipmentMethod = new EventEmitter<void>();
  @Output() public toggleLiabilityCoverFee = new EventEmitter<boolean>();

  public readonly CurrencyCode = CurrencyCode;
  public readonly FreightType = FreightType;
  public readonly liabilityCoverFeeControl = new FormControl(true);

  private readonly _costs$ = new BehaviorSubject<Costs>(undefined);
  private readonly destroyed$ = new Subject<void>();

  public readonly costs$: Observable<CostTableVM[]> = combineLatest([
    this._costs$,
    this.translateService.get([
      'COMMON.FEES.IOR_AND_IMPORT',
      'COMMON.FEES.EOR_AND_IMPORT',
      'COMMON.FEES.ADMIN_FEE',
      'COMMON.FEES.CUSTOMS_BROKERAGE_COSTS',
      'COMMON.FEES.CLEARANCE_COSTS',
      'COMMON.FEES.HANDLING_COSTS',
      'COMMON.FEES.LICENSE_FEES',
      'COMMON.FEES.BANK_FEES',
      'COMMON.FEES.CASH_OUTLAY_FEE',
      'COMMON.FEES.COLLECTION_ADMINISTRATION_FEE',
      'COMMON.FEES.ESTIMATED_TAX_AND_DUTY',
      'COMMON.FEES.TAX_RECOVERY_FEE',
      'COMMON.FEES.LIABILITY_COVER_FEE',
      'COMMON.FEES.VAT_GST_FEE',
      'COMMON.FEES.DUTIES_AND_OTHER_TAXES_FEE',
    ]),
  ]).pipe(map(([costs, translations]) => (isNil(costs) ? [] : this.createCostsList(costs, translations))));

  constructor(
    private readonly translateService: TranslateService,
    private readonly costExplanationDialogService: CostExplanationDialogService
  ) {}

  public get liabilityCoverFee(): number {
    return this._costs$.value.liabilityCoverFee;
  }

  public ngOnInit(): void {
    this.liabilityCoverFeeControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((value) => {
      this.toggleLiabilityCoverFee.emit(value);
    });
  }

  public get totalCost(): number {
    const potentialCashOutlayFee = this._costs$.value.potentialCashOutlayFee ?? 0;
    return this._costs$.value.totalInvoiceAmount + potentialCashOutlayFee;
  }

  public get freightType(): FreightType {
    return this._costs$.value.freightType;
  }

  public get internationalDeliveryFee(): number {
    return this._costs$.value.internationalDeliveryFee;
  }

  public onChangeShipmentMethodClick(): void {
    this.changeShipmentMethod.emit();
  }

  public onCostExplanationButtonClick(): void {
    this.costExplanationDialogService.open(this.costs);
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private createCostsList(costs: Costs, translations: Record<string, string>): CostTableVM[] {
    return [
      {
        name: translations['COMMON.FEES.IOR_AND_IMPORT'],
        value: costs.iorFees,
        highlight: false,
      },
      {
        name: translations['COMMON.FEES.EOR_AND_IMPORT'],
        value: costs.eorFees,
        highlight: false,
      },
      {
        name: translations['COMMON.FEES.ADMIN_FEE'],
        value: costs.adminFee,
        highlight: false,
      },
      {
        name: translations['COMMON.FEES.BANK_FEES'],
        value: costs.bankFees,
        highlight: false,
      },
      {
        name: translations['COMMON.FEES.CLEARANCE_COSTS'],
        value: costs.customsClearanceCosts,
        highlight: false,
      },
      {
        name: translations['COMMON.FEES.CUSTOMS_BROKERAGE_COSTS'],
        value: costs.customsBrokerageCosts,
        highlight: false,
      },
      {
        name: translations['COMMON.FEES.HANDLING_COSTS'],
        value: costs.customsHandlingCosts,
        highlight: false,
      },
      {
        name: translations['COMMON.FEES.LICENSE_FEES'],
        value: costs.customsLicenseFees,
        highlight: false,
      },
      {
        name: translations['COMMON.FEES.CASH_OUTLAY_FEE'],
        value: costs.cashOutlayFee,
        highlight: false,
      },
      {
        name: translations['COMMON.FEES.LIABILITY_COVER_FEE'],
        value: this.liabilityCoverFeeControl.value ? costs.liabilityCoverFee : undefined,
        highlight: false,
      },
      {
        name: translations['COMMON.FEES.COLLECTION_ADMINISTRATION_FEE'],
        value: costs.collectionAdministrationFee,
        highlight: false,
      },
      {
        name: translations['COMMON.FEES.VAT_GST_FEE'],
        value: costs.vatGstFee,
        highlight: false,
      },
      {
        name: translations['COMMON.FEES.DUTIES_AND_OTHER_TAXES_FEE'],
        value: costs.dutiesAndOtherTaxesFee,
        highlight: false,
      },
      {
        name: costs.miscellaneousFeeName,
        value: costs.miscellaneousFee,
        highlight: false,
      },
    ].filter(({ value }) => !isNil(value) && value !== 0);
  }
}
