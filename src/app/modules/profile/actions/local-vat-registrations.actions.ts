import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { createAction, props } from '@ngrx/store';

export const enter = createAction('[Local VAT registrations] enter');

export const load = createAction('[Local VAT registrations] load');
export const loadSuccess = createAction('[Local VAT registrations] loadSuccess', props<{ data: LocalVatRegistrationVM[] }>());
export const loadError = createAction('[Local VAT registrations] loadError', props<{ error: string }>());

export const create = createAction('[Local VAT registrations] create');

export const edit = createAction('[Local VAT registrations] edit', props<{ vatRegistrationData: LocalVatRegistrationVM }>());

export const updateKeyword = createAction('[Local VAT registrations] updateKeyword', props<{ keyword: string }>());

export const leave = createAction('[Local VAT registrations] leave');
