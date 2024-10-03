import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CurrencyCode } from '@global/enums/currency-code.enum';
import { ShipmentMethod } from '@modules/quote/interfaces/shipment-method.interface';
import { FreightType } from '@CitT/data';

@Component({
  selector: 'app-shipment-method-card',
  templateUrl: './shipment-method-card.component.html',
  styleUrls: ['./shipment-method-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentMethodCardComponent {
  @Input() public shipmentMethod: ShipmentMethod;
  @Input() public isSelected: boolean;

  public readonly currency = CurrencyCode.USD;

  public get shipmentMethodNameTranslationKey(): string {
    switch (this.shipmentMethod.type) {
      case FreightType.AIR:
        return 'QUOTE.SHIPMENT_METHOD.AIR';
      case FreightType.SEA:
        return 'QUOTE.SHIPMENT_METHOD.SEA';
      case FreightType.ROAD:
        return 'QUOTE.SHIPMENT_METHOD.ROAD';
      default:
        return '';
    }
  }
}
