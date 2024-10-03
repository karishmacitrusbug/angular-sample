import { Injectable } from '@angular/core';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { AuthService } from '@global/services/auth.service';
import { QuoteDataService } from '@CitT/data';
import isNil from 'lodash/isNil';
import { Observable, timer } from 'rxjs';
import { finalize, mapTo, switchMap, takeWhile, tap } from 'rxjs/operators';

const POLL_INTERVAL = 5000;

@Injectable({
  providedIn: 'root',
})
export class CostEstimateService {
  constructor(
    private readonly authService: AuthService,
    private readonly loadingIndicatorService: LoadingIndicatorService,
    private readonly quoteDataService: QuoteDataService
  ) {}

  public downloadCostEstimate$(shipmentOrderId: string): Observable<void> {
    this.loadingIndicatorService.open();

    return this.authService.getUser$().pipe(
      switchMap((user) =>
        this.quoteDataService
          .generateCostEstimate({
            Accesstoken: user.accessToken,
            Identifier: 0,
            RecordID: shipmentOrderId,
          })
          .pipe(
            switchMap(() =>
              timer(POLL_INTERVAL, POLL_INTERVAL).pipe(
                switchMap(() =>
                  this.quoteDataService.getCostEstimate({
                    Accesstoken: user.accessToken,
                    Identifier: 1,
                    RecordID: shipmentOrderId,
                  })
                ),
                takeWhile((response) => isNil(response?.Success?.ContentDocumentId), true)
              )
            )
          )
      ),
      tap((response) => (window.location.href = response.Success.ContentDownloadUrl)),
      finalize(() => this.loadingIndicatorService.dispose()),
      mapTo(undefined)
    );
  }
}
