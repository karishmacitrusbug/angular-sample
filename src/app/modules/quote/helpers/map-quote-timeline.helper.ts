import { Radix } from '@global/enums/radix.enum';
import { QuoteTimeline } from '@global/modules/common-quote/interfaces/quote-timeline.interface';
import { ShipmentOrder } from '@CitT/data';
import isNil from 'lodash/isNil';

// See this discussion why this is implemented this way.
// https://citrsupercha-3169646.slack.com/archives/CVBRLED6U/p1633605690011000
export const mapQuoteTimeline = (shipmentOrder: ShipmentOrder): QuoteTimeline => {
  const compliance = shipmentOrder.Estimate_Pre_Approval_Time_Formula__c;
  const transit = shipmentOrder.Estimate_Transit_Time_Formula__c;
  const customClearance = shipmentOrder.Estimate_Customs_Clearance_Time_Formula__c;
  const licensePermitProcessTime = shipmentOrder.License_and_Permit_Process__c ? shipmentOrder.License_and_Permit_Process__c : null;
  const finalDeliveryTime = '3-7 business days';

  const total = [compliance, transit, customClearance, finalDeliveryTime, licensePermitProcessTime].reduce(
    (accumulator, item) => {
      if (isNil(item)) {
        return accumulator;
      }

      const matches = item.match(/\d+/g);

      if (matches.length === 0) {
        return accumulator;
      }

      const values = matches.map((match) => Number.parseInt(match, Radix.Decimal)).filter((match) => !Number.isNaN(match));
      const minimum = Math.min(...values);
      const maximum = Math.max(...values);

      return {
        minimum: accumulator.minimum + minimum,
        maximum: accumulator.maximum + maximum,
      };
    },
    { minimum: 0, maximum: 0 }
  );

  return {
    compliance,
    transit,
    customClearance,
    finalDeliveryTime,
    licensePermitProcessTime,
    // eslint-disable-next-line sonarjs/no-nested-template-literals
    total: `${total.minimum === total.maximum ? total.minimum : `${total.minimum} - ${total.maximum}`} business days`,
  };
};
