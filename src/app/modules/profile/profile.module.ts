import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { BottomBarComponent } from '@global/components/bottom-bar/bottom-bar.component';
import { CommonAddressModule } from '@global/modules/common-address/common-address.module';
import { CommonProfileModule } from '@global/modules/common-profile/common-profile.modules';
import { DropdownModule } from '@global/modules/dropdown/dropdown.module';
import { FormControlModule } from '@global/modules/form-control/form-control.module';
import { LoadingIndicatorModule } from '@global/modules/loading-indicator/loading-indicator.module';
import { MessageButtonModule } from '@global/modules/message-button/message-button.module';
import { MessageCardModule } from '@global/modules/message-card/message-card.module';
import { MessageThreadModule } from '@global/modules/message-thread/message-thread.module';
import { PageContainerModule } from '@global/modules/page-container/page-container.module';
import { SearchFieldModule } from '@global/modules/search-field/search-field.module';
import { SelectionModule } from '@global/modules/selection/selection.module';
import { StateIndicatorCircleModule } from '@global/modules/state-indicator-circle/state-indicator-circle.module';
import { TooltipModule } from '@global/modules/tooltip/tooltip.module';
import { CountryModule } from '@modules/country/country.module';
import { LocalVatRegistrationModule } from '@modules/local-vat-registration/local-vat-registration.module';
import { LocalVatRegistrationsEffects } from '@modules/profile/effects/local-vat-registrations.effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddressTabContentComponent } from './components/address-tab-content/address-tab-content.component';
import { AddressBookPageComponent } from './pages/address-book-page/address-book-page.component';
import { LocalVatRegistrationPageComponent } from './pages/local-vat-registration-page/local-vat-registration-page.component';
import { ProductListingPageComponent } from './pages/product-listing-page/product-listing-page.component';
import { ProfileAndNotificationsPageComponent } from './pages/profile-and-notifications-page/profile-and-notifications-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { QuoteDefaultsPageComponent } from './pages/quote-defaults-page/quote-defaults-page.component';
import { ProfileRoutingModule } from './profile-routing.module';
import * as fromLocalVatRegistrations from './reducers';

@NgModule({
  declarations: [
    ProfilePageComponent,
    ProfileAndNotificationsPageComponent,
    QuoteDefaultsPageComponent,
    AddressBookPageComponent,
    AddressTabContentComponent,
    ProductListingPageComponent,
    LocalVatRegistrationPageComponent,
    BottomBarComponent,
  ],
  imports: [
    SharedModule,
    ProfileRoutingModule,
    CommonProfileModule.forFeature(),
    PageContainerModule,
    FormsModule,
    MessageCardModule,
    MessageThreadModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormControlModule,
    SelectionModule,
    DropdownModule,
    CountryModule,
    LoadingIndicatorModule,
    MatTabsModule,
    CommonAddressModule,
    SearchFieldModule,
    MessageButtonModule,
    StateIndicatorCircleModule,
    TooltipModule,
    NgxPaginationModule,
    LocalVatRegistrationModule.forFeature(),
    StoreModule.forFeature(fromLocalVatRegistrations.localVatRegistrationsFeatureKey, fromLocalVatRegistrations.reducers),
    EffectsModule.forFeature([LocalVatRegistrationsEffects]),
  ],
})
export class ProfileModule {}
