import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { invoicePaymentReturnUrlMapSessionStorageKey } from '@global/constants/global.constants';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { PaymentCallbackQueryParam } from '@modules/payment-callback/enums/payment-callback-query-param.enum';
import isNil from 'lodash/isNil';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCallbackPageComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    this.handlePaymentCallback();
  }

  private handlePaymentCallback(): void {
    try {
      const invoiceId = this.route.snapshot.queryParamMap.get(PaymentCallbackQueryParam.InvoiceId);
      const status = this.route.snapshot.queryParamMap.get(PaymentCallbackQueryParam.Status);

      if (isNil(invoiceId)) {
        throw new Error('Invoice ID was not provided');
      }

      if (isNil(status)) {
        throw new Error('Status was not provided');
      }

      const storedInvoicePaymentReturnUrlMap = sessionStorage.getItem(invoicePaymentReturnUrlMapSessionStorageKey);

      if (isNil(storedInvoicePaymentReturnUrlMap)) {
        throw new Error('Invoice payment return URL map is empty');
      }

      const parsedInvoicePaymentReturnUrlMap = JSON.parse(storedInvoicePaymentReturnUrlMap);
      const returnUrl = parsedInvoicePaymentReturnUrlMap[invoiceId];

      if (isNil(returnUrl)) {
        throw new Error(`Return URL is not present for invoice with ID: ${invoiceId}`);
      }

      this.router.navigateByUrl(returnUrl, { replaceUrl: true });
    } catch (error) {
      this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_RETURN_FROM_PAYMENT');
      this.router.navigate([], { replaceUrl: true });
    }
  }
}
