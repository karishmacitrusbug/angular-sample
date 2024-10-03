import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CurrencyCode } from '@global/enums/currency-code.enum';
import { ServiceType } from '@global/enums/service-type.enum';
import { FinalCostsState } from '@global/modules/common-quote/enums/final-costs-state.enum';
import { LineItemsState } from '@global/modules/common-quote/enums/line-items-state.enum';
import { ShipmentMethodState } from '@modules/new-quote/enums/shipment-method-state.enum';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import * as NewQuoteBasicsActions from '../../actions/new-quote-basics.actions';
import * as NewQuoteFinalCostsActions from '../../actions/new-quote-final-costs.actions';
import * as NewQuoteLineItemsActions from '../../actions/new-quote-line-items.actions';
import * as fromNewQuote from '../../reducers/index';
import { selectProgressTracker } from './progress-tracker.selectors';
import { ProgressTrackerVM } from './progress-tracker.vm';

@Component({
  selector: 'app-progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressTrackerComponent {
  public readonly vm$: Observable<ProgressTrackerVM>;
  public readonly ServiceType = ServiceType;
  public readonly CurrencyCode = CurrencyCode;
  public readonly LineItemsState = LineItemsState;
  public readonly ShipmentMethodState = ShipmentMethodState;
  public readonly FinalCostsState = FinalCostsState;

  constructor(private readonly store$: Store<fromNewQuote.AppState>) {
    this.vm$ = store$.select(selectProgressTracker);
  }

  public onEditBasicsClick(): void {
    this.store$.dispatch(NewQuoteBasicsActions.edit());
  }

  public editLineItemsClick(): void {
    this.vm$.pipe(take(1)).subscribe(({ lineItems: { state } }) => {
      if (state === LineItemsState.Completed) {
        this.store$.dispatch(NewQuoteLineItemsActions.edit());
      }
    });
  }

  public editShipmentMethod(): void {
    this.store$.dispatch(NewQuoteFinalCostsActions.changeShipmentMethod());
  }

  public getLineItemsClass(state: LineItemsState): string {
    switch (state) {
      case LineItemsState.NotCompleted:
        return 'not-completed';
      case LineItemsState.InProgress:
        return 'in-progress';
      case LineItemsState.Completed:
        return 'completed';
      default:
        return '';
    }
  }

  public getShipmentMethodClass(state: ShipmentMethodState): string {
    switch (state) {
      case ShipmentMethodState.NotCompleted:
        return 'not-completed';
      case ShipmentMethodState.InProgress:
        return 'in-progress';
      case ShipmentMethodState.Completed:
        return 'completed';
      default:
        return '';
    }
  }
}
