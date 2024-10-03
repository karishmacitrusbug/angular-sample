import { LineItemsColumn } from '@global/enums/line-items-column.enum';
import { LineItem } from '@global/modules/common-quote/interfaces/line-item.interface';
import { ShipmentOrderRelations, ShipmentOrderRelationsParts } from '@CitT/data';
import get from 'lodash/get';

export const mapShipmentOrderLineItems = (shipmentOrderRelations: ShipmentOrderRelations): LineItem[] =>
  get<ShipmentOrderRelations, 'Parts', ShipmentOrderRelationsParts[]>(shipmentOrderRelations, 'Parts', []).map((lineItem) => ({
    [LineItemsColumn.ProductCode]: lineItem.PartNumber,
    [LineItemsColumn.Description]: lineItem.PartDescription,
    [LineItemsColumn.Quantity]: lineItem.Quantity,
    [LineItemsColumn.UnitPrice]: lineItem.RetailMethodSalesPriceperunit,
    [LineItemsColumn.HsCode]: lineItem.USHTSCode,
    [LineItemsColumn.CountryOfOrigin]: lineItem.CountryOfOrigin,
    [LineItemsColumn.StoreFees]: lineItem.RetailMethodAmazonFeesperunit,
  }));
