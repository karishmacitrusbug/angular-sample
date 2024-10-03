import { ValidatorFn } from '@ngneat/reactive-forms';

export const existingVatRegistrationValidator =
  (countryList: string[]): ValidatorFn =>
  (formControl) => {
    if (!formControl.value) {
      // eslint-disable-next-line unicorn/no-useless-undefined
      return undefined;
    }

    if (countryList.includes(formControl.value.value)) {
      return { vatRegistrationExists: true };
    }

    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined;
  };
