import { DOCUMENT, Location } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { invoicePaymentReturnUrlMapSessionStorageKey } from '@global/constants/global.constants';
import { InvoicePaymentPayload } from '@shared/interfaces/invoice-payment-payload.interface';
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(@Inject(DOCUMENT) private readonly document: Document, private readonly location: Location) {}

  public payInvoice(payload: InvoicePaymentPayload): void {
    const invoicePaymentReturnUrlMap = this.getInvoicePaymentReturnUrlMap();
    this.addReturnUrlForInvoice(invoicePaymentReturnUrlMap, payload.invoiceId);
    this.document.location.href = payload.stripeUrl;
  }

  private getInvoicePaymentReturnUrlMap(): Record<string, string> {
    const storedInvoicePaymentReturnUrlMap = sessionStorage.getItem(invoicePaymentReturnUrlMapSessionStorageKey);
    if (isNil(storedInvoicePaymentReturnUrlMap)) {
      return {};
    }
    try {
      const parsedInvoicePaymentReturnUrlMap = JSON.parse(storedInvoicePaymentReturnUrlMap);

      return isObject(parsedInvoicePaymentReturnUrlMap) ? (parsedInvoicePaymentReturnUrlMap as Record<string, string>) : {};
    } catch {
      return {};
    }
  }

  private addReturnUrlForInvoice(invoicePaymentReturnUrlMap: Record<string, string>, invoiceId: string): void {
    const updatedMap = { ...invoicePaymentReturnUrlMap, [invoiceId]: this.location.path(true) };
    sessionStorage.setItem(invoicePaymentReturnUrlMapSessionStorageKey, JSON.stringify(updatedMap));
  }
}
