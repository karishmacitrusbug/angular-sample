import { CbDeliveryAddress } from '@CitT/data';
import { AddressCardDeliveryAddressVM } from '../interfaces/address-card-delivery-address.vm';

export const mapCbDeliveryAddress = (address: CbDeliveryAddress): AddressCardDeliveryAddressVM => ({
  id: address.Id,
  tag: address.Name,
  companyName: address.CompanyName__c,
  contactPerson: address.Contact_Full_Name__c,
  email: address.Contact_Email__c,
  phone: address.Contact_Phone_Number__c,
  additionalPhone: address.AdditionalContactNumber__c,
  country: address.All_Countries__c,
  state: address.Province__c,
  city: address.City__c,
  streetAddress: address.Address__c,
  additionalStreetAddress: address.Address2__c,
  zip: address.Postal_Code__c,
  isDefault: false,
  isActive: true,
  isFulfillmentCenter: address.Client__r.Name === 'Citr E-Commerce Prospective Client',
});
