import { MappedShippingStatus } from '@global/enums/mapped-shipping-status.enum';
import { MappedTrackingStatus } from '@global/enums/mapped-tracking-status.enum';
import { MessageThreadType } from '@global/enums/message-thread-type.enum';
import { ShipmentStatus } from '@global/enums/shipment-status.enum';
import { ShipmentDocumentType } from '@global/enums/shipments/shipment-document-type.enum';
import { TrackingState } from '@global/enums/tracking-state.enum';
import { doesTaskHaveMessages } from '@global/helpers/does-task-have-messages.helper';
import { filterEmptyCase, filterEmptySendbirdCase } from '@global/helpers/filter-empty-case.helper';
import { mapFromLongCurrencyCode } from '@global/helpers/map-country-validation-currency.helper';
import { mapEtaDays } from '@global/helpers/map-eta-days.helper';
import { mapShortLengthUnit } from '@global/helpers/map-length-unit.helper';
import { mapShipmentOrderPackages } from '@global/helpers/map-shipment-order-packages.helper';
import { mapTaskStates } from '@global/helpers/map-task-states.helper';
import { mapMappedTrackerState } from '@global/helpers/map-tracker-state.helper';
import { mapWeightUnit } from '@global/helpers/map-weight-unit.helper';
import { mapIsUnread, mapLastMessage, mapSendbirdMessageIsUnread } from '@global/helpers/messages/map-message.helper';
import { mapDeliveryDate } from '@global/helpers/shipments/map-delivery-date.helper';
import { mapLogItems } from '@global/helpers/shipments/map-shipment-log-items.helper';
import { sortByDate } from '@global/helpers/sort-by-date.helper';
import { SendbirdChannelsList } from '@global/interfaces/messages/sendbird-channel-list.interface';
import { ShipmentHistory } from '@global/interfaces/shipments/shipment-history.vm';
import { ShipmentTaskDataVM } from '@global/interfaces/shipments/shipment-task-data.vm';
import { ShipmentTaskType } from '@global/interfaces/shipments/shipment-task-type.enum';
import { TrackingItemLogVM } from '@global/interfaces/tracking/tracking-item-log.vm';
import { mapContacts } from '@global/modules/common-profile/helpers/map-contacts.helper';
import { mapShipmentOrderPickupAddresses } from '@global/modules/common-quote/helpers/map-shipment-order-pickup-addresses.helper';
import { mapShipmentOrderShipToAddresses } from '@global/modules/common-quote/helpers/map-shipment-order-ship-to-addresses.helper';
import { MessageButtonUserVM } from '@global/modules/message-button/user.vm';
import { MessageEnvelopeMessageVM } from '@global/modules/message-envelope/message.vm';
import { mapShipmentOrderLineItems } from '@modules/quote-list/helpers/map-shipment-order-line-items.helper';
import { mapShipmentInvoices } from '@modules/shipments/helpers/map-shipment-invoices.helper';
import { orderTasks } from '@modules/shipments/helpers/task-ordering.helper';
import { ShipmentDetailsShipmentVM } from '@modules/shipments/interfaces/shipment-details-shipment.vm';
import { CbShipmentDocumentVM } from '@modules/shipments/interfaces/cb-shipment-document.vm';
import { profilePictureFallback } from '@shared/constants/app.constants';
import { mapCosts } from '@shared/helpers/map-costs.helper';
import {
  Contact,
  FreightType,
  InlineResponse2001,
  ShipmentOrder,
  ShipmentOrderRelations,
  ShipmentOrderRelationsTask,
  TaskState,
  YesNo,
} from '@CitT/data';
import get from 'lodash/get';
import isNil from 'lodash/isNil';

const mapShipmentHistoryToTracking = (log: ShipmentHistory[]): TrackingItemLogVM[] =>
  log
    .filter((logItem) => Object.values(MappedTrackingStatus).includes(logItem.state as MappedTrackingStatus))
    .map((logItem) => ({ ...logItem, state: mapMappedTrackerState(logItem.state) }));

const mapTasks = (shipmentOrderRelations: ShipmentOrderRelations): ShipmentTaskDataVM[] => {
  if (!shipmentOrderRelations.Task) {
    return [];
  }

  const taskList = shipmentOrderRelations.Task.filter((task) => !task.IsNotApplicable && task.ClientVisibility).map((task) => ({
    id: task.Id,
    title: task.TemplateTitle,
    category: task.Category,
    taskType: mapTaskType(task),
    isInactive: task.Inactive,
    state: task.State,
    isClientPending: task.State === TaskState.CLIENT_PENDING,
    blocksApproval: task.BlocksApprovaltoShip,
  }));

  return orderTasks(taskList);
};

const mapMessages = (cases: InlineResponse2001, tasks: ShipmentOrderRelationsTask[]): MessageEnvelopeMessageVM[] => {
  const mesasagesFromCases: MessageEnvelopeMessageVM[] =
    cases?.Cases?.filter(filterEmptyCase).map((message) => ({
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
    })) || [];

  const messagesFromTasks: MessageEnvelopeMessageVM[] =
    tasks
      ?.filter((task) => !task.IsNotApplicable && task.ClientVisibility && doesTaskHaveMessages(task))
      .map((task) => ({
        id: task.Id,
        type: MessageThreadType.Task,
        user: {
          name: '',
          profilePicture: profilePictureFallback,
        },
        subject: task.TemplateTitle,
        date: mapLastMessage(task.createddate, task.LastClientMsgTime, task.LastMessageTime),
        isAnswer: false,
        isUnread: mapIsUnread(task.Last_Client_viewed_time, task.LastMessageTime),
        isClosed: task.State === TaskState.RESOLVED,
      })) || [];

  return mesasagesFromCases.concat(messagesFromTasks).sort((a, b) => sortByDate(b.date.toISOString(), a.date.toISOString()));
};

const mapDocuments = (
  shipmentOrderRelations: ShipmentOrderRelations,
  podString: string,
  podAvailableSoonString: string,
  clearanceLetterString: string,
  customsClearanceLetterString: string
): CbShipmentDocumentVM[] => {
  const documents: CbShipmentDocumentVM[] = [];
  if (shipmentOrderRelations.FinalDeliveries) {
    documents.push(
      ...shipmentOrderRelations.FinalDeliveries.map((finalDelivery) => ({
        title: finalDelivery.FinalDeliveryDocuments ? podString : podAvailableSoonString,
        owner: finalDelivery.DeliveryReference,
        date: finalDelivery.DeliveryDate,
        urlId: finalDelivery.FinalDeliveryDocuments ? finalDelivery.FinalDeliveryDocuments[0].Id : '',
        type: ShipmentDocumentType.ProofOfDelivery,
      }))
    );
  }

  if (shipmentOrderRelations.Customs_Clearance_Documents) {
    documents.push(
      ...shipmentOrderRelations.Customs_Clearance_Documents.map((ccd) => ({
        title: customsClearanceLetterString,
        urlId: ccd.CCD_attached_Documents?.length ? ccd.CCD_attached_Documents[0].Id : '',
        type: ShipmentDocumentType.CustomClearance,
      }))
    );
  }

  if (shipmentOrderRelations.Attachments) {
    documents.push(
      ...shipmentOrderRelations.Attachments.filter((attachment) =>
        attachment.Name.toLowerCase().includes(clearanceLetterString.toLowerCase())
      ).map((attachment) => ({
        title: clearanceLetterString,
        urlId: attachment.Id,
        type: ShipmentDocumentType.ClearanceLetter,
      }))
    );
  }

  return documents;
};
const mapSendbirdCaseMessages = (
  cases: SendbirdChannelsList[],
  tasks: ShipmentOrderRelationsTask[],
  sendbirdChannelsArray?
): MessageEnvelopeMessageVM[] => {
  const mesasagesFromCases: MessageEnvelopeMessageVM[] =
    cases?.filter(filterEmptySendbirdCase).map((message) => ({
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
      isUnread: mapSendbirdMessageIsUnread(message.id, sendbirdChannelsArray),
      isClosed: true ? message.channelstatus === 'closed' : false,
    })) || [];

  // const messagesFromTasks: MessageEnvelopeMessageVM[] =
  //   tasks
  //     ?.filter((task) => !task.IsNotApplicable && task.ClientVisibility && doesTaskHaveMessages(task))
  //     .map((task) => ({
  //       id: task.Id,
  //       type: MessageThreadType.Task,
  //       user: {
  //         name: '',
  //         profilePicture: profilePictureFallback,
  //       },
  //       subject: task.TemplateTitle,
  //       date: mapLastMessage(task.createddate, task.LastClientMsgTime, task.LastMessageTime),
  //       isAnswer: false,
  //       isUnread: mapSendbirdMessageIsUnread(task.Id, sendbirdChannelsArray),
  //       isClosed: task.State === TaskState.Resolved,
  //     })) || [];

  return [...mesasagesFromCases].sort((a, b) => sortByDate(b.date.toISOString(), a.date.toISOString()));
};

const mapSubStatus = (shipment: ShipmentOrder) =>
  shipment.Sub_Status_Update__c && shipment.Sub_Status_Update__c !== 'NONE' ? shipment.Sub_Status_Update__c : undefined;

const mapShipmentStatus = (mappedShippingStatus: string): ShipmentStatus => {
  switch (mappedShippingStatus) {
    case MappedShippingStatus.ArrivedInCountry:
    case MappedShippingStatus.ClearedCustoms:
    case MappedShippingStatus.FinalDeliveryInProgress:
    case MappedShippingStatus.InTransit:
      return ShipmentStatus.Tracking;
    case MappedShippingStatus.Delivered:
      return ShipmentStatus.Completed;
    default:
      return ShipmentStatus.CompliancePending;
  }
};

const mapTrackingState = (mappedShippingStatus: string): TrackingState => mapMappedTrackerState(mappedShippingStatus);

const mapTaskType = (task: ShipmentOrderRelationsTask): ShipmentTaskType => {
  switch (task.State) {
    case TaskState.NOT_STARTED:
    case TaskState.CLIENT_PENDING:
    case TaskState.TEC_EX_PENDING:
      return ShipmentTaskType.Open;
    case TaskState.UNDER_REVIEW:
      return ShipmentTaskType.UnderReview;
    case TaskState.RESOLVED:
      return ShipmentTaskType.Closed;
    default:
      return undefined;
  }
};

export const mapShipmentOrderResponse = (
  soResponse: ShipmentOrder,
  shipmentOrderRelations: ShipmentOrderRelations,
  contacts: Contact[],
  messages: SendbirdChannelsList[],
  podString: string,
  podAvailableSoonString: string,
  defaultTeamMember: MessageButtonUserVM,
  clearanceLetterString: string,
  customsClearanceLetterString: string,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  sendbirdChannelsArray?: any
): ShipmentDetailsShipmentVM => {
  const { log } = mapLogItems(shipmentOrderRelations.SOLOG, soResponse.Mapped_Shipping_status__c === 'Delivered');

  return {
    id: soResponse.Id,
    freightId: get(shipmentOrderRelations.FreightDetails, [0, 'Id']),
    name: soResponse.NCP_Quote_Reference__c,
    shipmentName: soResponse.Name,
    references: isNil(soResponse.Client_Reference__2__c)
      ? [soResponse.Client_Reference__c]
      : [soResponse.Client_Reference__c, soResponse.Client_Reference__2__c],
    destination: soResponse.Destination__c,
    orderType: soResponse.Quote_type__c,
    owner: soResponse.Client_Contact_for_this_Shipment__c,
    contacts: mapContacts(contacts),
    trackingState: mapTrackingState(soResponse.Mapped_Shipping_status__c),
    shipmentTaskStates: {
      customsCompliance: mapTaskStates(soResponse.Customs_Compliance__c),
      shippingDocuments: mapTaskStates(soResponse.Shipping_Documents__c),
      pickUpCoordination: mapTaskStates(soResponse.Pick_up_Coordination__c),
      invoicePayment: mapTaskStates(soResponse.Invoice_Payment__c),
    },
    statusUpdates: {
      description: soResponse.Banner_Feed__c,
      finalDeliveryDate: mapDeliveryDate(soResponse),
      eta: mapEtaDays(soResponse),
      etaText: soResponse.ETA_Text_per_Status__c,
    },
    status: mapShipmentStatus(soResponse.Mapped_Shipping_status__c),
    mappedStatus: soResponse.Mapped_Shipping_status__c,
    from: soResponse.Ship_From_Country__c,
    subStatus: mapSubStatus(soResponse),
    value: soResponse.Shipment_Value_USD__c,
    estimatedWeight: soResponse.Chargeable_Weight__c,
    estimatedWeightUnit: mapWeightUnit(shipmentOrderRelations?.ShipmentOrderPackages?.[0]?.WeightUnit),
    lineItems: mapShipmentOrderLineItems(shipmentOrderRelations),
    packages: mapShipmentOrderPackages(shipmentOrderRelations),
    lengthUnit: mapShortLengthUnit(shipmentOrderRelations?.ShipmentOrderPackages?.[0]?.DimensionUnit),
    pickUpAddress: mapShipmentOrderPickupAddresses(shipmentOrderRelations),
    deliveryAddresses: mapShipmentOrderShipToAddresses(shipmentOrderRelations),
    numberOfLocations: soResponse.Final_Deliveries_New__c,
    nameOfAddressedEntity: { id: get(soResponse.Buyer_Account__r, 'Id'), name: get(soResponse.Buyer_Account__r, 'Name', '') },
    transitTime: soResponse.Estimate_Transit_Time__c,
    customsDates: soResponse.Estimate_Customs_Clearance_time__c,
    shipmentProvider: soResponse.Who_arranges_International_courier__c,
    totalCosts: mapCosts(soResponse),
    invoices: mapShipmentInvoices(shipmentOrderRelations),
    tasks: mapTasks(shipmentOrderRelations),
    messages: mapSendbirdCaseMessages(messages, shipmentOrderRelations.Task, sendbirdChannelsArray),
    documents: mapDocuments(shipmentOrderRelations, podString, podAvailableSoonString, clearanceLetterString, customsClearanceLetterString),
    history: log,
    logs: mapShipmentHistoryToTracking(log),
    note: soResponse.NCP_Client_Notes__c,
    defaultTeamMember,
    liabilityCoverFeeEnabled: soResponse.Client_Taking_Liability_Cover__c === YesNo.YES,
    trackingNumber: soResponse.Portal_Tracking_Number__c,
    newStatusDate: soResponse.New_Status_Date__c,
    preferredFreightMethod: soResponse.Preferred_Freight_method__c,
    ciTotal: soResponse.CI_Total__c,
    totalValueAppliedOnCustomerInvoice: soResponse.Total_Value_Applied_on_Customer_Invoice__c ?? 0,
    selectedShipmentMethod: soResponse.Preferred_Freight_method__c ?? FreightType.AIR,
    invoiceStatusRollup: soResponse.Client_Invoice_Status_Roll_up__c,
    ClientCurrencyInput: mapFromLongCurrencyCode(shipmentOrderRelations.Parts[0]?.ClientCurrencyInput),
    StoreFeesAvailable: shipmentOrderRelations.Parts[0]?.StoreFeesAvailable,
    Valuation_Method__c: soResponse.CPA_v2_0__r.Valuation_Method__c,
    invoicingTerm: soResponse.Account__r?.Invoicing_Term_Parameters__c,
    totalOutstandingTasks: soResponse.Total_Outstanding_Tasks__c,
  };
};
