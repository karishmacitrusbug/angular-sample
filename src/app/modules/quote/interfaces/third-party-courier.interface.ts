import { FreightType } from '@CitT/data';

export interface ThirdPartyCourier {
  name: string;
  description: string;
  websiteUrl: string;
  shipmentMethodType: FreightType;
}
