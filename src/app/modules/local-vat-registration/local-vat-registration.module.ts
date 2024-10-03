import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DialogModule } from '@global/modules/dialog/dialog.module';
import { DropdownModule } from '@global/modules/dropdown/dropdown.module';
import { FormControlModule } from '@global/modules/form-control/form-control.module';
import { GoogleMapAutocompleteModule } from '@global/modules/google-map-autocomplete/google-map-autocomplete.module';
import { SvgIconsModule } from '@global/modules/svg-icons/svg-icons.module';
import { LocalVatRegistrationDialogService } from '@modules/local-vat-registration/components/local-vat-registration-dialog/local-vat-registration-dialog.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { LocalVatRegistrationDialogComponent } from './components/local-vat-registration-dialog/local-vat-registration-dialog.component';
import { LocalVatRegistrationService } from './services/local-vat-registration.service';

@NgModule({
  declarations: [LocalVatRegistrationDialogComponent],
  imports: [
    SharedModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    FormControlModule,
    DropdownModule,
    TranslateModule,
    MatButtonModule,
    SvgIconsModule,
    GoogleMapAutocompleteModule,
  ],
})
export class LocalVatRegistrationModule {
  public static forFeature(): ModuleWithProviders<LocalVatRegistrationModule> {
    return { ngModule: LocalVatRegistrationModule, providers: [LocalVatRegistrationDialogService, LocalVatRegistrationService] };
  }
}
