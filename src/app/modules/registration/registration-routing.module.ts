import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationRouteSegment } from '@global/modules/common-registration/enums/registration-route-segment.enum';
import { RegistrationSuccessComponent } from './pages/registration-success/registration-success.component';
import { RegistrationComponent } from './pages/registration/registration.component';

const routes: Routes = [
  {
    path: '',
    component: RegistrationComponent,
  },
  {
    path: RegistrationRouteSegment.Success,
    component: RegistrationSuccessComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationRoutingModule {}
