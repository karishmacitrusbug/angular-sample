import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { CurrencyCode } from '@global/enums/currency-code.enum';
import { LengthUnit } from '@global/enums/length-unit.enum';
import { ServiceType } from '@global/enums/service-type.enum';
import { WeightUnit } from '@global/enums/weight-unit.enum';
import { constructInputData } from '@global/helpers/construct-input-data.helper';
import { AddressCardAddressVM } from '@global/interfaces/address/address.vm';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { QuoteDefaultValues } from '@global/interfaces/quote-default-values.interface';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { AddressService } from '@modules/address/services/address.service';
import { FormBuilder, FormControl, FormGroup } from '@ngneat/reactive-forms';
import { Store } from '@ngrx/store';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { filter, finalize, first, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import * as CountryActions from '../../../country/actions/country.actions';
import * as fromCountry from '../../../country/reducers';
import { QuoteDefaultsPageService } from './quote-defaults-page.service';

@Component({
  selector: 'app-quote-defaults-page',
  templateUrl: './quote-defaults-page.component.html',
  styleUrls: ['./quote-defaults-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QuoteDefaultsPageService],
})
export class QuoteDefaultsPageComponent implements OnInit, OnDestroy {
  public readonly currencyCodes: InputDataVM[] = Object.values(CurrencyCode).map((value) => ({ value, viewValue: value }));
  public readonly WeightUnit = WeightUnit;
  public readonly LengthUnit = LengthUnit;

  public defaultValues?: Partial<QuoteDefaultValues>;
  public allCountries: InputDataVM<string, string>[] = [];

  public formGroup: FormGroup = this.createForm();
  public readonly shipFromCountryControl = this.formGroup.controls.shipFromCountry as FormControl<InputDataVM<string>>;
  public readonly pickUpAddressControl = this.formGroup.controls.pickUpAddress as FormControl<AddressCardAddressVM>;
  public readonly weightUnitControl = this.formGroup.controls.weightUnit as FormControl;
  public readonly dimensionUnitControl = this.formGroup.controls.dimensionUnit as FormControl;
  public readonly currencyControl = this.formGroup.controls.currency as FormControl;

  private readonly destroyed$ = new Subject<void>();
  private quoteDefaults: Partial<QuoteDefaultValues>;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly quoteDefaultsPageService: QuoteDefaultsPageService,
    private readonly addressService: AddressService,
    private readonly store$: Store<fromCountry.AppState>,
    private readonly cdr: ChangeDetectorRef,
    private readonly loadingIndicator: LoadingIndicatorService
  ) {}

  public ngOnInit(): void {
    of({})
      .pipe(
        tap(() => this.loadingIndicator.open()),
        switchMap(() => forkJoin([this.getPickupCountries$(), this.quoteDefaultsPageService.getQuoteDefaults$()])),
        finalize(() => this.loadingIndicator.dispose()),
        takeUntil(this.destroyed$)
      )
      .subscribe(([pickupCountries, quoteDefaults]) => {
        this.allCountries = pickupCountries;
        this.quoteDefaults = quoteDefaults;
        this.updateForm(quoteDefaults);
        this.cdr.markForCheck();
      });

    this.shipFromCountryControl.valueChanges
      .pipe(
        filter((value) => !isNil(value)),
        takeUntil(this.destroyed$)
      )
      .subscribe(({ value }) => {
        this.pickUpAddressControl.setValue(this.quoteDefaults?.defaultPickUpAddresses?.[value]);
        this.pickUpAddressControl.markAsPristine();
      });
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public get canSave(): boolean {
    return this.formGroup.valid && (this.formGroup.dirty || this.shipFromCountryControl.dirty);
  }

  private createForm(quoteDefaults?: Partial<QuoteDefaultValues>): FormGroup {
    const currency = get(quoteDefaults, 'currency', CurrencyCode.USD);
    return this.formBuilder.group({
      serviceType: this.formBuilder.control(get(quoteDefaults, 'serviceType', ServiceType.IOR), [Validators.required]),
      shipFromCountry: this.formBuilder.control(constructInputData(get(quoteDefaults, 'shipFromCountry')), [Validators.required]),
      pickUpAddress: this.formBuilder.control(quoteDefaults?.defaultPickUpAddresses[quoteDefaults?.shipFromCountry]),
      weightUnit: this.formBuilder.control(get(quoteDefaults, 'weightUnit', WeightUnit.Kg), Validators.required),
      dimensionUnit: this.formBuilder.control(get(quoteDefaults, 'dimensionUnit', LengthUnit.Cm), Validators.required),
      currency: this.formBuilder.control(isNil(currency) ? CurrencyCode.USD : currency, Validators.required),
    });
  }

  private updateForm(quoteDefaults: Partial<QuoteDefaultValues>): void {
    this.defaultValues = quoteDefaults;
    const form = this.createForm(quoteDefaults);
    this.formGroup.reset(form.value);
  }

  private getPickupCountries$(): Observable<InputDataVM<string, string>[]> {
    this.store$.dispatch(CountryActions.getAll());

    return this.store$.select(fromCountry.selectAllCountriesLoading).pipe(
      takeWhile((isLoading) => isLoading, true),
      switchMap(() => this.store$.select(fromCountry.selectPickupCountries).pipe(first((countries) => countries.length > 0)))
    );
  }

  public onChangeDefaultAddressClick(): void {
    this.addressService
      .selectDefaultPickupAddress$(this.shipFromCountryControl.value.value, this.allCountries)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((address) => {
        if (this.pickUpAddressControl.value?.id === address.id) {
          return;
        }

        this.pickUpAddressControl.setValue(address);
        this.pickUpAddressControl.markAsDirty();
        this.cdr.markForCheck();
      });
  }

  public onSubmit(): void {
    if (!this.canSave) {
      return;
    }

    const updates: Observable<unknown>[] = [];
    if (this.pickUpAddressControl.dirty && this.pickUpAddressControl.value) {
      updates.push(this.addressService.updateDefaultAddress$(this.shipFromCountryControl.value.value, this.pickUpAddressControl.value));
    }
    if (this.formGroup.dirty) {
      const values = this.formGroup.value;

      updates.push(
        this.quoteDefaultsPageService.saveQuoteDefaults$({
          ...this.defaultValues,
          ...values,
          shipFromCountry: values.shipFromCountry.value,
        })
      );
    }

    this.loadingIndicator.open();
    forkJoin(updates)
      .pipe(finalize(() => this.loadingIndicator.dispose()))
      .subscribe(() => {
        this.formGroup.reset(this.formGroup.value);
        this.cdr.markForCheck();
      });
  }
}
