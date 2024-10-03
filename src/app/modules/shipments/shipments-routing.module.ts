import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShipmentsListParam } from '@modules/shipments/enums/shipments-list-param.enum';
import { ShipmentsDetailsPageComponent } from '@modules/shipments/pages/shipments-details-page/shipments-details-page.component';
import { ShipmentsListPageComponent } from '@modules/shipments/pages/shipments-list-page/shipments-list-page.component';

const routes: Routes = [
  {
    path: '',
    component: ShipmentsListPageComponent,
  },
  {
    path: `:${ShipmentsListParam.ShipmentId}`,
    component: ShipmentsDetailsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShipmentsRoutingModule {}
