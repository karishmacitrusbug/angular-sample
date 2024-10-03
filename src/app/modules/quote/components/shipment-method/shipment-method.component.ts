import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { CurrencyCode } from '@global/enums/currency-code.enum';
import { Freight } from '@global/interfaces/freight.interface';
import { ShipmentMethod } from '@modules/quote/interfaces/shipment-method.interface';
import { ThirdPartyCourier } from '@modules/quote/interfaces/third-party-courier.interface';
import { CbCourier } from '@modules/quote/interfaces/cb-courier.interface';
import { FreightStatus, FreightType } from '@CitT/data';

@Component({
  selector: 'app-shipment-method',
  templateUrl: './shipment-method.component.html',
  styleUrls: ['./shipment-method.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentMethodComponent {
  @Input() public shipmentMethods: ShipmentMethod[];
  @Input() public selectedShipmentMethodType: FreightType;
  @Input() public freight: Freight | undefined;
  @Input() public zeeCouriers: CbCourier[];
  @Input() public thirdPartyCouriers: ThirdPartyCourier[];
  @Input() public selectedCbCourierId?: string;
  @Output() public selectShipmentMethod = new EventEmitter<ShipmentMethod>();
  @Output() public selectCbCourierId = new EventEmitter<string>();

  public readonly FreightStatus = FreightStatus;

  /**
   * The default currency
   */
  public readonly currency = CurrencyCode.USD;

  /**
   * Example couriers to show with the loading indicator
   */
  public readonly dummyCbCouriers: CbCourier[] = [
    { id: '0', name: 'FedEx Express', fee: 450, serviceType: 'FedEx Ground®' },
    { id: '1', name: 'FedEx Sprint', fee: 405, serviceType: 'FedEx Ground®' },
    { id: '2', name: 'FedEx Standard', fee: 205, serviceType: 'FedEx Ground®' },
  ];

  /**
   * Get the shipment method with the selected freight type
   */
  public get selectedShipmentMethod(): ShipmentMethod | undefined {
    return this.shipmentMethods.find((shipmentMethod) => shipmentMethod.type === this.selectedShipmentMethodType);
  }

  /**
   * Get the third party couriers with the selected freight type
   */
  public get thirdPartyCouriersForCurrentShipmentMethod(): ThirdPartyCourier[] {
    return this.thirdPartyCouriers.filter((courier) => courier.shipmentMethodType === this.selectedShipmentMethodType);
  }

  /**
   * Get whether a hint should be shown about the current best rates
   */
  public get showCurrentBestRatesHint(): boolean {
    return (
      (this.freight?.status !== FreightStatus.SEARCHING && !this.zeeCouriers?.length) ||
      this.freight?.status === FreightStatus.CURRENT_BEST_RATE
    );
  }

  /**
   * Emit an event when a shipment method is selected
   *
   * @param shipmentMethod
   */
  public onShipmentMethodClick(shipmentMethod: ShipmentMethod): void {
    this.selectShipmentMethod.emit(shipmentMethod);
  }

  /**
   * Emit an event when a cb courier is selected
   *
   * @param change
   */
  public onSelectedCbCourierIdChange(change: MatRadioChange): void {
    this.selectCbCourierId.emit(change.value);
  }
}
