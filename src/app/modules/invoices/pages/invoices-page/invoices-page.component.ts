import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { InvoiceType } from '@global/enums/invoice-type.enum';
import { FileHelper } from '@global/helpers/file.helper';
import { filterEntriesByFields } from '@global/helpers/filter-entries-by-fields.helper';
import { ClosedInvoice, OpenCreditInvoice, OutstandingInvoice } from '@global/modules/common-invoices/interfaces/invoice.interface';
import { InvoicesVM } from '@global/modules/common-invoices/interfaces/invoices.vm';
import { PaymentHistorySubItem } from '@global/modules/common-invoices/interfaces/payment-history-item.interface';
import { MessageButtonUserVM as UserVM } from '@global/modules/message-button/user.vm';
import { CaseMessageDialogService } from '@global/modules/message-dialog/services/case-message-dialog.service';
import * as commonMessageAction from '@global/modules/message-thread/actions/common-messages.actions';
import { TeamMemberListType } from '@global/modules/message-thread/enums/team-member-list-type.enum';
import * as commonMessageReducer from '@global/modules/message-thread/reducers';
import { ToastMessageService } from '@global/modules/toast-message/toast-message.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { TeamMemberService } from '@global/services/team-member.service';
import { InvoicesService } from '@modules/invoices/services/invoices.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { CbInvoiceDialogPayload } from '@shared/interfaces/cb-invoice-dialog-payload.interface';
import { InvoiceDialogService } from '@shared/modules/invoice-dialog/components/invoice-dialog/invoice-dialog.service';
import { PaymentService } from '@shared/services/payment.service';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-invoices-page',
  templateUrl: './invoices-page.component.html',
  styleUrls: ['./invoices-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesPageComponent implements OnInit, OnDestroy {
  public readonly itemsPerPage = 15;
  public readonly paymentHistoryPerPage = 5;

  public statement: number;
  public teamMember: UserVM;
  public invoices: InvoicesVM;
  public filteredInvoices: InvoicesVM = { outstanding: [], openCredit: [], closed: [], history: [] };
  public isLoading = false;

  private readonly destroyed$ = new Subject<void>();

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly invoicesService: InvoicesService,
    private readonly caseMessageDialogService: CaseMessageDialogService,
    private readonly invoiceDialogService: InvoiceDialogService,
    private readonly toastMessageService: ToastMessageService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly translateService: TranslateService,
    private readonly cdr: ChangeDetectorRef,
    private readonly paymentService: PaymentService,
    private readonly teamMemberService: TeamMemberService,
    private readonly store$: Store<commonMessageReducer.AppState>
  ) {}

  public ngOnInit(): void {
    this.loadInvoicesData();
    this.store$.dispatch(commonMessageAction.loadAwstokens());
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private loadInvoicesData(): void {
    this.isLoading = true;

    forkJoin([this.invoicesService.invoicesData$, this.teamMemberService.getDefaultTeamMember$(undefined, TeamMemberListType.Invoice)])
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe(([{ invoices, accountStatement }, teamMember]) => {
        if (!isNil(accountStatement)) {
          this.statement = accountStatement;
        }
        this.invoices = invoices;
        this.teamMember = teamMember;
        this.filterInvoices();
        this.openDeeplink();
        this.cdr.markForCheck();
      });
  }

  private openInvoiceDetailsDialog(payload: CbInvoiceDialogPayload): void {
    const dialogRef = this.invoiceDialogService.open(payload);
    dialogRef.afterClosed$().subscribe(() => {
      this.document.location.hash = '';
    });
  }

  public onOutstandingInvoiceClick(invoice: OutstandingInvoice): void {
    this.openInvoiceDetailsDialog({
      id: invoice.id,
      type: InvoiceType.Outstanding,
      name: invoice.invoiceId,
      orderId: invoice.orderId,
      amount: invoice.totalOwing,
      dueDate: invoice.dueDate,
      stripeUrl: invoice.stripeUrl,
      status: invoice.invoiceStatus,
      needsPayment: true,
    });
  }

  public onOpenCreditInvoiceClick(invoice: OpenCreditInvoice): void {
    this.openInvoiceDetailsDialog({
      id: invoice.id,
      type: InvoiceType.OpenCredits,
      name: invoice.creditId,
      orderId: invoice.orderId,
      amount: invoice.unappliedAmount,
      status: invoice.invoiceStatus,
      needsPayment: false,
    });
  }

  public onClosedInvoiceClick(invoice: ClosedInvoice): void {
    this.openInvoiceDetailsDialog({
      id: invoice.id,
      type: InvoiceType.Closed,
      name: invoice.invoiceId,
      orderId: invoice.orderId,
      amount: invoice.invoiceValue,
      dueDate: invoice.dueDate,
      isCreditNote: invoice.isCreditNote,
      status: invoice.invoiceStatus,
      needsPayment: false,
    });
  }

  public onHistoryInvoiceClick(invoice: PaymentHistorySubItem): void {
    this.openInvoiceDetailsDialog({
      id: invoice.invoiceId,
      type: InvoiceType.PaymentHistory,
      amount: invoice.amount,
      name: invoice.name,
      orderId: invoice.orderId,
      dueDate: invoice.date,
      needsPayment: false,
    });
  }

  public onMessageClick(): void {
    this.caseMessageDialogService.open({
      teamMemberListType: TeamMemberListType.Invoice,
      messageTo: this.teamMember,
    });
  }

  public onSendAccountStatementEmailClick(): void {
    this.invoicesService
      .sendAccountStatementEmail$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () => this.toastMessageService.open(this.translateService.instant('INVOICES_PAGE.ACCOUNT_STATEMENT_EMAIL_SENT_SUCCESSFULLY')),
        (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SEND_ACCOUNT_STATEMENT_EMAIL')
      );
  }

  public onDownloadAccountStatementClick(): void {
    this.invoicesService
      .downloadAccountStatement$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (attachment) => FileHelper.downloadDataFile(attachment),
        (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_DOWNLOAD_ACCOUNT_STATEMENT')
      );
  }

  public onSendEmailClick(id: string): void {
    this.invoicesService
      .sendInvoiceEmail$(id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () => this.toastMessageService.open(this.translateService.instant('INVOICES_PAGE.ACCOUNT_STATEMENT_EMAIL_SENT_SUCCESSFULLY')),
        (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SEND_INVOICE_EMAIL')
      );
  }

  public onDownloadClick(id: string): void {
    this.invoicesService
      .downloadInvoice$(id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (attachment) => FileHelper.downloadDataFile(attachment),
        (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_DOWNLOAD_INVOICE')
      );
  }

  public filterInvoices(filterText: string = ''): void {
    const filterTerm = filterText.trim().toLowerCase();

    if (isEmpty(filterTerm)) {
      this.filteredInvoices = this.invoices;
    }

    this.filteredInvoices = {
      outstanding: filterEntriesByFields(this.invoices.outstanding, filterTerm, ['invoiceId', 'reference1', 'reference2', 'shipment']),
      openCredit: filterEntriesByFields(this.invoices.openCredit, filterTerm, ['creditId', 'reference1', 'reference2', 'shipment']),
      closed: filterEntriesByFields(this.invoices.closed, filterTerm, ['invoiceId', 'reference1', 'reference2', 'shipment']),
      history: this.invoices.history.reduce((filteredHistory, historyItem) => {
        const filteredHistorySubItems = historyItem.subItems.filter((invoice) => invoice.invoice.toLowerCase().includes(filterTerm));
        return filteredHistorySubItems.length === 0
          ? filteredHistory
          : filteredHistory.concat({ ...historyItem, subItems: filteredHistorySubItems });
      }, []),
    };
  }

  public onPayInvoiceClick(invoice: OutstandingInvoice): void {
    if (isNil(invoice.stripeUrl)) {
      this.invoiceDialogService.open({
        id: invoice.id,
        type: InvoiceType.Outstanding,
        name: invoice.invoiceId,
        orderId: invoice.orderId,
        amount: invoice.totalOwing,
        dueDate: invoice.dueDate,
        stripeUrl: invoice.stripeUrl,
        needsPayment: true,
        status: invoice.invoiceStatus,
      });
    } else {
      this.paymentService.payInvoice({ invoiceId: invoice.id, stripeUrl: invoice.stripeUrl });
    }
  }

  private openDeeplink(): void {
    const messageDeeplinkMatches = this.document.location.hash.match(/^#(.*)\/message\/(.*)$/);

    if (!isEmpty(messageDeeplinkMatches)) {
      const [, invoiceId, caseId] = messageDeeplinkMatches;
      this.openMessageDeeplink(invoiceId, caseId);
      return;
    }

    const invoiceDeeplinkMatches = this.document.location.hash.match(/^#(invoice|payment)\/(.*)$/);

    if (!isEmpty(invoiceDeeplinkMatches)) {
      const [, type, invoiceId] = invoiceDeeplinkMatches as [string, 'invoice' | 'payment', string];
      this.openInvoiceDeeplink(type, invoiceId);
    }
  }

  private openMessageDeeplink(invoiceId: string, caseId: string): void {
    const outstandingInvoice = this.invoices.outstanding.find((item) => item.id === invoiceId);
    if (outstandingInvoice) {
      this.onOutstandingInvoiceClick(outstandingInvoice);
      this.caseMessageDialogService.open({ id: caseId });

      return;
    }

    const openCreditInvoice = this.invoices.openCredit.find((item) => item.id === invoiceId);
    if (openCreditInvoice) {
      this.onOpenCreditInvoiceClick(openCreditInvoice);
      this.caseMessageDialogService.open({ id: caseId });

      return;
    }

    const closedInvoice = this.invoices.closed.find((item) => item.id === invoiceId);
    if (closedInvoice) {
      this.onClosedInvoiceClick(closedInvoice);
      this.caseMessageDialogService.open({ id: caseId });

      return;
    }

    const historyInvoice = this.invoices.history
      .reduce((accumulator, item) => accumulator.concat(item.subItems), [])
      .find((subItem) => subItem.invoiceId === invoiceId);
    if (historyInvoice) {
      this.onHistoryInvoiceClick(historyInvoice);
      this.caseMessageDialogService.open({ id: caseId });
    }
  }

  private openInvoiceDeeplink(type: 'invoice' | 'payment', invoiceId: string): void {
    switch (type) {
      case 'invoice':
        const matchingOutstandingInvoice = this.invoices.outstanding.find((invoice) => invoice.id === invoiceId);
        if (!isNil(matchingOutstandingInvoice)) {
          this.onOutstandingInvoiceClick(matchingOutstandingInvoice);
          return;
        }

        const matchingOpenCreditInvoice = this.invoices.openCredit.find((invoice) => invoice.id === invoiceId);
        if (!isNil(matchingOpenCreditInvoice)) {
          this.onOpenCreditInvoiceClick(matchingOpenCreditInvoice);
          return;
        }

        const matchingClosedInvoice = this.invoices.closed.find((invoice) => invoice.id === invoiceId);
        if (!isNil(matchingClosedInvoice)) {
          this.onClosedInvoiceClick(matchingClosedInvoice);
          return;
        }
        break;
      case 'payment':
        const matchingPaymentHistoryInvoice = this.invoices.history.reduce<PaymentHistorySubItem | undefined>(
          (matchingInvoice, historyItem) =>
            isNil(matchingInvoice) ? historyItem.subItems.find((invoice) => invoice.invoiceId === invoiceId) : matchingInvoice,
          // eslint-disable-next-line unicorn/no-useless-undefined
          undefined
        );
        if (!isNil(matchingPaymentHistoryInvoice)) {
          this.onHistoryInvoiceClick(matchingPaymentHistoryInvoice);
          return;
        }
        break;
    }
  }
}
