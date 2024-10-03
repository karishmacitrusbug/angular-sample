import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { DIALOG_DATA } from '@global/modules/dialog/dialog.tokens';
import { DialogData } from '@global/modules/dialog/interfaces/dialog-data.interface';
import { ShipmentListSideFilterDialogPayload } from '@modules/shipments/components/shipment-list-side-filter-dialog/shipment-list-side-filter-dialog-payload.interface';
import { ShipmentListSideFilterDialogResult } from '@modules/shipments/components/shipment-list-side-filter-dialog/shipment-list-side-filter-dialog-result.interface';
import { FormBuilder, FormControl, FormGroup } from '@ngneat/reactive-forms';
import { Store } from '@ngrx/store';
import isNil from 'lodash/isNil';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as ShipmentListActions from '../../../../../../../CitT/src/app/modules/shipments/actions/shipment-list.actions';
import * as fromShipment from '../../../../../../../CitT/src/app/modules/shipments/reducers';

@Component({
  selector: 'app-shipment-list-side-filter-dialog',
  templateUrl: './shipment-list-side-filter-dialog.component.html',
  styleUrls: ['./shipment-list-side-filter-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentListSideFilterDialogComponent implements OnInit {
  public readonly countries = this.data.payload.countries;

  constructor(
    private readonly store$: Store<fromShipment.AppState>,
    @Inject(DIALOG_DATA) private readonly data: DialogData<ShipmentListSideFilterDialogPayload, ShipmentListSideFilterDialogResult>,
    private readonly formBuilder: FormBuilder
  ) {}

  public readonly formGroup = this.formBuilder.group<
    Omit<ShipmentListSideFilterDialogResult, 'createdDateRange' | 'finalDeliveryDateRange'> & {
      createdDateRange: { start?: Date; end: Date };
      finalDeliveryDateRange: { start1?: Date; end1: Date };
    }
  >({
    createdDateRange: this.formBuilder.group<{ start?: Date; end: Date }>({
      // @ts-ignore
      start: this.formBuilder.control(),
      // @ts-ignore
      end: this.formBuilder.control(),
    }),
    // @ts-ignore
    finalDeliveryDateRange: this.formBuilder.group<{ start1?: Date; end1: Date }>({
      // @ts-ignore
      start1: this.formBuilder.control(),
      // @ts-ignore
      end1: this.formBuilder.control(),
    }),
    clientReference1: this.formBuilder.control(''),
    shipToCountry: this.formBuilder.control([]),
    owner: this.formBuilder.control(false),
  });

  public readonly createdDateRangeGroup = this.formGroup.controls.createdDateRange as FormGroup<{ start?: Date; end: Date }>;
  public readonly clientReferenceControl1 = this.formGroup.controls.clientReference1 as FormControl;
  public readonly shipToCountryControl = this.formGroup.controls.shipToCountry as FormControl;
  public ownerSwitchControl = this.formBuilder.control(false);

  public readonly finalDeliveryDateRangeGroup = this.formGroup.controls.finalDeliveryDateRange as FormGroup<{
    start1?: Date;
    end1: Date;
  }>;

  private readonly destroyed$ = new Subject<void>();

  public ngOnInit(): void {
    this.patchFormerFilter();
    this.ownerSwitchControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((onlyOwnQuotes) => this.store$.dispatch(ShipmentListActions.updateOwnershipFilter({ onlyOwnQuotes })));
  }

  public patchFormerFilter(): void {
    if (!this.data.payload.filters) {
      return;
    }

    this.formGroup.patchValue({
      createdDateRange: {
        start: isNil(this.data.payload.filters?.createdDateRange?.start)
          ? undefined
          : new Date(this.data.payload.filters.createdDateRange.start),
        end: isNil(this.data.payload.filters?.createdDateRange?.end) ? undefined : new Date(this.data.payload.filters.createdDateRange.end),
      },
      clientReference1: this.data.payload.filters.clientReference1,
      shipToCountry: this.data.payload.filters.shipToCountry || [],
      owner: this.data.payload.filters.owner,
      finalDeliveryDateRange: {
        start1: isNil(this.data.payload.filters?.finalDeliveryDateRange?.start1)
          ? undefined
          : new Date(this.data.payload.filters.finalDeliveryDateRange.start1),
        end1: isNil(this.data.payload.filters?.finalDeliveryDateRange?.end1)
          ? undefined
          : new Date(this.data.payload.filters.finalDeliveryDateRange.end1),
      },
    });
  }

  public onSubmit(): void {
    const createdDateStart = isNil(this.createdDateRangeGroup.value.start)
      ? undefined
      : this.createdDateRangeGroup.value.start.toISOString();

    const finalDeliveryDateStart = isNil(this.finalDeliveryDateRangeGroup.value.start1)
      ? undefined
      : this.finalDeliveryDateRangeGroup.value.start1.toISOString();
    const finalDeliveryDateEnd = isNil(this.finalDeliveryDateRangeGroup.value.end1)
      ? undefined
      : this.finalDeliveryDateRangeGroup.value.end1.toISOString();

    const createdDateEnd = isNil(this.createdDateRangeGroup.value.end) ? undefined : this.createdDateRangeGroup.value.end.toISOString();
    this.data.dialogRef.close({
      ...this.formGroup.value,
      createdDateRange: isNil(createdDateStart) && isNil(createdDateEnd) ? undefined : { start: createdDateStart, end: createdDateEnd },
      finalDeliveryDateRange:
        isNil(finalDeliveryDateStart) && isNil(finalDeliveryDateEnd)
          ? undefined
          : { start1: finalDeliveryDateStart, end1: finalDeliveryDateEnd },
    });
  }
}
