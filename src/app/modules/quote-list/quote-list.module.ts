import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { ActionButtonsModule } from '@global/modules/action-buttons/action-buttons.module';
import { ActivateAccountModule } from '@global/modules/activate-account/activate-account.module';
import { CancelQuoteDialogModule } from '@global/modules/cancel-quote-dialog/cancel-quote-dialog.module';
import { CommonCountryValidationModule } from '@global/modules/common-country-validation/common-country-validation.module';
import { CommonQuoteModule } from '@global/modules/common-quote/common-quote.module';
import { ContextMenuModule } from '@global/modules/context-menu/context-menu.module';
import { DetailAddressCardModule } from '@global/modules/detail-address-card/detail-address-card.module';
import { DetailCardModule } from '@global/modules/detail-card/detail-card.module';
import { ExpandableCardModule } from '@global/modules/expandable-card/expandable-card.module';
import { FormControlModule } from '@global/modules/form-control/form-control.module';
import { LoadingIndicatorModule } from '@global/modules/loading-indicator/loading-indicator.module';
import { MessageButtonModule } from '@global/modules/message-button/message-button.module';
import { MessageCardModule } from '@global/modules/message-card/message-card.module';
import { MessageEnvelopeModule } from '@global/modules/message-envelope/message-envelope.module';
import { MultiAutocompleteModule } from '@global/modules/multi-autocomplete/multi-autocomplete.module';
import { PackageClosedContentCardModule } from '@global/modules/package-closed-content-card/package-closed-content-card.module';
import { PageContainerModule } from '@global/modules/page-container/page-container.module';
import { SearchFieldModule } from '@global/modules/search-field/search-field.module';
import { SelectModule } from '@global/modules/select/select.module';
import { SelectionModule } from '@global/modules/selection/selection.module';
import { TableHeaderSortButtonModule } from '@global/modules/table-header-sort-button/table-header-sort-button.module';
import { TooltipModule } from '@global/modules/tooltip/tooltip.module';
import { CountryModule } from '@modules/country/country.module';
import { CountryService } from '@modules/country/services/country.service';
import { LocalVatRegistrationModule } from '@modules/local-vat-registration/local-vat-registration.module';
import { QuoteListSideFilterDialogService } from '@modules/quote-list/components/quote-list-side-filter-dialog/quote-list-side-filter-dialog.service';
import { QuoteListEffects } from '@modules/quote-list/effects/quote-list.effects';
import { QuoteModule } from '@modules/quote/quote.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CountryValidationModule } from '@shared/modules/country-validation/country-validation.module';
import { SharedModule } from '@shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { QuoteActionsCellComponent } from './components/quote-actions-cell/quote-actions-cell.component';
import { QuoteDetailsCardComponent } from './components/quote-details-card/quote-details-card.component';
import { QuoteListSideFilterDialogComponent } from './components/quote-list-side-filter-dialog/quote-list-side-filter-dialog.component';
import { QuoteListTableComponent } from './components/quote-list-table/quote-list-table.component';
import { QuoteTableRowComponent } from './components/quote-table-row/quote-table-row.component';
import { YourQuoteContentComponent } from './components/your-quote-content/your-quote-content.component';
import { QuoteDetailsEffects } from './effects/quote-details.effects';
import { QuoteDetailsPageComponent } from './pages/quote-details-page/quote-details-page.component';
import { QuoteListPageComponent } from './pages/quote-list-page/quote-list-page.component';
import { QuoteListRoutingModule } from './quote-list-routing.module';
import * as fromQuoteList from './reducers';

@NgModule({
  declarations: [
    QuoteListPageComponent,
    QuoteActionsCellComponent,
    QuoteTableRowComponent,
    QuoteListTableComponent,
    QuoteListSideFilterDialogComponent,
    QuoteDetailsPageComponent,
    YourQuoteContentComponent,
    QuoteDetailsCardComponent,
  ],
  imports: [
    SharedModule,
    QuoteListRoutingModule,
    PageContainerModule,
    MatTabsModule,
    LoadingIndicatorModule,
    SelectionModule,
    SearchFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatCheckboxModule,
    NgxPaginationModule,
    StoreModule.forFeature(fromQuoteList.quoteListFeatureKey, fromQuoteList.reducers),
    EffectsModule.forFeature([QuoteListEffects, QuoteDetailsEffects]),
    FormControlModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MultiAutocompleteModule,
    CountryModule,
    PageContainerModule,
    SelectModule,
    MessageButtonModule,
    ContextMenuModule,
    MessageCardModule,
    MessageEnvelopeModule,
    CommonQuoteModule.forFeature(),
    ExpandableCardModule,
    QuoteModule.forFeature(),
    DetailCardModule,
    DetailAddressCardModule,
    PackageClosedContentCardModule,
    TooltipModule,
    ActivateAccountModule.forFeature(),
    CancelQuoteDialogModule,
    CountryValidationModule,
    CommonCountryValidationModule.forFeature(),
    LocalVatRegistrationModule.forFeature(),
    ActionButtonsModule,
    TableHeaderSortButtonModule,
  ],
  providers: [QuoteListSideFilterDialogService, CountryService],
})
export class QuoteListModule {}
