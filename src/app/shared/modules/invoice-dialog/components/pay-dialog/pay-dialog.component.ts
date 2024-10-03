import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FileHelper } from '@global/helpers/file.helper';
import { InvoiceDetails, InvoiceDetailsVM } from '@global/modules/common-invoices/interfaces/invoice-details.vm';
import { InvoiceDetailsService } from '@global/modules/common-invoices/service/invoice-details.service';
import { DIALOG_DATA } from '@global/modules/dialog/dialog.tokens';
import { DialogData } from '@global/modules/dialog/interfaces/dialog-data.interface';
import { CaseMessageDialogService } from '@global/modules/message-dialog/services/case-message-dialog.service';
import { TeamMemberListType } from '@global/modules/message-thread/enums/team-member-list-type.enum';
import { ToastMessageService } from '@global/modules/toast-message/toast-message.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { TranslateService } from '@ngx-translate/core';
import { CbInvoiceDialogPayload } from '@shared/interfaces/cb-invoice-dialog-payload.interface';
import { PaymentService } from '@shared/services/payment.service';
import { CaseSource } from '@CitT/data';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pay-dialog',
  templateUrl: './pay-dialog.component.html',
  styleUrls: ['./pay-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InvoiceDetailsService],
})
export class PayDialogComponent implements OnInit, OnDestroy {
  public invoice: CbInvoiceDialogPayload;
  public invoiceDetails: InvoiceDetailsVM;

  public isLoadingDetails = false;
  public readonly DATE_FORMAT = 'dd LLL yyyy';

  private readonly destroyed$ = new Subject<void>();

  constructor(
    @Inject(DIALOG_DATA) private readonly data: DialogData<{ invoice: CbInvoiceDialogPayload }>,
    private readonly caseMessageDialogService: CaseMessageDialogService,
    private readonly invoiceDetailsService: InvoiceDetailsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly toastMessageService: ToastMessageService,
    private readonly translateService: TranslateService,
    private readonly paymentService: PaymentService
  ) {
    this.invoice = this.data.payload.invoice;
  }

  public ngOnInit(): void {
    this.loadInvoiceDetails();
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private loadInvoiceDetails(): void {
    this.isLoadingDetails = true;
    this.invoiceDetailsService
      .getInvoiceDetails$(this.data.payload.invoice.id, this.data.payload.invoice.orderId)
      .pipe(
        finalize(() => {
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe((invoiceDetails) => {
        this.isLoadingDetails = false;
        this.invoiceDetails = invoiceDetails;
        this.cdr.markForCheck();
      });
  }

  public onMessageClick(): void {
    this.invoiceDetailsService
      .sendInvoiceEmail$(this.invoice.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () => this.toastMessageService.open(this.translateService.instant('INVOICES_PAGE.ACCOUNT_STATEMENT_EMAIL_SENT_SUCCESSFULLY')),
        (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SEND_INVOICE_EMAIL')
      );
  }

  public onMessageManager(): void {
    const shipmentOrder = this.invoiceDetails.shipmentOrder;

    this.caseMessageDialogService.open({
      messageTo: this.invoiceDetails.defaultTeamMember,
      teamMemberListType: TeamMemberListType.Invoice,
      shipment: {
        id: shipmentOrder.id,
        reference: shipmentOrder.reference,
        title: shipmentOrder.name,
      },
      source: {
        type: CaseSource.NCP_INVOICE,
        recordId: this.invoice.id,
      },
    });
  }

  public onDownloadClick(): void {
    this.invoiceDetailsService
      .downloadInvoice$(this.invoice.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (attachment) => FileHelper.downloadDataFile(attachment),
        (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_DOWNLOAD_INVOICE')
      );
  }

  public isPastDate(date: Date): boolean {
    return date < new Date();
  }

  public getDueDate(invoiceDetails: InvoiceDetails): string | Date {
    return this.invoice.dueDate || invoiceDetails?.dueDate;
  }

  public onPayClick(): void {
    this.paymentService.payInvoice({ invoiceId: this.invoice.id, stripeUrl: this.invoice.stripeUrl });
  }
}
