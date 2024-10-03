import { FreightType } from '@CitT/data';

export interface ShipmentMethod {
  type: FreightType;
  isHandledByCb: boolean;
  transitTime: string;
  freightAmount: number;
}
