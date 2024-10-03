import { CourierRate, CourierRateStatus } from '@CitT/data';
import { CbCourier } from '../interfaces/cb-courier.interface';

const MAX_COURIERS = 5;

export const mapCbCouriers = (couriers: CourierRate[]): CbCourier[] =>
  couriers
    .filter((courier) => courier.Preferred__c && [CourierRateStatus.CREATED, CourierRateStatus.SELECTED].includes(courier.Status__c))
    .sort((a, b) => a.Final_Rate__c - b.Final_Rate__c)
    .slice(0, MAX_COURIERS)
    .map(
      (courier): CbCourier => ({
        id: courier.Id,
        name: courier.Carrier_Name__c,
        fee: courier.Final_Rate__c,
        serviceType: courier.Service_Type_Name__c,
      })
    );
