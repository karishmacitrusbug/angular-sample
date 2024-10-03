import { Injectable } from '@angular/core';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { LocalVatRegistrationService } from '@modules/local-vat-registration/services/local-vat-registration.service';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';
import * as fromShipmentDetails from '../../reducers';

@Injectable()
export class ShipmentsDetailsPageService {
  constructor(
    private readonly store$: Store<fromShipmentDetails.AppState>,
    private readonly localVatRegistrationService: LocalVatRegistrationService
  ) {}

  public getLocalVatRegistration$(): Observable<LocalVatRegistrationVM | undefined> {
    return this.store$.select(fromShipmentDetails.selectShipmentDetailsShipment).pipe(
      switchMap((shipment) =>
        shipment ? this.localVatRegistrationService.getCachedVatRegistrationForCountry$(shipment.destination) : of(undefined)
      ),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
