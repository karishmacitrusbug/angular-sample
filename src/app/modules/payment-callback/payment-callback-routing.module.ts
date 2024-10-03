import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentCallbackPageComponent } from './pages/payment-callback-page/payment-callback-page.component';

const routes: Routes = [{ path: '', component: PaymentCallbackPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentCallbackRoutingModule {}
