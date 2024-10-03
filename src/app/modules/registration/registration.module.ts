import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonRegistrationModule } from '@global/modules/common-registration/common-registration.module';
import { DropdownModule } from '@global/modules/dropdown/dropdown.module';
import { FormControlModule } from '@global/modules/form-control/form-control.module';
import { LoadingIndicatorModule } from '@global/modules/loading-indicator/loading-indicator.module';
import { OnboardingHeaderModule } from '@global/modules/onboarding-header/onboarding-header.module';
import { PhoneInputModule } from '@global/modules/phone-input/phone-input.module';
import { CountryModule } from '@modules/country/country.module';
import { PrivacyAndTermsModule } from '@shared/modules/privacy-and-terms/privacy-and-terms.module';
import { SharedModule } from '@shared/shared.module';
import { RegistrationSuccessComponent } from './pages/registration-success/registration-success.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { RegistrationRoutingModule } from './registration-routing.module';

@NgModule({
  declarations: [RegistrationComponent, RegistrationSuccessComponent],
  imports: [
    RegistrationRoutingModule,
    SharedModule,
    FormControlModule,
    DropdownModule,
    MatCheckboxModule,
    OnboardingHeaderModule,
    CountryModule,
    LoadingIndicatorModule,
    PhoneInputModule,
    CommonRegistrationModule.forFeature(),
    PrivacyAndTermsModule.forFeature(),
  ],
})
export class RegistrationModule {}
