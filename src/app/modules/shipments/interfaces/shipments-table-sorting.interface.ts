import { SortingDirection } from '@global/enums/sorting-direction.enum';
import { ShipmentsTableSortableColumns } from '@modules/shipments/components/shipments-table/shipments-table-sortable-columns.type';

export interface ShipmentsTableSorting {
  column: ShipmentsTableSortableColumns;
  direction?: SortingDirection;
}
