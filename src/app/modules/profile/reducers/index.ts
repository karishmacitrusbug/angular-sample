import { matchesItemKeys } from '@global/helpers/matches-item-keys.helper';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from 'app/reducers';
import * as fromLocalVatRegistrations from './local-vat-registrations.reducer';

export const localVatRegistrationsFeatureKey = 'localVatRegistrations';

export interface LocalVatRegistrationsState {
  [fromLocalVatRegistrations.localVatRegistrationsFeatureKey]: fromLocalVatRegistrations.State;
}

export interface AppState extends State {
  [localVatRegistrationsFeatureKey]: LocalVatRegistrationsState;
}

export const reducers: ActionReducerMap<LocalVatRegistrationsState> = {
  [fromLocalVatRegistrations.localVatRegistrationsFeatureKey]: fromLocalVatRegistrations.reducer,
};

export const selectLocalVatRegistrationFeatureState = createFeatureSelector<LocalVatRegistrationsState>(localVatRegistrationsFeatureKey);

export const selectLocalVatRegistrationsState = createSelector(
  selectLocalVatRegistrationFeatureState,
  (state) => state[fromLocalVatRegistrations.localVatRegistrationsFeatureKey]
);

export const selectLocalVatRegistrations = createSelector(selectLocalVatRegistrationsState, (state) =>
  state.items.data.filter((element) => filterNotRequired(element))
);

export const selectLocalVatRegistrationsLoading = createSelector(selectLocalVatRegistrationsState, (state) => state.items.isLoading);

export const selectKeyword = createSelector(selectLocalVatRegistrationsState, (state) => state.keyword);

export const selectFilteredRegistrations = createSelector(selectLocalVatRegistrations, selectKeyword, (items, keyword) =>
  items.filter((item) =>
    matchesItemKeys(item, keyword, [
      'registeredEntityName',
      'vatNumber',
      'toCountry',
      'registeredAddress',
      'registeredCity',
      'registeredState',
      'registeredCountry',
      'registeredPostalCode',
      'contactPersonName',
      'contactPersonPhoneNumber',
      'contactPersonEmail',
    ])
  )
);

export const selectRegisteredCountries = createSelector(selectLocalVatRegistrations, (registrations) => [
  ...new Set(registrations.map((reg) => reg.toCountry)),
]);

const filterNotRequired = (vatReg: LocalVatRegistrationVM) => vatReg.registeredEntityName !== 'Not Required';
