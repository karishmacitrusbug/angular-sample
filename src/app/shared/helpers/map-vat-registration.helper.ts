import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { User } from '@global/interfaces/user.interface';
import {
  CreateAccRegistrationRequest,
  GetRegistrationResponse,
  UpdateAccRegistrationRequest,
} from '@CitT/data/model/models';

/**
 * Maps a GetRegistrationResponse object to a LocalVatRegistrationVM.
 *
 * This function transforms the response from a VAT registration API call into a
 * LocalVatRegistrationVM object, which provides a structured representation of
 * the VAT registration data, making it easier to work with in the application.
 *
 * @param {GetRegistrationResponse} response - The response object containing VAT registration details.
 * @returns {LocalVatRegistrationVM} - A structured object representing the local VAT registration.
 */
export const mapVatRegistration = (
  response: GetRegistrationResponse
): LocalVatRegistrationVM => ({
  id: response.Id, // Maps the unique identifier of the registration.
  registeredEntityName: response.Name, // Maps the name of the registered entity.
  vatNumber: response.VAT_number__c, // Maps the VAT number.
  registrationType: response.Type_of_registration__c, // Maps the type of registration.
  toCountry: response.Country__c, // Maps the destination country for the registration.
  registeredAddress: response.Registered_Address__c, // Maps the registered address.
  registeredCity: response.Registered_Address_City__c, // Maps the city of the registered address.
  registeredState: response.Registered_Address_Province__c, // Maps the state/province of the registered address.
  registeredCountry: response.Registered_Address_Country__c, // Maps the country of the registered address.
  registeredPostalCode: response.Registered_Address_Postal_Code__c, // Maps the postal code of the registered address.
  contactPersonName: response.Finance_contact_Name__c, // Maps the contact person's name for finance matters.
  contactPersonEmail: response.Finance_contact_Email__c, // Maps the contact person's email.
  contactPersonPhoneNumber: response.Finance_contact_Phone__c, // Maps the contact person's phone number.
});

/**
 * Maps LocalVatRegistrationVM and User data to a CreateAccRegistrationRequest.
 *
 * This function constructs a CreateAccRegistrationRequest object for creating
 * a new VAT registration using data from the LocalVatRegistrationVM and User
 * objects. It ensures that all necessary fields are properly set.
 *
 * @param {LocalVatRegistrationVM} vatRegistrationData - The VAT registration data to map.
 * @param {User} user - The user information, including access token and account ID.
 * @returns {CreateAccRegistrationRequest} - The constructed request object for creating a VAT registration.
 */
export const mapCreateVatRegistrationRequest = (
  vatRegistrationData: LocalVatRegistrationVM,
  user: User
): CreateAccRegistrationRequest => ({
  accesstoken: user.accessToken, // Uses the user's access token for authorization.
  Name: vatRegistrationData.registeredEntityName, // Maps the registered entity name.
  VATnumber: vatRegistrationData.vatNumber, // Maps the VAT number.
  RegisteredAddress: vatRegistrationData.registeredAddress, // Maps the registered address.
  RegisteredAddressCity: vatRegistrationData.registeredCity, // Maps the city of the registered address.
  RegisteredAddressProvince: vatRegistrationData.registeredState, // Maps the state/province.
  RegisteredAddressPostalCode: vatRegistrationData.registeredPostalCode, // Maps the postal code.
  RegisteredAddressCountry: vatRegistrationData.registeredCountry, // Maps the country of the registered address.
  Typeofregistration: vatRegistrationData.registrationType, // Maps the type of registration.
  FinancecontactEmail: vatRegistrationData.contactPersonEmail, // Maps the finance contact person's email.
  FinancecontactName: vatRegistrationData.contactPersonName, // Maps the finance contact person's name.
  FinancecontactPhone: vatRegistrationData.contactPersonPhoneNumber, // Maps the finance contact person's phone number.
  AccountID: user.accountId, // Maps the user's account ID.
  toCountry: vatRegistrationData.toCountry, // Maps the destination country.
});

/**
 * Maps LocalVatRegistrationVM and User data to an UpdateAccRegistrationRequest.
 *
 * This function constructs an UpdateAccRegistrationRequest object for updating
 * an existing VAT registration. It builds upon the create request mapping by
 * adding the registration ID to specify which registration to update.
 *
 * @param {LocalVatRegistrationVM} vatRegistrationData - The VAT registration data to map.
 * @param {User} user - The user information, including access token and account ID.
 * @returns {UpdateAccRegistrationRequest} - The constructed request object for updating a VAT registration.
 */
export const mapUpdateVatRegistrationRequest = (
  vatRegistrationData: LocalVatRegistrationVM,
  user: User
): UpdateAccRegistrationRequest => ({
  ...mapCreateVatRegistrationRequest(vatRegistrationData, user), // Reuses the create request mapping logic.
  RegistrationID: vatRegistrationData.id, // Adds the registration ID for the update request.
});
