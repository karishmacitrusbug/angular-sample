import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { mapGooglePlaceResult } from '@global/modules/common-address/helpers/map-google-place-result.helper';
import { AddressAutocompleteResult } from '@global/modules/common-address/interfaces/address-autocomplete-result.interface';
import { DIALOG_DATA } from '@global/modules/dialog/dialog.tokens';
import { DialogData } from '@global/modules/dialog/interfaces/dialog-data.interface';
import { ValidatorHelperService } from '@global/services/validator-helper.service';
import { CustomValidators } from '@global/validators/custom.validators';
import { emailWithTldValidator } from '@global/validators/email-with-tld.validator';
import { phoneNumberValidator } from '@global/validators/phone-number.validator';
import { LocalVatRegistrationDialogPayload } from '@modules/local-vat-registration/interfaces/local-vat-registration-dialog-payload.interface';
import { FormBuilder, FormControl, FormGroup } from '@ngneat/reactive-forms';
import { existingVatRegistrationValidator } from '@shared/validators/existing-vat-registration.validator';
import { TypeOfRegistration } from '@CitT/data';
import isNil from 'lodash/isNil';
import { Observable, Subject } from 'rxjs';

interface LocalVatRegistrationForm extends Omit<LocalVatRegistrationVM, 'id' | 'toCountry' | 'registeredCountry' | 'registrationType'> {
  toCountry: InputDataVM<string, string>;
  registeredCountry: InputDataVM<string, string>;
  registrationType: InputDataVM<TypeOfRegistration, TypeOfRegistration>;
}

@Component({
  templateUrl: './local-vat-registration-dialog.component.html',
  styleUrls: ['./local-vat-registration-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalVatRegistrationDialogComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  public readonly registrationTypes: InputDataVM<string, string>[] = [
    {
      value: TypeOfRegistration.EU_ESTABLISHED,
      viewValue: TypeOfRegistration.EU_ESTABLISHED,
    },
    {
      value: TypeOfRegistration.FOREIGN_VAT_REGISTRATION,
      viewValue: TypeOfRegistration.FOREIGN_VAT_REGISTRATION,
    },
  ];

  public formGroup: FormGroup<LocalVatRegistrationForm> = this.fromBuilder.group({
    registeredEntityName: this.fromBuilder.control('', [Validators.required]),
    vatNumber: this.fromBuilder.control('', [Validators.required]),
    registrationType: this.fromBuilder.control(undefined, [Validators.required]),
    toCountry: this.fromBuilder.control({ value: undefined, disabled: this.data.payload.toCountryDisabled }, [
      Validators.required,
      CustomValidators.conditionalValidator(
        () => !!this.data.payload.alreadyRegisteredCountries?.length,
        existingVatRegistrationValidator(this.data.payload.alreadyRegisteredCountries)
      ),
    ]),
    registeredAddress: this.fromBuilder.control('', [Validators.required]),
    registeredCity: this.fromBuilder.control('', [Validators.required]),
    registeredState: this.fromBuilder.control('', [Validators.required]),
    registeredCountry: this.fromBuilder.control(undefined, [Validators.required]),
    registeredPostalCode: this.fromBuilder.control('', [Validators.required]),
    contactPersonName: this.fromBuilder.control('', [Validators.required]),
    contactPersonEmail: this.fromBuilder.control('', [Validators.required, emailWithTldValidator]),
    contactPersonPhoneNumber: this.fromBuilder.control('', [Validators.required, phoneNumberValidator()]),
  });

  public readonly registeredEntityNameControl = this.formGroup.controls.registeredEntityName as FormControl<string>;
  public readonly vatNumberControl = this.formGroup.controls.vatNumber as FormControl<string>;
  public readonly registrationTypeControl = this.formGroup.controls.registrationType as FormControl<
    InputDataVM<TypeOfRegistration, TypeOfRegistration>
  >;
  public readonly toCountryControl = this.formGroup.controls.toCountry as FormControl<InputDataVM<string, string>>;
  public readonly registeredAddressControl = this.formGroup.controls.registeredAddress as FormControl<string>;
  public readonly registeredCityControl = this.formGroup.controls.registeredCity as FormControl<string>;
  public readonly registeredStateControl = this.formGroup.controls.registeredState as FormControl<string>;
  public readonly registeredCountryControl = this.formGroup.controls.registeredCountry as FormControl<InputDataVM<string, string>>;
  public readonly registeredPostalCodeControl = this.formGroup.controls.registeredPostalCode as FormControl<string>;
  public readonly contactPersonNameControl = this.formGroup.controls.contactPersonName as FormControl<string>;
  public readonly contactPersonEmailControl = this.formGroup.controls.contactPersonEmail as FormControl<string>;
  public readonly contactPersonPhoneNumberControl = this.formGroup.controls.contactPersonPhoneNumber as FormControl<string>;

  public readonly registeredEntityNameError$: Observable<string | null> = this.validatorHelperService.getError$(
    this.registeredEntityNameControl
  );
  public readonly vatNumberError$: Observable<string | null> = this.validatorHelperService.getError$(this.vatNumberControl);
  public readonly registrationTypeError$: Observable<string | null> = this.validatorHelperService.getError$(this.registrationTypeControl);
  public readonly toCountryError$: Observable<string | null> = this.validatorHelperService.getError$(this.toCountryControl);
  public readonly registeredAddressError$: Observable<string | null> = this.validatorHelperService.getError$(this.registeredAddressControl);
  public readonly registeredCityError$: Observable<string | null> = this.validatorHelperService.getError$(this.registeredCityControl);
  public readonly registeredStateError$: Observable<string | null> = this.validatorHelperService.getError$(this.registeredStateControl);
  public readonly registeredCountryError$: Observable<string | null> = this.validatorHelperService.getError$(this.registeredCountryControl);
  public readonly registeredPostalCodeError$: Observable<string | null> = this.validatorHelperService.getError$(
    this.registeredPostalCodeControl
  );
  public readonly contactPersonNameError$: Observable<string | null> = this.validatorHelperService.getError$(this.contactPersonNameControl);
  public readonly contactPersonEmailError$: Observable<string | null> = this.validatorHelperService.getError$(
    this.contactPersonEmailControl
  );
  public readonly contactPersonPhoneNumberError$: Observable<string | null> = this.validatorHelperService.getError$(
    this.contactPersonPhoneNumberControl
  );

  public isEditing = false;

  constructor(
    @Inject(DIALOG_DATA) public readonly data: DialogData<LocalVatRegistrationDialogPayload, LocalVatRegistrationVM>,
    private readonly fromBuilder: FormBuilder,
    private readonly validatorHelperService: ValidatorHelperService
  ) {}

  public ngOnInit(): void {
    if (this.data.payload.formValues) {
      this.isEditing = true;
      this.formGroup.patchValue({
        ...this.data.payload.formValues,
        toCountry: { value: this.data.payload.formValues.toCountry, viewValue: this.data.payload.formValues.toCountry },
        registeredCountry: {
          value: this.data.payload.formValues.registeredCountry,
          viewValue: this.data.payload.formValues.registeredCountry,
        },
        registrationType: {
          value: this.data.payload.formValues.registrationType,
          viewValue: this.data.payload.formValues.registrationType,
        },
      });
    } else {
      this.formGroup.patchValue({
        toCountry: !isNil(this.data.payload.toCountry)
          ? { value: this.data.payload.toCountry, viewValue: this.data.payload.toCountry }
          : undefined,
      });
    }
  }

  public onSubmitClick(): void {
    if (this.formGroup.valid) {
      this.data.dialogRef.close({
        ...this.formGroup.value,
        id: this.data.payload.formValues?.id || undefined,
        toCountry: this.toCountryControl.value.value,
        registeredCountry: this.registeredCountryControl.value.value,
        registrationType: this.registrationTypeControl.value.value,
      });
    }
  }

  public onBackIconClick(): void {
    this.data.dialogRef.close();
  }

  public onCancelClick(): void {
    this.data.dialogRef.close();
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public onAddressSelect(placeResult: google.maps.places.PlaceResult): void {
    const autocompleteAddress: AddressAutocompleteResult = mapGooglePlaceResult(placeResult);
    this.formGroup.patchValue({
      registeredAddress: autocompleteAddress.address,
      registeredCity: autocompleteAddress.city,
      registeredState: autocompleteAddress.state,
      registeredPostalCode: autocompleteAddress.zip,
      registeredCountry: { value: autocompleteAddress.country, viewValue: autocompleteAddress.country },
    });
  }
}
