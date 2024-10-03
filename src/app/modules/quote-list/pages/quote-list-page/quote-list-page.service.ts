import { Injectable } from '@angular/core';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { AuthService } from '@global/services/auth.service';
import { CbQuoteVM } from '@modules/quote-list/interfaces/cb-quote.vm';
import { QuoteDataService } from '@CitT/data';
import { Observable } from 'rxjs';
import { finalize, mapTo, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class QuoteListPageService {
  constructor(
    private readonly authService: AuthService,
    private readonly loadingIndicatorService: LoadingIndicatorService,
    private readonly quoteDataService: QuoteDataService
  ) {}

  public sendFinalCostsEmail$(quote: CbQuoteVM): Observable<void> {
    return this.authService.getUser$().pipe(
      tap(() => this.loadingIndicatorService.open()),
      switchMap((user) =>
        this.quoteDataService.sendFinalQuoteEmail({
          Accesstoken: user.accessToken,
          ID: quote.id,
          Email_Estimate_to: user.email,
          Shipment_Value_USD: quote.shipmentValue,
          request_EmailEstimate: true,
        })
      ),
      mapTo(undefined),
      finalize(() => this.loadingIndicatorService.dispose())
    );
  }
}
