import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { ChargeableWeightDialogModule } from '@global/modules/chargeable-weight-dialog/chargeable-weight-dialog.module';
import { DropdownModule } from '@global/modules/dropdown/dropdown.module';
import { FormControlModule } from '@global/modules/form-control/form-control.module';
import { LoadingIndicatorModule } from '@global/modules/loading-indicator/loading-indicator.module';
import { MessageCardModule } from '@global/modules/message-card/message-card.module';
import { SelectionModule } from '@global/modules/selection/selection.module';
import { ShipmentStateIndicatorCirclesModule } from '@global/modules/shipment-state-indicator-circles/shipment-state-indicator-circles.module';
import { LocalVatRegistrationModule } from '@modules/local-vat-registration/local-vat-registration.module';
import { CostExplanationDialogModule } from '@shared/modules/cost-explanation-dialog/cost-explanation-dialog.module';
import { SharedModule } from '@shared/shared.module';
import { CostsTableComponent } from './components/costs-table/costs-table.component';
import { QuoteAcceptDialogComponent } from './components/quote-accept-dialog/quote-accept-dialog.component';
import { QuoteAcceptDialogService } from './components/quote-accept-dialog/quote-accept-dialog.service';
import { QuoteBasicsDialogComponent } from './components/quote-basics-dialog/quote-basics-dialog.component';
import { QuoteBasicsDialogService } from './components/quote-basics-dialog/quote-basics-dialog.service';
import { QuoteBasicsComponent } from './components/quote-basics/quote-basics.component';
import { ShipmentMethodCardComponent } from './components/shipment-method-card/shipment-method-card.component';
import { ShipmentMethodDialogComponent } from './components/shipment-method-dialog/shipment-method-dialog.component';
import { ShipmentMethodDialogService } from './components/shipment-method-dialog/shipment-method-dialog.service';
import { ShipmentMethodComponent } from './components/shipment-method/shipment-method.component';
import { QuoteService } from './services/quote.service';
import { ShipmentMethodService } from './services/shipment-method.service';

@NgModule({
  imports: [
    SharedModule,
    MessageCardModule,
    FormControlModule,
    SelectionModule,
    DropdownModule,
    ReactiveFormsModule,
    MatRadioModule,
    LoadingIndicatorModule,
    ChargeableWeightDialogModule.forFeature(),
    LocalVatRegistrationModule.forFeature(),
    CostExplanationDialogModule,
    ShipmentStateIndicatorCirclesModule,
    MatCheckboxModule,
  ],
  declarations: [
    QuoteBasicsComponent,
    QuoteBasicsDialogComponent,
    ShipmentMethodComponent,
    ShipmentMethodCardComponent,
    ShipmentMethodDialogComponent,
    CostsTableComponent,
    QuoteAcceptDialogComponent,
  ],
  exports: [QuoteBasicsComponent, QuoteBasicsDialogComponent, ShipmentMethodComponent, CostsTableComponent, QuoteAcceptDialogComponent],
})
export class QuoteModule {
  public static forFeature(): ModuleWithProviders<QuoteModule> {
    return {
      ngModule: QuoteModule,
      providers: [QuoteService, QuoteBasicsDialogService, ShipmentMethodDialogService, ShipmentMethodService, QuoteAcceptDialogService],
    };
  }
}
