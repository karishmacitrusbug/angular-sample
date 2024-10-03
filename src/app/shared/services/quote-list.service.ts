import { Injectable } from '@angular/core';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { mapQuoteList } from '@modules/quote-list/helpers/map-quote-list.helper';
import { CbQuoteVM } from '@modules/quote-list/interfaces/cb-quote.vm';
import { ShipmentOrderDataService } from '@CitT/data';
import isNil from 'lodash/isNil';
import { BehaviorSubject, EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap, switchMapTo, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class QuoteListService {
  private readonly cachedQuoteListLength$ = new BehaviorSubject<number | undefined>(undefined);

  constructor(
    private readonly shipmentOrderDataService: ShipmentOrderDataService,
    private readonly authService: AuthService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly loadingIndicatorService: LoadingIndicatorService
  ) {}

  public getQuoteList$(): Observable<CbQuoteVM[]> {
    this.loadingIndicatorService.open();
    return this.authService.getUser$().pipe(
      switchMap((user) =>
        this.shipmentOrderDataService.getShipmentOrders({
          Accesstoken: user.accessToken,
          AccountID: user.accountId,
          ContactID: user.contactId,
        })
      ),
      map((res) => mapQuoteList(res)),
      tap((quoteList) => this.cachedQuoteListLength$.next(quoteList.length)),
      finalize(() => this.loadingIndicatorService.dispose()),
      catchError((error) => {
        this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_QUOTE_LIST');
        return throwError(error);
      })
    );
  }

  public getCachedQuoteListLength$(): Observable<number> {
    return this.cachedQuoteListLength$.pipe(
      switchMap((cachedData) =>
        isNil(cachedData)
          ? this.getQuoteList$().pipe(
              map((resultQuotes) => resultQuotes.length),
              switchMapTo(EMPTY)
            )
          : of(cachedData)
      )
    );
  }

  public resetCache(): void {
    this.cachedQuoteListLength$.next(undefined);
  }
}
