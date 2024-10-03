import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonInvoicesModule } from '@global/modules/common-invoices/common-invoices.module';
import { InvoiceDetailsService } from '@global/modules/common-invoices/service/invoice-details.service';
import { LoadingIndicatorModule } from '@global/modules/loading-indicator/loading-indicator.module';
import { MessageButtonModule } from '@global/modules/message-button/message-button.module';
import { CommonMessageEffect } from '@global/modules/message-thread/effects/common-messages.effects';
import * as fromCommonMessage from '@global/modules/message-thread/reducers';
import { PageContainerModule } from '@global/modules/page-container/page-container.module';
import { SearchFieldModule } from '@global/modules/search-field/search-field.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { InvoiceDialogModule } from '@shared/modules/invoice-dialog/invoice-dialog.module';
import { SharedModule } from '@shared/shared.module';
import { InvoicesRoutingModule } from './invoices-routing.module';
import { InvoicesPageComponent } from './pages/invoices-page/invoices-page.component';
import { InvoicesService } from './services/invoices.service';

@NgModule({
  declarations: [InvoicesPageComponent],
  imports: [
    SharedModule,
    PageContainerModule,
    InvoicesRoutingModule,
    CommonInvoicesModule,
    LoadingIndicatorModule,
    MessageButtonModule,
    InvoiceDialogModule,
    SearchFieldModule,
    MatTabsModule,
    FormsModule,
    StoreModule.forFeature(fromCommonMessage.messagesFeatureKey, fromCommonMessage.reducers),
    EffectsModule.forFeature([CommonMessageEffect]),
  ],
  providers: [InvoicesService, InvoiceDetailsService],
})
export class InvoicesModule {}
