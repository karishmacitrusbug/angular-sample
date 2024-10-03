import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ShipmentMethod } from '@modules/quote/interfaces/shipment-method.interface';
import { Store } from '@ngrx/store';
import * as fromCountryValidation from '@shared/modules/country-validation/reducers';
import * as NewQuoteShipmentMethodActions from '../../actions/new-quote-shipment-method.actions';
import * as fromNewQuote from '../../reducers';
import { selectCanProceed } from './new-quote-shipment-method-page.selectors';

@Component({
  selector: 'app-new-quote-shipment-method-page',
  templateUrl: './new-quote-shipment-method-page.component.html',
  styleUrls: ['./new-quote-shipment-method-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewQuoteShipmentMethodPageComponent implements OnInit {
  public isLoading$ = this.store$.select(fromNewQuote.selectNewQuoteShipmentMethodLoading);
  public shipmentMethods$ = this.store$.select(fromNewQuote.selectNewQuoteShipmentMethods);
  public freight$ = this.store$.select(fromNewQuote.selectNewQuoteFreight);
  public zeeCouriers$ = this.store$.select(fromNewQuote.selectNewQuoteCbCouriers);
  public thirdPartyCouriers$ = this.store$.select(fromNewQuote.selectNewQuoteThirdPartyCouriers);
  public selectedCbCourierId$ = this.store$.select(fromNewQuote.selectNewQuoteSelectedCbCourierId);
  public selectedShipmentMethodType$ = this.store$.select(fromNewQuote.selectNewQuoteSelectedShipmentMethodType);
  public canProceed$ = this.store$.select(selectCanProceed);

  constructor(private readonly store$: Store<fromNewQuote.AppState & fromCountryValidation.AppState>) {}

  public ngOnInit(): void {
    this.store$.dispatch(NewQuoteShipmentMethodActions.enter());
  }

  public onSelectShipmentMethod(shipmentMethod: ShipmentMethod): void {
    this.store$.dispatch(NewQuoteShipmentMethodActions.selectShipmentMethod({ shipmentMethod }));
  }

  public onSelectCbCourierId(zeeCourierId: string): void {
    this.store$.dispatch(NewQuoteShipmentMethodActions.selectCbCourierId({ zeeCourierId }));
  }

  public onSubmit(): void {
    this.store$.dispatch(NewQuoteShipmentMethodActions.submit());
  }
}
