import { ShipmentTaskDataVM } from '@global/interfaces/shipments/shipment-task-data.vm';
import { TaskState } from '@CitT/data';

const compareTaskState = (prev: ShipmentTaskDataVM, next: ShipmentTaskDataVM): number => {
  if (prev.state === next.state) {
    return 0;
  }

  return prev.state === TaskState.CLIENT_PENDING ? -1 : 1;
};

const compareInactive = (prev: ShipmentTaskDataVM, next: ShipmentTaskDataVM): number => {
  if (prev.isInactive === next.isInactive) {
    return 0;
  }

  return prev.isInactive ? 1 : -1;
};

const compareBlocksApproval = (prev: ShipmentTaskDataVM, next: ShipmentTaskDataVM): number => {
  if (prev.blocksApproval === next.blocksApproval) {
    return 0;
  }

  return prev.blocksApproval ? -1 : 1;
};

export const orderTasks = (tasks: ShipmentTaskDataVM[]): ShipmentTaskDataVM[] =>
  tasks.sort((prev, next) => compareTaskState(prev, next) || compareInactive(prev, next) || compareBlocksApproval(prev, next));
