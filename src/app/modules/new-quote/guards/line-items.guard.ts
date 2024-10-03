import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { LineItemsState } from '@global/modules/common-quote/enums/line-items-state.enum';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NewQuoteRouteSegment } from '../enums/new-quote-route-segment.enum';
import { ShipmentMethodState } from '../enums/shipment-method-state.enum';
import * as fromNewQuote from '../reducers/index';

@Injectable()
export class LineItemsGuard implements CanActivate {
  constructor(private readonly store$: Store<fromNewQuote.AppState>, private readonly router: Router) {}

  public canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.store$.select(fromNewQuote.selectNewQuoteFeatureState).pipe(
      map((newQuoteState) => {
        if (newQuoteState.newQuoteShipmentMethod.state === ShipmentMethodState.Completed) {
          return this.router.createUrlTree([RouteSegment.NewQuote, NewQuoteRouteSegment.FinalCosts]);
        }

        if (newQuoteState.newQuoteLineItems.state === LineItemsState.Completed) {
          return this.router.createUrlTree([RouteSegment.NewQuote, NewQuoteRouteSegment.ShipmentMethod]);
        }

        if (newQuoteState.newQuoteBasics.state !== 'completed') {
          return this.router.createUrlTree([RouteSegment.NewQuote, NewQuoteRouteSegment.Basics]);
        }

        return true;
      })
    );
  }
}
