import { SortingDirection } from '@global/enums/sorting-direction.enum';
import { ShipmentListItemVM } from '@modules/shipments/interfaces/shipment-list-item.vm';
import { ShipmentsTableSorting } from '@modules/shipments/interfaces/shipments-table-sorting.interface';

export const sortShipmentOrders = (a: ShipmentListItemVM, b: ShipmentListItemVM): number => {
  const firstDate = new Date(a.acceptanceDate).getTime();
  const secondDate = new Date(b.acceptanceDate).getTime();
  if (firstDate === secondDate) {
    return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
  }

  return firstDate - secondDate;
};

export const sortShipmentOrdersByColumns = (shipments: ShipmentListItemVM[], sorting: ShipmentsTableSorting): ShipmentListItemVM[] => {
  if (!sorting || !sorting.direction) {
    return shipments;
  }

  return sorting.column === 'clientTodos' ? sortClientTodos(shipments, sorting.direction) : shipments;
};

export const sortClientTodos = (shipments: ShipmentListItemVM[], direction: SortingDirection): ShipmentListItemVM[] => {
  const sortAscending = [...shipments].sort((a, b) => {
    const numberOfTasksA = a.numberOfTasks || 0;
    const numberOfMessagesA = a.numberOfMessages || 0;
    const numberOfTasksB = b.numberOfTasks || 0;
    const numberOfMessagesB = b.numberOfMessages || 0;
    return numberOfTasksA + numberOfMessagesA - (numberOfTasksB + numberOfMessagesB);
  });
  return direction === SortingDirection.Ascending ? sortAscending : sortAscending.reverse();
};
