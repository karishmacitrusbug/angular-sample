import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { newQuoteCreationLimitForUnvettedAccount } from '@global/constants/global.constants';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { QuoteListService } from '@shared/services/quote-list.service';
import { ClientVettingStatus } from '@CitT/data';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class UnvettedLimitGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly quoteListService: QuoteListService,
    private readonly errorNotificationService: ErrorNotificationService
  ) {}

  public canActivate(): Observable<boolean> {
    return this.authService.getUser$().pipe(
      switchMap((user) => {
        const isUserVetted =
          user.isVetted &&
          user.contractSigned &&
          [ClientVettingStatus.ONGOING_MONITORING, ClientVettingStatus.ACCEPT].includes(user.vettingStatus);
        if (isUserVetted) {
          return of(true);
        }
        return this.quoteListService
          .getCachedQuoteListLength$()
          .pipe(map((quoteListLength) => quoteListLength < newQuoteCreationLimitForUnvettedAccount));
      }),
      tap((result) => {
        if (!result) {
          this.errorNotificationService.showErrorNotification('NEW_QUOTE.UNVETTED_QUOTE_LIMIT_REACHED');
        }
      })
    );
  }
}
