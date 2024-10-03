import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { DIALOG_DATA } from '@global/modules/dialog/dialog.tokens';
import { DialogData } from '@global/modules/dialog/interfaces/dialog-data.interface';
import { QuoteListSideFilterDialogPayload } from '@modules/quote-list/components/quote-list-side-filter-dialog/quote-list-side-filter-dialog-payload.interface';
import { QuoteListSideFilterDialogVM } from '@modules/quote-list/components/quote-list-side-filter-dialog/quote-list-side-filter-dialog.vm';
import { FormBuilder, FormControl, FormGroup } from '@ngneat/reactive-forms';
import isNil from 'lodash/isNil';

type FilterFormValue = Omit<QuoteListSideFilterDialogVM, 'createdDateRange'> & {
  createdDateRange: { start?: Date; end?: Date };
};

@Component({
  templateUrl: './quote-list-side-filter-dialog.component.html',
  styleUrls: ['./quote-list-side-filter-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteListSideFilterDialogComponent implements OnInit {
  public readonly countries = this.data.payload.countries;

  constructor(
    @Inject(DIALOG_DATA) private readonly data: DialogData<QuoteListSideFilterDialogPayload, QuoteListSideFilterDialogVM>,
    private readonly formBuilder: FormBuilder
  ) {}

  public readonly formGroup = this.formBuilder.group<FilterFormValue>({
    createdDateRange: this.formBuilder.group({ start: this.formBuilder.control(undefined), end: this.formBuilder.control(undefined) }),
    clientReference1: this.formBuilder.control(''),
    shipToCountry: this.formBuilder.control([]),
  });

  public readonly createdDateRangeGroup = this.formGroup.controls.createdDateRange as FormGroup<{ start?: Date; end?: Date }>;
  public readonly clientReferenceControl1 = this.formGroup.controls.clientReference1 as FormControl;
  public readonly shipToCountryControl = this.formGroup.controls.shipToCountry as FormControl;

  public ngOnInit(): void {
    if (this.data.payload.filters) {
      this.formGroup.patchValue({
        createdDateRange: {
          start: isNil(this.data.payload.filters?.createdDateRange?.start)
            ? undefined
            : new Date(this.data.payload.filters.createdDateRange.start),
          end: isNil(this.data.payload.filters?.createdDateRange?.end)
            ? undefined
            : new Date(this.data.payload.filters.createdDateRange.end),
        },
        clientReference1: this.data.payload.filters.clientReference1,
        shipToCountry: this.data.payload.filters.shipToCountry,
      });
    }
  }

  public onSubmit(): void {
    const createdDateStart = isNil(this.createdDateRangeGroup.value.start)
      ? undefined
      : this.createdDateRangeGroup.value.start.toISOString();
    const createdDateEnd = isNil(this.createdDateRangeGroup.value.end) ? undefined : this.createdDateRangeGroup.value.end.toISOString();
    this.data.dialogRef.close({
      ...this.formGroup.value,
      createdDateRange: isNil(createdDateStart) && isNil(createdDateEnd) ? undefined : { start: createdDateStart, end: createdDateEnd },
    });
  }
}
