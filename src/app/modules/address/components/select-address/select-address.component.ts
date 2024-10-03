import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { EditAddressDialogResultType } from '@global/enums/edit-address-dialog-result-type.enum';
import { SelectAddressDialogType } from '@global/enums/select-address-dialog-type.enum';
import { AddressCardAddressVM } from '@global/interfaces/address/address.vm';
import { SelectAddressDialogPayload } from '@global/interfaces/address/select-address-dialog-payload.interface';
import { SelectAddress } from '@global/interfaces/address/select-address.interface';
import { AuthService } from '@global/services/auth.service';
import { AddressCardDeliveryAddressVM } from '@modules/address/interfaces/address-card-delivery-address.vm';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

type AddressVM = AddressCardAddressVM | AddressCardDeliveryAddressVM;

@Component({
  selector: 'app-select-address',
  templateUrl: './select-address.component.html',
  styleUrls: ['./select-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectAddressComponent implements SelectAddress, OnDestroy {
  @Input() public type: SelectAddressDialogType;
  @Input() public title: string;
  @Input() public set initialAddresses(initialAddresses: AddressVM[]) {
    this._initialAddresses = initialAddresses;
    this.updateLists(this.initialSelectedAddresses[0], this.initialAddresses);
  }
  public get initialAddresses(): AddressVM[] {
    return this._initialAddresses;
  }
  private _initialAddresses: AddressVM[] = [];
  @Input() public set initialSelectedAddresses(initialSelectedAddresses: AddressVM[]) {
    this._initialSelectedAddresses = initialSelectedAddresses;
    this.updateLists(this.initialSelectedAddresses[0], this.initialAddresses);
  }
  public get initialSelectedAddresses(): AddressVM[] {
    return this._initialSelectedAddresses;
  }
  private _initialSelectedAddresses: AddressVM[] = [];
  @Input() public onCreate: SelectAddressDialogPayload['onCreate'];
  @Input() public onEdit: SelectAddressDialogPayload['onEdit'];

  @Output() public selectedAddressesChange = new EventEmitter<AddressVM[]>();

  public readonly SelectAddressDialogType = SelectAddressDialogType;
  public readonly allowCustomizedFinalDeliveries$: Observable<boolean> = this.authService
    .getUser$()
    .pipe(map((user) => user.allowCustomizedFinalDeliveries));

  public searchText = '';
  /**
   * List of all addresses
   */
  private fullAddressList: AddressVM[];
  /**
   * List of filtered addresses available for selection
   */
  public filteredAddressList: AddressVM[];
  public filterFulfillmentCenters: AddressVM[];
  public selectedAddress?: AddressVM;

  private readonly destroyed$ = new Subject<void>();

  constructor(private readonly authService: AuthService, private readonly cdr: ChangeDetectorRef) {}

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private updateLists(selectedAddress?: AddressVM, addressList = this.fullAddressList): void {
    this.fullAddressList = addressList;
    this.selectedAddress = isNil(selectedAddress) ? undefined : addressList.find((address) => address.id === selectedAddress.id);
    this.filteredAddressList = this.getFilteredAddressList();
    if (this.type === SelectAddressDialogType.LocationAddresses) {
      this.filterFulfillmentCenters = this.getFilteredFulfillmentCentersList();
    }

    this.selectedAddressesChange.emit(isNil(this.selectedAddress) ? [] : [this.selectedAddress]);
  }

  public get showNumberOfSelectedAddresses(): boolean {
    return this.type === SelectAddressDialogType.LocationAddresses && !isNil(this.selectedAddress);
  }

  public get customAddressList(): AddressVM[] {
    return this.fullAddressList.filter((address) => !get(address, 'isFulfillmentCenter', false));
  }

  public get hasAddresses(): boolean {
    return this.customAddressList.length > 0;
  }

  public onSelectAddress(address: AddressVM): void {
    if (this.selectedAddress.id === address.id) {
      return;
    }
    this.updateLists(address);
  }

  public onToggleAddress(selectedAddress: AddressVM): void {
    this.updateLists(selectedAddress);
  }

  public onEditAddressCard(address: AddressVM): void {
    this.onEdit(address)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((updatedAddresses) => {
        this.updateLists(this.selectedAddress, updatedAddresses);
        this.cdr.markForCheck();
      });
  }

  public onDeleteAddressCard(): void {
    this.updateLists();
    this.cdr.markForCheck();
  }

  public onAddNewAddressClick(): void {
    this.onCreate()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(({ addresses, result }) => {
        let newSelectedAddressList = this.selectedAddress;
        if (result?.type === EditAddressDialogResultType.Create) {
          newSelectedAddressList = addresses.find((address) => address.id === result.address.id);
        }
        this.updateLists(newSelectedAddressList, addresses);

        this.cdr.markForCheck();
      });
  }

  public searchAddresses(searchText: string): void {
    this.searchText = searchText;
    this.filteredAddressList = this.getFilteredAddressList();
    if (this.type === SelectAddressDialogType.LocationAddresses) {
      this.filterFulfillmentCenters = this.getFilteredFulfillmentCentersList();
    }
  }

  private getFilteredAddressList(): AddressVM[] {
    if (this.searchText === undefined || this.searchText === '') {
      return this.customAddressList;
    }
    return this.customAddressList.filter((address) =>
      Object.values(address)
        .filter((value): value is string => isString(value))
        .some((value) => value.toLowerCase().includes(this.searchText.trim().toLowerCase()))
    );
  }

  private getFilteredFulfillmentCentersList(): AddressVM[] {
    const fulfillmentCenters = this.fullAddressList.filter((address) => get(address, 'isFulfillmentCenter', false));
    if (this.searchText === undefined || this.searchText === '') {
      return fulfillmentCenters;
    }
    return fulfillmentCenters.filter((address) =>
      Object.values(address)
        .filter((value): value is string => isString(value))
        .some((value) => value.toLowerCase().includes(this.searchText.trim().toLowerCase()))
    );
  }
}
