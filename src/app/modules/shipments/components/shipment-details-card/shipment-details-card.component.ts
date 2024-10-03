import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { toggleAnimation, toggleOpacityAnimation } from '@global/animations/toggle-open-close.animation';
import { CurrencyCode } from '@global/enums/currency-code.enum';
import { LengthUnit } from '@global/enums/length-unit.enum';
import { LineItemsColumn } from '@global/enums/line-items-column.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { WeightUnit } from '@global/enums/weight-unit.enum';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { ShipmentDetailsShipmentVM } from '@modules/shipments/interfaces/shipment-details-shipment.vm';
import { Store } from '@ngrx/store';
import { ValuationMethod } from '@CitT/data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as ShipmentDetailsActions from '../../actions/shipment-details.actions';
import * as fromShipments from '../../reducers';

const DETAILS_HEADER_HEIGHT = 60;

@Component({
  selector: 'app-shipment-details-card',
  templateUrl: './shipment-details-card.component.html',
  styleUrls: ['./shipment-details-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [toggleAnimation(DETAILS_HEADER_HEIGHT), toggleOpacityAnimation],
})
export class ShipmentDetailsCardComponent {
  @Input() public localVatRegistration: LocalVatRegistrationVM | undefined;
  @Input() public isVatRegistrationRequired: boolean;
  @Output() public reuseDataClick = new EventEmitter<void>();
  public shipment$: Observable<ShipmentDetailsShipmentVM> = this.store$.select(fromShipments.selectShipmentDetailsShipment);
  public weightUnit$: Observable<WeightUnit> = this.shipment$.pipe(map((shipment) => shipment.estimatedWeightUnit));
  public lengthUnit$: Observable<LengthUnit> = this.shipment$.pipe(map((shipment) => shipment.lengthUnit));
  public isOpen = false;

  public currency = CurrencyCode.USD;
  public newQuoteLink = [RouteSegment.NewQuote];

  public readonly LineItemsColumn = LineItemsColumn;
  public readonly ValuationMethod = ValuationMethod;
  public readonly CurrencyCode = CurrencyCode;

  constructor(private readonly store$: Store<fromShipments.AppState>) {}

  public onHeaderClick(): void {
    this.isOpen = !this.isOpen;
  }

  public onPickUpAddressEditClick(): void {
    this.store$.dispatch(ShipmentDetailsActions.editPickupAddress());
  }

  public onShipToLocationsEditClick(): void {
    this.store$.dispatch(ShipmentDetailsActions.editDeliveryLocations());
  }

  public onReuseDataClick(): void {
    this.reuseDataClick.emit();
  }

  public onPickupAddressDelete(): void {
    this.store$.dispatch(ShipmentDetailsActions.deletePickupAddress());
  }

  public onAddPackageDetailsClick(packageId?: number): void {
    this.store$.dispatch(ShipmentDetailsActions.addPackages({ openPackageId: packageId }));
  }
}
