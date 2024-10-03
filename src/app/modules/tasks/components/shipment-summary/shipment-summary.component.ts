import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { ShipmentStatus } from '@global/enums/shipment-status.enum';
import { ShipmentSummaryComponentType } from '@global/modules/tasks/types/shipment-summary-component-type.interface';
import { TaskVM } from '@global/modules/tasks/types/task.vm';

@Component({
  selector: 'app-shipment-summary',
  templateUrl: './shipment-summary.component.html',
  styleUrls: ['./shipment-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentSummaryComponent implements ShipmentSummaryComponentType {
  @Input() public shipmentOrder: TaskVM['shipmentOrder'];

  public readonly ShipmentStatus = ShipmentStatus;

  public get shipmentLink(): string[] {
    return [RouteSegment.Root, RouteSegment.ShipmentsList, this.shipmentOrder.id];
  }
}
