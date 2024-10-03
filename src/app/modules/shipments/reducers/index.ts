import { ShipmentDocumentType } from '@global/enums/shipments/shipment-document-type.enum';
import { ShipmentTaskType } from '@global/interfaces/shipments/shipment-task-type.enum';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from 'app/reducers';
import * as fromShipmentDetails from './shipment-details.reducer';
import * as fromShipmentList from './shipment-list.reducer';

export const shipmentsFeatureKey = 'shipments';

export interface ShipmentState {
  [fromShipmentList.shipmentListFeatureKey]: fromShipmentList.State;
  [fromShipmentDetails.shipmentDetailsKey]: fromShipmentDetails.State;
}

export interface AppState extends State {
  [shipmentsFeatureKey]: ShipmentState;
}

export const reducers: ActionReducerMap<ShipmentState> = {
  [fromShipmentList.shipmentListFeatureKey]: fromShipmentList.reducer,
  [fromShipmentDetails.shipmentDetailsKey]: fromShipmentDetails.reducer,
};

export const selectShipmentFeatureState = createFeatureSelector<ShipmentState>(shipmentsFeatureKey);

export const selectShipmentListState = createSelector(
  selectShipmentFeatureState,
  (state) => state[fromShipmentList.shipmentListFeatureKey]
);

export const selectLastActivatedTab = createSelector(selectShipmentListState, (state) => state.lastActivatedTab);

export const selectShipmentDetails = createSelector(selectShipmentFeatureState, (state) => state[fromShipmentDetails.shipmentDetailsKey]);
export const selectShipmentDetailsShipment = createSelector(selectShipmentDetails, (state) => state.shipment.data);

export const selectShipmentDetailsisLoading = createSelector(selectShipmentDetails, (state) => state.shipment.isLoading);

export const selectShipmentOwner = createSelector(selectShipmentDetailsShipment, (state) => state?.owner);

export const selectOpenTasks = createSelector(selectShipmentDetailsShipment, (shipment) =>
  shipment.tasks?.filter((task) => task.taskType === ShipmentTaskType.Open)
);

export const selectOpenTasksNumber = createSelector(selectOpenTasks, (tasks) => tasks.length);

export const selectClientPendingTasksNumber = createSelector(
  selectOpenTasks,
  (tasks) => tasks.filter((task) => task.isClientPending).length
);

export const selectUnderReviewTasks = createSelector(selectShipmentDetailsShipment, (shipment) => {
  if (shipment.tasks) {
    return shipment.tasks.filter((task) => task.taskType === ShipmentTaskType.UnderReview);
  }
  return [];
});

export const selectUnderReviewTasksNumber = createSelector(selectUnderReviewTasks, (tasks) => tasks.length);

export const selectClosedTasks = createSelector(selectShipmentDetailsShipment, (shipment) => {
  if (shipment.tasks) {
    return shipment.tasks.filter((task) => task.taskType === ShipmentTaskType.Closed);
  }
  return [];
});

export const selectClosedTasksNumber = createSelector(selectClosedTasks, (tasks) => tasks.length);

export const selectMessages = createSelector(selectShipmentDetailsShipment, (shipment) => shipment?.messages || []);

export const selectOpenMessages = createSelector(selectMessages, (messages) => {
  if (messages) {
    return messages.filter((message) => !message.isClosed);
  }
  return [];
});

export const selectOpenMessagesNumber = createSelector(selectOpenMessages, (messages) => messages.length);

export const selectClosedMessages = createSelector(selectMessages, (messages) => {
  if (messages) {
    return messages.filter((message) => message.isClosed);
  }
  return [];
});

export const selectClosedMessagesNumber = createSelector(selectClosedMessages, (messages) => messages.length);

export const selectPodDocuments = createSelector(selectShipmentDetailsShipment, (shipment) => {
  if (shipment.documents) {
    return shipment.documents.filter((doc) => doc.type === ShipmentDocumentType.ProofOfDelivery);
  }
  return [];
});

export const selectPodDocumentsNumber = createSelector(selectPodDocuments, (documents) => documents.length);

export const selectCcdDocuments = createSelector(selectShipmentDetailsShipment, (shipment) => {
  if (shipment.documents) {
    return shipment.documents.filter((doc) => doc.type === ShipmentDocumentType.CustomClearance);
  }
  return [];
});

export const selectCcdDocumentsNumber = createSelector(selectCcdDocuments, (documents) => documents.length);

export const selectClearanceLetterDocuments = createSelector(selectShipmentDetailsShipment, (shipment) => {
  if (shipment.documents) {
    return shipment.documents.filter((doc) => doc.type === ShipmentDocumentType.ClearanceLetter);
  }
  return [];
});

export const selectClearanceLetterDocumentsNumber = createSelector(selectClearanceLetterDocuments, (documents) => documents.length);

export const selectShipmentNote = createSelector(selectShipmentDetailsShipment, (shipment) => shipment?.note);
