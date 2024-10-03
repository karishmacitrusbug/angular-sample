import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { toggleAnimation, toggleOpacityAnimation } from '@global/animations/toggle-open-close.animation';
import { AddressCardAddressVM } from '@global/interfaces/address/address.vm';
import get from 'lodash/get';
import { AddressTabContentAddressGroupVM } from './address-group.vm';

const ADDRESS_GROUP_HEADER_HEIGHT = 64;

@Component({
  selector: 'app-address-tab-content',
  templateUrl: './address-tab-content.component.html',
  styleUrls: ['./address-tab-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [toggleAnimation(ADDRESS_GROUP_HEADER_HEIGHT), toggleOpacityAnimation],
})
export class AddressTabContentComponent implements OnChanges {
  @Input() public addressGroups: AddressTabContentAddressGroupVM[] = [];
  /**
   * Emits when needs to create a new address, passes optional value of country name
   */
  @Output() public createAddress = new EventEmitter<string | undefined>();
  @Output() public editAddress = new EventEmitter<AddressCardAddressVM>();
  @Output() public deleteAddress = new EventEmitter<AddressCardAddressVM>();

  public filterText = '';

  public filteredAddressGroups: AddressTabContentAddressGroupVM[] = [];
  public expandedAddressGroups = new Map<string, boolean>();

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.addressGroups) {
      this.handleAddressGroupChanges();
    }
  }

  private handleAddressGroupChanges(): void {
    this.onSearch(this.filterText);
    if (this.filteredAddressGroups.length > 0) {
      this.expandedAddressGroups.set(this.filteredAddressGroups[0].countryName, true);
    }
  }

  public onSearch(text: string): void {
    this.filterText = text;

    if (this.filterText === '') {
      this.filteredAddressGroups = this.addressGroups;
      return;
    }

    const regexp = new RegExp(text.trim().toLocaleLowerCase());

    this.filteredAddressGroups = this.addressGroups.reduce<AddressTabContentAddressGroupVM[]>(
      (filteredAddressGroups, currentAddressGroup) => {
        const country = currentAddressGroup.countryName || '';
        if (regexp.test(country.toLocaleLowerCase())) {
          return [...filteredAddressGroups, currentAddressGroup];
        }

        const addresses = currentAddressGroup.addresses.reduce<AddressCardAddressVM[]>((filteredAddresses, currentAddress) => {
          const matchFields = [
            currentAddress.tag,
            currentAddress.streetAddress,
            currentAddress.city,
            currentAddress.state,
            currentAddress.zip,
          ];
          if (matchFields.some((matchField) => regexp.test(matchField?.toLowerCase()))) {
            return [...filteredAddresses, currentAddress];
          }
          return filteredAddresses;
        }, []);

        if (addresses.length > 0) {
          return [...filteredAddressGroups, { ...currentAddressGroup, addresses }];
        }

        return filteredAddressGroups;
      },
      []
    );
  }

  public onAddNewAddressClick(addressGroup?: AddressTabContentAddressGroupVM): void {
    const country = get(addressGroup, 'countryName');
    this.createAddress.emit(country);
  }

  public onAddressCardEdit(address: AddressCardAddressVM): void {
    this.editAddress.emit(address);
  }

  public onAddressCardDelete(address: AddressCardAddressVM): void {
    this.deleteAddress.emit(address);
  }

  public isGroupExpanded(addressGroup: AddressTabContentAddressGroupVM): boolean {
    return this.expandedAddressGroups.get(addressGroup.countryName) || false;
  }

  public onToggleAddressGroupClick(addressGroup: AddressTabContentAddressGroupVM): void {
    const isGroupExpanded = this.isGroupExpanded(addressGroup);
    this.expandedAddressGroups.set(addressGroup.countryName, !isGroupExpanded);
  }
}
