import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NewQuoteQueryParam } from '@global/enums/new-quote/new-quote-query-param.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { TrackingItemType } from '@global/enums/tracking/tracking-item-type.enum';
import { filterTrackingItems } from '@global/helpers/tracking/filter-tracking-items.helper';
import { mapTrackingDetails } from '@global/helpers/tracking/map-tracking-details.helper';
import { mapTrackingItems } from '@global/helpers/tracking/map-tracking-items.helper';
import { TeamMemberListType } from '@global/modules/message-thread/enums/team-member-list-type.enum';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { TeamMemberService } from '@global/services/team-member.service';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TrackingDataService } from '@CitT/data';
import { EMPTY, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as TrackingActions from '../actions/tracking.actions';
import * as fromTracking from '../reducers';

@Injectable()
export class TrackingEffects {
  public enter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TrackingActions.enter),
      switchMap(() => of(TrackingActions.getTrackings()))
    );
  });

  public getTrackings$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TrackingActions.getTrackings),
      switchMap(() => this.authService.getUser$()),
      switchMap((user) =>
        this.trackingDataService
          .getTrackings({
            Accesstoken: user.accessToken,
            AccountID: user.accountId,
          })
          .pipe(
            map((trackingItems) => TrackingActions.getTrackingsSuccess({ data: mapTrackingItems(trackingItems) })),
            catchError((error) => {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_TRACKING_ITEMS');
              return of(TrackingActions.getTrackingsError({ error: error.message }));
            })
          )
      )
    );
  });

  public getTrackingsSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TrackingActions.getTrackingsSuccess),
      switchMap(({ data }) => {
        if (data.length > 0) {
          return of(
            TrackingActions.getTrackingsDetails({
              shippingId: data[0].type === TrackingItemType.Rollout ? data[0].items[0].shippingId : data[0].shippingId,
            })
          );
        }

        return EMPTY;
      })
    );
  });

  public getTrackingDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TrackingActions.getTrackingsDetails),
      concatLatestFrom(() => this.authService.getUser$()),
      switchMap(([{ shippingId }, user]) =>
        forkJoin([
          this.trackingDataService.getTracking({
            Accesstoken: user.accessToken,
            AccountID: user.accountId,
            SOID: shippingId,
          }),
          this.teamMemberService.getDefaultTeamMember$(shippingId, TeamMemberListType.ShipmentOrder),
        ]).pipe(
          map(([trackingsDetails, defaultTeamMember]) =>
            TrackingActions.getTrackingsDetailsSuccess({
              data: mapTrackingDetails(trackingsDetails, defaultTeamMember),
            })
          ),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_TRACKING_DETAILS');
            return of(TrackingActions.getTrackingsDetailsError({ error: error.message }));
          })
        )
      )
    );
  });

  public selectItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TrackingActions.selectItem),
      switchMap(({ id }) => {
        if (id) {
          return of(TrackingActions.getTrackingsDetails({ shippingId: id }));
        }
        return EMPTY;
      })
    );
  });

  public updateKeyword$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TrackingActions.updateKeyword),
      concatLatestFrom(() => [this.store$.select(fromTracking.selectTrackingItems), this.store$.select(fromTracking.selectSelectedItem)]),
      switchMap(([{ keyword }, items, selectedItem]) => {
        const filteredItems = filterTrackingItems(items, keyword);
        if (!filteredItems[0]) {
          return of(TrackingActions.selectItem({ id: '' }));
        }

        // only trigger when the selection is changing
        if (!selectedItem || selectedItem.id !== filteredItems[0].id) {
          return of(TrackingActions.selectItem({ id: filteredItems[0].id }));
        }

        return EMPTY;
      })
    );
  });

  public reuseData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TrackingActions.reuseData),
        tap(({ shipmentId }) =>
          this.router.navigate([RouteSegment.Root, RouteSegment.NewQuote], {
            queryParams: { [NewQuoteQueryParam.QuoteIdToReuse]: shipmentId },
          })
        )
      );
    },
    {
      dispatch: false,
    }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly store$: Store<fromTracking.AppState>,
    private readonly authService: AuthService,
    private readonly trackingDataService: TrackingDataService,
    private readonly teamMemberService: TeamMemberService,
    private readonly router: Router
  ) {}
}
