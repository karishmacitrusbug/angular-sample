import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AddressType } from '@global/enums/address-type.enum';
import { replaceItem } from '@global/helpers/utils.helper';
import { AddressCardAddressVM } from '@global/interfaces/address/address.vm';
import { EditAddressDialogResult } from '@global/interfaces/address/edit-address-dialog-result.type';
import { InputDataVM } from '@global/interfaces/input-data.vm';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { AddressService } from '@modules/address/services/address.service';
import { AddressTabContentAddressGroupVM } from '@modules/profile/components/address-tab-content/address-group.vm';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { finalize, first, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import * as CountryActions from '../../../country/actions/country.actions';
import * as fromCountry from '../../../country/reducers';
import { selectDeliveryCountries, selectPickupCountries } from './address-book-page.selectors';

@Component({
  selector: 'app-address-book-page',
  templateUrl: './address-book-page.component.html',
  styleUrls: ['./address-book-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressBookPageComponent implements OnDestroy, OnInit {
  public pickUpAddresses: AddressTabContentAddressGroupVM[] = [];
  public deliveryAddresses: AddressTabContentAddressGroupVM[] = [];
  public isLoading = false;

  public readonly showDeliveryAddresses$: Observable<boolean> = this.addressService.getIsCustomizedFinalDeliveriesAllowed$();
  private readonly destroyed$ = new Subject<void>();

  public get pickUpAddressCount(): number {
    return this.pickUpAddresses.reduce((addressCount, country) => addressCount + country.addresses.length, 0);
  }
  public get deliveryAddressCount(): number {
    return this.deliveryAddresses.reduce((addressCount, country) => addressCount + country.addresses.length, 0);
  }

  constructor(
    private readonly store$: Store<fromCountry.AppState>,
    private readonly addressService: AddressService,
    private readonly cdr: ChangeDetectorRef,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly loadingIndicatorService: LoadingIndicatorService
  ) {}

  public ngOnInit(): void {
    this.loadAddressBook();
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private groupAddressesByCountry(addresses: AddressCardAddressVM[]): AddressTabContentAddressGroupVM[] {
    return addresses
      .reduce<AddressTabContentAddressGroupVM[]>((addressGroups, address) => {
        const existingCountryGroup = addressGroups.find((group) => group.countryName === address.country);
        if (existingCountryGroup === undefined) {
          const newGroup: AddressTabContentAddressGroupVM = { countryName: address.country, addresses: [address] };
          return addressGroups.concat(newGroup);
        }
        const updatedGroup: AddressTabContentAddressGroupVM = {
          ...existingCountryGroup,
          addresses: existingCountryGroup.addresses.concat(address),
        };
        return addressGroups.map(replaceItem((group) => group === existingCountryGroup, updatedGroup));
      }, [])
      .sort((prev, next) => prev.countryName.localeCompare(next.countryName));
  }

  private loadAddressBook() {
    this.isLoading = true;

    this.addressService
      .getAddressBook$()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe(
        (addressBook) => {
          this.pickUpAddresses = this.groupAddressesByCountry(addressBook.pickupAddresses);
          this.deliveryAddresses = this.groupAddressesByCountry(addressBook.deliveryAddresses);
          this.cdr.markForCheck();
        },
        (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_ADDRESS_BOOK')
      );
  }

  public onCreatePickupAddress(country?: string): void {
    this.getPickupCountries$()
      .pipe(
        switchMap((countries) => this.addressService.createPickupAddressThroughDialog$(countries, country)),
        takeUntil(this.destroyed$)
      )
      .subscribe((result) => this.handleAddressBookUpdateResult(result));
  }

  public onCreateDeliveryAddress(country?: string): void {
    this.getDeliveryCountries$()
      .pipe(
        switchMap((countries) => this.addressService.createShipToAddressThroughDialog$(countries, country)),
        takeUntil(this.destroyed$)
      )
      .subscribe((result) => this.handleAddressBookUpdateResult(result));
  }

  public onEditPickupAddress(address: AddressCardAddressVM): void {
    this.getPickupCountries$()
      .pipe(
        switchMap((countries) => this.addressService.editAddressThroughDialog$(AddressType.Pickup, address, countries)),
        takeUntil(this.destroyed$)
      )
      .subscribe((result) => this.handleAddressBookUpdateResult(result));
  }

  public onEditDeliveryAddress(address: AddressCardAddressVM): void {
    this.getDeliveryCountries$()
      .pipe(
        switchMap((countries) => this.addressService.editAddressThroughDialog$(AddressType.Delivery, address, countries)),
        takeUntil(this.destroyed$)
      )
      .subscribe((result) => this.handleAddressBookUpdateResult(result));
  }

  public onDeleteAddress(address: AddressCardAddressVM): void {
    this.addressService
      .deleteAddress$(address)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (result) => this.handleAddressBookUpdateResult(result),
        (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_DELETE_ADDRESS')
      );
  }

  private getPickupCountries$(): Observable<InputDataVM<string, string>[]> {
    this.store$.dispatch(CountryActions.getAll());

    return this.store$.select(fromCountry.selectAllCountriesLoading).pipe(
      takeWhile((isLoading) => isLoading, true),
      tap((isLoading) => (isLoading ? this.loadingIndicatorService.open() : this.loadingIndicatorService.dispose())),
      switchMap(() => this.store$.select(selectPickupCountries).pipe(first((countries) => countries.length > 0)))
    );
  }

  private getDeliveryCountries$(): Observable<InputDataVM<string, string>[]> {
    this.store$.dispatch(CountryActions.getDestination());

    return this.store$.select(fromCountry.selectDestinationCountriesLoading).pipe(
      takeWhile((isLoading) => isLoading, true),
      tap((isLoading) => (isLoading ? this.loadingIndicatorService.open() : this.loadingIndicatorService.dispose())),
      switchMap(() => this.store$.select(selectDeliveryCountries).pipe(first((countries) => countries.length > 0)))
    );
  }

  private handleAddressBookUpdateResult(result: EditAddressDialogResult): void {
    if (result === undefined) {
      return;
    }
    this.loadAddressBook();
    this.cdr.markForCheck();
  }
}
