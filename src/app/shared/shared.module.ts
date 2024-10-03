import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { GlobalModule } from '@global/global.module';
import { DialogModule } from '@global/modules/dialog/dialog.module';
import { SvgIconsModule } from '@global/modules/svg-icons/svg-icons.module';
import { TranslateModule } from '@ngx-translate/core';
import { GetShipmentMethodPipe } from './pipes/get-shipment-method.pipe';

@NgModule({
  declarations: [GetShipmentMethodPipe],
  imports: [GlobalModule],
  exports: [GlobalModule, SvgIconsModule, TranslateModule, DialogModule, MatButtonModule, RouterModule, GetShipmentMethodPipe],
})
export class SharedModule {}
