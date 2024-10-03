import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActionButtonsModule } from '@global/modules/action-buttons/action-buttons.module';
import { LoadingIndicatorModule } from '@global/modules/loading-indicator/loading-indicator.module';
import { MessageButtonModule } from '@global/modules/message-button/message-button.module';
import { SvgIconsModule } from '@global/modules/svg-icons/svg-icons.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { InvoiceDetailsComponent } from './components/invoice-details/invoice-details.component';
import { InvoiceDialogComponent } from './components/invoice-dialog/invoice-dialog.component';
import { InvoiceDialogService } from './components/invoice-dialog/invoice-dialog.service';
import { PayDialogComponent } from './components/pay-dialog/pay-dialog.component';
import { PayDialogService } from './components/pay-dialog/pay-dialog.service';

@NgModule({
  declarations: [InvoiceDialogComponent, PayDialogComponent, InvoiceDetailsComponent],
  imports: [
    SharedModule,
    TranslateModule,
    MatButtonModule,
    SvgIconsModule,
    MessageButtonModule,
    LoadingIndicatorModule,
    ActionButtonsModule,
  ],
  exports: [InvoiceDialogComponent],
  providers: [InvoiceDialogService, PayDialogService],
})
export class InvoiceDialogModule {}
