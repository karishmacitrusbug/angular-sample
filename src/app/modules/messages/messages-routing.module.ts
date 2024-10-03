import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MessagesRouteParam } from '@global/modules/common-messages/enums/messages-route-param.enum';
import { MessagesPageComponent } from './pages/messages-page/messages-page.component';

const routes: Routes = [
  {
    path: '',
    component: MessagesPageComponent,
  },
  {
    path: `:${MessagesRouteParam.Id}`,
    component: MessagesPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessagesRoutingModule {}
