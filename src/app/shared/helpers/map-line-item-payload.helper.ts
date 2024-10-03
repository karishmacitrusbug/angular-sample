import { LineItemsColumn } from '@global/enums/line-items-column.enum';
import { LineItem } from '@global/modules/common-quote/interfaces/line-item.interface';
import { defaultStoreFeePercentage } from '@shared/constants/app.constants';
import { LineItemsMappingOptions } from '@shared/interfaces/line-items-mapping-options.interface';
import { CbAddOrEditPartsRequestLineItems } from '@CitT/data';

/**
 * Maps a LineItem object to a CbAddOrEditPartsRequestLineItems payload.
 * 
 * This function takes a line item and a set of mapping options to transform the line item 
 * into a format suitable for creating or editing parts in a request. It calculates the 
 * retail price, store fees, and adjusts the unit price based on the provided options.
 * 
 * @param {LineItem} lineItem - The line item to be mapped.
 * @param {LineItemsMappingOptions} options - The options that influence the mapping, including currency and store fee calculations.
 * @returns {CbAddOrEditPartsRequestLineItems} - The mapped line item payload ready for API requests.
 */
export const mapLineItemPayload = (lineItem: LineItem, options: LineItemsMappingOptions): CbAddOrEditPartsRequestLineItems => {
  const result: CbAddOrEditPartsRequestLineItems = {
    partNumber: lineItem[LineItemsColumn.ProductCode],  // Maps the product code.
    description: lineItem[LineItemsColumn.Description],  // Maps the description of the product.
    quantity: lineItem[LineItemsColumn.Quantity],  // Maps the quantity of the item.
    hsCode: lineItem[LineItemsColumn.HsCode],  // Maps the HS code.
    countryOfOrigin: lineItem[LineItemsColumn.CountryOfOrigin],  // Maps the country of origin.
    clientCurrencyInput: options.currency,  // Sets the currency from the options.
    retailMethodSalesPriceperunit: lineItem[LineItemsColumn.UnitPrice],  // Maps the unit price.
  };

  // Calculate store fee and adjust unit price based on options provided.
  if (!options.calculateStoreFee) {
    result.storeFeeAvailable = false;  // No store fee calculation.
    result.retailMethodAmazonFeesperunit = 0;  // Set Amazon fees to 0.
    result.unitPrice = lineItem[LineItemsColumn.UnitPrice];  // Retain the original unit price.
  } else if (options.hasStoreFees) {
    result.storeFeeAvailable = true;  // Store fees are available.
    result.retailMethodAmazonFeesperunit = lineItem[LineItemsColumn.StoreFees];  // Use the provided store fees.
    result.unitPrice = result.retailMethodSalesPriceperunit - result.retailMethodAmazonFeesperunit;  // Calculate unit price after store fees.
  } else {
    result.storeFeeAvailable = false;  // No store fees available.
    result.retailMethodAmazonFeesperunit = +((result.retailMethodSalesPriceperunit / 100) * defaultStoreFeePercentage).toFixed(1);  // Calculate default store fees.
    result.unitPrice = result.retailMethodSalesPriceperunit - result.retailMethodAmazonFeesperunit;  // Calculate unit price after default store fees.
  }

  return result;  // Return the constructed payload.
};
