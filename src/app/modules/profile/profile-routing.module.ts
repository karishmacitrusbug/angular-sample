import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileRouteSegment } from '@global/enums/profile-route-segment.enum';
import { MyTeamPageComponent } from '@global/modules/common-profile/components/my-team-page/my-team-page.component';
import { AddressBookPageComponent } from './pages/address-book-page/address-book-page.component';
import { LocalVatRegistrationPageComponent } from './pages/local-vat-registration-page/local-vat-registration-page.component';
import { ProductListingPageComponent } from './pages/product-listing-page/product-listing-page.component';
import { ProfileAndNotificationsPageComponent } from './pages/profile-and-notifications-page/profile-and-notifications-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { QuoteDefaultsPageComponent } from './pages/quote-defaults-page/quote-defaults-page.component';

const routes: Routes = [
  {
    path: '',
    component: ProfilePageComponent,
    children: [
      {
        path: ProfileRouteSegment.MyTeam,
        component: MyTeamPageComponent,
      },
      {
        path: ProfileRouteSegment.QuoteDefaults,
        component: QuoteDefaultsPageComponent,
      },
      {
        path: ProfileRouteSegment.ProfileAndNotifications,
        component: ProfileAndNotificationsPageComponent,
      },
      {
        path: ProfileRouteSegment.AddressBook,
        component: AddressBookPageComponent,
      },
      {
        path: ProfileRouteSegment.ProductListing,
        component: ProductListingPageComponent,
      },
      {
        path: ProfileRouteSegment.LocalVatRegistrations,
        component: LocalVatRegistrationPageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
