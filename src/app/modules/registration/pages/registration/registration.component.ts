import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { mapTypeOfEquipment } from '@global/helpers/map-type-of-equipment.helper';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { RegistrationPayload } from '@global/interfaces/registration-payload.interface';
import { RegistrationRouteSegment } from '@global/modules/common-registration/enums/registration-route-segment.enum';
import { RegistrationVM } from '@global/modules/common-registration/interfaces/registration.vm';
import { RegistrationService } from '@global/modules/common-registration/services/registration.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import * as CountryActions from '@modules/country/actions/country.actions';
import * as fromCountry from '@modules/country/reducers';
import { Store } from '@ngrx/store';
import { PrivacyAndTermsDialogService } from '@shared/modules/privacy-and-terms/services/privacy-and-terms-dialog.service';
import { TypeOfEquipment } from '@CitT/data';
import isNil from 'lodash/isNil';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationComponent implements OnInit, OnDestroy {
  public readonly allCountries$ = this.store$.select(fromCountry.selectAllCountriesInputData);
  public readonly isLoading$ = this.store$.select(fromCountry.selectAllCountriesLoading);
  public readonly allTypesOfEquipment: InputDataVM<TypeOfEquipment, string>[] = mapTypeOfEquipment();
  public readonly initialData?: RegistrationPayload;

  private registrationSubscription?: Subscription;
  private readonly destroyed$ = new Subject<void>();

  constructor(
    private readonly store$: Store<fromCountry.AppState>,
    private readonly registrationService: RegistrationService,
    private readonly privacyAndTermsDialogService: PrivacyAndTermsDialogService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly router: Router
  ) {
    this.initialData = this.router.getCurrentNavigation().extras.state?.payload;
  }

  public ngOnInit(): void {
    this.store$.dispatch(CountryActions.getAll());
  }

  public ngOnDestroy(): void {
    if (!isNil(this.registrationSubscription)) {
      this.registrationSubscription.unsubscribe();
    }
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public onSubmit(value: RegistrationVM): void {
    if (!isNil(this.registrationSubscription)) {
      return;
    }
    this.registrationSubscription = this.registrationService.createAccount$(value).subscribe(
      () =>
        this.router.navigate([RouteSegment.Root, RouteSegment.Registration, RegistrationRouteSegment.Success], {
          state: { email: value.email },
        }),
      (error) => {
        this.registrationSubscription = undefined;
        this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_CREATE_ACCOUNT');
      }
    );
  }

  public onTermsAndConditionsClick(): void {
    this.privacyAndTermsDialogService.open();
  }
}
