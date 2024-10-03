import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { toggleAnimation, toggleOpacityAnimation } from '@global/animations/toggle-open-close.animation';
import { CurrencyCode } from '@global/enums/currency-code.enum';
import { LengthUnit } from '@global/enums/length-unit.enum';
import { LineItemsColumn } from '@global/enums/line-items-column.enum';
import { WeightUnit } from '@global/enums/weight-unit.enum';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import * as fromCountry from '@modules/country/reducers';
import { QuoteDetailsQuote } from '@modules/quote-list/interfaces/quote.interface';
import { Store } from '@ngrx/store';
import { ServiceType, ValuationMethod } from '@CitT/data';
import { Subject } from 'rxjs';
import * as QuoteDetailsActions from '../../actions/quote-details.actions';
import * as fromQuoteDetails from '../../reducers';

const DEATILS_HEADER_HEIGHT = 60;

@Component({
  selector: 'app-quote-details-card',
  templateUrl: './quote-details-card.component.html',
  styleUrls: ['./quote-details-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [toggleAnimation(DEATILS_HEADER_HEIGHT), toggleOpacityAnimation],
})
export class QuoteDetailsCardComponent implements OnDestroy {
  @Input() public quote: QuoteDetailsQuote;
  @Input() public localVatRegistration: LocalVatRegistrationVM | undefined;
  @Input() public isVatRegistrationRequired: boolean;
  @Input() public isCollapsable = true;

  public isOpen = false;
  public destroy$ = new Subject<void>();

  public readonly currency = CurrencyCode.USD;
  public get weightUnit(): WeightUnit {
    return this.quote.estimatedWeightUnit;
  }
  public get lengthUnit(): LengthUnit {
    return this.quote.lengthUnit;
  }

  public get isCostMethod(): boolean {
    return this.quote.valuationMethod === ValuationMethod.COST_METHOD;
  }

  public readonly LineItemsColumn = LineItemsColumn;
  public readonly ServiceType = ServiceType;

  constructor(private readonly store$: Store<fromQuoteDetails.AppState & fromCountry.AppState>) {}

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onHeaderClick(): void {
    this.isOpen = !this.isOpen;
  }

  public onEditBasicsClick(): void {
    this.store$.dispatch(QuoteDetailsActions.editBasics());
  }

  public onEditLineItemsClick(): void {
    this.store$.dispatch(QuoteDetailsActions.editLineItems());
  }

  public onPackageEditClick(): void {
    this.store$.dispatch(QuoteDetailsActions.editPackages({ quote: this.quote }));
  }

  public onPickUpAddressEditClick(): void {
    this.store$.dispatch(QuoteDetailsActions.editPickupAddress());
  }

  public onShipToLocationsEditClick(): void {
    this.store$.dispatch(QuoteDetailsActions.editShipToLocations());
  }

  public onPickupAddressDelete(): void {
    this.store$.dispatch(QuoteDetailsActions.deletePickupAddress());
  }

  public onAddLocalVatRegistrationClick(): void {
    this.store$.dispatch(QuoteDetailsActions.addLocalVatRegistration());
  }

  public onChangeShipmentMethodClick(): void {
    this.store$.dispatch(QuoteDetailsActions.changeShipmentMethod());
  }
}
