import { CurrencyCode } from '@global/enums/currency-code.enum';
import { MessageThreadType } from '@global/enums/message-thread-type.enum';
import { filterEmptyCase } from '@global/helpers/filter-empty-case.helper';
import { mapFromLongCurrencyCode } from '@global/helpers/map-country-validation-currency.helper';
import { mapShortLengthUnit } from '@global/helpers/map-length-unit.helper';
import { mapServiceType } from '@global/helpers/map-service-type.helper';
import { mapShipmentOrderPackages } from '@global/helpers/map-shipment-order-packages.helper';
import { mapWeightUnit } from '@global/helpers/map-weight-unit.helper';
import { mapIsUnread, mapLastMessage, mapSendbirdMessageIsUnread } from '@global/helpers/messages/map-message.helper';
import { roundDecimal } from '@global/helpers/utils.helper';
import { SendbirdChannelsList } from '@global/interfaces/messages/sendbird-channel-list.interface';
import { QuoteStatus } from '@global/modules/common-quote/enums/quote-status.enum';
import { mapShipmentOrderPickupAddresses } from '@global/modules/common-quote/helpers/map-shipment-order-pickup-addresses.helper';
import { mapShipmentOrderShipToAddresses } from '@global/modules/common-quote/helpers/map-shipment-order-ship-to-addresses.helper';
import { MessageButtonUserVM } from '@global/modules/message-button/user.vm';
import { MessageEnvelopeMessageVM } from '@global/modules/message-envelope/message.vm';
import { mapShipmentOrderLineItems } from '@modules/quote-list/helpers/map-shipment-order-line-items.helper';
import { mapQuoteTimeline } from '@modules/quote/helpers/map-quote-timeline.helper';
import { mapShipmentMethods } from '@modules/quote/helpers/map-shipment-methods.helper';
import { profilePictureFallback } from '@shared/constants/app.constants';
import { mapCosts } from '@shared/helpers/map-costs.helper';
import {
  CourierResponsibility,
  FreightType,
  InlineResponse2001,
  ShipmentOrder,
  ShipmentOrderRelations,
  SimplifiedQuoteAndShipmentStatus,
  YesNo,
} from '@CitT/data';
import get from 'lodash/get';
import { QuoteDetailsQuote } from '../interfaces/quote.interface';

const mapMessages = (messages: InlineResponse2001): MessageEnvelopeMessageVM[] => {
  if (!messages?.Cases) {
    return [];
  }

  return messages?.Cases?.filter((element) => filterEmptyCase(element)).map((message) => ({
    id: message.Id,
    type: MessageThreadType.Case,
    user: {
      name: message.Ownername,
      profilePicture: message.FullphotoURL || profilePictureFallback,
    },
    subject: message.subject,
    date: mapLastMessage(message.CreatedDate, message.LatestClientCommentedtime, message.LatestInternalCommentedtime),
    attachment: !!message.Attachments?.length,
    isAnswer: false,
    isUnread: mapIsUnread(message.LatestClientCaseViewedTime, message.LatestInternalCommentedtime),
    isClosed: message.ClosedDownSO,
  }));
};

const mapSendbirdMessages = (messages: SendbirdChannelsList[], sendbirdChannelsObject?: any[]): MessageEnvelopeMessageVM[] => {
  if (!messages) {
    return [];
  }

  return messages
    ?.filter((element) => filterEmptyCase(element))
    .map((message) => ({
      id: message.id,
      type: MessageThreadType.Case,
      user: {
        name: message.from.nickname,
        profilePicture: profilePictureFallback,
      },
      subject: message.subject,
      date: new Date(message.date),
      attachment: false,
      isAnswer: false,
      isUnread: mapSendbirdMessageIsUnread(message.id, sendbirdChannelsObject),
      isClosed: true ? message.channelstatus === 'closed' : false,
    }));
};

const isExpiredQuote = (shipmentOrder: ShipmentOrder): boolean =>
  shipmentOrder.NCP_Shipping_Status__c === SimplifiedQuoteAndShipmentStatus.QUOTE___EXPIRED;

export const mapQuoteDetails = (
  shipmentOrder: ShipmentOrder,
  shipmentOrderRelations: ShipmentOrderRelations,
  messages: SendbirdChannelsList[],
  defaultTeamMember: MessageButtonUserVM,
  shipmentMethods: FreightType[],
  sendbirdChannelsObject: any[]
): QuoteDetailsQuote => {
  const serviceType = mapServiceType(shipmentOrder.Service_Type__c);
  const estimatedWeightUnit = mapWeightUnit(shipmentOrderRelations?.ShipmentOrderPackages?.[0]?.WeightUnit);

  return {
    id: shipmentOrder.Id,
    freightId: get(shipmentOrderRelations.FreightDetails, [0, 'Id']),
    name: shipmentOrder.NCP_Quote_Reference__c,
    projectReference1: get(shipmentOrder, 'Client_Reference__c', ''),
    projectReference2: get(shipmentOrder, 'Client_Reference_2__c', ''),
    from: shipmentOrder.Ship_From_Country__c,
    to: shipmentOrder.Destination__c,
    shipmentValue: shipmentOrder.Shipment_Value_USD__c,
    shipmentValueCurrency: CurrencyCode.USD,
    estimatedWeight: roundDecimal(shipmentOrder.Chargeable_Weight__c, estimatedWeightUnit),
    estimatedWeightUnit,
    numberOfLocations: shipmentOrder.Final_Deliveries_New__c,
    nameOfAddressedEntity: { id: get(shipmentOrder.Buyer_Account__r, 'Id'), name: get(shipmentOrder.Buyer_Account__r, 'Name', '') },
    lineItemNumber: shipmentOrder.of_Line_Items__c || 0,
    lineItems: mapShipmentOrderLineItems(shipmentOrderRelations),
    packages: mapShipmentOrderPackages(shipmentOrderRelations),
    pickUpAddress: mapShipmentOrderPickupAddresses(shipmentOrderRelations),
    locationAddresses: mapShipmentOrderShipToAddresses(shipmentOrderRelations),
    expiryDate: shipmentOrder.Expiry_Date__c,
    lengthUnit: mapShortLengthUnit(shipmentOrderRelations?.ShipmentOrderPackages?.[0]?.DimensionUnit),
    messages: mapSendbirdMessages(messages, sendbirdChannelsObject),
    serviceType,
    timeline: mapQuoteTimeline(shipmentOrder),
    costs: mapCosts(shipmentOrder),
    citrShippingServiceFeeEnabled: shipmentOrder.Who_arranges_International_courier__c === CourierResponsibility.TEC_EX,
    liabilityCoverFeeEnabled: shipmentOrder.Client_Taking_Liability_Cover__c === YesNo.YES,
    clientNote: shipmentOrder.NCP_Client_Notes__c,
    shippingNotes: shipmentOrder.Shipping_Notes_New__c,
    parent: shipmentOrder.Roll_Out__c
      ? {
          id: shipmentOrder.Roll_Out__c,
          reference: shipmentOrder.RolloutName__c,
        }
      : undefined,
    status: shipmentOrder.Cost_Estimate_Accepted__c ? QuoteStatus.Accepted : QuoteStatus.NotAccepted,
    orderType: shipmentOrder.Quote_type__c,
    totalCost: {
      min: shipmentOrder.Total_Cost_Range_Min__c || 0,
      max: shipmentOrder.Total_Cost_Range_Max__c || 0,
    },
    shippingStatus: shipmentOrder.Shipping_Status__c,
    isExpired: isExpiredQuote(shipmentOrder),
    defaultTeamMember,
    typeOfGoods: shipmentOrder.Type_of_Goods__c,
    etaDisclaimer: shipmentOrder.CPA_v2_0__r?.ETA_Disclaimer__c,
    reasonForProForma: shipmentOrder.Reason_for_Pro_forma_quote__c,
    owner: shipmentOrder.Client_Contact_for_this_Shipment__c,
    shipmentMethods: mapShipmentMethods(shipmentMethods, shipmentOrder),
    selectedShipmentMethod: shipmentOrder.Preferred_Freight_method__c ?? FreightType.AIR,
    cpaId: shipmentOrder.CPA_v2_0__r.Id,
    valuationMethod: shipmentOrder.CPA_v2_0__r.Valuation_Method__c,
    clientCurrencyInput: mapFromLongCurrencyCode(shipmentOrderRelations.Parts[0]?.ClientCurrencyInput),
    storeFeesAvailable: shipmentOrderRelations.Parts[0]?.StoreFeesAvailable,
  };
};
