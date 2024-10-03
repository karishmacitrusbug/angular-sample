import { Injectable } from '@angular/core';
import { DashboardSideFilterDialogService } from '@global/modules/common-dashboard/components/dashboard-side-filter-dialog/dashboard-side-filter-dialog.service';
import { CommonDashboardService } from '@global/modules/common-dashboard/services/common-dashboard.service';
import { SendbirdService } from '@global/modules/message-thread/services/sendbird-message.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { OnboardingService } from '@global/services/onboarding.service';
import * as CountryActions from '@modules/country/actions/country.actions';
import * as fromCountry from '@modules/country/reducers';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { asyncScheduler, EMPTY, from, of } from 'rxjs';
import { catchError, map, observeOn, switchMap, tap } from 'rxjs/operators';
import * as CommonDashboardActions from '../../../../../../../common/src/global/modules/message-thread/actions/common-messages.actions';
import * as DashboardActions from '../actions/dashboard.actions';
import * as fromDashboard from '../reducers';

@Injectable()
export class DashboardEffects {
  public enter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DashboardActions.enter),
      switchMap(() =>
        of(
          DashboardActions.getShipmentOrders(),
          DashboardActions.getYourTasks(),
          DashboardActions.getProgressUpdates(),
          DashboardActions.getMessageThreads(),
          CountryActions.getAll(),
          CommonDashboardActions.loadAwstokens()
        )
      )
    );
  });

  public getTasks$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DashboardActions.getYourTasks),
      switchMap(() =>
        this.commonDashboardService.getDashboardTasks$().pipe(
          map((tasks) => DashboardActions.getYourTasksSuccess({ tasks })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_YOUR_TASKS');
            return of(DashboardActions.getYourTasksError({ error: error.message }));
          })
        )
      )
    );
  });

  public getTasksSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DashboardActions.getYourTasksSuccess),
        tap(({ tasks }) => this.onboardingService.refreshOnboardingStatus(undefined, tasks))
      );
    },
    { dispatch: false }
  );

  public getProgressUpdates$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DashboardActions.getProgressUpdates),
      switchMap(() =>
        this.commonDashboardService.getProgressUpdates$().pipe(
          map((progressUpdates) => DashboardActions.getProgressUpdatesSuccess({ progressUpdates })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_YOUR_PROGRESS_UPDATES');
            return of(DashboardActions.getProgressUpdatesError({ error: error.message }));
          })
        )
      )
    );
  });

  public getCases$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DashboardActions.getMessageThreads),
      switchMap(() =>
        this.commonDashboardService.getMessageThreads$().pipe(
          map((messageThreads) => DashboardActions.getMessageThreadsSuccess({ messageThreads })),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_YOUR_MESSAGES');
            return of(DashboardActions.getMessageThreadsError({ error: error.message }));
          })
        )
      )
    );
  });

  public getShipmentOrders$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DashboardActions.getShipmentOrders),
      switchMap(() =>
        this.commonDashboardService.getShipmentOrders$().pipe(
          map(({ shipmentOrderCounts, quoteUpdates, assignees }) =>
            DashboardActions.getShipmentOrdersSuccess({ shipmentOrderCounts, quoteUpdates, assignees })
          ),
          catchError((error) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_SHIPMENT_LIST');

            return of(DashboardActions.getShipmentOrdersError({ error: error.message }));
          })
        )
      )
    );
  });

  public openTask$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DashboardActions.openTask),
      switchMap(({ taskId }) => this.commonDashboardService.openTask$(taskId)),
      switchMap((shouldReloadTasks) => {
        if (shouldReloadTasks) {
          return of(DashboardActions.getYourTasks());
        }

        return EMPTY;
      })
    );
  });

  public openMessage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DashboardActions.openMessage),
      switchMap(({ id, messageType }) => {
        this.commonDashboardService.openMessage(id, messageType);
        return of(DashboardActions.removeMessage({ messageId: id }));
      })
    );
  });

  public messageToAccountManager$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DashboardActions.messageToAccountManager),
        switchMap(({ teamMember }) => this.commonDashboardService.messageAccountManager$(teamMember))
      );
    },
    { dispatch: false }
  );

  public openTaskDeeplink$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DashboardActions.enter),
      map(() => window.location.hash.match(/^#task\/(\w*)\/?/)),
      observeOn(asyncScheduler),
      switchMap((matches) => {
        if (!matches) {
          return EMPTY;
        }

        return of(DashboardActions.openTask({ taskId: matches[1] }));
      })
    );
  });

  public loadUnreadSendbirdChannels$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DashboardActions.loadSendBirdUnreadChannels),
      switchMap(() =>
        from(this.sendbirdServices.getunreadChannels$()).pipe(
          map((data) => {
            return DashboardActions.loadSendBirdUnreadChannelsSuccess({ unreadChannels: data });
          })
        )
      )
    );
  });

  public openAdvancedFilters$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DashboardActions.openAdvancedFilters),
      concatLatestFrom(() => [
        this.store$.select(fromDashboard.selectAdvanceFilters),
        this.store$.select(fromDashboard.selectAssignees),
        this.store$.select(fromCountry.selectAllCountriesInputData),
      ]),
      switchMap(([, advancedFilters, assignees, countries]) =>
        this.dashboardSideFilterDialogService.open(countries, assignees, advancedFilters).afterClosed$()
      ),
      switchMap((advancedFilters) => {
        if (!advancedFilters) {
          return EMPTY;
        }

        return of(DashboardActions.setAdvanceFilters({ advancedFilters }));
      })
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly commonDashboardService: CommonDashboardService,
    private readonly dashboardSideFilterDialogService: DashboardSideFilterDialogService,
    private readonly store$: Store<fromDashboard.AppState & fromCountry.AppState>,
    private readonly onboardingService: OnboardingService,
    private readonly sendbirdServices: SendbirdService
  ) {}
}
