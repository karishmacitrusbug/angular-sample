import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { PaymentCallbackPageComponent } from './pages/payment-callback-page/payment-callback-page.component';
import { PaymentCallbackRoutingModule } from './payment-callback-routing.module';

@NgModule({
  declarations: [PaymentCallbackPageComponent],
  imports: [SharedModule, PaymentCallbackRoutingModule],
})
export class PaymentCallbackModule {}
