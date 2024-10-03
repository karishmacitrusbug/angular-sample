import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { User } from '@global/interfaces/user.interface';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { LocalVatRegistrationDialogService } from '@modules/local-vat-registration/components/local-vat-registration-dialog/local-vat-registration-dialog.service';
import {
  mapCreateVatRegistrationRequest,
  mapUpdateVatRegistrationRequest,
  mapVatRegistration,
} from '@shared/helpers/map-vat-registration.helper';
import { VatRegistrationDataService } from '@CitT/data';
import { GetRegistrationResponse } from '@CitT/data/model/models';
import { BehaviorSubject, EMPTY, Observable, of } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class LocalVatRegistrationService {
  private readonly vatRegistrationForCountry: Map<string, BehaviorSubject<LocalVatRegistrationVM>> = new Map();

  constructor(
    private readonly vatRegistrationDataService: VatRegistrationDataService,
    private readonly localVatRegistrationDialogService: LocalVatRegistrationDialogService,
    private readonly authService: AuthService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly loadingIndicatorService: LoadingIndicatorService
  ) {}

  public getCachedVatRegistrationForCountry$(country: string, forceRefresh = false): Observable<LocalVatRegistrationVM | undefined> {
    let cachedVatRegistration$: BehaviorSubject<LocalVatRegistrationVM | undefined> = this.vatRegistrationForCountry.get(country);

    if (!cachedVatRegistration$) {
      cachedVatRegistration$ = new BehaviorSubject(undefined);
      this.vatRegistrationForCountry.set(country, cachedVatRegistration$);
    }

    if (cachedVatRegistration$.value === undefined || forceRefresh) {
      return this.fetchVatRegistrationForCountry$(country).pipe(switchMap(() => cachedVatRegistration$.asObservable()));
    }

    return cachedVatRegistration$.asObservable();
  }

  public createThroughDialog$(
    toCountry: string | undefined,
    allCountries: InputDataVM<string, string>[],
    destinationCountries: InputDataVM<string, string>[],
    alreadyRegisteredCountries?: string[]
  ): Observable<LocalVatRegistrationVM> {
    return this.localVatRegistrationDialogService
      .openDialog({
        toCountry,
        allCountries,
        destinationCountries,
        toCountryDisabled: false,
        alreadyRegisteredCountries,
      })
      .afterClosed$()
      .pipe(
        filter((result) => !!result),
        switchMap((result) => this.createVatRegistration$(result))
      );
  }

  public editThroughDialog$(
    toCountry: string,
    allCountries: InputDataVM<string, string>[],
    destinationCountries: InputDataVM<string, string>[],
    formValues: LocalVatRegistrationVM,
    toCountryDisabled = true,
    alreadyRegisteredCountries?: string[]
  ): Observable<LocalVatRegistrationVM> {
    return this.localVatRegistrationDialogService
      .openDialog({
        toCountry,
        allCountries,
        destinationCountries,
        formValues,
        toCountryDisabled,
        alreadyRegisteredCountries,
      })
      .afterClosed$()
      .pipe(
        filter((result) => !!result),
        switchMap((result) => this.updateVatRegistration$(result))
      );
  }

  public createVatRegistration$(data: LocalVatRegistrationVM): Observable<LocalVatRegistrationVM> {
    this.loadingIndicatorService.open();

    return this.authService.getUser$().pipe(
      switchMap((user) =>
        this.vatRegistrationDataService.createAccRegistration(mapCreateVatRegistrationRequest(data, user)).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === HttpStatusCode.BadRequest && error.error?.Message?.Message?.includes('Registraion already existing')) {
              this.errorNotificationService.showErrorNotification(error.error.Message.Message);
            } else {
              this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_CREATE_LOCAL_VAT');
            }
            return EMPTY;
          })
        )
      ),
      finalize(() => this.loadingIndicatorService.dispose()),
      switchMap(() => this.getCachedVatRegistrationForCountry$(data.toCountry, true))
    );
  }

  public updateVatRegistration$(data: LocalVatRegistrationVM): Observable<LocalVatRegistrationVM> {
    this.loadingIndicatorService.open();
    return this.authService.getUser$().pipe(
      switchMap((user) =>
        this.vatRegistrationDataService.updateAccRegistration(mapUpdateVatRegistrationRequest(data, user)).pipe(
          tap(() => this.clearRegistration(data.toCountry)),
          catchError((error: HttpErrorResponse) => {
            this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_UPDATE_LOCAL_VAT');
            return EMPTY;
          })
        )
      ),
      finalize(() => this.loadingIndicatorService.dispose()),
      switchMap(() => this.getCachedVatRegistrationForCountry$(data.toCountry, true))
    );
  }

  private fetchVatRegistrationForCountry$(country: string): Observable<LocalVatRegistrationVM | undefined> {
    this.loadingIndicatorService.open();

    return this.authService.getUser$().pipe(
      switchMap((user) => this.loadVatRegistration$(country, user)),
      map(([registation]) => registation),
      map(mapVatRegistration),
      tap((reg) => {
        const cachedRegistration$ = this.vatRegistrationForCountry.get(country);

        if (cachedRegistration$) {
          cachedRegistration$.next(reg);
        } else {
          this.vatRegistrationForCountry.set(country, new BehaviorSubject(reg));
        }
      }),
      finalize(() => this.loadingIndicatorService.dispose()),
      catchError((error: HttpErrorResponse) => {
        if (error.status !== HttpStatusCode.BadRequest) {
          this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_LOCAL_VAT');
        }

        return of(undefined);
      })
    );
  }

  private loadVatRegistration$(country: string, user: User): Observable<Array<GetRegistrationResponse>> {
    return this.vatRegistrationDataService.getRegistration({
      Accesstoken: user.accessToken,
      AccountID: user.accountId,
      toCountry: country,
    });
  }

  private clearRegistration(country: string) {
    this.vatRegistrationForCountry.delete(country);
  }
}
