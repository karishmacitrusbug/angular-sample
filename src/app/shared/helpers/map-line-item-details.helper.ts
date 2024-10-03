import { LineItemsColumn } from '@global/enums/line-items-column.enum';
import { LineItem } from '@global/modules/common-quote/interfaces/line-item.interface';
import { GetPartsDetailsResponsePart } from '@CitT/data/model/getPartsDetailsResponsePart';

/**
 * Maps details from a GetPartsDetailsResponsePart object to a structured LineItem object.
 *
 * This function transforms the properties of a line item received from parts details
 * into a more structured format defined by the LineItem interface. The mapping is based
 * on predefined columns from the LineItemsColumn enum, ensuring consistency across line item data.
 *
 * @param {GetPartsDetailsResponsePart} lineItem - The line item details from the parts response to be mapped.
 * @returns {LineItem} - A structured object representing the line item with relevant details.
 */
export const mapLineItemDetails = (
  lineItem: GetPartsDetailsResponsePart
): LineItem => ({
  [LineItemsColumn.ProductCode]: lineItem.Name, // Maps the product code from the line item's name.
  [LineItemsColumn.Description]: lineItem.DescriptionandFunctionality, // Maps the description and functionality.
  [LineItemsColumn.Quantity]: lineItem.Quantity, // Maps the quantity of the line item.
  [LineItemsColumn.UnitPrice]: lineItem.RetailMethodSalesPricePerUnit, // Maps the unit price.
  [LineItemsColumn.HsCode]: lineItem.USHTSCode, // Maps the HS code for the product.
  [LineItemsColumn.CountryOfOrigin]: lineItem.CountryOfOrigin, // Maps the country of origin.
  [LineItemsColumn.StoreFees]: lineItem.RetailMethodAmazonFeesPerUnit, // Maps the store fees per unit.
});
