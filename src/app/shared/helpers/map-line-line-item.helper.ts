import { LineItemsColumn } from '@global/enums/line-items-column.enum';
import { LineItem } from '@global/modules/common-quote/interfaces/line-item.interface';
import { AddPartsResponseItem } from '@CitT/data';

/**
 * Maps an AddPartsResponseItem object to a structured LineItem object.
 *
 * This function transforms the properties of a line item received from an add parts
 * response into a more structured format defined by the LineItem interface. Each
 * relevant property from the AddPartsResponseItem is mapped to a corresponding
 * property in the LineItem using predefined columns from the LineItemsColumn enum.
 *
 * @param {AddPartsResponseItem} lineItem - The line item details from the add parts response to be mapped.
 * @returns {LineItem} - A structured object representing the line item with relevant details.
 */
export const mapLineItem = (lineItem: AddPartsResponseItem): LineItem => ({
  [LineItemsColumn.ProductCode]: lineItem.Name, // Maps the product code from the line item's name.
  [LineItemsColumn.Description]: lineItem.Description_and_Functionality__c, // Maps the description and functionality of the product.
  [LineItemsColumn.Quantity]: lineItem.Quantity__c, // Maps the quantity of the line item.
  [LineItemsColumn.UnitPrice]: lineItem.Retail_Method_Sales_Price_per_unit__c, // Maps the unit price.
  [LineItemsColumn.HsCode]: lineItem.US_HTS_Code__c, // Maps the HS code for the product.
  [LineItemsColumn.CountryOfOrigin]: lineItem.Country_of_Origin__c, // Maps the country of origin.
  [LineItemsColumn.StoreFees]: lineItem.Retail_Method_Amazon_Fees_per_unit__c, // Maps the store fees per unit.
});
