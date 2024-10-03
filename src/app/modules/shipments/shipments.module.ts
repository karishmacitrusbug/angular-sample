import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { ActionButtonsModule } from '@global/modules/action-buttons/action-buttons.module';
import { InvoiceDetailsService } from '@global/modules/common-invoices/service/invoice-details.service';
import { CommonQuoteModule } from '@global/modules/common-quote/common-quote.module';
import { CommonShipmentsModule } from '@global/modules/common-shipments/common-shipments.module';
import { ContextMenuModule } from '@global/modules/context-menu/context-menu.module';
import { DetailAddressCardModule } from '@global/modules/detail-address-card/detail-address-card.module';
import { DetailCardModule } from '@global/modules/detail-card/detail-card.module';
import { FormControlModule } from '@global/modules/form-control/form-control.module';
import { LoadingIndicatorModule } from '@global/modules/loading-indicator/loading-indicator.module';
import { MessageCardModule } from '@global/modules/message-card/message-card.module';
import { MessageEnvelopeModule } from '@global/modules/message-envelope/message-envelope.module';
import { MultiAutocompleteModule } from '@global/modules/multi-autocomplete/multi-autocomplete.module';
import { PackageClosedContentCardModule } from '@global/modules/package-closed-content-card/package-closed-content-card.module';
import { PageContainerModule } from '@global/modules/page-container/page-container.module';
import { SearchFieldModule } from '@global/modules/search-field/search-field.module';
import { SelectModule } from '@global/modules/select/select.module';
import { SelectionModule } from '@global/modules/selection/selection.module';
import { ShipmentStateIndicatorCirclesModule } from '@global/modules/shipment-state-indicator-circles/shipment-state-indicator-circles.module';
import { TableHeaderSortButtonModule } from '@global/modules/table-header-sort-button/table-header-sort-button.module';
import { TooltipModule } from '@global/modules/tooltip/tooltip.module';
import { TrackerModule } from '@global/modules/tracker/tracker.module';
import { TrackingLogCardModule } from '@global/modules/tracking-log-card/tracking-log-card.module';
import { TrackingNumberDialogDataService } from '@global/modules/tracking-number/components/tracking-number-dialog/tracking-number-dialog-data.service';
import { TrackingNumberModule } from '@global/modules/tracking-number/tracking-number.module';
import { CountryModule } from '@modules/country/country.module';
import { LocalVatRegistrationModule } from '@modules/local-vat-registration/local-vat-registration.module';
import { ShipmentListSideFilterDialogService } from '@modules/shipments/components/shipment-list-side-filter-dialog/shipment-list-side-filter-dialog.service.ts.service';
import { ShipmentDetailsEffects } from '@modules/shipments/effects/shipment-details.effects';
import { ShipmentListEffects } from '@modules/shipments/effects/shipment-list.effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { InvoiceDialogModule } from '@shared/modules/invoice-dialog/invoice-dialog.module';
import { SharedModule } from '@shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { ComplianceStatusHeaderComponent } from './components/compliance-status-header/compliance-status-header.component';
import { ShipmentCostsTableComponent } from './components/shipment-costs-table/shipment-costs-table.component';
import { ShipmentDetailsCardComponent } from './components/shipment-details-card/shipment-details-card.component';
import { ShipmentInvoiceItemComponent } from './components/shipment-invoice-item/shipment-invoice-item.component';
import { ShipmentListSideFilterDialogComponent } from './components/shipment-list-side-filter-dialog/shipment-list-side-filter-dialog.component';
import { ShipmentsTableRowComponent } from './components/shipments-table-row/shipments-table-row.component';
import { ShipmentsTableComponent } from './components/shipments-table/shipments-table.component';
import { ShipmentsDetailsPageComponent } from './pages/shipments-details-page/shipments-details-page.component';
import { ShipmentsListPageComponent } from './pages/shipments-list-page/shipments-list-page.component';
import * as fromShipments from './reducers';
import { ShipmentsRoutingModule } from './shipments-routing.module';

@NgModule({
  declarations: [
    ShipmentsListPageComponent,
    ShipmentsTableComponent,
    ShipmentsTableRowComponent,
    ShipmentListSideFilterDialogComponent,
    ShipmentsDetailsPageComponent,
    ComplianceStatusHeaderComponent,
    ShipmentDetailsCardComponent,
    ShipmentInvoiceItemComponent,
    ShipmentCostsTableComponent,
  ],
  imports: [
    SharedModule,
    ShipmentsRoutingModule,
    PageContainerModule,
    LoadingIndicatorModule,
    MatTabsModule,
    TooltipModule,
    NgxPaginationModule,
    ShipmentStateIndicatorCirclesModule,
    TrackerModule,
    StoreModule.forFeature(fromShipments.shipmentsFeatureKey, fromShipments.reducers),
    EffectsModule.forFeature([ShipmentListEffects, ShipmentDetailsEffects]),
    SelectionModule,
    SearchFieldModule,
    ReactiveFormsModule,
    FormsModule,
    CountryModule,
    FormControlModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MultiAutocompleteModule,
    SelectModule,
    ContextMenuModule,
    TrackingLogCardModule,
    TrackingNumberModule,
    PackageClosedContentCardModule,
    CommonQuoteModule.forFeature(),
    CommonShipmentsModule,
    MessageEnvelopeModule,
    MessageCardModule,
    InvoiceDialogModule,
    DetailCardModule,
    DetailAddressCardModule,
    LocalVatRegistrationModule.forFeature(),
    ActionButtonsModule,
    TableHeaderSortButtonModule,
  ],
  providers: [ShipmentListSideFilterDialogService, TrackingNumberDialogDataService, InvoiceDetailsService],
})
export class ShipmentsModule {}
