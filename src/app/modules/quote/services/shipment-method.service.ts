import { Injectable } from '@angular/core';
import { UpdateQuoteService } from '@global/modules/common-quote/services/update-quote.service';
import { AuthService } from '@global/services/auth.service';
import { CourierRateStatus, QuoteDataService, Success } from '@CitT/data';
import isNil from 'lodash/isNil';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ShipmentMethod } from '../interfaces/shipment-method.interface';

@Injectable()
/**
 * ShipmentMethodService
 * 
 * This service handles the business logic related to saving and updating shipment methods for a given order.
 * It interacts with various services like `UpdateQuoteService`, `AuthService`, and `QuoteDataService` to
 * update the preferred freight option and optionally update courier rates when necessary.
 * 
 * @class ShipmentMethodService
 */
export class ShipmentMethodService {
  constructor(
    private readonly authService: AuthService,
    private readonly quoteDataService: QuoteDataService,
    private readonly updateQuoteService: UpdateQuoteService
  ) {}

  /**
   * saveShipmentMethod$
   * 
   * This method updates the preferred shipment method for a given order. 
   * It first updates the quote with the selected shipment method and, if applicable,
   * updates the courier rates for cross-border shipments handled by the `CB` courier.
   * 
   * @param {string} shipmentOrderId - The unique ID of the shipment order.
   * @param {ShipmentMethod} selectedShipmentMethod - The selected shipment method containing information such as type and handling.
   * @param {string} [selectedCbCourierId] - Optional ID of the selected cross-border courier, required if the method is handled by a CB courier.
   * @returns {Observable<Success>} - An observable that emits a `Success` object when the operation completes.
   */
  public saveShipmentMethod$(
    shipmentOrderId: string,
    selectedShipmentMethod: ShipmentMethod,
    selectedCbCourierId?: string
  ): Observable<Success> {
    return this.updateQuoteService
      .updateQuote$(shipmentOrderId, {
        preferredFreight: selectedShipmentMethod.type,
      })
      .pipe(
        switchMap(() => {
          // If the shipment method is not handled by a CB courier or the courier ID is missing, no further updates are needed.
          if (!selectedShipmentMethod.isHandledByCb || isNil(selectedCbCourierId)) {
            return of(null); // Return an observable with null as no further action is required.
          }

          // If the shipment is handled by a CB courier, update the courier rates using the authenticated user's access token.
          return this.authService.getUser$().pipe(
            switchMap((user) =>
              this.quoteDataService.updateCourierRates({
                Accesstoken: user.accessToken,  // Use the user's access token for authentication.
                CRID: selectedCbCourierId,      // The ID of the selected CB courier.
                Status: CourierRateStatus.SELECTED,  // Mark the courier rate status as "SELECTED".
              })
            )
          );
        })
      );
  }
}
