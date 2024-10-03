import { Injectable } from '@angular/core';
import { QuoteDefaultValues } from '@global/interfaces/quote-default-values.interface';
import { mapQuoteDefaultsPayload } from '@global/modules/common-profile/helpers/map-quote-defaults-payload.helper';
import { mapQuoteDefaultsResponse } from '@global/modules/common-profile/helpers/map-quote-defaults-response.helper';
import { ToastMessageService } from '@global/modules/toast-message/toast-message.service';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { UserDefaultsService } from '@global/services/user-defaults.service';
import { TranslateService } from '@ngx-translate/core';
import { ClientDefault, ProfileDataService } from '@CitT/data';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class QuoteDefaultsPageService {
  constructor(
    private readonly profileDataService: ProfileDataService,
    private readonly authService: AuthService,
    private readonly toastMessageService: ToastMessageService,
    private readonly translateService: TranslateService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly userDefaultsService: UserDefaultsService
  ) {}

  public getQuoteDefaults$(): Observable<Partial<QuoteDefaultValues>> {
    return this.userDefaultsService.getUserDefaults$().pipe(map(mapQuoteDefaultsResponse));
  }

  public saveQuoteDefaults$(defaults: Partial<QuoteDefaultValues>): Observable<ClientDefault[]> {
    return this.authService.getUser$().pipe(
      switchMap((user) => this.profileDataService.updateUserDefaults(mapQuoteDefaultsPayload(defaults, user.accountId))),
      tap(() => this.toastMessageService.open(this.translateService.instant('PROFILE.QUOTE_DEFAULTS.SUCCESSFULLY_UPDATED'))),
      catchError((error) => {
        this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_UPDATE_QUOTE_DEFAULTS');

        return of(undefined);
      })
    );
  }
}
