import { NgModule } from '@angular/core';
import { ShipmentStateIndicatorCirclesModule } from '@global/modules/shipment-state-indicator-circles/shipment-state-indicator-circles.module';
import { SvgIconsModule } from '@global/modules/svg-icons/svg-icons.module';
import { TrackerModule } from '@global/modules/tracker/tracker.module';
import { ShipmentSummaryComponent } from '@modules/tasks/components/shipment-summary/shipment-summary.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ShipmentSummaryComponent],
  imports: [SharedModule, SvgIconsModule, TrackerModule, ShipmentStateIndicatorCirclesModule],
  exports: [ShipmentSummaryComponent],
})
export class TasksModule {}
