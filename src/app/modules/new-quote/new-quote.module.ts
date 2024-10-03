import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActionButtonsModule } from '@global/modules/action-buttons/action-buttons.module';
import { ActivateAccountModule } from '@global/modules/activate-account/activate-account.module';
import { CancelQuoteDialogModule } from '@global/modules/cancel-quote-dialog/cancel-quote-dialog.module';
import { CommonCountryValidationModule } from '@global/modules/common-country-validation/common-country-validation.module';
import { CommonQuoteModule } from '@global/modules/common-quote/common-quote.module';
import { ContextMenuModule } from '@global/modules/context-menu/context-menu.module';
import { CurrencySelectorModule } from '@global/modules/currency-selector/currency-selector.module';
import { DropdownModule } from '@global/modules/dropdown/dropdown.module';
import { ExpandableTableModule } from '@global/modules/expandable-table/expandable-table.module';
import { LoadingIndicatorModule } from '@global/modules/loading-indicator/loading-indicator.module';
import { MessageButtonModule } from '@global/modules/message-button/message-button.module';
import { MessageCardModule } from '@global/modules/message-card/message-card.module';
import { MessageDialogModule } from '@global/modules/message-dialog/message-dialog.module';
import { PageContainerModule } from '@global/modules/page-container/page-container.module';
import { SelectModule } from '@global/modules/select/select.module';
import { SelectionModule } from '@global/modules/selection/selection.module';
import { TooltipModule } from '@global/modules/tooltip/tooltip.module';
import { CountryService } from '@modules/country/services/country.service';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CountryValidationModule } from '@shared/modules/country-validation/country-validation.module';
import { SharedModule } from '@shared/shared.module';
import { CountryModule } from '../country/country.module';
import { QuoteModule } from '../quote/quote.module';
import { ProgressTrackerComponent } from './components/progress-tracker/progress-tracker.component';
import { NewQuoteBasicsEffects } from './effects/new-quote-basics.effects';
import { NewQuoteFinalCostsEffects } from './effects/new-quote-final-costs.effects';
import { NewQuoteLineItemsEffects } from './effects/new-quote-line-items.effects';
import { NewQuoteShipmentMethodEffects } from './effects/new-quote-shipment-method.effects';
import { NewQuoteEffects } from './effects/new-quote.effects';
import { NewQuoteRoutingModule } from './new-quote-routing.module';
import { NewQuoteBasicsPageComponent } from './pages/new-quote-basics-page/new-quote-basics-page.component';
import { NewQuoteFinalCostsPageComponent } from './pages/new-quote-final-costs-page/new-quote-final-costs-page.component';
import { NewQuoteLineItemsPageComponent } from './pages/new-quote-line-items-page/new-quote-line-items-page.component';
import { NewQuotePageComponent } from './pages/new-quote-page/new-quote-page.component';
import { NewQuoteShipmentMethodPageComponent } from './pages/new-quote-shipment-method-page/new-quote-shipment-method-page.component';
import * as fromNewQuote from './reducers';

@NgModule({
  declarations: [
    NewQuoteBasicsPageComponent,
    NewQuotePageComponent,
    NewQuoteLineItemsPageComponent,
    ProgressTrackerComponent,
    NewQuoteShipmentMethodPageComponent,
    NewQuoteFinalCostsPageComponent,
  ],
  imports: [
    SharedModule,
    PageContainerModule,
    NewQuoteRoutingModule,
    StoreModule.forFeature(fromNewQuote.newQuoteFeatureKey, fromNewQuote.reducers),
    MatButtonModule,
    MessageButtonModule,
    EffectsModule.forFeature([
      NewQuoteEffects,
      NewQuoteBasicsEffects,
      NewQuoteLineItemsEffects,
      NewQuoteShipmentMethodEffects,
      NewQuoteFinalCostsEffects,
    ]),
    MessageCardModule,
    QuoteModule.forFeature(),
    ExpandableTableModule,
    TooltipModule,
    MatCheckboxModule,
    CountryModule,
    LoadingIndicatorModule,
    MessageDialogModule,
    ContextMenuModule,
    CommonCountryValidationModule.forFeature(),
    CountryValidationModule,
    ActivateAccountModule.forFeature(),
    CommonQuoteModule.forFeature(),
    CancelQuoteDialogModule,
    ActionButtonsModule,
    SelectionModule,
    SelectModule,
    DropdownModule,
    ReactiveFormsModule,
    CurrencySelectorModule,
  ],
  providers: [CountryService],
})
export class NewQuoteModule {}
