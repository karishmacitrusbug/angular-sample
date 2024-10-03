import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuoteListRouteParam } from './enums/quote-list-route-param.enum';
import { QuoteDetailsPageComponent } from './pages/quote-details-page/quote-details-page.component';
import { QuoteListPageComponent } from './pages/quote-list-page/quote-list-page.component';

const routes: Routes = [
  { path: '', component: QuoteListPageComponent },
  {
    path: `:${QuoteListRouteParam.QuoteId}`,
    component: QuoteDetailsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuoteListRoutingModule {}
