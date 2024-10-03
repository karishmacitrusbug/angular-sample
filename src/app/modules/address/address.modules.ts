import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonAddressModule } from '@global/modules/common-address/common-address.module';
import { ADDRESS_SERVICE } from '@global/tokens/address-service.token';
import { SharedModule } from '@shared/shared.module';
import { SelectAddressDialogComponent } from './components/select-address-dialog/select-address-dialog.component';
import { SelectAddressComponent } from './components/select-address/select-address.component';
import { AddressService } from './services/address.service';

@NgModule({
  imports: [SharedModule, CommonAddressModule, FormsModule, MatTabsModule],
  declarations: [SelectAddressComponent, SelectAddressDialogComponent],
  exports: [SelectAddressComponent, SelectAddressDialogComponent],
})
export class AddressModule {
  public static forRoot(): ModuleWithProviders<AddressModule> {
    return {
      ngModule: AddressModule,
      providers: [
        AddressService,
        { provide: ADDRESS_SERVICE, useFactory: (addressService: AddressService) => addressService, deps: [AddressService] },
      ],
    };
  }
}
