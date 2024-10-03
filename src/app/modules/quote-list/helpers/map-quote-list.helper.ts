import { QuoteState } from '@global/enums/quote-list/quote-state.enum';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { CbQuoteVM } from '@modules/quote-list/interfaces/cb-quote.vm';
import { Country, ShipmentOrderBase, SimplifiedQuoteAndShipmentStatus } from '@CitT/data';
import isNil from 'lodash/isNil';

export const mapQuoteList = (
  shipmentOrders: ShipmentOrderBase[],
  localVatRegistrations?: LocalVatRegistrationVM[],
  destinationCountries?: Country[]
): CbQuoteVM[] => {
  const quoteMap = shipmentOrders.reduce<Map<string, CbQuoteVM>>((quotes, shipmentOrder) => {
    const state = resolveQuoteState(shipmentOrder);
    if (isNil(state)) {
      return quotes;
    }
    return quotes.set(shipmentOrder.Id, mapQuoteListEntry(shipmentOrder, state, localVatRegistrations, destinationCountries));
  }, new Map<string, CbQuoteVM>());
  return [...quoteMap.values()];
};

export const mapLocalVatRegistration = (
  destinationCountry: string,
  localVatRegistrations: LocalVatRegistrationVM[]
): LocalVatRegistrationVM | undefined => localVatRegistrations.find((reg) => reg.toCountry === destinationCountry);

export const mapQuoteListEntry = (
  shipmentOrder: ShipmentOrderBase,
  quoteState: QuoteState,
  localVatRegistrations?: LocalVatRegistrationVM[],
  destinationCountries?: Country[]
): CbQuoteVM => ({
  id: shipmentOrder.Id,
  name: shipmentOrder.NCP_Quote_Reference__c,
  state: quoteState,
  estimatedTotalCost: shipmentOrder.Total_Invoice_Amount__c,
  fixTotalCost: shipmentOrder.Total_Invoice_Amount__c,
  timelineTotal: shipmentOrder.ETA_Formula__c,
  expiryDate: shipmentOrder.Expiry_Date__c,
  createdDate: shipmentOrder.CreatedDate,
  destinationCountry: shipmentOrder.Destination__c,
  owner: isNil(shipmentOrder.Client_Contact_for_this_Shipment__r)
    ? undefined
    : { id: shipmentOrder.Client_Contact_for_this_Shipment__r.Id, name: shipmentOrder.Client_Contact_for_this_Shipment__r.Name },
  reference1: shipmentOrder.Client_Reference__c,
  reference2: shipmentOrder.Client_Reference_2__c,
  shippingStatus: shipmentOrder.Shipping_Status__c,
  estimatedTaxDutyCost: shipmentOrder.Tax_Cost__c,
  shipmentValue: shipmentOrder.Shipment_Value_USD__c,
  localVatRegistration: localVatRegistrations && mapLocalVatRegistration(shipmentOrder.Destination__c, localVatRegistrations),
  isLocalVatRequired: destinationCountries?.find((c) => c.value === shipmentOrder.Destination__c)?.VATRegistrationrequired,
});

const resolveQuoteState = (shipmentOrder: ShipmentOrderBase): QuoteState | undefined => {
  if (isCompleteQuote(shipmentOrder)) {
    return QuoteState.Complete;
  }
  if (isExpiredQuote(shipmentOrder)) {
    return QuoteState.Expired;
  }
  return undefined;
};

const isCompleteQuote = (shipmentOrder: ShipmentOrderBase): boolean =>
  shipmentOrder.NCP_Shipping_Status__c === SimplifiedQuoteAndShipmentStatus.QUOTE___COMPLETE_OR_INCOMPLETE &&
  shipmentOrder.of_Line_Items__c > 0;

const isExpiredQuote = (shipmentOrder: ShipmentOrderBase): boolean =>
  shipmentOrder.NCP_Shipping_Status__c === SimplifiedQuoteAndShipmentStatus.QUOTE___EXPIRED;
