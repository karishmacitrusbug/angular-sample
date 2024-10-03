import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewQuoteRouteSegment } from './enums/new-quote-route-segment.enum';
import { BasicsGuard } from './guards/basics.guard';
import { FinalCostsGuard } from './guards/final-costs.guard';
import { LineItemsGuard } from './guards/line-items.guard';
import { ShipmentMethodGuard } from './guards/shipment-method.guard';
import { UnvettedLimitGuard } from './guards/unvetted-limit.guard';
import { NewQuoteBasicsPageComponent } from './pages/new-quote-basics-page/new-quote-basics-page.component';
import { NewQuoteFinalCostsPageComponent } from './pages/new-quote-final-costs-page/new-quote-final-costs-page.component';
import { NewQuoteLineItemsPageComponent } from './pages/new-quote-line-items-page/new-quote-line-items-page.component';
import { NewQuotePageComponent } from './pages/new-quote-page/new-quote-page.component';
import { NewQuoteShipmentMethodPageComponent } from './pages/new-quote-shipment-method-page/new-quote-shipment-method-page.component';

const routes: Routes = [
  {
    path: '',
    component: NewQuotePageComponent,
    canActivate: [UnvettedLimitGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: NewQuoteRouteSegment.Basics,
      },
      {
        path: NewQuoteRouteSegment.Basics,
        component: NewQuoteBasicsPageComponent,
        canActivate: [BasicsGuard],
      },
      {
        path: NewQuoteRouteSegment.LineItems,
        component: NewQuoteLineItemsPageComponent,
        canActivate: [LineItemsGuard],
      },
      {
        path: NewQuoteRouteSegment.ShipmentMethod,
        component: NewQuoteShipmentMethodPageComponent,
        canActivate: [ShipmentMethodGuard],
      },
      {
        path: NewQuoteRouteSegment.FinalCosts,
        component: NewQuoteFinalCostsPageComponent,
        canActivate: [FinalCostsGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [UnvettedLimitGuard, BasicsGuard, LineItemsGuard, ShipmentMethodGuard, FinalCostsGuard],
})
export class NewQuoteRoutingModule {}
