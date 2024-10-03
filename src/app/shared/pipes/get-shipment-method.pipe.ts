import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FreightType } from '@CitT/data';

/**
 * A custom Angular pipe that transforms a FreightType enum value into a 
 * localized string representation of the shipment method.
 * 
 * This pipe can return both short and long descriptions of the shipment 
 * methods based on the provided type parameter. It leverages the 
 * TranslateService to retrieve the appropriate localized strings.
 */
@Pipe({
  name: 'getShipmentMethod',
})
export class GetShipmentMethodPipe implements PipeTransform {
  constructor(private readonly translateService: TranslateService) {}

  /**
   * Transforms a FreightType value into a localized string representation 
   * based on the specified type ('short' or 'long').
   * 
   * @param value The FreightType enum value to be transformed.
   * @param type The type of description to return: 'short' for a concise 
   *              name, 'long' for a detailed description. Defaults to 'short'.
   * @returns A localized string representing the shipment method.
   */
  public transform(value: FreightType, type: 'short' | 'long' = 'short'): string {
    switch (type) {
      case 'short':
        return this.getShortShipmentMethod(value);
      case 'long':
        return this.getLongShipmentMethod(value);
    }
  }

  private getShortShipmentMethod(value: FreightType): string {
    switch (value) {
      case FreightType.AIR:
        return this.translateService.instant('QUOTE.SHIPMENT_METHOD.AIR');
      case FreightType.ROAD:
        return this.translateService.instant('QUOTE.SHIPMENT_METHOD.ROAD');
      case FreightType.SEA:
        return this.translateService.instant('QUOTE.SHIPMENT_METHOD.SEA');
    }
  }

  private getLongShipmentMethod(value: FreightType): string {
    switch (value) {
      case FreightType.AIR:
        return this.translateService.instant('QUOTE.SHIPMENT_METHOD.ZEE_AIR_SHIPPING');
      case FreightType.ROAD:
        return this.translateService.instant('QUOTE.SHIPMENT_METHOD.ROAD_FREIGHT');
      case FreightType.SEA:
        return this.translateService.instant('QUOTE.SHIPMENT_METHOD.SEA_FREIGHT');
    }
  }
}
