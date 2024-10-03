import { mapCommonCosts } from '@global/helpers/map-common-costs.helper';
import { Costs } from '@global/interfaces/costs.interface';
import { ShipmentOrder } from '@CitT/data';

/**
 * Maps costs associated with a shipment order to a structured Costs object.
 * 
 * This function extracts and organizes cost-related data from a given ShipmentOrder object.
 * It utilizes a helper function to map common costs and adds additional cost fields specific 
 * to the shipment, such as customs license fees, liability cover fees, VAT/GST fees, 
 * duties and other taxes, and shipping service fees.
 * 
 * @param {ShipmentOrder} shipmentOrder - The shipment order from which to extract cost information.
 * @returns {Costs} - An object containing various cost details associated with the shipment order.
 */
export const mapCosts = (shipmentOrder: ShipmentOrder): Costs => ({
  ...mapCommonCosts(shipmentOrder),  // Spread common cost fields mapped from the shipment order.
  customsLicenseFees: shipmentOrder.Recharge_License_Cost__c,  // Customs license fees.
  liabilityCoverFee: shipmentOrder.Potential_Liability_cover_fee_USD__c,  // Liability cover fee in USD.
  vatGstFee: shipmentOrder.Total_VAT_GST_with_buffer__c,  // Total VAT/GST including buffer.
  dutiesAndOtherTaxesFee: shipmentOrder.Total_Duties_and_Other_Taxes_Excl_VAT__c,  // Duties and other taxes excluding VAT.
  zeeShippingServiceFees: shipmentOrder.International_Delivery_Fee__c,  // Shipping service fees for international delivery.
});
