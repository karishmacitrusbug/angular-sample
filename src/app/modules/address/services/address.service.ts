import { Injectable } from '@angular/core';
import { BaseAddressService } from '@global/base-classes/base-address.service';
import { AddressType } from '@global/enums/address-type.enum';
import { SelectAddressDialogType } from '@global/enums/select-address-dialog-type.enum';
import { AddressCardAddressVM } from '@global/interfaces/address/address.vm';
import { SelectAddressDialogPayload } from '@global/interfaces/address/select-address-dialog-payload.interface';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { EditAddressDialogService } from '@global/modules/common-address/components/edit-address-dialog/edit-address-dialog.service';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { AuthService } from '@global/services/auth.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { TranslateService } from '@ngx-translate/core';
import { AddressesDataService, ProfileDataService } from '@CitT/data';
import isNil from 'lodash/isNil';
import { Observable } from 'rxjs';
import { filter, first, map, shareReplay, switchMap } from 'rxjs/operators';
import { SelectAddressDialogComponent } from '../components/select-address-dialog/select-address-dialog.component';
import { mapCbDeliveryAddress } from '../helpers/map-cb-delivery-address.helper';

@Injectable()
export class AddressService extends BaseAddressService {
  constructor(
    loadingIndicatorService: LoadingIndicatorService,
    errorNotificationService: ErrorNotificationService,
    private readonly dialogService: DialogService,
    private readonly translate: TranslateService,
    protected readonly editAddressDialogService: EditAddressDialogService,
    protected readonly authService: AuthService,
    protected readonly profileDataService: ProfileDataService,
    protected readonly addressesDataService: AddressesDataService
  ) {
    super(
      loadingIndicatorService,
      errorNotificationService,
      authService,
      addressesDataService,
      profileDataService,
      editAddressDialogService
    );
  }

  protected getShipToAddresses$(shipToCountry: string, showLoadingIndicator = true): Observable<AddressCardAddressVM[]> {
    return this.authService.getUser$().pipe(
      switchMap((user) => {
        const shipToAddressesEndpoint$ = this.addressesDataService
          .getCbDestinationAddressesForCountry({
            AccountID: user.accountId,
            Accesstoken: user.accessToken,
            Shiptocountry: shipToCountry,
          })
          .pipe(map((addresses) => addresses.map((address) => mapCbDeliveryAddress(address))));

        return this.getCachableAddresses$(AddressType.Delivery, shipToAddressesEndpoint$, showLoadingIndicator);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  public selectDefaultPickupAddress$(
    country: string,
    countries: InputDataVM<string, string>[]
  ): Observable<AddressCardAddressVM | undefined> {
    const pickupAddresses$: Observable<AddressCardAddressVM[]> = this.getCachedPickupAddressesForCountry$(country);
    return pickupAddresses$.pipe(
      switchMap((pickupAddresses) => {
        const currentDefaultAddress = pickupAddresses.find((address) => address.isDefault);
        return this.dialogService
          .open<SelectAddressDialogPayload, AddressCardAddressVM[]>(SelectAddressDialogComponent, {
            addresses: pickupAddresses,
            dialogType: SelectAddressDialogType.DefaultAddress,
            title: this.translate.instant('ADDRESS.CHANGE_DEFAULT_ADDRESS'),
            buttonText: this.translate.instant('COMMON.SAVE'),
            selectedAddresses: isNil(currentDefaultAddress) ? [] : [currentDefaultAddress],
            onCreate: () =>
              this.createPickupAddressThroughDialog$(countries, country).pipe(
                switchMap((result) => this.getCachedPickupAddressesForCountry$(country).pipe(map((addresses) => ({ addresses, result }))))
              ),
            onEdit: (address) =>
              this.editAddressThroughDialog$(AddressType.Pickup, address, countries).pipe(
                switchMap(() => this.getCachedPickupAddressesForCountry$(country))
              ),
          })
          .afterClosed$();
      }),
      filter((addresses) => !isNil(addresses)),
      map((addresses) => addresses[0])
    );
  }

  public selectPickupAddresses$({
    country,
    countries,
    selectedAddresses,
  }: {
    country: string;
    countries: InputDataVM<string, string>[];
    selectedAddresses: AddressCardAddressVM[];
  }): Observable<AddressCardAddressVM[] | undefined> {
    const pickupAddresses$: Observable<AddressCardAddressVM[]> = this.getCachedPickupAddressesForCountry$(country);
    return pickupAddresses$.pipe(
      first(),
      switchMap((pickupAddresses) =>
        this.dialogService
          .open<SelectAddressDialogPayload, AddressCardAddressVM[]>(SelectAddressDialogComponent, {
            addresses: pickupAddresses,
            dialogType: SelectAddressDialogType.PickUpAddress,
            title: this.translate.instant('SELECT_ADDRESS.PICKUP_DIALOG_TITLE'),
            buttonText: this.translate.instant('COMMON.SAVE'),
            selectedAddresses,
            onCreate: () =>
              this.createPickupAddressThroughDialog$(countries, country).pipe(
                switchMap((result) => this.getCachedPickupAddressesForCountry$(country).pipe(map((addresses) => ({ addresses, result }))))
              ),
            onEdit: (address) =>
              this.editAddressThroughDialog$(AddressType.Pickup, address, countries).pipe(
                switchMap(() => this.getCachedPickupAddressesForCountry$(country))
              ),
          })
          .afterClosed$()
      )
    );
  }

  public selectShipToAddresses$({
    country,
    countries,
    selectedAddresses,
  }: {
    country: string;
    countries: InputDataVM<string, string>[];
    selectedAddresses: AddressCardAddressVM[];
  }): Observable<AddressCardAddressVM[] | undefined> {
    const shipToAddresses$: Observable<AddressCardAddressVM[]> = this.getCachedShipToAddressesForCountry$(country);
    return shipToAddresses$.pipe(
      first(),
      switchMap((shipToAddresses) =>
        this.dialogService
          .open<SelectAddressDialogPayload, AddressCardAddressVM[]>(SelectAddressDialogComponent, {
            addresses: shipToAddresses,
            dialogType: SelectAddressDialogType.LocationAddresses,
            title: this.translate.instant('SELECT_ADDRESS.SHIP_TO_DIALOG_TITLE'),
            buttonText: this.translate.instant('COMMON.SAVE'),
            selectedAddresses,
            onCreate: () =>
              this.createShipToAddressThroughDialog$(countries, country).pipe(
                switchMap((result) => this.getCachedShipToAddressesForCountry$(country).pipe(map((addresses) => ({ addresses, result }))))
              ),
            onEdit: (address) =>
              this.editAddressThroughDialog$(AddressType.Delivery, address, countries).pipe(
                switchMap(() => this.getCachedShipToAddressesForCountry$(country))
              ),
          })
          .afterClosed$()
      )
    );
  }
}
