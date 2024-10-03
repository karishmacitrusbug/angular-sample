import { Injectable } from '@angular/core';
import { minTaxCalculationModalTime } from '@global/constants/global.constants';
import { CurrencyCode } from '@global/enums/currency-code.enum';
import { mapToLongCurrencyCode } from '@global/helpers/map-country-validation-currency.helper';
import { LineItem } from '@global/modules/common-quote/interfaces/line-item.interface';
import { LineItemsData } from '@global/modules/common-quote/interfaces/line-items-data.interface';
import { BaseLineItemsDataService } from '@global/modules/line-items-config/base-classes/base-line-items-data.service';
import { mapLineItemDetails } from '@shared/helpers/map-line-item-details.helper';
import { mapLineItemPayload } from '@shared/helpers/map-line-item-payload.helper';
import { mapLineItem } from '@shared/helpers/map-line-line-item.helper';
import { QuoteDataService, ValuationMethod, CbAddOrEditPartsRequestLineItems, CbQuoteDataService } from '@CitT/data';
import { forkJoin, Observable, timer } from 'rxjs';
import { map, mapTo } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LineItemsDataService extends BaseLineItemsDataService {
  constructor(private readonly zeeQuoteDataService: CbQuoteDataService, protected readonly quoteDataService: QuoteDataService) {
    super(quoteDataService);
  }

  public saveNewLineItems$({
    shipmentOrderIds,
    lineItems,
    user,
    valuationMethod,
    currency,
    hasStoreFees,
  }: LineItemsData): Observable<LineItem[]> {
    const parts = shipmentOrderIds.reduce<CbAddOrEditPartsRequestLineItems[]>(
      (result) => [...result, ...lineItems.map((item) => this.mapLineItemsWithOptions(item, currency, valuationMethod, hasStoreFees))],
      []
    );

    return this.zeeQuoteDataService
      .addOrEditCbLineItems({ Accesstoken: user.accessToken, LineItems: parts, SOID: shipmentOrderIds[0] })
      .pipe(map((response) => response.map((element) => mapLineItem(element))));
  }

  public editLineItems$({
    shipmentOrderIds,
    lineItems,
    user,
    valuationMethod,
    currency,
    hasStoreFees,
  }: LineItemsData): Observable<LineItem[]> {
    const parts = lineItems.map((item) => this.mapLineItemsWithOptions(item, currency, valuationMethod, hasStoreFees));
    return forkJoin([
      ...shipmentOrderIds.map((shipmentOrderId) =>
        this.zeeQuoteDataService.addOrEditCbLineItems({
          Accesstoken: user.accessToken,
          SOID: shipmentOrderId,
          LineItems: parts,
        })
      ),
      timer(minTaxCalculationModalTime),
    ]).pipe(mapTo(lineItems));
  }

  public getLineItems$(SOID: string, accessToken: string): Observable<LineItem[]> {
    return this._getLineItems$(SOID, accessToken).pipe(map(({ Part }) => Part.map((item) => mapLineItemDetails(item))));
  }

  private readonly mapLineItemsWithOptions = (
    item: LineItem,
    currency: CurrencyCode,
    valuationMethod: ValuationMethod,
    hasStoreFees: boolean
  ): CbAddOrEditPartsRequestLineItems =>
    mapLineItemPayload(item, {
      currency: mapToLongCurrencyCode(currency),
      calculateStoreFee: valuationMethod !== ValuationMethod.COST_METHOD,
      hasStoreFees,
    });
}
