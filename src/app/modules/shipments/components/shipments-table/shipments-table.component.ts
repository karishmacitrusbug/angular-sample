import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ShipmentStatus } from '@global/enums/shipment-status.enum';
import { SortingDirection } from '@global/enums/sorting-direction.enum';
import { ShipmentsTableSortableColumns } from '@modules/shipments/components/shipments-table/shipments-table-sortable-columns.type';
import { ShipmentListItemVM } from '@modules/shipments/interfaces/shipment-list-item.vm';
import { ShipmentsTableSorting } from '@modules/shipments/interfaces/shipments-table-sorting.interface';

let PAGINATION_ID = 0;

@Component({
  selector: 'app-shipments-table',
  templateUrl: './shipments-table.component.html',
  styleUrls: ['./shipments-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentsTableComponent implements OnChanges {
  @Input() public shipments: ShipmentListItemVM[];
  @Input() public tooltip?: string;
  @Input() public tableStatus: ShipmentStatus;
  @Input() public noResultsLabel: string;
  @Input() public columnSorted?: ShipmentsTableSorting;

  @Output() public payInvoice = new EventEmitter<ShipmentListItemVM>();
  @Output() public sortByColumn = new EventEmitter<ShipmentsTableSorting>();

  public readonly ShipmentStatus = ShipmentStatus;
  public readonly paginationId = `shipmentsListPagination-${PAGINATION_ID++}`;
  public readonly itemsPerPage = 15;

  public currentPage = 1;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes?.shipments) {
      this.currentPage = 1;
    }
  }

  public onPageChange(page: number): void {
    this.currentPage = page;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  public onPayInvoice(shipment: ShipmentListItemVM): void {
    this.payInvoice.emit(shipment);
  }

  public onSortButtonClick(column: ShipmentsTableSortableColumns, direction: SortingDirection): void {
    this.sortByColumn.emit({ column, direction });
  }
}
