import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { CurrencyCode } from '@global/enums/currency-code.enum';
import { LengthUnit } from '@global/enums/length-unit.enum';
import { ServiceType } from '@global/enums/service-type.enum';
import { WeightUnit } from '@global/enums/weight-unit.enum';
import { constructInputData } from '@global/helpers/construct-input-data.helper';
import { mapWeight } from '@global/helpers/map-weight.helper';
import { ChargeableWeightDialogResult } from '@global/interfaces/chargeable-weight-dialog.vm';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { ChargeableWeightDialogPackageVM } from '@global/interfaces/package.vm';
import { User } from '@global/interfaces/user.interface';
import { ActivateAccountService } from '@global/modules/activate-account/activate-account.service';
import { ChargeableWeightDialogService } from '@global/modules/chargeable-weight-dialog/services/chargeable-weight-dialog.service';
import { CountryValidationService } from '@global/modules/common-country-validation/services/country-validation.service';
import { CountryValidationErrorField } from '@global/modules/common-country-validation/types/country-validation-error-field.enum';
import { CountryValidationError } from '@global/modules/common-country-validation/types/country-validation-error.interface';
import { CountryValidationRule } from '@global/modules/common-country-validation/types/country-validation-rule.interface';
import { CountryValidationErrorMessageCTAType } from '@global/modules/common-country-validation/types/county-validation-error-message-cta-type.enum';
import { LineItem } from '@global/modules/common-quote/interfaces/line-item.interface';
import { AuthService } from '@global/services/auth.service';
import { ValidatorHelperService } from '@global/services/validator-helper.service';
import { greaterThanValidator } from '@global/validators/greater-than.validator';
import { numberValidator } from '@global/validators/number.validator';
import { unvettedDestinationCountryLimit } from '@global/validators/unvetted-destination-country-limit';
import { AddressService } from '@modules/address/services/address.service';
import { LocalVatRegistrationService } from '@modules/local-vat-registration/services/local-vat-registration.service';
import { QuoteBasicsForm } from '@modules/quote/interfaces/quote-basics-form.interface';
import { FormArray, FormBuilder, FormControl } from '@ngneat/reactive-forms';
import { TypeOfGoods } from '@CitT/data';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, take, takeUntil } from 'rxjs/operators';

interface Form extends Omit<QuoteBasicsForm, 'from' | 'to' | 'shipmentValue'> {
  from: InputDataVM<string, string>;
  to: InputDataVM<string, string>;
}

const MIN_WEIGHT_KG = 1;
const MIN_WEIGHT_LBS = 2.2;

@Component({
  selector: 'app-quote-basics',
  templateUrl: './quote-basics.component.html',
  styleUrls: ['./quote-basics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteBasicsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public initialValues: QuoteBasicsForm;
  @Input() public pickUpAddressEnabled = true;
  @Input() public weightCalculatorEnabled = true;
  @Input() public shipToLocationEnabled = true;
  @Input() public localVatEnabled = true;
  @Input() public allCountries: InputDataVM<string, string>[] = [];
  @Input() public destinationCountries: InputDataVM<string, string>[] = [];
  @Input() public lineItems: LineItem[] = [];
  @Input() public isEditing = false;
  @Input() public vatRegistrationForDestinationCountry?: LocalVatRegistrationVM;
  private readonly validationRules$ = new BehaviorSubject<CountryValidationRule[]>([]);

  @Input()
  public set validationRules(validationRules: CountryValidationRule[]) {
    this.validationRules$.next(validationRules);
  }

  @Output() public validityChange = new EventEmitter<boolean>();
  @Output() public submitBasics = new EventEmitter<void>();

  public readonly CurrencyCode = CurrencyCode;
  public readonly WeightUnit = WeightUnit;
  public readonly TypeOfGoods = TypeOfGoods;
  public readonly MAX_PROJECT_NAME_REFERENCE_LENGTH = 50;
  public readonly projectReferences$: Observable<
    {
      formControl: FormControl;
      errors$: Observable<string>;
    }[]
  >;
  // public showTypeOfGoodsQuestion$: Observable<boolean>;
  public validationErrors$: Observable<CountryValidationError[]>;
  public validationErrorsWithLink$: Observable<CountryValidationError[]>;

  public readonly formGroup = this.formBuilder.group<Form>({
    from: this.formBuilder.control(undefined, [Validators.required]),
    // eslint-disable-next-line unicorn/no-useless-undefined
    to: this.formBuilder.control(undefined),
    pickUpAddress: this.formBuilder.control([]),
    // eslint-disable-next-line unicorn/no-useless-undefined
    localVatRegistration: this.formBuilder.control(undefined),
    // eslint-disable-next-line unicorn/no-useless-undefined
    typeOfGoods: this.formBuilder.control(undefined),
    shipmentValueCurrency: this.formBuilder.control(CurrencyCode.USD, [Validators.required]),
    estimatedWeight: this.formBuilder.control(undefined, [
      Validators.required,
      numberValidator(),
      greaterThanValidator(MIN_WEIGHT_KG, true),
    ]),
    estimatedWeightUnit: this.formBuilder.control(WeightUnit.Kg, [Validators.required]),
    lengthUnit: this.formBuilder.control(LengthUnit.Cm),
    packages: this.formBuilder.control([]),
    projectReferences: this.formBuilder.array([
      this.formBuilder.control('', [Validators.maxLength(this.MAX_PROJECT_NAME_REFERENCE_LENGTH)]),
    ]),
  });

  public readonly fromControl = this.formGroup.controls.from as FormControl<InputDataVM<string>>;
  public readonly toControl = this.formGroup.controls.to as FormControl<InputDataVM<string>>;
  public readonly pickUpAddressControl = this.formGroup.controls.pickUpAddress as FormControl;
  public readonly localVatRegistrationControl = this.formGroup.controls.localVatRegistration as FormControl;
  public readonly typeOfGoodsControl = this.formGroup.controls.typeOfGoods as FormControl;
  public readonly estimatedWeightControl = this.formGroup.controls.estimatedWeight as FormControl;
  public readonly estimatedWeightUnitControl = this.formGroup.controls.estimatedWeightUnit as FormControl;
  public readonly lengthUnitControl = this.formGroup.controls.lengthUnit as FormControl;
  public readonly packages = this.formGroup.controls.packages as FormControl;
  public readonly projectReferencesArray = this.formGroup.controls.projectReferences as FormArray;

  public readonly fromError$: Observable<string | null>;
  public readonly toError$: Observable<string | null>;

  // Disabled for ZUB-141
  // public readonly typeOfGoodsError$: Observable<string | null>;
  // public readonly typeOfGoodsErrorPresent$: Observable<boolean>;

  public readonly estimatedWeightError$: Observable<string | null> = this.validatorHelperService.getError$(this.estimatedWeightControl);

  private readonly destroyed$ = new Subject<void>();
  private readonly relatedValidationRules$: Observable<CountryValidationRule[]>;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly validatorHelperService: ValidatorHelperService,
    private readonly addressService: AddressService,
    private readonly countryValidationService: CountryValidationService,
    private readonly authService: AuthService,
    private readonly activateAccountService: ActivateAccountService,
    private readonly chargeableWeightDialogService: ChargeableWeightDialogService,
    private readonly localVatRegistrationService: LocalVatRegistrationService
  ) {
    // This is here to cache error streams.
    this.projectReferences$ = this.formGroup.value$.pipe(
      distinctUntilChanged((previous, current) => previous.projectReferences.length === current.projectReferences.length),
      map(({ projectReferences }) =>
        projectReferences.map((_, index) => {
          const formControl = this.projectReferencesArray.at(index) as FormControl;

          return {
            formControl,
            // eslint-disable-next-line rxjs/finnish
            errors$: this.validatorHelperService.getError$(formControl),
          };
        })
      )
    );

    const from$ = this.fromControl.value$.pipe(map((value) => value?.value));
    this.relatedValidationRules$ = combineLatest([this.validationRules$, this.toControl.value$, from$]).pipe(
      map(([validationRules, to, from]) =>
        this.countryValidationService.getRelatedValidationRules(validationRules, ServiceType.IOR, from, isNil(to) ? [] : [to.value])
      ),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.authService.getUser$().subscribe((user: User) => {
      this.toControl.setValidators([Validators.required, unvettedDestinationCountryLimit(user.isVetted)]);
    });

    // Disabled for ZUB-141
    // this.showTypeOfGoodsQuestion$ = this.relatedValidationRules$.pipe(
    //   map((relatedValidationRules) =>
    //     this.countryValidationService.shouldShowTypeOfGoodsQuestion(relatedValidationRules, ServiceType.IOR)
    //   ),
    //   distinctUntilChanged()
    // );

    const allValidationErrors$: Observable<CountryValidationError[]> = combineLatest([
      this.relatedValidationRules$,
      this.typeOfGoodsControl.value$,
      from$,
      this.toControl.value$,
    ]).pipe(
      map(([validationRules, typeOfGoods, from, to]) =>
        this.countryValidationService.getErrors(
          validationRules,
          typeOfGoods,
          from,
          isNil(to) ? [] : [to.value],
          ServiceType.IOR,
          undefined,
          {
            IORRefurbishedGoodsDisabled: true,
            IORSecondHandGoodsDisabled: true,
            IORConditionDisabled: true,
            IORConditionValueDisabled: true,
            EORSecondHandGoodsDisabled: true,
            EORRefurbishedGoodsDisabled: true,
            EORConditionDisabled: true,
            EORConditionValueDisabled: true,
          }
        )
      )
    );

    this.validationErrors$ = allValidationErrors$.pipe(map((errors) => errors.filter((err) => !err.messageCTA)));
    this.validationErrorsWithLink$ = allValidationErrors$.pipe(map((errors) => errors.filter((err) => err.messageCTA)));

    this.fromError$ = this.markWithValidationError$(
      this.validatorHelperService.getError$(this.fromControl),
      CountryValidationErrorField.From
    );
    this.toError$ = this.markWithValidationError$(this.validatorHelperService.getError$(this.toControl), CountryValidationErrorField.To);

    // Disabled for ZUB-141
    // this.typeOfGoodsError$ = this.markWithValidationError$(
    //   this.validatorHelperService.getError$(this.typeOfGoodsControl),
    //   CountryValidationErrorField.TypeOfGoods
    // );
    //
    // this.typeOfGoodsErrorPresent$ = this.typeOfGoodsError$.pipe(
    //   map((error) => !isNil(error)),
    //   startWith(false)
    // );

    this.estimatedWeightUnitControl.value$.pipe(takeUntil(this.destroyed$)).subscribe((unit) => this.updateWeightValidators(unit));
  }

  public get hasPackageGroups(): boolean {
    return this.packages.value.length > 0;
  }

  public get hasFromCountry(): boolean {
    return !isEmpty(this.fromControl.value);
  }

  public get hasToCountry(): boolean {
    return !isEmpty(this.toControl.value);
  }

  public ngOnInit(): void {
    combineLatest([this.validationErrors$, this.formGroup.status$])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([validationErrors]) => {
        const canProceed = this.formGroup.valid && validationErrors.length === 0;
        this.validityChange.next(canProceed);
      });

    // we have to reset value of pickup addresses whenever pickup country changes
    // to avoid sending selected country with wrong address
    this.fromControl.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(() => {
      this.pickUpAddressControl.setValue([]);
    });
    // we have to reset value of destination addresses whenever destination countries changes
    // to avoid sending selected countries with wrong address
    this.toControl.valueChanges.pipe(distinctUntilChanged(isEqual), takeUntil(this.destroyed$)).subscribe((inputValue) => {
      // this.localVatRegistrationControl.setValue(undefined);
      if (!isNil(inputValue)) {
        this.getLocalVatRegistration(inputValue.value);
      }
    });

    // Disabled for ZUB-141
    // this.showTypeOfGoodsQuestion$.pipe(takeUntil(this.destroyed$)).subscribe((showTypeOfGoodsQuestion) => {
    //   if (showTypeOfGoodsQuestion) {
    //     this.typeOfGoodsControl.setValidators(Validators.required);
    //   } else {
    //     this.typeOfGoodsControl.clearValidators();
    //     this.typeOfGoodsControl.setValue(undefined);
    //   }
    // });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes?.initialValues) {
      this.loadInitalValues(changes.initialValues.currentValue);
    }

    if (changes?.isEditing) {
      this.toggleControls();
    }
  }

  private loadInitalValues(initialValues: QuoteBasicsForm): void {
    if (initialValues.projectReferences.length > 1) {
      initialValues.projectReferences.slice(1).forEach(() => this.onAddProjectReferenceClick());
    }
    this.formGroup.patchValue({
      ...initialValues,
      from: constructInputData(initialValues.from),
      to: constructInputData(initialValues.to),
    });
    this.getLocalVatRegistration(initialValues.to);
  }

  private toggleControls(): void {
    if (this.isEditing) {
      this.fromControl.disable();
      this.toControl.disable();
    } else {
      this.fromControl.enable();
      this.toControl.enable();
    }
  }

  public get canAddProjectReference(): boolean {
    return this.projectReferencesArray.length === 1;
  }

  public onAddProjectReferenceClick(): void {
    this.projectReferencesArray.push(this.formBuilder.control('', Validators.maxLength(this.MAX_PROJECT_NAME_REFERENCE_LENGTH)));
  }

  public onAddPickUpAddressClick(): void {
    if (!this.hasFromCountry) {
      return;
    }
    this.addressService
      .selectPickupAddresses$({
        country: this.fromControl.value.value,
        countries: this.allCountries,
        selectedAddresses: this.pickUpAddressControl.value,
      })
      .pipe(takeUntil(this.destroyed$))
      .subscribe((selectedAddresses) => {
        if (selectedAddresses === undefined) {
          return;
        }
        this.pickUpAddressControl.setValue(selectedAddresses);
        this.cdr.markForCheck();
      });
  }

  public onEditPickupAddressClick(): void {
    this.onAddPickUpAddressClick();
  }

  public onUseWeightCalculatorClick(packages?: ChargeableWeightDialogPackageVM[]): void {
    this.chargeableWeightDialogService
      .open({
        packages,
      })
      .afterClosed$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((result: ChargeableWeightDialogResult) => {
        if (!result) {
          return;
        }

        const totalPackagesWeight = result.packages.reduce(
          (totalWeight, packageValue) =>
            (totalWeight += packageValue.packageCount * mapWeight(packageValue.weight, packageValue.weightUnit, WeightUnit.Kg)),
          0
        );

        this.formGroup.patchValue({
          estimatedWeight: totalPackagesWeight,
          estimatedWeightUnit: WeightUnit.Kg,
          lengthUnit: LengthUnit.Cm,
          packages: result.packages,
        });

        this.estimatedWeightControl.disable();

        this.cdr.markForCheck();
      });
  }

  public onEditPackagesClick(): void {
    this.onUseWeightCalculatorClick(this.packages.value);
  }

  public onSubmit(): void {
    this.submitBasics.next();
  }

  public getValue(): QuoteBasicsForm {
    const values = this.formGroup.getRawValue();

    return {
      ...values,
      from: values.from.value,
      to: values.to.value,
    };
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private markWithValidationError$(error$: Observable<string | null>, fieldName: CountryValidationErrorField): Observable<string | null> {
    return combineLatest([error$, this.validationErrors$]).pipe(
      map(([message, validationErrors]) => {
        if (message) {
          return message;
        }

        const hasRelatedValidationError = validationErrors.some((validationError) => validationError.fieldsToMark.includes(fieldName));

        // Empty string will mark the form control with red color,
        // but do not show an error message, which fits our case.
        if (hasRelatedValidationError) {
          return '';
        }

        return null;
      })
    );
  }

  public onErrorMessageLinkClick(type: CountryValidationErrorMessageCTAType): void {
    if (type === CountryValidationErrorMessageCTAType.ActivateAccount) {
      this.activateAccountService.openVerifyAccountModal$().pipe(takeUntil(this.destroyed$)).subscribe();
    }
  }

  private getLocalVatRegistration(country: string) {
    if (!country) {
      return;
    }

    this.localVatRegistrationService
      .getCachedVatRegistrationForCountry$(country)
      .pipe(take(1), takeUntil(this.destroyed$))
      .subscribe((result) => {
        this.localVatRegistrationControl.setValue(result);
        this.cdr.markForCheck();
      });
  }

  public onAddLocalVatRegistrationClick(): void {
    this.localVatRegistrationService
      .createThroughDialog$(this.toControl.value.value, this.allCountries, this.destinationCountries)
      .pipe(take(1), takeUntil(this.destroyed$))
      .subscribe((result) => {
        this.localVatRegistrationControl.setValue(result);
        this.cdr.markForCheck();
      });
  }

  public onEditLocalVatRegistrationClick(localRegistrationData: LocalVatRegistrationVM): void {
    this.localVatRegistrationService
      .editThroughDialog$(this.toControl.value.value, this.allCountries, this.destinationCountries, localRegistrationData)
      .pipe(take(1), takeUntil(this.destroyed$))
      .subscribe((result) => {
        this.localVatRegistrationControl.setValue(result);
        this.cdr.markForCheck();
      });
  }

  private updateWeightValidators(unit: WeightUnit): void {
    this.estimatedWeightControl.clearValidators();
    this.estimatedWeightControl.addValidators([
      Validators.required,
      numberValidator(),
      greaterThanValidator(unit === WeightUnit.Lbs ? MIN_WEIGHT_LBS : MIN_WEIGHT_KG, true),
    ]);
    this.estimatedWeightControl.updateValueAndValidity();
  }
}
